from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.s3 import list_keys_in_prefix, presign_get, BUCKET_RAW
from app.services.db import get_conn

router = APIRouter()


@router.get("/{event_slug}/general")
async def list_general_photos(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    """
    Lista as fotos gerais de um evento e gera URLs pré-assinadas.
    """
    try:
        folder = f"{event_slug}/general/"
        # Usa seu list_keys_in_prefix existente
        keys = list_keys_in_prefix(BUCKET_RAW, folder)

        files = []
        for key in keys:
            # Gera URL temporária e segura
            url = presign_get(BUCKET_RAW, key)
            files.append({"key": key, "url": url})

        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar fotos: {e}")


@router.get("/{event_slug}/videos")
async def list_event_videos(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    """
    Lista os vídeos de um evento e gera URLs pré-assinadas.
    """
    try:
        folder = f"{event_slug}/videos/"
        keys = list_keys_in_prefix(BUCKET_RAW, folder)

        files = []
        for key in keys:
            url = presign_get(BUCKET_RAW, key)
            files.append({"key": key.split("/")[-1], "url": url})

        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar vídeos: {e}")
