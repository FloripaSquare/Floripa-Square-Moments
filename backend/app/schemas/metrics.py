from pydantic import BaseModel
from typing import Optional
from .base import metadata
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID # <-- 1. IMPORTE O TIPO UUID

metrics_table = sa.Table(
    "metrics",
    metadata,
    sa.Column("id", sa.Integer, primary_key=True), # Supondo que o ID da métrica é um Integer
    
    # --- A CORREÇÃO ESTÁ AQUI ---
    # Trocamos sa.String por UUID para ser compatível com o 'id' da tabela 'users'
    sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    # --------------------------
    
    sa.Column("event_slug", sa.String, sa.ForeignKey("events.slug"), nullable=True),
    sa.Column("type", sa.String, nullable=False),
    sa.Column("count", sa.Integer, default=1),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
)

class MetricIn(BaseModel):
    user_id: Optional[str] = None
    event_slug: Optional[str] = None
    type: str

class MetricOut(MetricIn):
    id: str
    count: int
    created_at: str
