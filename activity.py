from datetime import datetime
from pydantic import BaseModel

class ActivityRead(BaseModel):
    id:        int
    event:     str
    username:  str | None
    ip_addr:   str
    timestamp: datetime

    class Config:
        orm_mode = True
