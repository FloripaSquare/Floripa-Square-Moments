# app/routes/auth.py (VERSÃO CORRIGIDA)

from fastapi import APIRouter, Depends, HTTPException, Form, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from passlib.hash import bcrypt
import uuid

from app.services.db import get_conn
from app.schemas.user import users_table, UserOut
from app.schemas.session import active_sessions_table
from app.security.jwt import create_access_token

router = APIRouter()

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    conn: AsyncSession = Depends(get_conn),
):
    stmt = select(users_table).where(
        users_table.c.email == email, 
        users_table.c.is_admin == True
    )
    result = await conn.execute(stmt)
    user_from_db = result.mappings().first()

    if not user_from_db or not user_from_db["password_hash"] or not bcrypt.verify(password, user_from_db["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    jti = str(uuid.uuid4())
    payload = {"sub": str(user_from_db["id"]), "is_admin": True}
    token, _ = create_access_token(payload, jti=jti)
    
    session_stmt = insert(active_sessions_table).values(
        user_id=user_from_db["id"],
        token_jti=jti,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent", "N/A"),
    )
    await conn.execute(session_stmt)
    await conn.commit()

    # --- A CORREÇÃO ESTÁ AQUI ---
    # Criamos um dicionário a partir do resultado do banco
    # e convertemos o 'id' para string antes de passar para o UserOut.
    user_data_for_schema = dict(user_from_db)
    user_data_for_schema['id'] = str(user_from_db['id'])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "jti": jti,
        "user": UserOut(**user_data_for_schema)
    }