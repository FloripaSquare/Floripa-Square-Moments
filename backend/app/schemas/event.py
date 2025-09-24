from sqlalchemy import Table, Column, String
from pydantic import BaseModel, HttpUrl
from typing import Optional
from .base import metadata

# Tabela de eventos no banco
events_table = Table(
    "events",
    metadata,
    Column("slug", String, primary_key=True),
    Column("title", String, nullable=False),
    Column("privacy_url", String, nullable=True),  # ✅ armazenado como String
)

# Schemas Pydantic -------------------

class CreateEventIn(BaseModel):
    slug: str
    title: str
    privacy_url: Optional[HttpUrl] = None  # entrada aceita HttpUrl

class EventOut(BaseModel):
    slug: str
    title: str
    privacy_url: Optional[str] = None  # ✅ saída como string normal
