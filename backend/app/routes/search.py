from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.s3 import presign_get, BUCKET_RAW
from app.services.rekognition import search_by_image_bytes
from app.services.db import get_conn
from app.schemas.search import SearchOut, ItemUrl
from app.routes.uploads import validate_image_bytes
from app.services.zips import create_zip_from_keys
from app.services.metrics import track
from app.security.jwt import require_any_user
import hashlib
import time
import uuid  # 👈 Importar UUID para conversão
import asyncio
from concurrent.futures import ThreadPoolExecutor

# ▼▼▼ IMPORTAR O QUE PRECISAMOS PARA A CONSULTA ▼▼▼
from sqlalchemy import select
from app.schemas.photo import photos_table

# ▲▲▲ IMPORTAR O QUE PRECISAMOS PARA A CONSULTA ▲▲▲

_rekognition_executor = ThreadPoolExecutor(
    max_workers=30,
    thread_name_prefix="rekognition_worker"
)

router = APIRouter()


@router.post("/{event_slug}", response_model=SearchOut)
async def search_faces(
        event_slug: str,
        background_tasks: BackgroundTasks,
        selfie: UploadFile = File(...),
        create_zip: bool = False,
        conn: AsyncSession = Depends(get_conn),
        user=Depends(require_any_user),
):
    """
    Busca faces correspondentes a uma imagem de selfie em um evento específico.
    """
    start_time = time.time()
    img_bytes = await selfie.read()
    validate_image_bytes(img_bytes)

    try:
        loop = asyncio.get_running_loop()
        res = await loop.run_in_executor(
            _rekognition_executor,
            lambda: search_by_image_bytes(event_slug, img_bytes, max_faces=50, threshold=75)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar faces: {str(e)}"
        )

    matches = sorted(
        res.get("FaceMatches", []), key=lambda m: m["Similarity"], reverse=True
    )

    #
    # ▼▼▼ ESTA É A LÓGICA DE CORREÇÃO ▼▼▼
    #

    # 1. Pega os IDs (UUIDs) que o Rekognition retornou.
    # O 'ExternalImageId' que salvamos no upload era o 'image_id' da tabela.
    matched_image_ids = [m['Face']['ExternalImageId'] for m in matches]

    if not matched_image_ids:
        # Se não achou nada, retorna vazio
        return SearchOut(count=0, items=[], zip=None)

    # 2. Busca no banco de dados pelas 's3_key' REAIS usando esses IDs.
    # Converte os IDs de string para UUID para a consulta
    try:
        uuid_list = [uuid.UUID(img_id) for img_id in matched_image_ids]
    except ValueError:
        print("Erro: Rekognition retornou um ExternalImageId que não é um UUID.")
        uuid_list = []

    s3_keys = []
    if uuid_list:
        query = select(photos_table.c.s3_key).where(
            photos_table.c.id.in_(uuid_list)
        )
        result = await conn.execute(query)

        # Pega as s3_keys (extrai da tupla/row) e filtra Nones
        s3_keys = [row[0] for row in result.all() if row[0] is not None]

    # 3. Gera as URLs com as chaves corretas.
    urls = [ItemUrl(key=k, url=presign_get(BUCKET_RAW, k)) for k in s3_keys]

    #
    # ▲▲▲ FIM DA LÓGICA DE CORREÇÃO ▲▲▲
    #

    zip_download_url = None
    if create_zip and s3_keys:
        keys_tuple = tuple(sorted(s3_keys))
        zip_hash = hashlib.md5(str(keys_tuple).encode()).hexdigest()
        zip_key = f"zips/search-{zip_hash}.zip"
        background_tasks.add_task(create_zip_from_keys, s3_keys, zip_key)
        zip_download_url = presign_get(BUCKET_RAW, zip_key, expires=300)

    duration = time.time() - start_time

    await track(
        conn,
        action="search",
        user_id=user["user_id"],
        event_slug=event_slug,
        data={
            "file_size": len(img_bytes),
            "matches_count": len(s3_keys),
            "create_zip": create_zip,
            "duration_ms": int(duration * 1000),
        },
    )

    await conn.commit()

    return SearchOut(count=len(s3_keys), items=urls, zip=zip_download_url)