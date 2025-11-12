from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from typing import List, Optional
import imghdr
import asyncio
import time
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.photo import photos_table, PhotoResponse
from app.services.db import get_conn
from app.services.s3 import put_bytes, BUCKET_RAW, presign_get
from app.services.rekognition import index_s3_object, sanitize_key_for_rekognition

router = APIRouter()
MAX_SIZE_MB = 200
ALLOWED_FORMATS = {"jpeg", "png", "jpg"}


def validate_image_bytes(data: bytes):
    if len(data) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo acima de {MAX_SIZE_MB}MB")
    if imghdr.what(None, h=data) not in ALLOWED_FORMATS:
        raise HTTPException(415, "Formato não suportado (use jpg ou png)")


async def process_file(event_slug: str, uploader_id: Optional[uuid.UUID], file: UploadFile):
    """Processa um único arquivo: valida, salva no S3 e indexa no Rekognition."""
    try:
        data = await file.read()
        validate_image_bytes(data)

        original_filename = file.filename or "unknown.jpg"
        sanitized_name = sanitize_key_for_rekognition(original_filename)
        ts = int(time.time())

        image_id = uuid.uuid4()
        unique_filename = f"{ts}-{image_id.hex}-{sanitized_name}"
        s3_key = f"{event_slug}/photos/{unique_filename}"

        # 1. Envia para o S3
        put_bytes(BUCKET_RAW, s3_key, data, file.content_type or "image/jpeg")

        # 2. Envia para o Rekognition
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, lambda: index_s3_object(event_slug, BUCKET_RAW, s3_key, str(image_id))
        )

        return {"image_id": image_id, "s3_key": s3_key}

    except HTTPException as e:
        # Repassa exceções HTTP (validação falhou)
        print(f"!!!!!!!! ERRO DE VALIDAÇÃO: {file.filename}: {e.detail} !!!!!!!!")
        return None
    except Exception as e:
        # Captura outros erros (S3, Rekognition)
        print(f"!!!!!!!! ERRO AO PROCESSAR O ARQUIVO {file.filename}: {e} !!!!!!!!")
        return None


@router.post("/{event_slug}/photos", response_model=List[PhotoResponse])
async def upload_photos_batch(
        event_slug: str,
        files: List[UploadFile] = File(...),
        uploader_id: Optional[uuid.UUID] = Query(None),
        db: AsyncSession = Depends(get_conn),
):
    """
    Upload de fotos em lote.
    - Se 'uploader_id' for informado, é upload de fotógrafo.
    - Se for None, é upload de admin.
    """

    # Processa todos os arquivos em paralelo
    tasks = [process_file(event_slug, uploader_id, file) for file in files]
    upload_results = await asyncio.gather(*tasks)

    # Filtra apenas os uploads que tiveram sucesso
    successful_uploads = [res for res in upload_results if res]
    if not successful_uploads:
        # Se nenhum arquivo foi processado, retorna lista vazia
        return []

    # Prepara os dados para inserir no banco
    photos_to_insert = []
    for res in successful_uploads:
        photos_to_insert.append({
            "id": res["image_id"],
            "uploader_id": uploader_id,
            "event_slug": event_slug,
            "s3_key": res["s3_key"],
            #
            # ▼▼▼ CORREÇÃO 1: NÃO SALVAR A URL TEMPORÁRIA NO BANCO ▼▼▼
            #
            "s3_url": None,  # Salva None. A s3_key é a única fonte da verdade.
            #
            # ▲▲▲ FIM DA CORREÇÃO 1 ▲▲▲
            #
            "status": "active",
        })

    # Insere os novos registros no banco
    stmt = photos_table.insert().values(photos_to_insert)
    await db.execute(stmt)

    # Busca os dados que acabamos de inserir para retornar
    photo_ids = [p["id"] for p in photos_to_insert]
    query = select(photos_table).where(photos_table.c.id.in_(photo_ids))
    result = await db.execute(query)

    # Comita a transação (salva o insert)
    await db.commit()

    # Pega os resultados do select
    newly_created_photos = result.all()

    #
    # ▼▼▼ CORREÇÃO 2: GERAR URLS FRESCAS 'AO VIVO' SÓ PARA A RESPOSTA ▼▼▼
    #
    response_data = []
    for photo_row in newly_created_photos:
        # Converte a "Row" do SQLAlchemy para um dict
        photo_dict = dict(photo_row._mapping)

        # Gera a URL pré-assinada fresca usando a s3_key
        # Isso garante que o frontend receba uma URL válida
        photo_dict["s3_url"] = presign_get(BUCKET_RAW, photo_dict["s3_key"])

        response_data.append(photo_dict)
    #
    # ▲▲▲ FIM DA CORREÇÃO 2 ▲▲▲
    #

    # Retorna a lista de dicts com as URLs frescas para o frontend
    return response_data