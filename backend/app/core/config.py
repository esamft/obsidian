import os
from typing import Optional
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    # Configurações da aplicação
    APP_NAME: str = "ObsidianAI Sync"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Configurações do servidor
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Configurações de segurança
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Configurações do banco de dados
    DATABASE_URL: str = Field(default="sqlite:///./obsidian_ai.db", env="DATABASE_URL")
    
    # Configurações da Claude API
    CLAUDE_API_KEY: str = Field(..., env="CLAUDE_API_KEY")
    CLAUDE_MODEL: str = Field(default="claude-sonnet-4-20250514", env="CLAUDE_MODEL")
    CLAUDE_MAX_TOKENS: int = Field(default=4000, env="CLAUDE_MAX_TOKENS")
    CLAUDE_TEMPERATURE: float = Field(default=0.3, env="CLAUDE_TEMPERATURE")
    
    # Rate Limiting
    CLAUDE_REQUESTS_PER_MINUTE: int = Field(default=50, env="CLAUDE_REQUESTS_PER_MINUTE")
    CLAUDE_REQUESTS_PER_DAY: int = Field(default=1000, env="CLAUDE_REQUESTS_PER_DAY")
    
    # Fallback/Retry
    CLAUDE_RETRY_ATTEMPTS: int = Field(default=3, env="CLAUDE_RETRY_ATTEMPTS")
    CLAUDE_RETRY_DELAY: int = Field(default=5, env="CLAUDE_RETRY_DELAY")
    
    # Configurações do Redis
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Configurações de sincronização
    DEFAULT_VAULT_PATH: str = Field(default="", env="DEFAULT_VAULT_PATH")
    SYNC_METHOD: str = Field(default="filesystem", env="SYNC_METHOD")
    
    # Configurações de logs
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FILE: str = Field(default="logs/obsidian_ai.log", env="LOG_FILE")
    
    # Configurações de CORS
    ALLOWED_ORIGINS: list = Field(default=["*"], env="ALLOWED_ORIGINS")
    
    # Configurações de upload
    MAX_TEXT_LENGTH: int = Field(default=50000, env="MAX_TEXT_LENGTH")
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global das configurações
settings = Settings()


def get_settings() -> Settings:
    """Retorna instância das configurações"""
    return settings 