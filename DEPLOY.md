# 🚀 Deploy - ObsidianAI Sync

Instruções completas para fazer deploy do projeto.

## 📋 Pré-requisitos

1. **Conta no GitHub** com repositório público
2. **API Key da OpenAI** (https://platform.openai.com/api-keys)
3. **Conta Railway** (https://railway.app) - Backend
4. **Conta Vercel** (https://vercel.com) - Frontend

## 🔧 Passo 1: GitHub

### 1.1. Criar Repositório no GitHub
```bash
# Se não tem repositório, criar:
# 1. Acesse github.com
# 2. Clique "New Repository"
# 3. Nome: obsidian-ai-sync
# 4. Público
# 5. Criar
```

### 1.2. Conectar Projeto Local
```bash
# Adicionar origin remoto
git remote add origin https://github.com/SEU-USUARIO/obsidian-ai-sync.git

# Push inicial
git branch -M main
git push -u origin main
```

## 🚂 Passo 2: Deploy Backend (Railway)

### 2.1. Conectar Railway
1. Acesse https://railway.app
2. Login com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório `obsidian-ai-sync`
5. Selecione pasta `backend/`

### 2.2. Configurar Variáveis de Ambiente
No painel Railway, vá em **Variables**:

```bash
OPENAI_API_KEY=your-openai-api-key-here
OBSIDIAN_VAULT_PATH=/tmp/vault
DEFAULT_INBOX_FOLDER=Inbox
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

### 2.3. Deploy Automático
- Railway detecta automaticamente Python
- Install dependências do `requirements.txt`
- Executa via `Procfile`: `uvicorn app.main_simple:app`
- Deploy completo em ~5 minutos

### 2.4. Testar Backend
```bash
# URL será algo como: https://obsidian-ai-sync-production.up.railway.app
curl https://sua-app.up.railway.app/health
```

## 🌐 Passo 3: Deploy Frontend (Vercel)

### 3.1. Conectar Vercel
1. Acesse https://vercel.com
2. Login com GitHub
3. "New Project" → Import Git Repository
4. Selecione `obsidian-ai-sync`
5. **Root Directory**: `frontend`
6. **Build Command**: deixe vazio
7. **Output Directory**: `public`

### 3.2. Configurar Variáveis de Ambiente
No painel Vercel, Settings → Environment Variables:

```bash
REACT_APP_API_URL=https://sua-app.up.railway.app
REACT_APP_API_TIMEOUT=30000
```

### 3.3. Deploy Automático
- Vercel faz deploy dos arquivos estáticos
- `vercel.json` configura redirecionamentos
- Deploy completo em ~2 minutos

### 3.4. Testar Frontend
- URL será algo como: https://obsidian-ai-sync.vercel.app
- Teste upload de arquivos e processamento

## ⚙️ Passo 4: Atualizar Frontend para Produção

### 4.1. Atualizar URL da API
Edite `frontend/public/index_simple.html`:

```javascript
// Linha ~252, trocar:
const API_URL = 'http://localhost:8000';

// Por:
const API_URL = 'https://sua-app.up.railway.app';
```

### 4.2. Commit e Push
```bash
git add .
git commit -m "fix: atualizar URL da API para produção"
git push origin main
```

Deploy automático será disparado!

## 🧪 Passo 5: Testar Sistema Completo

### 5.1. Teste Básico
1. Acesse seu frontend no Vercel
2. Digite texto: "Teste de produção"
3. Clique "Criar Rascunho"
4. Deve processar e mostrar resultado

### 5.2. Teste com Upload
1. Adicione um arquivo TXT pequeno
2. Processe junto com texto
3. Verifique extração de conteúdo

## 📊 URLs Finais

Após deploy completo:

- **Frontend**: https://obsidian-ai-sync.vercel.app
- **Backend API**: https://obsidian-ai-sync-production.up.railway.app
- **API Docs**: https://obsidian-ai-sync-production.up.railway.app/docs
- **Health Check**: https://obsidian-ai-sync-production.up.railway.app/health

## 🔄 Atualizações Futuras

### Deploy Automático Configurado:
- Push no `main` → Deploy automático no Railway e Vercel
- Branch `develop` pode ter deploy de staging
- Pull Requests geram preview no Vercel

### Monitoramento:
- Railway: Logs automáticos
- Vercel: Analytics de performance
- Both: Notificações por email

## ⚠️ Limitações Conhecidas

### Railway Free Tier:
- 500h/mês de runtime
- 1GB RAM
- 1GB storage

### Vercel Free Tier:
- 100GB bandwidth/mês
- Unlimited requests
- Automatic HTTPS

### Soluções para Produção:
- Railway Pro ($5/mês): recursos ilimitados
- Vercel Pro ($20/mês): analytics avançadas
- Backup em AWS/DigitalOcean para escala maior

## 🆘 Troubleshooting

### Backend não sobe:
```bash
# Verificar logs no Railway
# Comum: dependências faltando no requirements.txt
```

### Frontend não carrega:
```bash
# Verificar CORS no backend
# Verificar URL da API no frontend
```

### Upload não funciona:
```bash
# Verificar se pytesseract está instalado no Railway
# Pode precisar usar Railway Pro para OCR
```

---

**Deploy configurado! 🚀**