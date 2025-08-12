"""
API Principal Simplificada - ObsidianAI Sync
"""
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import sys
from pathlib import Path
import shutil

# Adiciona o diretório pai ao path
sys.path.append(str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

# Importa serviços
from app.services.ai_service import AIService
from app.services.obsidian_service import ObsidianService
from app.services.file_processor import FileProcessor

# Inicializa FastAPI
app = FastAPI(
    title="ObsidianAI Sync API",
    version="1.0.0",
    description="API para processar texto com IA e sincronizar com Obsidian"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa serviços
ai_service = AIService()
obsidian_service = ObsidianService()
file_processor = FileProcessor()

# Modelos Pydantic
class ProcessRequest(BaseModel):
    text: str
    category: Optional[str] = "inbox"
    title: Optional[str] = None
    attachments: Optional[List[str]] = []

class ProcessResponse(BaseModel):
    success: bool
    message: str
    file_path: Optional[str] = None
    content: Optional[str] = None
    error: Optional[str] = None

# Endpoints
@app.get("/")
async def root():
    return {
        "name": "ObsidianAI Sync API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Verifica saúde da API"""
    vault_path = os.getenv("OBSIDIAN_VAULT_PATH", "")
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    vault_exists = bool(vault_path and os.path.exists(vault_path))
    api_configured = bool(api_key and api_key != "your-openai-api-key-here")
    
    return {
        "status": "healthy" if (vault_exists and api_configured) else "needs_configuration",
        "vault_configured": vault_exists,
        "vault_path": vault_path if vault_exists else "Not configured",
        "api_configured": api_configured
    }

@app.post("/api/process", response_model=ProcessResponse)
async def process_text(request: ProcessRequest):
    """
    Processa texto com IA e salva no Obsidian
    """
    try:
        # Validação básica
        if not request.text or len(request.text.strip()) < 3:
            return ProcessResponse(
                success=False,
                message="Texto muito curto ou vazio",
                error="Mínimo 3 caracteres"
            )
        
        # Combinar texto digitado com conteúdo extraído dos arquivos
        combined_text = request.text
        
        if request.attachments:
            print(f"Processando {len(request.attachments)} arquivos anexados...")
            
            # Buscar arquivos na pasta Attachments
            vault_path = os.getenv("OBSIDIAN_VAULT_PATH")
            attachment_paths = []
            
            for filename in request.attachments:
                file_path = Path(vault_path) / "Attachments" / filename
                if file_path.exists():
                    attachment_paths.append(str(file_path))
            
            # Extrair conteúdo dos arquivos
            if attachment_paths:
                files_content = file_processor.process_multiple_files(attachment_paths)
                combined_text = f"{request.text}\n\n--- CONTEÚDO DOS ARQUIVOS ---\n{files_content}"
        
        # 1. Processa com IA
        print(f"Processando texto combinado com {len(combined_text)} caracteres...")
        ai_result = ai_service.process_text(combined_text, request.category)
        
        if not ai_result["success"]:
            return ProcessResponse(
                success=False,
                message="Erro no processamento com IA",
                error=ai_result.get("error", "Erro desconhecido")
            )
        
        # 2. Salva no Obsidian
        print(f"Salvando nota na categoria {request.category}...")
        obsidian_result = obsidian_service.save_note(
            content=ai_result["content"],
            category=request.category,
            title=request.title
        )
        
        if not obsidian_result["success"]:
            return ProcessResponse(
                success=False,
                message="Erro ao salvar no Obsidian",
                error=obsidian_result.get("error", "Erro ao salvar arquivo")
            )
        
        return ProcessResponse(
            success=True,
            message=f"✅ Nota criada com sucesso em {request.category}!",
            file_path=obsidian_result["file_path"],
            content=ai_result["content"][:500] + "..." if len(ai_result["content"]) > 500 else ai_result["content"]
        )
        
    except Exception as e:
        print(f"Erro: {str(e)}")
        return ProcessResponse(
            success=False,
            message="Erro no processamento",
            error=str(e)
        )

@app.get("/api/notes/recent")
async def get_recent_notes(limit: int = 10):
    """
    Lista notas recentes
    """
    notes = obsidian_service.list_recent_notes(limit)
    return {"notes": notes, "total": len(notes)}

@app.get("/api/categories")
async def get_categories():
    """
    Retorna categorias disponíveis
    """
    return {
        "categories": [
            {"id": "inbox", "name": "Inbox", "icon": "📥", "description": "Todas as notas"}
        ]
    }

@app.post("/api/test")
async def test_processing():
    """
    Endpoint de teste rápido
    """
    test_text = "Esta é uma nota de teste para verificar se o sistema está funcionando corretamente. Deve ser processada e salva no Obsidian."
    
    # Processa
    ai_result = ai_service.process_text(test_text, "inbox")
    
    # Salva
    if ai_result["success"]:
        obsidian_result = obsidian_service.save_note(
            content=ai_result["content"],
            category="inbox",
            title="Teste do Sistema"
        )
        return {
            "success": True,
            "message": "✅ Teste executado com sucesso!",
            "ai_processing": "OK",
            "file_saved": obsidian_result.get("success", False),
            "file_path": obsidian_result.get("file_path", None)
        }
    
    return {
        "success": False,
        "error": "Falha no teste",
        "details": ai_result.get("error")
    }

@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Upload de arquivos (imagens, PDFs, docs)
    """
    try:
        uploaded_files = []
        upload_dir = Path(os.getenv("OBSIDIAN_VAULT_PATH")) / "Attachments"
        upload_dir.mkdir(exist_ok=True)
        
        for file in files:
            # Validar tipo de arquivo
            allowed_types = {
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain'
            }
            
            if file.content_type not in allowed_types:
                return {"success": False, "error": f"Tipo de arquivo não suportado: {file.content_type}"}
            
            # Salvar arquivo
            file_path = upload_dir / file.filename
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Extrair conteúdo do arquivo
            try:
                extracted_content = file_processor.extract_text_from_file(str(file_path))
            except Exception as e:
                extracted_content = f"[Erro na extração: {str(e)}]"
            
            uploaded_files.append({
                "filename": file.filename,
                "path": str(file_path),
                "type": file.content_type,
                "extracted_content": extracted_content[:500] + "..." if len(extracted_content) > 500 else extracted_content
            })
        
        return {
            "success": True,
            "message": f"{len(uploaded_files)} arquivo(s) processado(s)",
            "files": uploaded_files
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=True)