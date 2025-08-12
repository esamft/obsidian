#!/usr/bin/env python3
"""
Script de teste para verificar a integração com OpenAI API
"""
import os
from dotenv import load_dotenv
from openai import OpenAI

# Carregar variáveis de ambiente
load_dotenv()

def test_openai_connection():
    """Testa a conexão com a API da OpenAI"""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your-openai-api-key-here":
        print("❌ ERRO: Configure sua OPENAI_API_KEY no arquivo .env")
        print("   Edite o arquivo backend/.env e adicione sua chave da API OpenAI")
        print("   Obtenha sua chave em: https://platform.openai.com/api-keys")
        return False
    
    try:
        client = OpenAI(api_key=api_key)
        
        # Teste simples
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {
                    "role": "user",
                    "content": "Responda apenas 'OK' se você está funcionando."
                }
            ],
            max_completion_tokens=10
        )
        
        if response.choices[0].message.content:
            print("✅ Conexão com OpenAI API funcionando!")
            print(f"   Resposta: {response.choices[0].message.content}")
            print(f"   Modelo: {response.model}")
            return True
    except Exception as e:
        print(f"❌ Erro ao conectar com OpenAI API: {str(e)}")
        if "api_key" in str(e).lower():
            print("   → Verifique se sua API key está correta")
        elif "quota" in str(e).lower():
            print("   → Verifique se você tem créditos na sua conta")
        return False
    
    return False

if __name__ == "__main__":
    print("🔍 Testando conexão com OpenAI API...")
    test_openai_connection()