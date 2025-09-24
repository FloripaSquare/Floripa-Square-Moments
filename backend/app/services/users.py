import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from passlib.hash import bcrypt
from fastapi import HTTPException, status
from app.schemas.user import users_table, UserCreate, AdminCreate
from app.services.metrics import track

# Usuário normal
async def create_or_get_user(conn: AsyncSession, data: UserCreate):
    email = data.email.lower().strip()
    stmt = select(users_table).where(users_table.c.email == email)
    result = await conn.execute(stmt)
    existing = result.mappings().first()
    if existing:
        return existing

    stmt = (
        insert(users_table)
        .values(
            name=data.name,
            email=email,
            whatsapp=data.whatsapp,
            instagram=data.instagram,
            accepted_lgpd=data.accepted_lgpd,
            event_slug=data.event_slug,
            is_admin=False,
        )
        .returning(users_table)
    )
    result = await conn.execute(stmt)    
    row = result.mappings().first()
    
    # --- AJUSTE A CHAMADA DA MÉTRICA AQUI ---
    # Agora passamos também o event_slug que veio com os dados do usuário.
    if row:
        await track(
            conn,
            action="register",
            user_id=str(row["id"]),
            event_slug=data.event_slug
        )
        await conn.commit() # Salva o usuário e a métrica na mesma transação
        
    return row

# Admin
async def create_admin_user(conn: AsyncSession, data: AdminCreate):
    email = data.email.lower().strip()
    stmt = select(users_table).where(users_table.c.email == email)
    result = await conn.execute(stmt)
    if result.mappings().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Um usuário com este e-mail já existe.")

    password_hash = bcrypt.hash(data.password)
    stmt = (
        insert(users_table)
        .values(
            name=data.name,
            email=email,
            whatsapp=data.whatsapp,
            instagram=data.instagram,
            accepted_lgpd=data.accepted_lgpd,
            is_admin=True,
            password_hash=password_hash,
        )
        .returning(users_table)
    )
    result = await conn.execute(stmt)
    await conn.commit()
    row = result.mappings().first()
    
    if row:
        await track(conn, action="register_admin", user_id=str(row["id"]))
        await conn.commit()

    return row

# Autenticação
async def authenticate_user(conn: AsyncSession, email: str, password: str):
    stmt = select(users_table).where(users_table.c.email == email.lower().strip())
    result = await conn.execute(stmt)
    user = result.mappings().first()
    if not user or not user["password_hash"]:
        return None
    if not bcrypt.verify(password, user["password_hash"]):
        return None
    return user