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
        db: AsyncSession = Depends(get_conn)
):
    # 1. Busca os dados do banco (onde s3_url é None)
    query = select(photos_table).where(photos_table.c.event_slug == event_slug)
    result = await db.execute(query)
    photos_from_db = result.all()

    #
    # ▼▼▼ ESTA É A LÓGICA DE CORREÇÃO ▼▼▼
    #
    response_data = []
    for photo_row in photos_from_db:
        # Converte a "Row" do SQLAlchemy para um dict
        photo_dict = dict(photo_row._mapping)

        # 2. Gera uma URL FRESCA "ao vivo" usando a s3_key
        # O Pydantic agora vai receber uma URL válida em vez de 'None'
        photo_dict["s3_url"] = presign_get(BUCKET_RAW, photo_dict["s3_key"])

        response_data.append(photo_dict)
    #
    # ▲▲▲ FIM DA LÓGICA DE CORREÇÃO ▲▲▲
    #

    # 3. Retorna a lista com as URLs frescas para o frontend
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