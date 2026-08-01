from datetime import timedelta

import sqlalchemy as sa
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import BizException, success
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserProfileResponse, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/login")
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(
        sa.select(User).where(User.username == payload.username)
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.hashed_password):
        raise BizException(code=401, msg="用户名或密码错误")

    if not user.is_active:
        raise BizException(code=403, msg="账号已被禁用")

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=60),
    )

    return success({"access_token": access_token, "token_type": "bearer", "role": user.role})


@router.post("/register")
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    existing = await db.execute(
        sa.select(User).where(User.username == payload.username)
    )
    if existing.scalar_one_or_none() is not None:
        raise BizException(code=409, msg="用户名已被注册")

    user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password),
        role="operator",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=timedelta(minutes=60),
    )
    return success({"access_token": access_token, "token_type": "bearer", "role": user.role})


@router.post("/refresh")
async def refresh(
    current_user: User = Depends(get_current_user),
) -> dict:
    access_token = create_access_token(
        subject=current_user.id,
        role=current_user.role,
        expires_delta=timedelta(minutes=60),
    )
    return success({"access_token": access_token, "token_type": "bearer", "role": current_user.role})


@router.get("/me")
async def get_profile(
    current_user: User = Depends(get_current_user),
) -> dict:
    return success(UserProfileResponse.model_validate(current_user).model_dump())


@router.put("/me")
async def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return success(UserProfileResponse.model_validate(current_user).model_dump())
