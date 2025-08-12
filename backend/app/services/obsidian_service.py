"""
Serviço de sincronização com Obsidian
"""
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class ObsidianService:
    def __init__(self):
        self.vault_path = Path(os.getenv("OBSIDIAN_VAULT_PATH", ""))
        self.folders = {
            "inbox": os.getenv("DEFAULT_INBOX_FOLDER", "Inbox")
        }
        
    def ensure_folders(self):
        """
        Garante que as pastas existem no vault
        """
        if not self.vault_path.exists():
            return {"success": False, "error": f"Vault não encontrado: {self.vault_path}"}
        
        for folder in self.folders.values():
            folder_path = self.vault_path / folder
            folder_path.mkdir(exist_ok=True)
            
        return {"success": True}
    
    def save_note(self, content: str, category: str = "inbox", title: str = None) -> Dict[str, Any]:
        """
        Salva uma nota no Obsidian vault
        """
        try:
            # Garante que as pastas existem
            self.ensure_folders()
            
            # Define o título se não fornecido
            if not title:
                # Extrai primeira linha ou usa timestamp
                first_line = content.split('\n')[0] if content else ""
                if first_line.startswith('#'):
                    title = first_line.replace('#', '').strip()
                else:
                    title = datetime.now().strftime("Nota %Y-%m-%d %H-%M")
            
            # Limpa o título para nome de arquivo
            safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_title = safe_title[:100]  # Limita tamanho
            
            # Define caminho do arquivo
            folder = self.folders.get(category, self.folders["inbox"])
            file_path = self.vault_path / folder / f"{safe_title}.md"
            
            # Adiciona metadados se não existirem
            if not content.startswith('---'):
                metadata = f"""---
created: {datetime.now().strftime('%Y-%m-%d %H:%M')}
category: {category}
tags: [ai-processed, {category}]
---

"""
                content = metadata + content
            
            # Salva o arquivo
            file_path.write_text(content, encoding='utf-8')
            
            return {
                "success": True,
                "file_path": str(file_path),
                "title": title,
                "category": category
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_recent_notes(self, limit: int = 10) -> list:
        """
        Lista as notas mais recentes
        """
        try:
            notes = []
            for folder in self.folders.values():
                folder_path = self.vault_path / folder
                if folder_path.exists():
                    for file in folder_path.glob("*.md"):
                        notes.append({
                            "name": file.stem,
                            "path": str(file),
                            "folder": folder,
                            "modified": file.stat().st_mtime
                        })
            
            # Ordena por data de modificação
            notes.sort(key=lambda x: x["modified"], reverse=True)
            
            return notes[:limit]
            
        except Exception as e:
            return []