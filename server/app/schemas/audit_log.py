from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    action: str
    target_type: str
    target_id: int
    detail: Optional[Dict[str, Any]] = None


class AuditLogResponse(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    created_at: datetime
