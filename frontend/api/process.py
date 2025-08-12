"""
Vercel Serverless Function para processamento de texto
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime
import tempfile
from pathlib import Path

# Simular OpenAI (você pode instalar openai se quiser usar a API real)
class MockOpenAI:
    def __init__(self, api_key):
        self.api_key = api_key
    
    def chat_completions_create(self, model, messages, max_completion_tokens=None):
        # Mock response - substitua pela OpenAI real se necessário
        user_text = messages[-1]["content"] if messages else "Sem texto"
        
        # Extrai o texto principal do prompt
        if "TEXTO A PROCESSAR:" in user_text:
            actual_text = user_text.split("TEXTO A PROCESSAR:")[1].split("INSTRUÇÕES:")[0].strip()
        else:
            actual_text = user_text
        
        # Template de rascunho
        title = f"Rascunho - {actual_text[:50]}..." if len(actual_text) > 50 else f"Rascunho - {actual_text}"
        
        mock_response = f"""# {title}

**Data:** {datetime.now().strftime('%d/%m/%Y')}
**Tipo:** Rascunho

## Resumo
{actual_text[:200] + '...' if len(actual_text) > 200 else actual_text}

## Conteúdo Original
{actual_text}

---
*Nota criada automaticamente - para ser processada posteriormente*
"""
        
        class MockChoice:
            def __init__(self, content):
                self.message = type('obj', (object,), {'content': content})()
        
        class MockUsage:
            def __init__(self):
                self.total_tokens = 150
        
        class MockResponse:
            def __init__(self, content):
                self.choices = [MockChoice(content)]
                self.usage = MockUsage()
        
        return MockResponse(mock_response)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Process text with AI"""
        try:
            # CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # Parse request
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            text = data.get('text', '')
            category = data.get('category', 'inbox')
            
            if not text or len(text.strip()) < 3:
                response = {
                    'success': False,
                    'message': 'Texto muito curto ou vazio',
                    'error': 'Mínimo 3 caracteres'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            
            # Process with AI (mock)
            api_key = os.getenv('OPENAI_API_KEY', 'mock')
            ai_client = MockOpenAI(api_key)
            
            # Build prompt
            prompt = f"""
Crie uma nota de rascunho no seguinte formato EXATO:

# [Título descritivo baseado no conteúdo]

**Data:** {datetime.now().strftime('%d/%m/%Y')}
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

            messages = [
                {"role": "system", "content": "Você é um assistente especializado em organizar e estruturar notas em Markdown para o Obsidian."},
                {"role": "user", "content": prompt}
            ]
            
            ai_result = ai_client.chat_completions_create(
                model="gpt-5-mini",
                messages=messages,
                max_completion_tokens=2000
            )
            
            # Simular salvamento (em produção, isso salvaria no vault do usuário)
            content = ai_result.choices[0].message.content
            
            response = {
                'success': True,
                'message': 'Rascunho criado com sucesso!',
                'file_path': f'/tmp/vault/Inbox/rascunho-{datetime.now().strftime("%Y%m%d-%H%M%S")}.md',
                'content': content[:300] + '...' if len(content) > 300 else content
            }
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            error_response = {
                'success': False,
                'message': 'Erro no processamento',
                'error': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            'message': 'ObsidianAI Sync API',
            'status': 'running',
            'version': '1.0.0'
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))