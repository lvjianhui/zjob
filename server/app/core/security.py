from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union

import bcrypt
import jwt
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.response import BizException

settings = get_settings()


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: Optional[int] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(
    subject: Union[str, int],
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "type": "access",
    }

    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        sub = payload.get("sub")
        role = payload.get("role")
        exp = payload.get("exp")
        if sub is None or role is None:
            raise BizException(code=401, msg="无效的令牌")
        return TokenPayload(sub=sub, role=role, exp=exp)
    except jwt.ExpiredSignatureError:
        raise BizException(code=401, msg="登录已过期，请重新登录")
    except jwt.PyJWTError:
        raise BizException(code=401, msg="认证失败，请重新登录")
