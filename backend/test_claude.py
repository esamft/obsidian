#!/usr/bin/env python3
"""
Script de teste para verificar a integração com Claude API
"""
import os
from dotenv import load_dotenv
from anthropic import Anthropic

# Carregar variáveis de ambiente
load_dotenv()

def test_claude_connection():
    """Testa a conexão com a API do Claude"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not api_key or api_key == "your-claude-api-key-here":
        print("❌ ERRO: Configure sua ANTHROPIC_API_KEY no arquivo .env")
        print("   Edite o arquivo backend/.env e adicione sua chave da API Claude")
        return False
    
    try:
        client = Anthropic(api_key=api_key)
        
        # Teste simples
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=100,
            messages=[
                {
                    "role": "user",
                    "content": "Responda apenas 'OK' se você está funcionando."
                }
            ]
        )
        
        if response.content[0].text:
            print("✅ Conexão com Claude API funcionando!")
            print(f"   Resposta: {response.content[0].text}")
            return True
    except Exception as e:
        print(f"❌ Erro ao conectar com Claude API: {str(e)}")
        return False
    
    return False

if __name__ == "__main__":
    print("🔍 Testando conexão com Claude API...")
    test_claude_connection()