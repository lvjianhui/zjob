from datetime import datetime, timezone
from typing import Any, Dict, Optional

import sqlalchemy as sa
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import BizException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.audit_log import AuditLog
from app.models.user import User

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise BizException(code=401, msg="请先登录")

    token_payload = decode_access_token(credentials.credentials)

    result = await db.execute(
        sa.select(User).where(
            sa.and_(
                User.id == int(token_payload.sub),
                User.is_active.is_(True),
            )
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise BizException(code=401, msg="用户不存在或已被禁用")

    return user


def require_role(*allowed_roles: str):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise BizException(code=403, msg="权限不足")
        return current_user

    return role_checker


async def create_audit_log(
    db: AsyncSession,
    user_id: Optional[int],
    action: str,
    target_type: str,
    target_id: int,
    detail: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail or {},
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log
