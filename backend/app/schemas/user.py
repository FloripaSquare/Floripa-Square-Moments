# app/schemas/user.py (VERSÃO AJUSTADA E CORRIGIDA)

import uuid
from sqlalchemy import Table, Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID  # 1. IMPORTS ADICIONADOS
from pydantic import BaseModel, EmailStr
from typing import Optional

# Assumindo que a metadata está em app/schemas/base.py, como no seu código original
from .base import metadata

# Tabela SQLAlchemy
users_table = Table(
    "users",
    metadata,
    # 2. AQUI ESTÁ A ALTERAÇÃO PRINCIPAL
    # Trocamos String por UUID para padronizar e corrigir o erro de chave estrangeira.
    # O `default=uuid.uuid4` faz o banco gerar um ID único automaticamente.
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    
    Column("name", String, nullable=False),
    Column("email", String(255), nullable=False, unique=True, index=True), # Adicionado tamanho e index para otimização
    Column("whatsapp", String, nullable=True),
    Column("instagram", String, nullable=True),
    Column("accepted_lgpd", Boolean, default=False, nullable=False),
    Column("event_slug", String, nullable=True),
    Column("is_admin", Boolean, default=False, nullable=False),
    Column("password_hash", String, nullable=True),  # só admins têm senha
)

# Schemas Pydantic (permanecem os mesmos, pois a API ainda tratará o ID como string)
class UserCreate(BaseModel):
    name: str
    email: str
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    accepted_lgpd: bool
    event_slug: Optional[str] = None

class UserOut(BaseModel):
    id: str # O Pydantic converte o objeto UUID para string automaticamente no JSON, está correto.
    name: str
    email: str
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    accepted_lgpd: bool
    event_slug: Optional[str] = None
    is_admin: bool

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    whatsapp: Optional[str] = None
    instagram: Optional[str] = None
    accepted_lgpd: bool = True
    event_slug: Optional[str] = None
    is_admin: bool = True

class LoginSchema(BaseModel):
    email: EmailStr
    password: str