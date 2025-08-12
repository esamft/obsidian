#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
print(f"API Key configurada: {'✅' if api_key and api_key != 'your-openai-api-key-here' else '❌'}")

if api_key and api_key != "your-openai-api-key-here":
    client = OpenAI(api_key=api_key)
    
    try:
        # Teste mais simples possível
        response = client.chat.completions.create(
            model="gpt-5-mini",
            messages=[{"role": "user", "content": "Responda com a palavra OK se você está funcionando"}],
            max_completion_tokens=100
        )
        print(f"✅ API funcionando! Resposta: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Erro: {e}")
else:
    print("Configure sua OPENAI_API_KEY no arquivo .env")