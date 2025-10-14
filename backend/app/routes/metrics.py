from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.security.jwt import require_any_user

from app.services.metrics import add_metric # ✅ Importe a função de serviço
from app.services.db import get_conn
from app.services.metrics import add_metric, get_metrics
from app.schemas.metrics import MetricIn, MetricOut, DownloadMetricIn

router = APIRouter()


# --- POST: cria uma métrica ---
@router.post("/", response_model=MetricOut)
async def create_metric(payload: MetricIn, conn: AsyncSession = Depends(get_conn)):
    metric = await add_metric(conn, payload)
    await conn.commit()  # ✅ commit explícito para persistir
    return MetricOut.model_validate(metric)  # ✅ valida e converte direto via Pydantic


# --- GET: lista métricas com filtros opcionais e paginação ---
@router.get("/", response_model=List[MetricOut])
async def list_metrics(
        user_id: Optional[str] = Query(None, description="Filtrar métricas por user_id"),
        event_slug: Optional[str] = Query(None, description="Filtrar métricas por evento"),
        limit: int = Query(100, ge=1, le=1000, description="Limite máximo de registros"),
        offset: int = Query(0, ge=0, description="Offset para paginação"),
        conn: AsyncSession = Depends(get_conn),
):
    """
    Lista métricas, com suporte a filtros e paginação.
    Usa fetchall() direto para performance.
    """
    metrics = await get_metrics(conn, user_id=user_id, event_slug=event_slug, limit=limit, offset=offset)
    return [MetricOut.model_validate(m) for m in metrics]


@router.post("/download", status_code=204)
async def log_download_metric(
    payload: DownloadMetricIn,
    conn: AsyncSession = Depends(get_conn),
    token_data: dict = Depends(require_any_user)
):
    user_id = token_data.get("user_id")

    await add_metric(
        conn,
        MetricIn(
            event_slug=payload.event_slug,
            type="download_photo",
            user_id=user_id,
            details={"file_name": payload.file_name}
        )
    )
    # Não precisa de commit aqui se 'add_metric' já adiciona à sessão
    await conn.commit()
    return