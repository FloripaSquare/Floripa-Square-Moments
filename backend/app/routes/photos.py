import uuid
from typing import List, Optional
from uuid import UUID as PyUUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

# adapte os imports conforme seu projeto
from app.services.db import get_conn
from app.schemas.photo import PhotoResponse  # se você já tem
from app.schemas.photo import photos_table   # sua Table SQLAlchemy
from app.services.s3 import BUCKET_RAW, s3, presign_get

router = APIRouter()


@router.get("/{event_slug}", response_model=List[PhotoResponse])
async def get_photos_for_event(
        event_slug: str,
        uploader_id: Optional[PyUUID] = Query(None),
        db: AsyncSession = Depends(get_conn)
):
    # Base da query
    query = select(photos_table).where(photos_table.c.event_slug == event_slug)

    # Se for fotógrafo, filtra pelo uploader_id
    if uploader_id:
        query = query.where(photos_table.c.uploader_id == uploader_id)

    result = await db.execute(query)
    photos_from_db = result.all()

    response_data = []
    for photo_row in photos_from_db:
        photo_dict = dict(photo_row._mapping)
        photo_dict["s3_url"] = presign_get(BUCKET_RAW, photo_dict["s3_key"])
        response_data.append(photo_dict)

    return response_data

    return response_data
@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: str,
    session: AsyncSession = Depends(get_conn),
):
    """
    Exclui uma foto:
    - Remove o arquivo do S3 (Bucket RAW)
    - Remove o registro do banco
    """
    try:
        # Verifica se existe
        try:
            photo_uuid = uuid.UUID(photo_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="photo_id inválido (deve ser UUID)")

        result = await session.execute(
            select(photos_table.c.s3_key).where(photos_table.c.id == photo_uuid)
        )
        row = result.first()

        if not row:
            raise HTTPException(status_code=404, detail="Foto não encontrada")

        s3_key = row.s3_key

        # Remove do S3
        try:
            s3.delete_object(Bucket=BUCKET_RAW, Key=s3_key)
        except Exception as s3_err:
            print(f"[S3] Falha ao apagar {s3_key}: {s3_err}")

        # Remove do banco
        await session.execute(delete(photos_table).where(photos_table.c.id == photo_uuid))
        await session.commit()

        return {"ok": True, "message": f"Foto {photo_id} excluída com sucesso."}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[photos.delete_photo] erro: {e}")
        raise HTTPException(status_code=500, detail="Erro ao excluir foto")