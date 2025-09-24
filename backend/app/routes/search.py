from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.s3 import presign_get, BUCKET_RAW
from app.services.rekognition import search_by_image_bytes
from app.services.db import get_conn
from app.schemas.search import SearchOut, ItemUrl
from app.routes.uploads import validate_image_bytes
from app.services.zips import create_zip_from_keys
# --- 1. Importe a função de métricas ---
from app.services.metrics import track
import hashlib

router = APIRouter()

@router.post("/{event_slug}", response_model=SearchOut)
async def search_faces(
    event_slug: str,
    background_tasks: BackgroundTasks,
    selfie: UploadFile = File(...),
    create_zip: bool = False,
    conn: AsyncSession = Depends(get_conn),
):
    """
    Busca faces correspondentes a uma imagem de selfie em um evento específico.
    """
    img_bytes = await selfie.read()
    validate_image_bytes(img_bytes)

    try:
        res = search_by_image_bytes(event_slug, img_bytes, max_faces=50, threshold=75)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar faces: {str(e)}"
        )

    matches = sorted(
        res.get("FaceMatches", []), key=lambda m: m["Similarity"], reverse=True
    )
    
    s3_keys = [f"{event_slug}/photos/{m['Face']['ExternalImageId']}" for m in matches]
    urls = [ItemUrl(key=k, url=presign_get(BUCKET_RAW, k)) for k in s3_keys]

    zip_download_url = None
    if create_zip and s3_keys:
        keys_tuple = tuple(sorted(s3_keys))
        zip_hash = hashlib.md5(str(keys_tuple).encode()).hexdigest()
        zip_key = f"zips/search-{zip_hash}.zip"
        background_tasks.add_task(create_zip_from_keys, s3_keys, zip_key)
        zip_download_url = presign_get(BUCKET_RAW, zip_key, expires=3600)

    # --- 2. ADICIONE A CHAMADA PARA REGISTRAR A MÉTRICA ---
    # Registra a métrica de busca após a operação ser concluída com sucesso.
    await track(conn, action="search", event_slug=event_slug)
    await conn.commit() # Garante que a métrica seja salva

    return SearchOut(count=len(s3_keys), items=urls, zip=zip_download_url)