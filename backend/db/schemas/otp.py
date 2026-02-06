from __future__ import annotations
from pydantic import BaseModel, EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    flow: str  # "register" or "login"
