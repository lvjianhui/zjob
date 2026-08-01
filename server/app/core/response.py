"""统一 API 响应结构。

所有接口统一返回:
    {"code": 0, "msg": "success", "data": <实际数据>}

- code == 0 表示成功，非 0 表示业务错误
- msg   用于前端弹窗展示
- data  为实际业务数据
"""

from typing import Any, Optional

from pydantic import BaseModel


class ApiResponse(BaseModel):
    """统一响应体。"""

    code: int = 0
    msg: str = "success"
    data: Optional[Any] = None


class BizException(Exception):
    """业务异常，被全局异常处理器捕获后转为统一响应体。"""

    def __init__(self, code: int, msg: str, data: Any = None) -> None:
        self.code = code
        self.msg = msg
        self.data = data
        super().__init__(msg)


def success(data: Any = None, msg: str = "success") -> dict:
    """构造成功响应。"""
    return {"code": 0, "msg": msg, "data": data}


def error(code: int, msg: str, data: Any = None) -> dict:
    """构造错误响应（一般不需要手动调用，由异常处理器自动生成）。"""
    return {"code": code, "msg": msg, "data": data}
