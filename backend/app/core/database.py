from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import logging

from .config import settings

logger = logging.getLogger(__name__)

# Configuração do engine do banco de dados
if settings.DATABASE_URL.startswith("sqlite"):
    # Configuração específica para SQLite
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG
    )
else:
    # Configuração para outros bancos (PostgreSQL, MySQL, etc.)
    engine = create_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True
    )

# Configuração da sessão
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()


def get_database() -> Session:
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Erro na sessão do banco: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_database():
    """Inicializa o banco de dados criando todas as tabelas"""
    try:
        # Importa todos os modelos para garantir que sejam registrados
        from ..models import text_processing, user_configuration
        
        # Cria todas as tabelas
        Base.metadata.create_all(bind=engine)
        logger.info("Banco de dados inicializado com sucesso")
        
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise


def check_database_connection() -> bool:
    """Verifica se a conexão com o banco está funcionando"""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Erro na conexão com banco de dados: {e}")
        return False 