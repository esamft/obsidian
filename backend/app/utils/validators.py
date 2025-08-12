import re
import bleach
from typing import List, Optional
from pydantic import BaseModel, validator, Field

from ..core.config import settings


class TextInputValidator(BaseModel):
    """Validador para entrada de texto"""
    text: str = Field(..., description="Texto a ser processado")
    category: str = Field(default="inbox", description="Categoria da nota")
    priority: str = Field(default="normal", description="Prioridade")
    tags: List[str] = Field(default=[], description="Tags personalizadas")
    
    @validator('text')
    def validate_text(cls, v):
        if not v or not v.strip():
            raise ValueError('Texto não pode estar vazio')
        
        if len(v) > settings.MAX_TEXT_LENGTH:
            raise ValueError(f'Texto muito longo (máximo {settings.MAX_TEXT_LENGTH} caracteres)')
        
        # Sanitização XSS
        cleaned_text = bleach.clean(
            v, 
            tags=[], 
            attributes={},
            strip=True
        )
        
        return cleaned_text
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['inbox', 'ideas', 'tasks', 'articles', 'meetings', 'references']
        if v not in allowed_categories:
            raise ValueError(f'Categoria deve ser uma das: {", ".join(allowed_categories)}')
        return v
    
    @validator('priority')
    def validate_priority(cls, v):
        allowed_priorities = ['low', 'normal', 'high', 'urgent']
        if v not in allowed_priorities:
            raise ValueError(f'Prioridade deve ser uma das: {", ".join(allowed_priorities)}')
        return v
    
    @validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Máximo 10 tags permitidas')
        
        # Sanitização de tags
        clean_tags = []
        for tag in v:
            # Remove caracteres especiais e limita tamanho
            clean_tag = re.sub(r'[^a-zA-Z0-9_-]', '', tag.lower())
            if clean_tag and len(clean_tag) <= 50:
                clean_tags.append(clean_tag)
        
        return clean_tags[:10]  # Garante máximo de 10


class ConfigurationValidator(BaseModel):
    """Validador para configurações do usuário"""
    obsidian_vault_path: Optional[str] = Field(None, description="Caminho do vault do Obsidian")
    sync_method: str = Field(default="filesystem", description="Método de sincronização")
    default_category: str = Field(default="inbox", description="Categoria padrão")
    auto_sync_enabled: bool = Field(default=True, description="Sincronização automática")
    backup_before_sync: bool = Field(default=True, description="Backup antes da sincronização")
    
    @validator('obsidian_vault_path')
    def validate_vault_path(cls, v):
        if v:
            # Validação básica de path
            if not re.match(r'^[a-zA-Z0-9/\\._\-\s:]+$', v):
                raise ValueError('Caminho do vault contém caracteres inválidos')
            
            if len(v) > 500:
                raise ValueError('Caminho muito longo')
        
        return v
    
    @validator('sync_method')
    def validate_sync_method(cls, v):
        allowed_methods = ['filesystem', 'icloud', 'dropbox', 'onedrive', 'git']
        if v not in allowed_methods:
            raise ValueError(f'Método de sync deve ser um dos: {", ".join(allowed_methods)}')
        return v
    
    @validator('default_category')
    def validate_default_category(cls, v):
        allowed_categories = ['inbox', 'ideas', 'tasks', 'articles', 'meetings', 'references']
        if v not in allowed_categories:
            raise ValueError(f'Categoria padrão deve ser uma das: {", ".join(allowed_categories)}')
        return v


class AIPreferencesValidator(BaseModel):
    """Validador para preferências de IA"""
    creativity_level: str = Field(default="balanced", description="Nível de criatividade")
    verbosity: str = Field(default="normal", description="Nível de detalhamento")
    language_tone: str = Field(default="professional", description="Tom da linguagem")
    include_metadata: bool = Field(default=True, description="Incluir metadados")
    include_word_count: bool = Field(default=True, description="Incluir contagem de palavras")
    include_reading_time: bool = Field(default=True, description="Incluir tempo de leitura")
    auto_extract_tags: bool = Field(default=True, description="Extrair tags automaticamente")
    max_tags: int = Field(default=5, ge=1, le=20, description="Máximo de tags")
    preferred_language: str = Field(default="pt-BR", description="Idioma preferido")
    
    @validator('creativity_level')
    def validate_creativity_level(cls, v):
        allowed_levels = ['conservative', 'balanced', 'creative']
        if v not in allowed_levels:
            raise ValueError(f'Nível de criatividade deve ser um dos: {", ".join(allowed_levels)}')
        return v
    
    @validator('verbosity')
    def validate_verbosity(cls, v):
        allowed_levels = ['concise', 'normal', 'detailed']
        if v not in allowed_levels:
            raise ValueError(f'Nível de detalhamento deve ser um dos: {", ".join(allowed_levels)}')
        return v
    
    @validator('language_tone')
    def validate_language_tone(cls, v):
        allowed_tones = ['casual', 'professional', 'academic']
        if v not in allowed_tones:
            raise ValueError(f'Tom da linguagem deve ser um dos: {", ".join(allowed_tones)}')
        return v
    
    @validator('preferred_language')
    def validate_preferred_language(cls, v):
        allowed_languages = ['pt-BR', 'en-US', 'es-ES']
        if v not in allowed_languages:
            raise ValueError(f'Idioma deve ser um dos: {", ".join(allowed_languages)}')
        return v


def sanitize_filename(filename: str) -> str:
    """Remove caracteres inválidos para nome de arquivo"""
    # Remove/substitui caracteres problemáticos
    invalid_chars = {
        '<': '_', '>': '_', ':': '_', '"': '_', 
        '/': '_', '\\': '_', '|': '_', '?': '_', '*': '_',
        '\n': ' ', '\r': ' ', '\t': ' '
    }
    
    for invalid, replacement in invalid_chars.items():
        filename = filename.replace(invalid, replacement)
    
    # Remove espaços extras e limita tamanho
    filename = ' '.join(filename.split())
    filename = filename[:50]
    
    return filename


def validate_url(url: str) -> bool:
    """Valida se uma URL é válida"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return bool(re.match(url_pattern, url))


def validate_email(email: str) -> bool:
    """Valida se um email é válido"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return bool(re.match(email_pattern, email))


def extract_urls_from_text(text: str) -> List[str]:
    """Extrai URLs de um texto"""
    url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
    return re.findall(url_pattern, text)


def extract_emails_from_text(text: str) -> List[str]:
    """Extrai emails de um texto"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.findall(email_pattern, text)


def detect_content_type(text: str) -> str:
    """Detecta o tipo de conteúdo baseado no texto"""
    text_lower = text.lower()
    
    # Detecção de URLs
    if extract_urls_from_text(text):
        return "url"
    
    # Detecção de emails
    if extract_emails_from_text(text):
        return "email"
    
    # Detecção de tarefas (checkboxes)
    if re.search(r'- \[ \]', text) or re.search(r'- \[x\]', text):
        return "tasks"
    
    # Detecção de ideias (palavras-chave)
    idea_keywords = ['ideia', 'idea', 'brainstorm', 'conceito', 'concept', 'inovação', 'innovation']
    if any(keyword in text_lower for keyword in idea_keywords):
        return "ideas"
    
    # Detecção de artigos (texto longo)
    if len(text.split()) > 100:
        return "articles"
    
    # Padrão
    return "inbox" 