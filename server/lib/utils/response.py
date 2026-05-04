from typing import Generic, Optional, TypeVar

from pydantic import BaseModel
from starlette.responses import Response

T = TypeVar("T")

class APIResponse(Response,BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    error: Optional[str] = None


def success_response(data=None, message="OK"):
    return APIResponse(success=True, message=message, data=data)

def error_response(message="Error"):
    return APIResponse(success=False, message=message, error=message)
