from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
import json
from typing import List, Dict, Any

from ..core.database import Base


class UserConfiguration(Base):
    """Modelo para configurações do usuário"""
    __tablename__ = "user_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Configurações do Obsidian
    obsidian_vault_path = Column(String(500))
    sync_method = Column(String(50), default="filesystem")
    auto_sync_enabled = Column(Boolean, default=True)
    backup_before_sync = Column(Boolean, default=True)
    
    # Configurações de categorias
    default_category = Column(String(50), default="inbox")
    categories_config = Column(Text)  # JSON com configurações de categorias
    
    # Configurações de templates
    default_template_style = Column(String(50), default="clean")
    templates_config = Column(Text)  # JSON com configurações de templates
    
    # Configurações de IA
    ai_preferences = Column(Text)  # JSON com preferências de IA
    ai_creativity_level = Column(String(20), default="balanced")
    ai_verbosity = Column(String(20), default="normal")
    ai_language_tone = Column(String(20), default="professional")
    
    # Configurações de tags
    auto_tag_enabled = Column(Boolean, default=True)
    default_tags = Column(Text)  # JSON array
    preferred_tags = Column(Text)  # JSON array
    
    # Configurações de organização
    auto_categorization = Column(Boolean, default=True)
    folder_structure_style = Column(String(20), default="category")
    
    # Configurações de produtividade
    enable_task_tracking = Column(Boolean, default=False)
    enable_idea_tracking = Column(Boolean, default=False)
    enable_article_tracking = Column(Boolean, default=False)
    default_project = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id: str, **kwargs):
        super().__init__(user_id=user_id, **kwargs)
        # Inicializa configurações padrão
        if not self.categories_config:
            self.categories_config = json.dumps(self._get_default_categories())
        if not self.templates_config:
            self.templates_config = json.dumps(self._get_default_templates())
        if not self.ai_preferences:
            self.ai_preferences = json.dumps(self._get_default_ai_preferences())
    
    def _get_default_categories(self) -> Dict[str, Any]:
        """Retorna configurações padrão de categorias"""
        return {
            "inbox": {
                "name": "📥 Inbox",
                "description": "Notas gerais e captura rápida",
                "folder": "📥 Inbox",
                "icon": "📥",
                "enabled": True,
                "auto_categorize": True
            },
            "ideas": {
                "name": "💡 Ideias",
                "description": "Brainstorms e insights criativos",
                "folder": "💡 Ideas",
                "icon": "💡",
                "enabled": True,
                "auto_categorize": True
            },
            "tasks": {
                "name": "✅ Tarefas",
                "description": "TODOs e gerenciamento de tarefas",
                "folder": "✅ Tasks",
                "icon": "✅",
                "enabled": True,
                "auto_categorize": True
            },
            "articles": {
                "name": "📚 Artigos",
                "description": "Conteúdo longo e referências",
                "folder": "📚 Articles",
                "icon": "📚",
                "enabled": True,
                "auto_categorize": True
            },
            "meetings": {
                "name": "🤝 Reuniões",
                "description": "Notas de reuniões e encontros",
                "folder": "🤝 Meetings",
                "icon": "🤝",
                "enabled": True,
                "auto_categorize": False
            },
            "references": {
                "name": "📖 Referências",
                "description": "Citações e material de referência",
                "folder": "📖 References",
                "icon": "📖",
                "enabled": True,
                "auto_categorize": False
            }
        }
    
    def _get_default_templates(self) -> Dict[str, Any]:
        """Retorna configurações padrão de templates"""
        return {
            "inbox": {
                "template_name": "inbox_basic",
                "enabled": True,
                "custom_variables": {},
                "ai_instructions": "Processe como nota geral de inbox"
            },
            "ideas": {
                "template_name": "ideas_advanced",
                "enabled": True,
                "custom_variables": {},
                "ai_instructions": "Processe como ideia criativa com desdobramentos"
            },
            "tasks": {
                "template_name": "tasks_advanced",
                "enabled": True,
                "custom_variables": {},
                "ai_instructions": "Processe como lista de tarefas estruturada"
            },
            "articles": {
                "template_name": "articles_advanced",
                "enabled": True,
                "custom_variables": {},
                "ai_instructions": "Processe como artigo com resumo e pontos-chave"
            }
        }
    
    def _get_default_ai_preferences(self) -> Dict[str, Any]:
        """Retorna preferências padrão de IA"""
        return {
            "creativity_level": "balanced",
            "verbosity": "normal",
            "language_tone": "professional",
            "include_metadata": True,
            "include_word_count": True,
            "include_reading_time": True,
            "auto_extract_tags": True,
            "max_tags": 5,
            "preferred_language": "pt-BR"
        }
    
    def get_categories_config(self) -> Dict[str, Any]:
        """Retorna configurações de categorias como dict"""
        if self.categories_config:
            try:
                return json.loads(self.categories_config)
            except json.JSONDecodeError:
                return self._get_default_categories()
        return self._get_default_categories()
    
    def set_categories_config(self, config: Dict[str, Any]):
        """Define configurações de categorias"""
        self.categories_config = json.dumps(config)
    
    def get_templates_config(self) -> Dict[str, Any]:
        """Retorna configurações de templates como dict"""
        if self.templates_config:
            try:
                return json.loads(self.templates_config)
            except json.JSONDecodeError:
                return self._get_default_templates()
        return self._get_default_templates()
    
    def set_templates_config(self, config: Dict[str, Any]):
        """Define configurações de templates"""
        self.templates_config = json.dumps(config)
    
    def get_ai_preferences(self) -> Dict[str, Any]:
        """Retorna preferências de IA como dict"""
        if self.ai_preferences:
            try:
                return json.loads(self.ai_preferences)
            except json.JSONDecodeError:
                return self._get_default_ai_preferences()
        return self._get_default_ai_preferences()
    
    def set_ai_preferences(self, preferences: Dict[str, Any]):
        """Define preferências de IA"""
        self.ai_preferences = json.dumps(preferences)
    
    def get_default_tags(self) -> List[str]:
        """Retorna tags padrão como lista"""
        if self.default_tags:
            try:
                return json.loads(self.default_tags)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_default_tags(self, tags: List[str]):
        """Define tags padrão"""
        self.default_tags = json.dumps(tags)
    
    def get_preferred_tags(self) -> List[str]:
        """Retorna tags preferidas como lista"""
        if self.preferred_tags:
            try:
                return json.loads(self.preferred_tags)
            except json.JSONDecodeError:
                return []
        return []
    
    def set_preferred_tags(self, tags: List[str]):
        """Define tags preferidas"""
        self.preferred_tags = json.dumps(tags)
    
    def get_enabled_categories(self) -> List[str]:
        """Retorna lista de categorias habilitadas"""
        categories = self.get_categories_config()
        return [
            category_id for category_id, config in categories.items()
            if config.get("enabled", True)
        ]
    
    def to_dict(self) -> Dict[str, Any]:
        """Converte modelo para dict"""
        return {
            "user_id": self.user_id,
            "obsidian_vault_path": self.obsidian_vault_path,
            "sync_method": self.sync_method,
            "auto_sync_enabled": self.auto_sync_enabled,
            "backup_before_sync": self.backup_before_sync,
            "default_category": self.default_category,
            "categories_config": self.get_categories_config(),
            "templates_config": self.get_templates_config(),
            "ai_preferences": self.get_ai_preferences(),
            "ai_creativity_level": self.ai_creativity_level,
            "ai_verbosity": self.ai_verbosity,
            "ai_language_tone": self.ai_language_tone,
            "auto_tag_enabled": self.auto_tag_enabled,
            "default_tags": self.get_default_tags(),
            "preferred_tags": self.get_preferred_tags(),
            "auto_categorization": self.auto_categorization,
            "folder_structure_style": self.folder_structure_style,
            "enable_task_tracking": self.enable_task_tracking,
            "enable_idea_tracking": self.enable_idea_tracking,
            "enable_article_tracking": self.enable_article_tracking,
            "default_project": self.default_project,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        } 