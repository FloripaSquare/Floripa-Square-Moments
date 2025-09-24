from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from app.schemas.event import CreateEventIn, EventOut, events_table
from pydantic import AnyUrl
from typing import List, Optional


# Buscar evento por slug
async def get_event_by_slug(conn: AsyncSession, slug: str) -> Optional[EventOut]:
    stmt = select(events_table).where(events_table.c.slug == slug)
    result = await conn.execute(stmt)
    row = result.mappings().first()
    return EventOut(**row) if row else None


async def create_event(conn: AsyncSession, event_data: CreateEventIn) -> EventOut:
    data_dict = event_data.dict()

    # Converter campos do tipo Url para str
    for key, value in data_dict.items():
        if isinstance(value, AnyUrl):
            data_dict[key] = str(value)

    stmt = insert(events_table).values(**data_dict).returning(events_table)
    result = await conn.execute(stmt)
    await conn.commit()
    row = result.mappings().first()
    return EventOut(**row)

# Listar eventos
async def list_events(conn: AsyncSession) -> List[EventOut]:
    stmt = select(events_table)
    result = await conn.execute(stmt)
    rows = result.mappings().all()
    return [EventOut(**row) for row in rows]

