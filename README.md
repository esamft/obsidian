# 🚀 ObsidianAI Sync

Sistema completo de captura e processamento inteligente de texto com IA que transforma qualquer conteúdo em notas Markdown estruturadas para Obsidian.

## ✨ Funcionalidades

- 📝 **Processamento com IA**: Converte texto em rascunhos estruturados usando OpenAI GPT
- 📎 **Extração de Conteúdo**: Lê PDFs, Word docs, imagens (OCR) e arquivos de texto
- 📱 **Interface Mobile-First**: PWA otimizado para captura rápida no celular
- 🔄 **Sincronização Automática**: Salva direto no seu vault do Obsidian
- 📋 **Template Padronizado**: Cria rascunhos com data, título e resumo inteligente

## 🛠️ Tecnologias

### Backend
- **FastAPI** - API moderna e rápida
- **OpenAI GPT-5-mini** - Processamento inteligente de texto
- **PyPDF2** - Extração de texto de PDFs
- **python-docx** - Leitura de documentos Word
- **pytesseract** - OCR para imagens
- **SQLAlchemy** - ORM para banco de dados

### Frontend
- **HTML5 + JavaScript** - Interface responsiva
- **CSS3** - Design moderno com gradientes
- **PWA Ready** - Funciona como app mobile

## 🚀 Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/obsidian-ai-sync.git
cd obsidian-ai-sync
```

### 2. Configure o Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

### 3. Configure Variáveis de Ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações:
# - OPENAI_API_KEY (obrigatório)
# - OBSIDIAN_VAULT_PATH (caminho para seu vault)
```

### 4. Execute o Sistema
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python -m uvicorn app.main_simple:app --reload --port 8000

# Terminal 2 - Frontend
open frontend/public/index_simple.html
```

## 📊 Como Usar

1. **Abra a interface** no navegador
2. **Cole qualquer texto** ou digite uma nota
3. **Adicione arquivos** (PDF, DOC, imagens) se necessário
4. **Clique "Criar Rascunho"**
5. **Rascunho estruturado** é salvo automaticamente no Obsidian

## 📝 Template de Rascunho

```markdown
# [Título Gerado pela IA]

**Data:** DD/MM/AAAA
**Tipo:** Rascunho

## Resumo
[Resumo inteligente do conteúdo]

## Conteúdo Original
[Texto digitado + conteúdo extraído dos arquivos]

---
*Nota criada automaticamente - para ser processada posteriormente*
```

## 🎯 Casos de Uso

- ✅ **Captura de Ideias**: Cole pensamentos e a IA estrutura
- ✅ **Processamento de Artigos**: Upload de PDFs para resumo
- ✅ **Digitalização**: OCR de fotos de documentos
- ✅ **Organização de Notas**: Template padronizado para tudo
- ✅ **Workflow Mobile**: Capture no celular, organize no PC

## 🔧 Configuração

### Variáveis de Ambiente Obrigatórias

```bash
# API Keys
OPENAI_API_KEY=your-openai-api-key-here

# Obsidian Configuration  
OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault

# Server Configuration (opcional)
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Tipos de Arquivo Suportados

- **PDFs** - Extração de texto até 5 páginas
- **Word** - .docx incluindo tabelas
- **Imagens** - .png, .jpg, .gif (OCR com pytesseract)
- **Texto** - .txt com encoding automático

## 🚀 Deploy

### Usando Docker
```bash
docker-compose up -d
```

### Deploy Manual
1. Configure servidor com Python 3.9+
2. Instale dependências: `pip install -r requirements.txt`
3. Configure variáveis de ambiente
4. Execute: `uvicorn app.main_simple:app --host 0.0.0.0 --port 8000`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [OpenAI](https://openai.com/) - GPT API
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web
- [Obsidian](https://obsidian.md/) - Aplicativo de notas

---

**Desenvolvido com ❤️ para facilitar a captura e organização de conhecimento**