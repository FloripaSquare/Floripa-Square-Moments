from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, literal
from typing import List
from pydantic import BaseModel

# Import de serviços
from app.services.db import get_conn
from app.services import events as event_service
from app.services import downloads as downloads_service # O alias correto é 'downloads_service'

# Import de schemas
from app.schemas.event import CreateEventIn, EventOut, UpdateEventIn, events_table
from app.schemas.metrics import AdminMetricSummary, metrics_table
from app.schemas.user import users_table, UserOut
from app.security.jwt import require_admin

router = APIRouter(dependencies=[Depends(require_admin)])

# --- ROTAS DE EVENTOS ---

@router.get("/events", response_model=List[EventOut])
async def list_events(conn: AsyncSession = Depends(get_conn)):
    """Lista todos os eventos cadastrados."""
    result = await conn.execute(select(events_table))
    rows = result.mappings().all()
    return [EventOut.model_validate(row) for row in rows]

@router.post("/events", response_model=EventOut, status_code=201)
async def create_event(payload: CreateEventIn, conn: AsyncSession = Depends(get_conn)):
    """Cria um novo evento (a lógica de negócio fica no serviço)."""
    return await event_service.create_event(conn, payload)

@router.patch("/events/{slug}", response_model=EventOut)
async def update_event(slug: str, payload: UpdateEventIn, conn: AsyncSession = Depends(get_conn)):
    """Atualiza um evento existente (ex: para adicionar horários)."""
    updated_event = await event_service.update_event(conn, slug, payload)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    return updated_event

# --- GERAÇÃO DE LINK PARA DOWNLOAD ---

class DownloadLinkOut(BaseModel):
    """Schema para a resposta da geração de link."""
    url: str

@router.post("/events/{slug}/generate-download-link", response_model=DownloadLinkOut)
async def generate_download_link(slug: str):
    """Gera um link de download para um .zip com todas as fotos do evento."""
    try:
        # ✅ CORREÇÃO: A chamada agora usa o alias de import correto.
        url = await downloads_service.generate_event_photos_zip_url(slug)
        return DownloadLinkOut(url=url)
    except ValueError as e:
        # Erro caso o evento não tenha fotos
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Captura outros erros (ex: falha de conexão com S3)
        print(f"Erro inesperado ao gerar link de download para o evento '{slug}': {e}")
        raise HTTPException(status_code=500, detail="Não foi possível gerar o link de download.")

# --- ROTAS DE MÉTRICAS ---

@router.get("/metrics", response_model=List[AdminMetricSummary])
async def all_metrics(conn: AsyncSession = Depends(get_conn)):
    """Lista métricas de engajamento agregadas."""
    j = metrics_table.outerjoin(users_table, metrics_table.c.user_id == users_table.c.id)
    result = await conn.execute(
        select(
            metrics_table.c.event_slug,
            func.coalesce(users_table.c.name, literal("Anônimo")).label("user_name"),
            func.sum(case((metrics_table.c.type == "search", metrics_table.c.count), else_=0)).label("pesquisas"),
            func.sum(case((metrics_table.c.type == "register", metrics_table.c.count), else_=0)).label("cadastros"),
        )
        .select_from(j)
        .group_by(metrics_table.c.event_slug, users_table.c.name)
        .order_by(metrics_table.c.event_slug, func.coalesce(users_table.c.name, literal("Anônimo")))
    )
    return result.mappings().all()


# --- ROTAS DE USUÁRIOS ---

@router.get("/users/{event_slug}", response_model=List[UserOut])
async def users_by_event(event_slug: str, conn: AsyncSession = Depends(get_conn)):
    """Lista todos os usuários detalhados de um evento específico."""
    result = await conn.execute(
        select(
            users_table.c.id,
            users_table.c.name,
            users_table.c.last_name,
            users_table.c.email,
            users_table.c.whatsapp,
            users_table.c.instagram,
            users_table.c.event_slug,
            users_table.c.role,
            users_table.c.accepted_lgpd,
            users_table.c.biometric_acceptance,
            users_table.c.international_transfer_data,
            users_table.c.image_usage_portifolio,
            users_table.c.marketing_communication_usage,
            users_table.c.age_declaration,
            users_table.c.responsible_consent,
        ).where(users_table.c.event_slug == event_slug)
    )
    rows = result.mappings().all()
    return [UserOut.model_validate(row) for row in rows]