import os
import shutil
import yaml
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from ..core.config import settings

logger = logging.getLogger(__name__)


class ObsidianVaultMonitor(FileSystemEventHandler):
    """Monitor de eventos do vault do Obsidian"""
    
    def __init__(self, sync_service):
        self.sync_service = sync_service
        self.processing_files = set()
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        if event.src_path.endswith('.md'):
            logger.info(f"Arquivo criado no vault: {event.src_path}")
    
    def on_modified(self, event):
        if event.is_directory or not event.src_path.endswith('.md'):
            return
        
        # Evita loops de sincronização
        if event.src_path not in self.processing_files:
            logger.info(f"Arquivo modificado no vault: {event.src_path}")


class ObsidianSync:
    """Serviço de sincronização com vault do Obsidian"""
    
    def __init__(self, vault_path: str = None):
        self.vault_path = Path(vault_path) if vault_path else Path(settings.DEFAULT_VAULT_PATH)
        self.observer = None
        self.monitor = None
        
        # Estrutura de pastas padrão
        self.folder_mapping = {
            "inbox": "📥 Inbox",
            "ideas": "💡 Ideas", 
            "tasks": "✅ Tasks",
            "articles": "📚 Articles",
            "meetings": "🤝 Meetings",
            "references": "📖 References"
        }
        
        if self.vault_path.exists():
            self._ensure_directories()
    
    def _ensure_directories(self):
        """Cria estrutura de diretórios necessária"""
        try:
            for folder_name in self.folder_mapping.values():
                folder_path = self.vault_path / folder_name
                folder_path.mkdir(exist_ok=True)
                logger.info(f"Diretório verificado/criado: {folder_path}")
        except Exception as e:
            logger.error(f"Erro ao criar diretórios: {e}")
            raise
    
    async def create_note(
        self, 
        processed_data: Dict[str, Any], 
        category: str = "inbox",
        user_id: str = None
    ) -> str:
        """
        Cria arquivo de nota no vault
        """
        try:
            # Determina pasta de destino
            target_folder = self.vault_path / self.folder_mapping.get(category, "📥 Inbox")
            
            # Garante que a pasta existe
            target_folder.mkdir(exist_ok=True)
            
            # Gera nome de arquivo único
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_title = self._sanitize_filename(processed_data["title"])
            filename = f"{timestamp}_{safe_title}.md"
            file_path = target_folder / filename
            
            # Constrói conteúdo final
            content = self._build_note_content(processed_data, user_id)
            
            # Escreve arquivo
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Nota criada com sucesso: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Erro ao criar nota: {e}")
            raise
    
    def _build_note_content(self, data: Dict[str, Any], user_id: str = None) -> str:
        """
        Constrói conteúdo completo da nota com frontmatter
        """
        # Frontmatter YAML
        frontmatter = {
            "title": data["title"],
            "created": datetime.now().isoformat(),
            "tags": data.get("tags", []),
            "category": data.get("category", "inbox"),
            "processed_by": "ObsidianAI Sync",
            "user_id": user_id
        }
        
        # Adiciona metadados extras se existirem
        if "metadata" in data:
            frontmatter.update(data["metadata"])
        
        # Adiciona metadados de processamento se existirem
        if "processing_metadata" in data:
            frontmatter["processing"] = data["processing_metadata"]
        
        # Gera YAML
        yaml_header = yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True)
        
        # Constrói conteúdo final
        content = f"---\n{yaml_header}---\n\n{data['content']}"
        
        return content
    
    def _sanitize_filename(self, title: str) -> str:
        """Remove caracteres inválidos para nome de arquivo"""
        # Remove/substitui caracteres problemáticos
        invalid_chars = {
            '<': '_', '>': '_', ':': '_', '"': '_', 
            '/': '_', '\\': '_', '|': '_', '?': '_', '*': '_',
            '\n': ' ', '\r': ' ', '\t': ' '
        }
        
        for invalid, replacement in invalid_chars.items():
            title = title.replace(invalid, replacement)
        
        # Remove espaços extras e limita tamanho
        title = ' '.join(title.split())
        title = title[:50]
        
        return title
    
    async def start_monitoring(self):
        """Inicia monitoramento do vault"""
        if not self.vault_path.exists():
            logger.warning(f"Vault não existe: {self.vault_path}")
            return
        
        try:
            self.monitor = ObsidianVaultMonitor(self)
            self.observer = Observer()
            self.observer.schedule(
                self.monitor, 
                str(self.vault_path), 
                recursive=True
            )
            self.observer.start()
            logger.info(f"Monitoramento iniciado para: {self.vault_path}")
        except Exception as e:
            logger.error(f"Erro ao iniciar monitoramento: {e}")
    
    async def stop_monitoring(self):
        """Para monitoramento do vault"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("Monitoramento parado")
    
    def get_vault_info(self) -> Dict[str, Any]:
        """Retorna informações sobre o vault"""
        if not self.vault_path.exists():
            return {
                "exists": False,
                "path": str(self.vault_path),
                "error": "Vault não encontrado"
            }
        
        try:
            # Conta arquivos por categoria
            file_counts = {}
            total_files = 0
            
            for category, folder_name in self.folder_mapping.items():
                folder_path = self.vault_path / folder_name
                if folder_path.exists():
                    count = len(list(folder_path.glob("*.md")))
                    file_counts[category] = count
                    total_files += count
                else:
                    file_counts[category] = 0
            
            return {
                "exists": True,
                "path": str(self.vault_path),
                "total_files": total_files,
                "file_counts": file_counts,
                "folders": list(self.folder_mapping.values()),
                "last_sync": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter informações do vault: {e}")
            return {
                "exists": True,
                "path": str(self.vault_path),
                "error": str(e)
            }
    
    def validate_vault_path(self, path: str) -> Dict[str, Any]:
        """Valida se um caminho é um vault válido do Obsidian"""
        vault_path = Path(path)
        
        if not vault_path.exists():
            return {
                "valid": False,
                "error": "Caminho não existe"
            }
        
        if not vault_path.is_dir():
            return {
                "valid": False,
                "error": "Caminho não é um diretório"
            }
        
        # Verifica se tem arquivo .obsidian (configuração do Obsidian)
        obsidian_config = vault_path / ".obsidian"
        if not obsidian_config.exists():
            return {
                "valid": False,
                "error": "Não parece ser um vault do Obsidian (falta pasta .obsidian)"
            }
        
        # Verifica se tem pelo menos alguns arquivos .md
        md_files = list(vault_path.glob("**/*.md"))
        if len(md_files) == 0:
            return {
                "valid": True,
                "warning": "Vault está vazio (nenhum arquivo .md encontrado)"
            }
        
        return {
            "valid": True,
            "md_files_count": len(md_files),
            "message": "Vault válido do Obsidian"
        }
    
    async def backup_vault(self, backup_path: str = None) -> str:
        """Cria backup do vault"""
        if not backup_path:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = f"backup_vault_{timestamp}"
        
        backup_path = Path(backup_path)
        
        try:
            if self.vault_path.exists():
                shutil.copytree(self.vault_path, backup_path)
                logger.info(f"Backup criado: {backup_path}")
                return str(backup_path)
            else:
                raise FileNotFoundError("Vault não existe")
                
        except Exception as e:
            logger.error(f"Erro ao criar backup: {e}")
            raise
    
    def get_recent_notes(self, limit: int = 10) -> list:
        """Retorna notas mais recentes do vault"""
        if not self.vault_path.exists():
            return []
        
        try:
            all_files = []
            for folder_name in self.folder_mapping.values():
                folder_path = self.vault_path / folder_name
                if folder_path.exists():
                    for md_file in folder_path.glob("*.md"):
                        stat = md_file.stat()
                        all_files.append({
                            "path": str(md_file),
                            "name": md_file.name,
                            "folder": folder_name,
                            "modified": datetime.fromtimestamp(stat.st_mtime),
                            "size": stat.st_size
                        })
            
            # Ordena por data de modificação (mais recente primeiro)
            all_files.sort(key=lambda x: x["modified"], reverse=True)
            
            return all_files[:limit]
            
        except Exception as e:
            logger.error(f"Erro ao obter notas recentes: {e}")
            return [] 