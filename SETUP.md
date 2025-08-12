# 🚀 Setup Rápido - ObsidianAI Sync

## ⚠️ Configuração Obrigatória

### 1. Configure sua OpenAI API Key

Edite o arquivo `backend/.env` e substitua:
```
OPENAI_API_KEY=your-openai-api-key-here
```

Por sua chave real da OpenAI API (obtida em https://platform.openai.com/api-keys)

### 2. Configure o caminho do seu Obsidian Vault

No mesmo arquivo `backend/.env`, ajuste:
```
OBSIDIAN_VAULT_PATH=/Users/esausamuellimafeitosa/Documents/ObsidianVault
```

Para o caminho real do seu vault do Obsidian.

### 3. Teste a conexão com OpenAI

```bash
cd backend
source venv/bin/activate
python test_openai.py
```

Você deve ver: ✅ Conexão com OpenAI API funcionando!

## 🎯 Iniciar o Sistema

### Backend (Terminal 1):
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend (Terminal 2):
```bash
cd frontend
npm start
```

## 📱 Acessar

- **Frontend (Mobile)**: http://localhost:3001
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🧪 Testar Fluxo Completo

1. Abra http://localhost:3001 no celular ou browser
2. Cole qualquer texto
3. Selecione categoria (Inbox, Ideas, Tasks)
4. Clique em "Processar"
5. Verifique a nota criada no seu Obsidian vault

## ❓ Problemas Comuns

### "API Key inválida"
→ Verifique se copiou a chave completa do Claude (começa com sk-ant-)

### "Vault não encontrado"
→ Confirme o caminho completo do seu vault no .env

### "Porta já em uso"
→ Mude a porta no comando uvicorn ou npm start

## 📝 Próximos Passos

Após confirmar que tudo funciona:
1. Customize as categorias no .env
2. Ajuste os prompts de processamento
3. Configure templates personalizados
4. Ative sincronização com cloud (opcional)