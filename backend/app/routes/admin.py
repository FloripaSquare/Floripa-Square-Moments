# backend/app/routes/admin.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.db import get_conn
from app.schemas.event import events_table, EventOut
from app.schemas.metrics import metrics_table, MetricOut
from app.schemas.user import users_table, UserOut
from app.security.jwt import require_admin

router = APIRouter(dependencies=[Depends(require_admin)])

# Listar todos os eventos
@router.get("/events", response_model=list[EventOut])
async def list_events(conn: AsyncSession = Depends(get_conn)):
    result = await conn.execute(select(events_table))
    rows = result.mappings().all()
    # Assuming EventOut schema might have similar UUID or integer issues
    return [EventOut(**row) for row in rows]

# Métricas por evento
@router.get("/metrics/{event_slug}", response_model=list[MetricOut])
async def metrics_by_event(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    result = await conn.execute(
        select(metrics_table).where(metrics_table.c.event_slug == event_slug)
    )
    rows = result.mappings().all()
    # ✨ Apply conversion here as well
    return [
        MetricOut(
            id=str(row["id"]),
            user_id=str(row["user_id"]),
            event_slug=row["event_slug"],
            type=row["type"],
            count=row["count"],
            created_at=str(row["created_at"]),
        )
        for row in rows
    ]

# Usuários por evento
@router.get("/users/{event_slug}", response_model=list[UserOut])
async def users_by_event(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    result = await conn.execute(
        select(users_table).where(users_table.c.event_slug == event_slug)
    )
    rows = result.mappings().all()
    # Assuming UserOut might have similar issues
    return [UserOut(**row) for row in rows]