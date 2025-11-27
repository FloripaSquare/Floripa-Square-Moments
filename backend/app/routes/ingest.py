import time
import uuid
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert

from app.schemas.media import media_table, MediaTypeDB
from app.services.db import get_conn
from app.services.s3 import put_bytes, BUCKET_RAW, make_object_key
from app.services.rekognition import index_s3_object, sanitize_key_for_rekognition
from app.services.metrics import track
import enum
import imghdr

router = APIRouter()

MAX_SIZE_MB = 1000
MAX_MEDIA_SIZE_MB = 3000

# ==========================================================
# ENUM CORRIGIDO — AGORA COMPATÍVEL COM MediaTypeDB
# ==========================================================
class MediaType(str, enum.Enum):
    GENERAL = "general"
    VIDEOS = "videos"


ALLOWED_IMAGE_FORMATS = {"jpeg", "png", "jpg"}
ALLOWED_VIDEO_FORMATS = {"mp4", "mov", "avi", "mkv"}


def _validate_media_file(media_type: MediaType, data: bytes, filename: str):
    """Valida fotos gerais e vídeos com regras mais flexíveis."""
    if len(data) > MAX_MEDIA_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"O arquivo '{filename}' excede o limite de {MAX_MEDIA_SIZE_MB}MB.")

    # FOTO
    if media_type == MediaType.GENERAL:
        if imghdr.what(None, h=data) not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(415, f"A foto '{filename}' tem um formato não suportado (use JPG ou PNG).")

    # VÍDEO
    if media_type == MediaType.VIDEOS:
        file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
        if file_ext not in ALLOWED_VIDEO_FORMATS:
            raise HTTPException(415, f"O vídeo '{filename}' tem um formato não suportado.")


def _validate_image_bytes(data: bytes):
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo acima de {MAX_SIZE_MB}MB")
    if imghdr.what(None, h=data) not in {"jpeg", "png"}:
        raise HTTPException(415, "Formato não suportado (use jpg ou png)")


# ==========================================================
#  UPLOAD DE FOTO DO EVENTO
# ==========================================================
@router.post("/{event_slug}/photo")
async def ingest_photo(
    event_slug: str,
    file: UploadFile = File(...),
    conn: AsyncSession = Depends(get_conn),
):
    data = await file.read()
    _validate_image_bytes(data)

    original_key = make_object_key(event_slug, file.filename or "image.jpg")
    safe_key = sanitize_key_for_rekognition(original_key.replace("/", "_"))

    put_bytes(BUCKET_RAW, safe_key, data, file.content_type or "image/jpeg")
    index_s3_object(event_slug, BUCKET_RAW, safe_key)

    await track(
        conn,
        action="upload_photo",
        user_id="",
        event_slug=event_slug,
        data={"filename": file.filename, "size": len(data), "content_type": file.content_type},
    )

    await conn.commit()
    return {"ok": True, "key": safe_key}


# ==========================================================
#  UPLOAD DE MÍDIAS (GERAL / VÍDEO)
# ==========================================================
@router.post("/{event_slug}/media")
async def ingest_media(
    event_slug: str,
    files: List[UploadFile] = File(...),
    media_type: MediaType = Query(..., alias="type", description="Tipo de mídia: 'general' ou 'videos'"),
    conn: AsyncSession = Depends(get_conn),
):
    successful_keys = []

    for file in files:
        try:
            # 1. Read and Validate
            data = await file.read()
            _validate_media_file(media_type, data, file.filename)

            # 2. Prepare S3 Key
            sanitized_name = sanitize_key_for_rekognition(file.filename)
            ts = int(time.time())
            folder_name = media_type.value
            s3_key = f"{event_slug}/{folder_name}/{ts}-{uuid.uuid4().hex}-{sanitized_name}"

            # 3. Upload to S3
            put_bytes(BUCKET_RAW, s3_key, data, file.content_type)

            # 4. INSERT CORRIGIDO — AGORA FUNCIONA
            stmt = insert(media_table).values(
                event_slug=event_slug,
                media_type=media_type.value,  # enum string diretamente
                s3_key=s3_key,
            )

            await conn.execute(stmt)

            # Métrica
            await track(
                conn,
                action="upload_media",
                event_slug=event_slug,
                data={"filename": file.filename, "size": len(data), "media_type": media_type.value, "s3_key": s3_key},
            )

            successful_keys.append(s3_key)

        except Exception as e:
            # AGORA NÃO ENGOLIMOS O ERRO — IMPRIME COMPLETO
            print(f"!!!!!!!! ERRO AO PROCESSAR '{file.filename}': {e} !!!!!!!!")
            raise

    await conn.commit()

    return {
        "ok": True,
        "upload_type": media_type.value,
        "uploaded_keys": successful_keys,
        "message": f"{len(successful_keys)} de {len(files)} arquivos enviados com sucesso."
    }


@router.delete("/media/{media_id}")
async def delete_media(
    media_id: str,
    conn: AsyncSession = Depends(get_conn),
):
    # Buscar registro
    result = await conn.execute(
        media_table.select().where(media_table.c.id == media_id)
    )
    media = result.fetchone()

    if not media:
        raise HTTPException(status_code=404, detail="Mídia não encontrada")

    # Remover do S3
    from app.services.s3 import delete_object, BUCKET_RAW

    try:
        delete_object(BUCKET_RAW, media.s3_key)
    except Exception as e:
        print("Erro ao deletar S3:", e)

    # Remover do banco
    await conn.execute(
        media_table.delete().where(media_table.c.id == media_id)
    )
    await conn.commit()

    return {"ok": True, "deleted": media_id}
