# ObsidianAI Sync - Backend

Backend FastAPI para o sistema ObsidianAI Sync, responsável pelo processamento de texto com IA e sincronização com Obsidian.

## 🚀 Funcionalidades

- **Processamento de Texto com IA**: Integração com Claude API para conversão inteligente de texto em Markdown
- **Sincronização com Obsidian**: Criação automática de notas no vault do Obsidian
- **Sistema de Categorias**: Organização automática por tipo de conteúdo
- **Processamento em Background**: Jobs assíncronos para melhor performance
- **Validação e Sanitização**: Sistema robusto de validação de entrada
- **Logs Estruturados**: Monitoramento completo das operações

## 📋 Pré-requisitos

- Python 3.11+
- Claude API Key (Anthropic)
- Obsidian instalado
- Redis (opcional, para cache)

## 🛠️ Instalação

1. **Clone o repositório e navegue para o backend:**
```bash
cd backend
```

2. **Crie um ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Configure as variáveis obrigatórias no .env:**
```bash
# Claude API Key (obrigatório)
CLAUDE_API_KEY=your-claude-api-key-here

# Secret Key para JWT (obrigatório)
SECRET_KEY=your-super-secret-key-here

# Caminho do vault do Obsidian (opcional)
DEFAULT_VAULT_PATH=/path/to/your/obsidian/vault
```

## 🏃‍♂️ Executando

### Desenvolvimento
```bash
# Com reload automático
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Ou usando o script principal
python -m app.main
```

### Produção
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Endpoints

### Processamento de Texto
- `POST /api/processing/text` - Processa texto e cria nota
- `GET /api/processing/status/{job_id}` - Status de um job
- `GET /api/processing/jobs` - Lista jobs do usuário
- `DELETE /api/processing/jobs/{job_id}` - Cancela um job
- `POST /api/processing/jobs/{job_id}/retry` - Reprocessa um job

### Informações
- `GET /` - Informações da aplicação
- `GET /health` - Health check
- `GET /api/categories` - Categorias disponíveis

### Documentação
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc

## 🗄️ Estrutura do Projeto

```
backend/
├── app/
│   ├── core/           # Configurações e utilitários core
│   │   ├── config.py   # Configurações da aplicação
│   │   ├── database.py # Configuração do banco de dados
│   │   └── security.py # Sistema de autenticação
│   ├── models/         # Modelos de dados
│   │   ├── text_processing.py
│   │   └── user_configuration.py
│   ├── routers/        # Endpoints da API
│   │   └── processing.py
│   ├── services/       # Lógica de negócio
│   │   ├── ai_processor.py
│   │   └── obsidian_sync.py
│   ├── utils/          # Utilitários
│   │   └── validators.py
│   └── main.py         # Aplicação principal
├── tests/              # Testes
├── logs/               # Logs da aplicação
├── requirements.txt    # Dependências
└── env.example         # Exemplo de configuração
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `CLAUDE_API_KEY` | Chave da API Claude | - | ✅ |
| `SECRET_KEY` | Chave secreta para JWT | - | ✅ |
| `DATABASE_URL` | URL do banco de dados | `sqlite:///./obsidian_ai.db` | ❌ |
| `DEFAULT_VAULT_PATH` | Caminho do vault Obsidian | - | ❌ |
| `DEBUG` | Modo debug | `false` | ❌ |
| `LOG_LEVEL` | Nível de log | `INFO` | ❌ |

### Configuração do Obsidian

1. **Configure o caminho do vault:**
```bash
DEFAULT_VAULT_PATH=/Users/seu-usuario/Documents/ObsidianVault
```

2. **Estrutura de pastas criada automaticamente:**
```
📥 Inbox/      # Notas gerais
💡 Ideas/      # Ideias e brainstorms  
✅ Tasks/      # Tarefas e TODOs
📚 Articles/   # Artigos e conteúdo longo
🤝 Meetings/   # Reuniões
📖 References/ # Referências
```

## 🧪 Testes

```bash
# Instalar dependências de teste
pip install pytest pytest-asyncio httpx

# Executar testes
pytest tests/ -v

# Com cobertura
pytest tests/ --cov=app --cov-report=html
```

## 📊 Monitoramento

### Logs
Os logs são salvos em `logs/obsidian_ai.log` e também exibidos no console.

### Health Check
```bash
curl http://localhost:8000/health
```

### Métricas
- Tempo de processamento por job
- Taxa de sucesso/falha
- Uso da API Claude
- Status da sincronização

## 🔒 Segurança

- **Sanitização XSS**: Todo input é sanitizado
- **Validação de Entrada**: Validação rigorosa com Pydantic
- **Rate Limiting**: Limites configuráveis por usuário
- **JWT Tokens**: Autenticação segura
- **HTTPS**: Recomendado para produção

## 🚀 Deploy

### Docker
```bash
# Build da imagem
docker build -t obsidian-ai-backend .

# Executar container
docker run -p 8000:8000 --env-file .env obsidian-ai-backend
```

### Docker Compose
```bash
docker-compose up -d
```

### Produção
- Use HTTPS
- Configure rate limiting
- Monitore logs
- Configure backup do banco
- Use Redis para cache

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no repositório ou entre em contato com a equipe. 