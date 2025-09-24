from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import imghdr
import asyncio
import time
import uuid
from app.services.s3 import put_bytes, BUCKET_RAW
from app.services.rekognition import index_s3_object, sanitize_key_for_rekognition

router = APIRouter()
MAX_SIZE_MB = 50
ALLOWED_FORMATS = {"jpeg", "png", "jpg"}


def validate_image_bytes(data: bytes):
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo acima de {MAX_SIZE_MB}MB")
    if imghdr.what(None, h=data) not in ALLOWED_FORMATS:
        raise HTTPException(415, "Formato não suportado (use jpg ou png)")


async def process_file(event_slug: str, file: UploadFile):
    try:
        data = await file.read()
        validate_image_bytes(data)

        # --- LOG DE DIAGNÓSTICO ---
        sanitized_name = sanitize_key_for_rekognition(file.filename)
        # --- FIM DO LOG ---

        ts = int(time.time())
        s3_key = f"{event_slug}/photos/{ts}-{uuid.uuid4().hex}-{sanitized_name}"
        
        # --- LOG DE DIAGNÓSTICO ---
        print(f"[UPLOAD-LOG] Chave S3 Gerada: {s3_key}")
        # --- FIM DO LOG ---

        put_bytes(BUCKET_RAW, s3_key, data, file.content_type or "image/jpeg")

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: index_s3_object(event_slug, BUCKET_RAW, s3_key)
        )
        return s3_key
    except Exception as e:
        print(f"!!!!!!!! ERRO AO PROCESSAR O ARQUIVO {file.filename}: {e} !!!!!!!!")
        return None


@router.post("/{event_slug}/photos")
async def ingest_photos(event_slug: str, files: List[UploadFile] = File(...)):
    tasks = [process_file(event_slug, file) for file in files]
    uploaded_keys = await asyncio.gather(*tasks)
    # Filtra qualquer resultado None que possa ter ocorrido por erro
    successful_keys = [key for key in uploaded_keys if key is not None]
    return {"ok": True, "uploaded_keys": successful_keys}