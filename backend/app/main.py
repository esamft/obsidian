from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import sys
from pathlib import Path

# Adiciona o diretório raiz ao path para imports
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import settings
from app.core.database import init_database, check_database_connection
from app.routers import processing

# Configuração de logs
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Criação da aplicação FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de captura e processamento inteligente de texto para Obsidian",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos routers
app.include_router(processing.router)


@app.on_event("startup")
async def startup_event():
    """Evento executado na inicialização da aplicação"""
    logger.info("Iniciando ObsidianAI Sync...")
    
    try:
        # Inicializa banco de dados
        init_database()
        logger.info("Banco de dados inicializado")
        
        # Verifica conexão com banco
        if check_database_connection():
            logger.info("Conexão com banco de dados OK")
        else:
            logger.error("Falha na conexão com banco de dados")
            sys.exit(1)
        
        logger.info(f"ObsidianAI Sync iniciado com sucesso na porta {settings.PORT}")
        
    except Exception as e:
        logger.error(f"Erro na inicialização: {e}")
        sys.exit(1)


@app.on_event("shutdown")
async def shutdown_event():
    """Evento executado no encerramento da aplicação"""
    logger.info("Encerrando ObsidianAI Sync...")


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check da aplicação"""
    try:
        # Verifica banco de dados
        db_ok = check_database_connection()
        
        # Verifica configurações essenciais
        config_ok = bool(settings.CLAUDE_API_KEY and settings.SECRET_KEY)
        
        status = "healthy" if db_ok and config_ok else "unhealthy"
        
        return {
            "status": status,
            "database": "ok" if db_ok else "error",
            "config": "ok" if config_ok else "error",
            "timestamp": "2025-08-04T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Erro no health check: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "error": str(e)
            }
        )


@app.get("/api/categories")
async def get_categories():
    """Retorna categorias disponíveis"""
    return {
        "categories": [
            {
                "id": "inbox",
                "name": "📥 Inbox",
                "description": "Notas gerais e captura rápida",
                "folder": "📥 Inbox",
                "icon": "📥"
            },
            {
                "id": "ideas", 
                "name": "💡 Ideias",
                "description": "Brainstorms e insights criativos",
                "folder": "💡 Ideas",
                "icon": "💡"
            },
            {
                "id": "tasks",
                "name": "✅ Tarefas", 
                "description": "TODOs e gerenciamento de tarefas",
                "folder": "✅ Tasks",
                "icon": "✅"
            },
            {
                "id": "articles",
                "name": "📚 Artigos",
                "description": "Conteúdo longo e referências",
                "folder": "📚 Articles", 
                "icon": "📚"
            },
            {
                "id": "meetings",
                "name": "🤝 Reuniões",
                "description": "Notas de reuniões e encontros",
                "folder": "🤝 Meetings",
                "icon": "🤝"
            },
            {
                "id": "references",
                "name": "📖 Referências",
                "description": "Citações e material de referência",
                "folder": "📖 References",
                "icon": "📖"
            }
        ]
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler para exceções HTTP"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler para exceções gerais"""
    logger.error(f"General Exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erro interno do servidor",
            "detail": str(exc) if settings.DEBUG else "Erro interno"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    ) 