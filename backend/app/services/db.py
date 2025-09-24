from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.schemas.user import metadata
import os
from dotenv import load_dotenv

# carrega o .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não definida no .env")

# Ajuste do engine com pool seguro para asyncpg
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    pool_size=10,           # número máximo de conexões simultâneas
    max_overflow=20,        # conexões extras em pico
    pool_timeout=30,        # espera até pegar conexão
    pool_recycle=1800,      # recicla conexões a cada 30min
    pool_pre_ping=True,     # testa se conexão está ativa
)

async_session_maker = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Inicializa tabelas
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)

# Dependency para FastAPI
async def get_conn() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
