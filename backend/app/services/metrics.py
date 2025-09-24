from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from app.schemas.metrics import metrics_table, MetricIn # Importe o MetricIn correto
from typing import Optional, List

# Adiciona uma nova métrica
async def add_metric(conn: AsyncSession, metric: MetricIn):
    # O values agora vem diretamente do Pydantic, sem gerar 'id' manualmente
    stmt = insert(metrics_table).values(metric.model_dump(exclude_none=True))
    await conn.execute(stmt)
    # O commit é feito na rota que chama esta função

# Lista métricas
async def get_metrics(conn: AsyncSession, user_id: Optional[str] = None):
    stmt = select(metrics_table)
    if user_id:
        stmt = stmt.where(metrics_table.c.user_id == user_id)
    result = await conn.execute(stmt)
    return result.mappings().all()

# Função auxiliar para registrar a métrica
async def track(conn: AsyncSession, action: str, user_id: Optional[str] = None, event_slug: Optional[str] = None):
    metric_payload = MetricIn(user_id=user_id, event_slug=event_slug, type=action)
    await add_metric(conn, metric_payload)