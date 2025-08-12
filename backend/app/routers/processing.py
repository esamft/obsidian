from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging

from ..core.database import get_database
from ..core.security import get_current_user_optional
from ..models.text_processing import TextProcessingJob, ProcessingStatus
from ..models.user_configuration import UserConfiguration
from ..services.ai_processor import AIProcessor
from ..services.obsidian_sync import ObsidianSync
from ..utils.validators import TextInputValidator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/processing", tags=["processing"])

# Instâncias dos serviços
ai_processor = AIProcessor()
obsidian_sync = ObsidianSync()


@router.post("/text")
async def process_text(
    request: TextInputValidator,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_database),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """
    Processa texto e cria nota no Obsidian
    """
    try:
        user_id = current_user["user_id"] if current_user else "anonymous"
        
        # Cria job de processamento
        job = TextProcessingJob(
            user_id=user_id,
            original_text=request.text,
            category=request.category,
            priority=request.priority
        )
        job.set_tags(request.tags)
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Adiciona processamento em background
        background_tasks.add_task(
            process_text_background,
            job.job_id,
            user_id
        )
        
        logger.info(f"Job criado: {job.job_id} para usuário {user_id}")
        
        return {
            "success": True,
            "job_id": job.job_id,
            "status": job.status.value,
            "message": "Texto enviado para processamento"
        }
        
    except Exception as e:
        logger.error(f"Erro ao processar texto: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno do servidor: {str(e)}"
        )


@router.get("/status/{job_id}")
async def get_job_status(
    job_id: str,
    db: Session = Depends(get_database),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """
    Retorna status de um job de processamento
    """
    try:
        user_id = current_user["user_id"] if current_user else "anonymous"
        
        job = db.query(TextProcessingJob).filter(
            TextProcessingJob.job_id == job_id,
            TextProcessingJob.user_id == user_id
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job não encontrado"
            )
        
        return {
            "job_id": job.job_id,
            "status": job.status.value,
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "processed_at": job.processed_at.isoformat() if job.processed_at else None,
            "synced_at": job.synced_at.isoformat() if job.synced_at else None,
            "obsidian_file_path": job.obsidian_file_path,
            "error_message": job.error_message,
            "word_count": job.word_count,
            "char_count": job.char_count,
            "processing_time_seconds": job.processing_time_seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter status do job: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )


@router.get("/jobs")
async def list_user_jobs(
    limit: int = 20,
    offset: int = 0,
    status: Optional[str] = None,
    db: Session = Depends(get_database),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """
    Lista jobs do usuário
    """
    try:
        user_id = current_user["user_id"] if current_user else "anonymous"
        
        query = db.query(TextProcessingJob).filter(
            TextProcessingJob.user_id == user_id
        )
        
        # Filtra por status se especificado
        if status:
            try:
                status_enum = ProcessingStatus(status)
                query = query.filter(TextProcessingJob.status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Status inválido"
                )
        
        # Ordena por data de criação (mais recente primeiro)
        query = query.order_by(TextProcessingJob.created_at.desc())
        
        # Paginação
        total = query.count()
        jobs = query.offset(offset).limit(limit).all()
        
        return {
            "jobs": [job.to_dict() for job in jobs],
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao listar jobs: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )


@router.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: str,
    db: Session = Depends(get_database),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """
    Cancela um job de processamento
    """
    try:
        user_id = current_user["user_id"] if current_user else "anonymous"
        
        job = db.query(TextProcessingJob).filter(
            TextProcessingJob.job_id == job_id,
            TextProcessingJob.user_id == user_id
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job não encontrado"
            )
        
        # Só pode cancelar jobs em fila ou processando
        if job.status not in [ProcessingStatus.QUEUED, ProcessingStatus.PROCESSING]:
            raise HTTPException(
                status_code=400,
                detail="Job não pode ser cancelado neste status"
            )
        
        job.mark_cancelled()
        db.commit()
        
        return {
            "success": True,
            "message": "Job cancelado com sucesso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao cancelar job: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )


@router.post("/jobs/{job_id}/retry")
async def retry_job(
    job_id: str,
    db: Session = Depends(get_database),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """
    Reprocessa um job que falhou
    """
    try:
        user_id = current_user["user_id"] if current_user else "anonymous"
        
        job = db.query(TextProcessingJob).filter(
            TextProcessingJob.job_id == job_id,
            TextProcessingJob.user_id == user_id
        ).first()
        
        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job não encontrado"
            )
        
        if not job.can_retry():
            raise HTTPException(
                status_code=400,
                detail="Job não pode ser reprocessado"
            )
        
        # Reseta status para fila
        job.status = ProcessingStatus.QUEUED
        job.error_message = None
        db.commit()
        
        # Adiciona reprocessamento em background
        from .processing import process_text_background
        import asyncio
        
        asyncio.create_task(
            process_text_background(job.job_id, user_id)
        )
        
        return {
            "success": True,
            "message": "Job enviado para reprocessamento"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao reprocessar job: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )


async def process_text_background(job_id: str, user_id: str):
    """
    Processa texto em background
    """
    from ..core.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Busca job
        job = db.query(TextProcessingJob).filter(
            TextProcessingJob.job_id == job_id
        ).first()
        
        if not job:
            logger.error(f"Job não encontrado: {job_id}")
            return
        
        # Busca configurações do usuário
        user_config = db.query(UserConfiguration).filter(
            UserConfiguration.user_id == user_id
        ).first()
        
        # Marca início do processamento
        job.mark_processing_started()
        db.commit()
        
        try:
            # Processa com IA
            user_preferences = user_config.get_ai_preferences() if user_config else None
            
            processed_data = await ai_processor.process_text(
                text=job.original_text,
                category=job.category,
                user_preferences=user_preferences
            )
            
            # Marca processamento concluído
            job.mark_processing_completed(
                processed_markdown=processed_data["content"],
                ai_response=str(processed_data),
                metadata=processed_data.get("metadata", {})
            )
            
            # Adiciona metadados de processamento
            if "processing_metadata" in processed_data:
                job.processing_time_seconds = processed_data["processing_metadata"].get("processing_time_seconds", 0)
                job.ai_model_used = processed_data["processing_metadata"].get("ai_model_used", "unknown")
            
            db.commit()
            
            # Sincroniza com Obsidian
            if user_config and user_config.auto_sync_enabled:
                await sync_to_obsidian_background(job_id, user_id)
            
        except Exception as e:
            logger.error(f"Erro no processamento: {e}")
            job.mark_failed(str(e))
            db.commit()
            
    except Exception as e:
        logger.error(f"Erro no processamento em background: {e}")
    finally:
        db.close()


async def sync_to_obsidian_background(job_id: str, user_id: str):
    """
    Sincroniza nota com Obsidian em background
    """
    from ..core.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Busca job
        job = db.query(TextProcessingJob).filter(
            TextProcessingJob.job_id == job_id
        ).first()
        
        if not job or job.status != ProcessingStatus.PROCESSED:
            return
        
        # Busca configurações do usuário
        user_config = db.query(UserConfiguration).filter(
            UserConfiguration.user_id == user_id
        ).first()
        
        if not user_config or not user_config.obsidian_vault_path:
            logger.warning(f"Vault não configurado para usuário {user_id}")
            return
        
        # Marca início da sincronização
        job.mark_sync_started()
        db.commit()
        
        try:
            # Cria nota no Obsidian
            obsidian_sync.vault_path = user_config.obsidian_vault_path
            
            processed_data = {
                "title": job.processed_markdown.split('\n')[0].replace('# ', '') if job.processed_markdown else "Nota",
                "content": job.processed_markdown,
                "tags": job.get_tags(),
                "category": job.category,
                "metadata": job.get_metadata()
            }
            
            file_path = await obsidian_sync.create_note(
                processed_data=processed_data,
                category=job.category,
                user_id=user_id
            )
            
            # Marca sincronização concluída
            job.mark_sync_completed(file_path)
            db.commit()
            
            logger.info(f"Nota sincronizada: {file_path}")
            
        except Exception as e:
            logger.error(f"Erro na sincronização: {e}")
            job.mark_failed(f"Erro na sincronização: {str(e)}")
            db.commit()
            
    except Exception as e:
        logger.error(f"Erro na sincronização em background: {e}")
    finally:
        db.close() 