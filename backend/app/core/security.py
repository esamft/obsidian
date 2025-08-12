from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import hashlib
import logging

from .config import settings

# Configuração de hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuração do security scheme
security = HTTPBearer()

logger = logging.getLogger(__name__)


class SecurityManager:
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def create_access_token(self, data: dict) -> str:
        """Cria token JWT de acesso"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "type": "access"})
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, data: dict) -> str:
        """Cria token JWT de refresh"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "type": "refresh"})
        
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> dict:
        """Verifica e decodifica token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"Erro na verificação do token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado"
            )
    
    def hash_password(self, password: str) -> str:
        """Hash de senha com bcrypt"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifica senha com hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def generate_api_key(self, user_id: str) -> str:
        """Gera API key única para usuário"""
        random_part = secrets.token_urlsafe(32)
        user_part = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        timestamp = str(int(datetime.utcnow().timestamp()))
        
        api_key = f"oai_{user_part}_{timestamp}_{random_part}"
        return api_key
    
    def validate_api_key(self, api_key: str) -> bool:
        """Valida formato da API key"""
        return api_key.startswith("oai_") and len(api_key) > 50


# Instância global do security manager
security_manager = SecurityManager()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency para obter usuário atual do token"""
    token = credentials.credentials
    payload = security_manager.verify_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    return {"user_id": user_id, "payload": payload}


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Dependency opcional para obter usuário atual"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None


def create_tokens(user_id: str) -> dict:
    """Cria tokens de acesso e refresh para usuário"""
    access_token = security_manager.create_access_token(data={"sub": user_id})
    refresh_token = security_manager.create_refresh_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def verify_api_key(api_key: str) -> bool:
    """Verifica se API key é válida"""
    return security_manager.validate_api_key(api_key) 