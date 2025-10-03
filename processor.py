from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class ProcessorBase(BaseModel):
    name: str = Field(min_length=3, max_length=64)
    kind: str
    # credentials arrive separately; not stored in the DTO

class ProcessorIn(ProcessorBase):
    credentials: dict  # raw keys → will go straight to Secrets Manager

class ProcessorOut(ProcessorBase):
    id: UUID
    verified: bool
    status: str
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True  # SQLA row → model
