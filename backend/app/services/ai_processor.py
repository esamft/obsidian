import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential

from anthropic import Anthropic
from ..core.config import settings

logger = logging.getLogger(__name__)


class AIProcessor:
    """Serviço para processamento de texto com Claude API"""
    
    def __init__(self):
        self.client = Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.max_tokens = settings.CLAUDE_MAX_TOKENS
        self.temperature = settings.CLAUDE_TEMPERATURE
        self.prompts = self._load_prompt_templates()
    
    def _load_prompt_templates(self) -> Dict[str, Dict[str, str]]:
        """Carrega templates de prompts por categoria"""
        return {
            "inbox": {
                "system": """Você é um especialista em organização de informações e criação de notas estruturadas.""",
                "user_template": """
                Analise o seguinte texto e transforme-o em uma nota Markdown bem estruturada:

                INSTRUÇÕES GERAIS:
                1. Crie um título claro e descritivo
                2. Organize o conteúdo com hierarquia apropriada
                3. Extraia tags relevantes (máximo 5)
                4. Identifique informações-chave
                5. Mantenha o tom e contexto original

                FORMATO DE RESPOSTA (JSON):
                {{
                    "title": "Título da nota",
                    "content": "# Título\\n\\nConteúdo em Markdown...",
                    "tags": ["tag1", "tag2"],
                    "category": "categoria_sugerida",
                    "metadata": {{
                        "priority": "normal|high|low",
                        "type": "article|idea|task|note|reference",
                        "estimated_read_time": "X min",
                        "key_points": ["ponto1", "ponto2"],
                        "action_items": ["ação1", "ação2"]
                    }}
                }}

                TEXTO A PROCESSAR:
                {text}
                """
            },
            
            "ideas": {
                "system": """Você é um especialista em brainstorming e desenvolvimento de ideias criativas.""",
                "user_template": """
                Transforme o seguinte texto em uma nota estruturada de IDEIA:

                FOCO ESPECIAL PARA IDEIAS:
                1. Identifique o conceito central
                2. Explore desdobramentos possíveis
                3. Sugira conexões com outros tópicos
                4. Proponha próximos passos
                5. Categorize o tipo de ideia

                ESTRUTURA ESPERADA:
                - Título criativo e memorável
                - Descrição clara da ideia principal
                - Bullet points com desdobramentos
                - Seção de "Conexões Possíveis"
                - Lista de "Próximos Passos"

                FORMATO DE RESPOSTA (JSON):
                {{
                    "title": "Título da ideia",
                    "content": "# Título\\n\\n## Ideia Principal\\n\\n## Desdobramentos\\n\\n## Conexões Possíveis\\n\\n## Próximos Passos",
                    "tags": ["ideias", "brainstorm"],
                    "category": "ideas",
                    "metadata": {{
                        "idea_type": "product|process|concept|improvement",
                        "potential_impact": "high|medium|low",
                        "feasibility": "easy|medium|hard",
                        "time_horizon": "short|medium|long"
                    }}
                }}

                TEXTO A PROCESSAR:
                {text}
                """
            },
            
            "tasks": {
                "system": """Você é um especialista em produtividade e gestão de tarefas.""",
                "user_template": """
                Converta o seguinte texto em uma lista de TAREFAS estruturada:

                FOCO ESPECIAL PARA TAREFAS:
                1. Identifique ações específicas e mensuráveis
                2. Extraia prazos mencionados
                3. Identifique pessoas envolvidas
                4. Organize por prioridade
                5. Use formato de checkbox do Obsidian

                FORMATO DE RESPOSTA (JSON):
                {{
                    "title": "Lista de Tarefas",
                    "content": "# Tarefas\\n\\n- [ ] Tarefa específica\\n- [ ] Outra tarefa @pessoa #contexto",
                    "tags": ["tarefas", "todo"],
                    "category": "tasks",
                    "metadata": {{
                        "due_date": "YYYY-MM-DD",
                        "people_involved": ["pessoa1", "pessoa2"],
                        "project": "nome_do_projeto",
                        "priority": "high|normal|low",
                        "estimated_time": "X horas"
                    }}
                }}

                TEXTO A PROCESSAR:
                {text}
                """
            },
            
            "articles": {
                "system": """Você é um especialista em análise e síntese de artigos e conteúdo longo.""",
                "user_template": """
                Processe o seguinte ARTIGO/CONTEÚDO LONGO:

                FOCO ESPECIAL PARA ARTIGOS:
                1. Crie um resumo executivo
                2. Extraia pontos-chave principais
                3. Identifique argumentos centrais
                4. Liste citações importantes
                5. Sugira tópicos para aprofundamento

                FORMATO DE RESPOSTA (JSON):
                {{
                    "title": "Título do Artigo",
                    "content": "# Título\\n\\n## Resumo Executivo\\n\\n## Pontos-Chave\\n\\n## Argumentos Principais\\n\\n## Citações Importantes\\n\\n## Tópicos Relacionados",
                    "tags": ["artigo", "leitura"],
                    "category": "articles",
                    "metadata": {{
                        "source": "fonte_do_conteúdo",
                        "author": "autor",
                        "publication_date": "YYYY-MM-DD",
                        "reading_time": "X min",
                        "difficulty_level": "básico|intermediário|avançado",
                        "key_insights": ["insight1", "insight2"]
                    }}
                }}

                TEXTO A PROCESSAR:
                {text}
                """
            }
        }
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def _call_claude_api(self, messages: List[Dict[str, str]]) -> str:
        """Chama API do Claude com retry automático"""
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=messages
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Erro na chamada da API Claude: {str(e)}")
            
            # Diferentes tipos de erro
            if "rate_limit" in str(e).lower():
                await asyncio.sleep(60)  # Aguarda 1 minuto para rate limit
                raise
            elif "context_length" in str(e).lower():
                raise ValueError("Texto muito longo para processamento")
            else:
                raise
    
    async def process_text(
        self, 
        text: str, 
        category: str = "inbox",
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processa texto usando Claude API
        """
        start_time = datetime.utcnow()
        
        try:
            # Obtém prompt para categoria
            prompt_config = self.prompts.get(category, self.prompts["inbox"])
            
            # Personaliza prompt baseado em preferências do usuário
            if user_preferences:
                prompt_config = self._customize_prompt(prompt_config, user_preferences)
            
            # Constrói mensagens para Claude
            messages = [
                {
                    "role": "system",
                    "content": prompt_config["system"]
                },
                {
                    "role": "user", 
                    "content": prompt_config["user_template"].format(text=text)
                }
            ]
            
            # Chama API
            response_text = await self._call_claude_api(messages)
            
            # Parse da resposta
            processed_data = self._parse_ai_response(response_text)
            
            # Adiciona metadados de processamento
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            processed_data["processing_metadata"] = {
                "processing_time_seconds": processing_time,
                "ai_model_used": self.model,
                "category_used": category,
                "text_length": len(text),
                "word_count": len(text.split())
            }
            
            logger.info(f"Texto processado com sucesso em {processing_time:.2f}s")
            return processed_data
            
        except Exception as e:
            logger.error(f"Erro no processamento de texto: {str(e)}")
            # Fallback para processamento básico
            return self._basic_processing_fallback(text, category)
    
    def _customize_prompt(self, prompt_config: Dict[str, str], preferences: Dict[str, Any]) -> Dict[str, str]:
        """Personaliza prompt baseado em preferências do usuário"""
        customized = prompt_config.copy()
        
        # Adiciona preferências de tags
        if preferences.get("preferred_tags"):
            tag_instruction = f"\nTAGS PREFERENCIAIS: {', '.join(preferences['preferred_tags'])}"
            customized["user_template"] += tag_instruction
        
        # Adiciona preferências de formato
        if preferences.get("markdown_style"):
            style_instruction = f"\nESTILO MARKDOWN: {preferences['markdown_style']}"
            customized["user_template"] += style_instruction
        
        # Adiciona nível de criatividade
        creativity_level = preferences.get("ai_creativity_level", "balanced")
        if creativity_level == "creative":
            customized["user_template"] += "\n\nSEJA CRIATIVO E INOVADOR NA ESTRUTURAÇÃO."
        elif creativity_level == "conservative":
            customized["user_template"] += "\n\nMANTENHA ESTRUTURA SIMPLES E DIRETA."
        
        return customized
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """Parse e validação da resposta da IA"""
        try:
            # Remove markdown code blocks se presentes
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            
            data = json.loads(response)
            
            # Validação básica
            required_fields = ["title", "content", "tags"]
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Campo obrigatório ausente: {field}")
            
            # Garante que tags é uma lista
            if not isinstance(data.get("tags", []), list):
                data["tags"] = []
            
            # Garante que metadata existe
            if "metadata" not in data:
                data["metadata"] = {}
            
            return data
            
        except (json.JSONDecodeError, ValueError) as e:
            raise Exception(f"Erro ao processar resposta da IA: {str(e)}")
    
    def _basic_processing_fallback(self, text: str, category: str) -> Dict[str, Any]:
        """Processamento básico quando IA falha"""
        # Extração básica de título
        lines = text.strip().split('\n')
        title = lines[0][:100] if lines else "Nota sem título"
        
        # Limpeza básica do título
        if len(title) > 50:
            title = title[:50] + "..."
        
        # Tags básicas baseadas na categoria
        category_tags = {
            "inbox": ["inbox", "to_process"],
            "ideas": ["ideas", "brainstorm"],
            "tasks": ["tasks", "todo"],
            "articles": ["articles", "reading"]
        }
        
        return {
            "title": title,
            "content": f"# {title}\n\n{text}",
            "tags": category_tags.get(category, ["note"]),
            "category": category,
            "metadata": {
                "priority": "normal",
                "type": "note",
                "processed_by": "fallback",
                "needs_review": True
            },
            "processing_metadata": {
                "processing_time_seconds": 0,
                "ai_model_used": "fallback",
                "category_used": category,
                "text_length": len(text),
                "word_count": len(text.split())
            }
        }
    
    async def process_with_fallback(self, text: str, category: str) -> Dict[str, Any]:
        """Processa texto com fallback para prompt simplificado"""
        try:
            # Tentativa 1: Prompt completo
            return await self.process_text(text, category)
            
        except ValueError as e:
            if "muito longo" in str(e):
                # Tentativa 2: Texto truncado
                truncated_text = text[:10000] + "...\n[TEXTO TRUNCADO]"
                return await self.process_text(truncated_text, category)
            raise
            
        except Exception as e:
            # Tentativa 3: Fallback para processamento básico
            logger.warning(f"Fallback para processamento básico: {str(e)}")
            return self._basic_processing_fallback(text, category) 