"""
Serviço de processamento de texto com OpenAI
"""
import os
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("DEFAULT_AI_MODEL", "gpt-5-mini")
        
    def process_text(self, text: str, category: str = "inbox") -> Dict[str, Any]:
        """
        Processa texto e converte para formato Markdown do Obsidian
        """
        prompt = self._build_prompt(text, category)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Você é um assistente especializado em organizar e estruturar notas em Markdown para o Obsidian."},
                    {"role": "user", "content": prompt}
                ],
                max_completion_tokens=2000
            )
            
            content = response.choices[0].message.content or ""
            
            return {
                "success": True,
                "content": content,
                "metadata": {
                    "model": self.model,
                    "category": category,
                    "tokens_used": response.usage.total_tokens if response.usage else 0
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": text  # Retorna texto original em caso de erro
            }
    
    def _build_prompt(self, text: str, category: str) -> str:
        """
        Constrói o prompt para template padronizado de rascunho
        """
        return f"""
Crie uma nota de rascunho no seguinte formato EXATO:

# [Título descritivo baseado no conteúdo]

**Data:** {self._get_current_date()}  
**Tipo:** Rascunho

## Resumo
[Se o texto for pequeno (<200 caracteres): manter o texto original]
[Se o texto for grande (>200 caracteres): criar resumo de 2-3 linhas]

## Conteúdo Original
{text}

---
*Nota criada automaticamente - para ser processada posteriormente*

TEXTO A PROCESSAR:
{text}

INSTRUÇÕES:
- Crie um título claro e descritivo
- Se o texto for pequeno, use ele inteiro no resumo
- Se o texto for grande, faça um resumo conciso de 2-3 linhas
- NÃO criar check-lists
- Manter formato simples para processamento posterior
"""
    
    def _get_current_date(self) -> str:
        """Retorna data atual formatada"""
        from datetime import datetime
        return datetime.now().strftime("%d/%m/%Y")