# backend/app/schemas/auth.py

from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username:     str 
    message: str        # e.g. "Welcome, alice"
    role: str           # e.g. "SUPER_ADMIN" or "ANALYST"
