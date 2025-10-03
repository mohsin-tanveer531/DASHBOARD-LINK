from typing import Optional
from pydantic import BaseModel, Field,ConfigDict  

class SuperAdminCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=128)
    password: str = Field(..., min_length=8)
class SuperAdminRead(BaseModel):
    id: int
    username: str
    ip_address: str
    is_active  : bool 
    model_config = ConfigDict(from_attributes=True)

class SuperAdminUpdate(BaseModel):
    username:   Optional[str] = Field(None, min_length=3, max_length=50, strip_whitespace=True)
    password:   Optional[str] = Field(None, min_length=8)
    ip_address: Optional[str] = Field(None, strip_whitespace=True)