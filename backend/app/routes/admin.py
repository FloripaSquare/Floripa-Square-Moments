from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.services.db import get_conn
from app.services.events import create_event as create_event_service
from app.schemas.event import CreateEventIn, EventOut, events_table
from app.schemas.metrics import metrics_table, MetricOut
from app.schemas.user import users_table, UserOut
from app.security.jwt import require_admin
from sqlalchemy import literal

router = APIRouter(dependencies=[Depends(require_admin)])

# --- Listar todos os eventos ---
@router.get("/events", response_model=list[EventOut])
async def list_events(conn: AsyncSession = Depends(get_conn)):
    result = await conn.execute(select(events_table))
    rows = result.mappings().all()
    return [EventOut(**row) for row in rows]

# --- Criar evento ---
@router.post("/events", response_model=EventOut)
async def create_event(payload: CreateEventIn, conn: AsyncSession = Depends(get_conn)):
    return await create_event_service(conn, payload)

# --- Listar métricas, incluindo user_name ---
@router.get("/metrics", response_model=list[MetricOut])
async def all_metrics(conn: AsyncSession = Depends(get_conn)):
    # Outer join para trazer métricas com ou sem usuário associado
    j = metrics_table.outerjoin(users_table, metrics_table.c.user_id == users_table.c.id)
    
    result = await conn.execute(
        select(
            metrics_table.c.id,
            metrics_table.c.user_id,
            func.coalesce(users_table.c.name, literal("Anônimo")).label("user_name"),
            metrics_table.c.event_slug,
            metrics_table.c.type,
            metrics_table.c.count,
            metrics_table.c.data,
            metrics_table.c.created_at,
        )
        .select_from(j)
        .order_by(metrics_table.c.created_at.desc())
    )
    
    rows = result.mappings().all()


    
    return [
        MetricOut(
            id=str(row["id"]),
            user_id=str(row["user_id"]) if row["user_id"] else None,
            user_name=row["user_name"],
            event_slug=row["event_slug"],
            type=row["type"],
            count=row["count"],
            data=row["data"],
            created_at=str(row["created_at"]),
        )
        for row in rows
    ]

# --- Listar usuários por evento, incluindo user_name ---
@router.get("/users/{event_slug}", response_model=list[UserOut])
async def users_by_event(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    result = await conn.execute(
        select(
            users_table.c.id,
            users_table.c.name.label("user_name"),
            users_table.c.email,
            users_table.c.role,
            users_table.c.event_slug,
        ).where(users_table.c.event_slug == event_slug)
    )
    rows = result.mappings().all()
    return [UserOut(**row) for row in rows]


