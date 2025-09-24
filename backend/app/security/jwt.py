# app/security/jwt.py

import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.db import get_conn
from app.schemas.session import token_denylist_table

SECRET_KEY = os.getenv("SECRET_KEY", "seu-segredo-super-secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 horas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def create_access_token(data: dict, jti: str):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "jti": jti})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire

async def require_admin(token: str = Depends(oauth2_scheme), conn: AsyncSession = Depends(get_conn)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        jti: str = payload.get("jti")
        is_admin: bool = payload.get("is_admin", False)

        if user_id is None or jti is None or not is_admin:
            raise credentials_exception

        # VERIFICAÇÃO CRÍTICA NA DENYLIST
        stmt = select(token_denylist_table).where(token_denylist_table.c.jti == jti)
        result = await conn.execute(stmt)
        if result.first() is not None:
            raise credentials_exception # Token foi invalidado (logout forçado)

    except JWTError:
        raise credentials_exception
    
    return {"user_id": user_id, "jti": jti}