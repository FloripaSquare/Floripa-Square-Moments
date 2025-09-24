from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserOut, AdminCreate, LoginSchema
from app.services.db import get_conn
from app.services.users import create_or_get_user, create_admin_user, authenticate_user

router = APIRouter()

# Cadastro de usuário normal
@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserCreate, conn: AsyncSession = Depends(get_conn)):
    user = await create_or_get_user(conn, payload)
    
    # --- CORREÇÃO APLICADA AQUI ---
    # Converte o ID de UUID para string antes de passar para o Pydantic
    user_data = dict(user)
    user_data['id'] = str(user_data['id'])
    
    return UserOut(**user_data)

# Cadastro de admin
@router.post("/admin", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_admin(payload: AdminCreate, conn: AsyncSession = Depends(get_conn)):
    user = await create_admin_user(conn, payload)
    if not user["is_admin"]:
        raise HTTPException(status_code=400, detail="Falha ao criar admin")
    
    # --- CORREÇÃO APLICADA AQUI ---
    user_data = dict(user)
    user_data['id'] = str(user_data['id'])

    return UserOut(**user_data)

# Login de admin (Rota movida para /auth, mas se ainda existir aqui, está corrigida)
@router.post("/login", response_model=UserOut)
async def login_admin(payload: LoginSchema, conn: AsyncSession = Depends(get_conn)):
    user = await authenticate_user(conn, payload.email, payload.password)
    if not user or not user["is_admin"]:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # --- CORREÇÃO APLICADA AQUI ---
    user_data = dict(user)
    user_data['id'] = str(user_data['id'])
    
    return UserOut(**user_data)