# backend/app/schemas/ip_whitelist.py

from pydantic import BaseModel, Field
from typing import Optional

class IPWhitelistCreateWithPassword(BaseModel):
    ip_address: str = Field(..., example="192.168.1.118")
    description: Optional[str] = Field(None, example="Dev machine")
    password: str = Field(..., example="super-secret-password")

class IPWhitelistRead(BaseModel):
    ip_address: str
    description: Optional[str]

    class Config:
        orm_mode = True   # Pydantic v2 → read from ORM attributes
