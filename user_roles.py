# backend/app/schemas/user_roles.py

from pydantic import BaseModel, Field, validator
from typing import Optional

class UserRoleCreate(BaseModel):
    username:     str = Field(..., min_length=3, max_length=50, strip_whitespace=True)
    password:     str = Field(..., min_length=8)                      # plain-text password
    ip_address:   str = Field(..., strip_whitespace=True)              # e.g. "127.0.0.1"
    role_name:    str = Field(..., min_length=1, strip_whitespace=True)

    class Config:
        orm_mode = True


class UserRoleRead(BaseModel):
    id:         int
    username:   str
    ip_address: str
    role_name:  str
    is_active  : bool 

    class Config:
        orm_mode = True

class UserRoleUpdate(BaseModel):
    username:   Optional[str] = Field(None, min_length=3,  max_length=50, strip_whitespace=True)
    password:   Optional[str] = None                      # validated in @validator below
    ip_address: Optional[str] = Field(None, strip_whitespace=True)
    role_name:  Optional[str] = Field(None, min_length=1, strip_whitespace=True)

    # ── treat "" as “not provided”, still check len≥8 if a real value is sent
    @validator("password", pre=True)
    def empty_string_becomes_none(cls, v: Optional[str]):
        if v is None:
            return None
        v = v.strip()
        if v == "":                    # allow empty input → “leave unchanged”
            return None
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    class Config:
        orm_mode = True