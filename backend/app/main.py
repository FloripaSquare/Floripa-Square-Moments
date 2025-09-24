# app/main.py (VERSÃO CORRIGIDA E COMPATÍVEL)

from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import update
from sqlalchemy.sql import func
from jose import jwt, JWTError
from prometheus_client import make_asgi_app # NOVO: Importa a biblioteca do Prometheus

from app.settings import settings
from app.logging_conf import configure_logging
# --- IMPORTAÇÕES CORRIGIDAS ---
# Importa o engine e o sessionmaker, não um objeto 'database'
from app.services.db import engine, async_session_maker, init_db 
from app.errors import botocore_error_handler, generic_error_handler
from botocore.exceptions import BotoCoreError, ClientError

# Importa todos os seus módulos de rotas
from app.routes import health, events, ingest, search, admin, privacy, users, metrics, auth, uploads, sessions
from app.schemas.session import active_sessions_table
from app.security.jwt import SECRET_KEY, ALGORITHM

# --- Configuração Inicial ---
configure_logging()
app = FastAPI(
    title="Face Event MVP",
    description="API para gerenciamento de eventos e reconhecimento facial.",
    version="1.0.0"
)

# --- Middlewares ---
origins = settings.CORS_ALLOW_ORIGINS.split(",") if settings.CORS_ALLOW_ORIGINS != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para atualizar 'last_seen_at' (compatível com seu db.py)
@app.middleware("http")
async def update_last_seen_middleware(request: Request, call_next):
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            jti = payload.get("jti")
            if jti:
                # Cria uma sessão de DB usando o sessionmaker
                async with async_session_maker() as session:
                    async with session.begin():
                        stmt = (
                            update(active_sessions_table)
                            .where(active_sessions_table.c.token_jti == jti)
                            .values(last_seen_at=func.now())
                        )
                        await session.execute(stmt)
        except JWTError:
            pass
            
    response = await call_next(request)
    return response

# --- Eventos de Ciclo de Vida do App (compatível com seu db.py) ---
@app.on_event("startup")
async def on_startup():
    # Esta função pode ser usada se você precisar criar tabelas sem o Alembic
    # await init_db() 
    pass

@app.on_event("shutdown")
async def on_shutdown():
    # Fecha o pool de conexões do engine ao desligar
    await engine.dispose() 

# --- Adicionando o endpoint do Prometheus ---
# NOVO: Cria uma aplicação de métricas do Prometheus
metrics_app = make_asgi_app()
# NOVO: Monta essa aplicação no endpoint /metrics
app.mount("/metrics", metrics_app)

# --- Organização das Rotas ---
api_router = APIRouter()

# Adicione todas as suas rotas aqui como antes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(events.router, prefix="/events", tags=["Events"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(privacy.router, prefix="/privacy", tags=["Privacy"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["Ingest"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])

# Rotas de Administração
admin_router = APIRouter(prefix="/admin")
admin_router.include_router(admin.router, tags=["Admin"])
# O endpoint /metrics do seu dashboard continua aqui, em /admin/metrics
admin_router.include_router(metrics.router, prefix="/metrics", tags=["Admin Metrics"])
admin_router.include_router(sessions.router, prefix="/sessions", tags=["Admin Sessions"])
api_router.include_router(admin_router)

app.include_router(api_router)

# --- Handlers de Exceção ---
app.add_exception_handler(BotoCoreError, botocore_error_handler)
app.add_exception_handler(ClientError, botocore_error_handler)
app.add_exception_handler(Exception, generic_error_handler)
