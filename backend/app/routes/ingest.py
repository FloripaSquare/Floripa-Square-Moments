import time
import uuid
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.db import get_conn
from app.services.s3 import put_bytes, BUCKET_RAW, make_object_key
from app.services.rekognition import index_s3_object, sanitize_key_for_rekognition
from app.services.metrics import track
import enum

from app.security.jwt import require_any_user
import imghdr

router = APIRouter()
MAX_SIZE_MB = 15
MAX_MEDIA_SIZE_MB = 10000  # Tamanho maior para vídeos e fotos gerais


class MediaType(str, enum.Enum):
    GENERAL = "general"
    VIDEOS = "videos"

ALLOWED_IMAGE_FORMATS = {"jpeg", "png", "jpg"}
ALLOWED_VIDEO_FORMATS = {"mp4", "mov", "avi", "mkv"}

def _validate_media_file(media_type: MediaType, data: bytes, filename: str):
    """Valida fotos gerais e vídeos com regras mais flexíveis."""
    if len(data) > MAX_MEDIA_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"O arquivo '{filename}' excede o limite de {MAX_MEDIA_SIZE_MB}MB.")
    if media_type == MediaType.GENERAL:
        if imghdr.what(None, h=data) not in ALLOWED_IMAGE_FORMATS:
            raise HTTPException(status_code=415, detail=f"A foto '{filename}' tem um formato não suportado (use JPG ou PNG).")
    if media_type == MediaType.VIDEOS:
        file_ext = filename.split('.')[-1].lower() if '.' in filename else ''
        if file_ext not in ALLOWED_VIDEO_FORMATS:
            raise HTTPException(status_code=415, detail=f"O vídeo '{filename}' tem um formato não suportado.")



def _validate_image_bytes(data: bytes):
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo acima de {MAX_SIZE_MB}MB")
    if imghdr.what(None, h=data) not in {"jpeg", "png"}:
        raise HTTPException(415, "Formato não suportado (use jpg ou png)")

@router.post("/{event_slug}/photo")
async def ingest_photo(
    event_slug: str,
    file: UploadFile = File(...),
    conn: AsyncSession = Depends(get_conn),
    user=Depends(require_any_user),
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
        user_id=user["user_id"],
        event_slug=event_slug,
        data={
            "filename": file.filename,
            "size": len(data),
            "content_type": file.content_type,
        },
    )

    await conn.commit()

    return {"ok": True, "key": safe_key}


# --- ROTA 2: FOTOS GERAIS E VÍDEOS (sem Rekognition) ---

@router.post("/{event_slug}/media")
async def ingest_media(
    event_slug: str,
    files: List[UploadFile] = File(...),
    media_type: MediaType = Query(..., alias="type", description="Tipo de mídia: 'general' ou 'videos'"),
    conn: AsyncSession = Depends(get_conn),
    user: dict = Depends(require_any_user),
):
    """
    Recebe fotos gerais ou vídeos e envia para a pasta 'general/' ou 'videos/'.
    NÃO executa o Rekognition.
    """
    successful_keys = []
    for file in files:
        try:
            data = await file.read()
            _validate_media_file(media_type, data, file.filename)

            sanitized_name = sanitize_key_for_rekognition(file.filename)
            ts = int(time.time())
            # A pasta é definida dinamicamente pelo 'media_type'
            folder_name = media_type.value
            s3_key = f"{event_slug}/{folder_name}/{ts}-{uuid.uuid4().hex}-{sanitized_name}"

            put_bytes(BUCKET_RAW, s3_key, data, file.content_type)

            await track(
                conn,
                action="upload_media",
                user_id=user["user_id"],
                event_slug=event_slug,
                data={"filename": file.filename, "size": len(data), "media_type": media_type.value, "s3_key": s3_key},
            )
            successful_keys.append(s3_key)
        except Exception as e:
            print(f"!!!!!!!! ERRO AO PROCESSAR A MÍDIA {file.filename}: {e} !!!!!!!!")
            continue

    await conn.commit()
    return {"ok": True, "upload_type": media_type, "uploaded_keys": successful_keys, "message": f"{len(successful_keys)} de {len(files)} arquivos enviados com sucesso."}
