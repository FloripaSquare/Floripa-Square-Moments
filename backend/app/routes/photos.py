import uuid
from typing import List, Optional
from uuid import UUID as PyUUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.media import MediaOut, MediaType, media_table
from app.services.db import get_conn
from app.schemas.photo import PhotoResponse, photos_table

from app.services.s3 import BUCKET_RAW, s3, presign_get

router = APIRouter()

# ===============================
#     FOTOS DO EVENTO
# ===============================

@router.get("/{event_slug}", response_model=List[PhotoResponse])
async def get_photos_for_event(
    event_slug: str,
    uploader_id: Optional[PyUUID] = Query(None),
    db: AsyncSession = Depends(get_conn)
):
    query = select(photos_table).where(photos_table.c.event_slug == event_slug)

    if uploader_id:
        query = query.where(photos_table.c.uploader_id == uploader_id)

    result = await db.execute(query)
    photos = result.all()

    response_data = []
    for row in photos:
        p = dict(row._mapping)
        p["s3_url"] = presign_get(BUCKET_RAW, p["s3_key"])
        response_data.append(p)

    return response_data


@router.delete("/photo/{photo_id}")
async def delete_photo(
    photo_id: str,
    db: AsyncSession = Depends(get_conn)
):
    try:
        photo_uuid = uuid.UUID(photo_id)
    except:
        raise HTTPException(400, "photo_id inválido")

    row = (
        await db.execute(
            select(photos_table.c.s3_key).where(photos_table.c.id == photo_uuid)
        )
    ).first()

    if not row:
        raise HTTPException(404, "Foto não encontrada")

    s3_key = row.s3_key

    try:
        s3.delete_object(Bucket=BUCKET_RAW, Key=s3_key)
    except Exception as e:
        print("[S3] erro ao excluir:", e)

    await db.execute(delete(photos_table).where(photos_table.c.id == photo_uuid))
    await db.commit()

    return {"ok": True, "message": "Foto excluída com sucesso"}


# ===============================
#          MÍDIAS DO EVENTO
# ===============================

@router.get("/{event_slug}/media", response_model=List[MediaOut])
async def get_media_for_event(
    event_slug: str,
    media_type: Optional[MediaType] = Query(None),
    uploader_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_conn)
):
    query = select(media_table).where(media_table.c.event_slug == event_slug)

    if media_type:
        query = query.where(media_table.c.media_type == media_type.value)

    if uploader_id:
        query = query.where(media_table.c.uploader_id == uploader_id)

    result = await db.execute(query)
    rows = result.all()

    items = []
    for row in rows:
        m = dict(row._mapping)
        m["s3_url"] = presign_get(BUCKET_RAW, m["s3_key"])
        items.append(m)

    return items


@router.delete("/media/{media_id}")
async def delete_media(
    media_id: str,
    db: AsyncSession = Depends(get_conn)
):
    try:
        media_uuid = uuid.UUID(media_id)
    except:
        raise HTTPException(400, "media_id inválido")

    row = (
        await db.execute(
            select(media_table.c.s3_key).where(media_table.c.id == media_uuid)
        )
    ).first()

    if not row:
        raise HTTPException(404, "Mídia não encontrada")

    s3_key = row.s3_key

    try:
        s3.delete_object(Bucket=BUCKET_RAW, Key=s3_key)
    except Exception as e:
        print("[S3] erro:", e)

    await db.execute(delete(media_table).where(media_table.c.id == media_uuid))
    await db.commit()

    return {"ok": True, "message": "Mídia excluída com sucesso"}
