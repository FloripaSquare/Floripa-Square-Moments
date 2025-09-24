import boto3
import os
import re

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
    # Esta função agora é usada tanto no upload quanto na indexação para garantir consistência.
    # Ela remove caracteres que a API do Rekognition não aceita.
    safe = re.sub(r"[^a-zA-Z0-9_.:-]", "_", s)
    return safe[:100]


def index_s3_object(event_slug: str, bucket: str, file_key: str):
    collection_id = ensure_collection(event_slug)

    # <--- LÓGICA CORRETA RESTAURADA ---
    # Extraímos o nome do arquivo da chave S3 e o sanitizamos.
    # Como o nome no S3 já foi sanitizado no upload, esta chamada garante
    # consistência e que o ID seja sempre válido para a API.
    ext_id = sanitize_key_for_rekognition(file_key.split("/")[-1])

    return rk.index_faces(
        CollectionId=collection_id,
        Image={"S3Object": {"Bucket": bucket, "Name": file_key}},
        ExternalImageId=ext_id,
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


def reindex_all(event_slug: str, bucket: str, keys: list[str]):
    """
    Reindexa todas as fotos de um evento.
    """
    from concurrent.futures import ThreadPoolExecutor

    def _index(key):
        try:
            index_s3_object(event_slug, bucket, key)
        except Exception as e:
            print(f"Erro ao indexar {key}: {e}")

    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(_index, keys)