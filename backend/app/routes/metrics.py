from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.services.db import get_conn
from app.services.metrics import add_metric, get_metrics
from app.schemas.metrics import MetricIn, MetricOut

router = APIRouter()

@router.post("/", response_model=MetricOut)
async def create_metric(payload: MetricIn, conn: AsyncSession = Depends(get_conn)):
    metric = await add_metric(conn, payload)
    return MetricOut(
        id=str(metric["id"]), # Convert to string
        user_id=str(metric["user_id"]), # Convert to string
        event_slug=metric["event_slug"],
        type=metric["type"],
        count=metric["count"],
        created_at=str(metric["created_at"]),
    )

@router.get("/", response_model=List[MetricOut])
async def list_metrics(user_id: Optional[str] = None, conn: AsyncSession = Depends(get_conn)):
    metrics = await get_metrics(conn, user_id)
    return [
        MetricOut(
            id=str(m["id"]), # Convert to string
            user_id=str(m["user_id"]), # Convert to string
            event_slug=m["event_slug"],
            type=m["type"],
            count=m["count"],
            created_at=str(m["created_at"]),
        )
        for m in metrics
    ]
