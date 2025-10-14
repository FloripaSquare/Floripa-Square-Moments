import boto3
import os
import re
from concurrent.futures import ThreadPoolExecutor

rk = boto3.client(
    "rekognition",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)
COLLECTIONS_CACHE = set()


def ensure_collection(event_slug: str) -> str:
    collection_id = f"evt-{event_slug}"
    if collection_id in COLLECTIONS_CACHE:
        return collection_id
    try:
        rk.create_collection(CollectionId=collection_id)
    except rk.exceptions.ResourceAlreadyExistsException:
        pass
    COLLECTIONS_CACHE.add(collection_id)
    return collection_id


def sanitize_key_for_rekognition(s: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_.:-]", "_", s)
    return safe[:100]


# --- ALTERAÇÃO 1: A assinatura da função foi atualizada ---
def index_s3_object(event_slug: str, bucket: str, file_key: str, external_image_id: str):
    """
    Indexa uma face no Rekognition usando um ExternalImageId explícito.
    """
    collection_id = ensure_collection(event_slug)

    # A linha que calculava o ext_id foi removida para evitar dupla sanitização.

    return rk.index_faces(
        CollectionId=collection_id,
        Image={"S3Object": {"Bucket": bucket, "Name": file_key}},
        ExternalImageId=external_image_id,  # Usa o ID recebido diretamente
        DetectionAttributes=[],
        MaxFaces=80,
        QualityFilter="AUTO",
    )


def search_by_image_bytes(event_slug: str, data: bytes, max_faces: int = 50, threshold: int = 75):
    collection = ensure_collection(event_slug)
    return rk.search_faces_by_image(
        CollectionId=collection,
        Image={"Bytes": data},
        MaxFaces=max_faces,
        FaceMatchThreshold=threshold,
    )


# --- ALTERAÇÃO 2: A função de reindexar foi atualizada para usar a nova lógica ---
def reindex_all(event_slug: str, bucket: str, keys: list[str]):
    """
    Reindexa todas as fotos de um evento, garantindo a consistência do ID.
    """

    def _index(key):
        try:
            # Extrai o nome do arquivo da chave S3 para usar como o ID explícito
            image_id = key.split("/")[-1]
            index_s3_object(event_slug, bucket, key, image_id)
            print(f"Reindexado com sucesso: {key}")
        except Exception as e:
            print(f"Erro ao reindexar {key}: {e}")

    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(_index, keys)