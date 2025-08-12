from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum
import json
from typing import List, Dict, Any

from ..core.database import Base


class ProcessingStatus(enum.Enum):
    """Status do processamento de texto"""
    QUEUED = "queued"
    PROCESSING = "processing"
    PROCESSED = "processed"
    SYNCING = "syncing"
    SYNCED = "synced"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TextProcessingJob(Base):
    """Modelo para jobs de processamento de texto"""
    __tablename__ = "text_processing_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    job_id = Column(String(100), unique=True, nullable=False, index=True)
    
    # Dados de entrada
    original_text = Column(Text, nullable=False)
    category = Column(String(50), default="inbox", index=True)
    priority = Column(String(20), default="normal")
    tags = Column(Text)  # JSON array
    
    # Dados processados
    processed_markdown = Column(Text)
    ai_response = Column(Text)  # Resposta completa da IA
    extracted_metadata = Column(Text)  # JSON com metadados extraídos
    
    # Status e controle
    status = Column(Enum(ProcessingStatus), default=ProcessingStatus.QUEUED, index=True)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Caminhos de arquivo
    obsidian_file_path = Column(String(500))
    temp_file_path = Column(String(500))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    processed_at = Column(DateTime)
    synced_at = Column(DateTime)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Configurações de processamento
    ai_model_used = Column(String(100))
    processing_time_seconds = Column(Integer)
    word_count = Column(Integer)
    char_count = Column(Integer)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.job_id:
            self.job_id = self._generate_job_id()
    
    def _generate_job_id(self) -> str:
        """Gera ID único para o job"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        import secrets
        random_part = secrets.token_hex(8)
        return f"job_{timestamp}_{random_part}"
    
    def get_tags(self) -> List[str]:
        """Retorna tags como lista"""
        if self.tags:
            try:
                return json.loads(self.tags)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_tags(self, tags: List[str]):
        """Define tags como JSON string"""
        self.tags = json.dumps(tags)
    
    def get_metadata(self) -> Dict[str, Any]:
        """Retorna metadados extraídos como dict"""
        if self.extracted_metadata:
            try:
                return json.loads(self.extracted_metadata)
            except json.JSONDecodeError:
                return {}
        return {}
    
    def set_metadata(self, metadata: Dict[str, Any]):
        """Define metadados extraídos como JSON string"""
        self.extracted_metadata = json.dumps(metadata)
    
    def mark_processing_started(self):
        """Marca início do processamento"""
        self.status = ProcessingStatus.PROCESSING
        self.updated_at = datetime.utcnow()
    
    def mark_processing_completed(self, processed_markdown: str, ai_response: str, metadata: Dict[str, Any]):
        """Marca processamento como concluído"""
        self.status = ProcessingStatus.PROCESSED
        self.processed_markdown = processed_markdown
        self.ai_response = ai_response
        self.set_metadata(metadata)
        self.processed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        # Calcula estatísticas
        self.word_count = len(processed_markdown.split())
        self.char_count = len(processed_markdown)
    
    def mark_sync_started(self):
        """Marca início da sincronização"""
        self.status = ProcessingStatus.SYNCING
        self.updated_at = datetime.utcnow()
    
    def mark_sync_completed(self, file_path: str):
        """Marca sincronização como concluída"""
        self.status = ProcessingStatus.SYNCED
        self.obsidian_file_path = file_path
        self.synced_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def mark_failed(self, error_message: str):
        """Marca job como falhado"""
        self.status = ProcessingStatus.FAILED
        self.error_message = error_message
        self.retry_count += 1
        self.updated_at = datetime.utcnow()
    
    def mark_cancelled(self):
        """Marca job como cancelado"""
        self.status = ProcessingStatus.CANCELLED
        self.updated_at = datetime.utcnow()
    
    def can_retry(self) -> bool:
        """Verifica se job pode ser reprocessado"""
        return (
            self.status == ProcessingStatus.FAILED and 
            self.retry_count < 3
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte modelo para dict"""
        return {
            "id": self.id,
            "job_id": self.job_id,
            "user_id": self.user_id,
            "category": self.category,
            "priority": self.priority,
            "tags": self.get_tags(),
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "synced_at": self.synced_at.isoformat() if self.synced_at else None,
            "obsidian_file_path": self.obsidian_file_path,
            "word_count": self.word_count,
            "char_count": self.char_count,
            "processing_time_seconds": self.processing_time_seconds,
            "error_message": self.error_message,
            "retry_count": self.retry_count
        } 