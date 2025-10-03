from sqlalchemy import Column, Integer, String
from app.core.db import Base

class IPWhitelistPassword(Base):
    __tablename__ = "ip_whitelist_password"

    id = Column(Integer, primary_key=True, index=True)
    hashed_password = Column(String, nullable=False)  # store only the hash
