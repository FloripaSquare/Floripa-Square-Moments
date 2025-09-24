from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.s3 import put_bytes, BUCKET_RAW, make_object_key
from ..services.rekognition import index_s3_object, sanitize_key_for_rekognition
import imghdr

router = APIRouter()
MAX_SIZE_MB = 15

def _validate_image_bytes(data: bytes):
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo acima de {MAX_SIZE_MB}MB")
    if imghdr.what(None, h=data) not in {"jpeg", "png"}:
        raise HTTPException(415, "Formato não suportado (use jpg ou png)")

@router.post("/{event_slug}/photo")
async def ingest_photo(event_slug: str, file: UploadFile = File(...)):
    data = await file.read()
    _validate_image_bytes(data)

    original_key = make_object_key(event_slug, file.filename or "image.jpg")
    # transformamos a key original (com “/”) em uma key segura, sem “/”
    # exemplo: rooftop-10set_photos_..._image.jpg
    safe_key = sanitize_key_for_rekognition(original_key.replace("/", "_"))

    # grava no S3 JÁ com o nome seguro (o mesmo que o Rekognition vai usar)
    put_bytes(BUCKET_RAW, safe_key, data, file.content_type or "image/jpeg")

    # indexa no Rekognition usando a MESMA safe_key
    index_s3_object(event_slug, BUCKET_RAW, safe_key)

    await track(conn, action="upload_photo", event_slug=event_slug)


    return {"ok": True, "key": safe_key}
