# ObsidianAI Sync - Frontend

Interface elegante e moderna para o sistema ObsidianAI Sync, desenvolvida com React, TypeScript e Tailwind CSS, seguindo a arquitetura MCP (Model-Controller-Presenter).

## 🎨 Design System

### Tecnologias
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilização
- **Framer Motion** - Animações
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Gerenciamento de estado do servidor
- **Zustand** - Gerenciamento de estado local

### Arquitetura MCP
```
src/
├── models/          # Modelos de dados
├── controllers/     # Lógica de negócio
├── presenters/      # Formatação para UI
├── services/        # Serviços externos
├── hooks/           # Hooks personalizados
├── components/      # Componentes React
├── utils/           # Utilitários
└── types/           # Definições TypeScript
```

## 🚀 Funcionalidades

### ✅ Implementadas
- **Interface Desktop Otimizada** - Design responsivo focado em desktop
- **Sistema de Categorias** - Organização inteligente de conteúdo
- **Processamento de Texto** - Interface para envio e monitoramento
- **Dashboard de Jobs** - Visualização de status e estatísticas
- **Sistema de Notificações** - Feedback em tempo real
- **Tema Escuro/Claro** - Suporte a múltiplos temas
- **Validação de Formulários** - Validação robusta de entrada
- **Animações Suaves** - Transições e micro-interações

### 🎯 Características
- **Design Elegante** - Interface moderna e profissional
- **Performance Otimizada** - Carregamento rápido e responsivo
- **Acessibilidade** - Suporte a navegação por teclado e leitores de tela
- **PWA Ready** - Funciona offline e pode ser instalado
- **TypeScript** - Código tipado e seguro

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Backend rodando em http://localhost:8000
- Porta 3001 disponível

### Setup
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env

# Executar em desenvolvimento
npm start

# Build para produção
npm run build
```

### Acesso
- **Desenvolvimento**: http://localhost:3001
- **Backend API**: http://localhost:8000

## 📁 Estrutura do Projeto

```
frontend/
├── public/              # Arquivos estáticos
│   ├── index.html       # HTML principal
│   ├── manifest.json    # PWA manifest
│   └── favicon.ico      # Ícone do app
├── src/
│   ├── components/      # Componentes React
│   │   ├── common/      # Componentes reutilizáveis
│   │   ├── layout/      # Componentes de layout
│   │   └── forms/       # Componentes de formulário
│   ├── hooks/           # Hooks personalizados
│   │   ├── useProcessing.ts
│   │   ├── useCategories.ts
│   │   └── useNotifications.ts
│   ├── models/          # Modelos de dados
│   │   ├── ProcessingJobModel.ts
│   │   └── CategoryModel.ts
│   ├── controllers/     # Controladores
│   │   ├── ProcessingController.ts
│   │   └── CategoryController.ts
│   ├── presenters/      # Presenters
│   │   ├── ProcessingPresenter.ts
│   │   └── CategoryPresenter.ts
│   ├── services/        # Serviços
│   │   ├── api.ts
│   │   └── notificationService.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/           # Utilitários
│   ├── styles/          # Estilos
│   │   └── index.css
│   └── App.tsx          # Componente principal
├── package.json         # Dependências
├── tailwind.config.js   # Configuração Tailwind
├── tsconfig.json        # Configuração TypeScript
└── README.md            # Documentação
```

## 🎨 Design System

### Cores
```css
/* Primária */
primary-50: #eff6ff
primary-500: #3b82f6
primary-900: #1e3a8a

/* Secundária */
secondary-50: #f8fafc
secondary-500: #64748b
secondary-900: #0f172a

/* Estados */
success: #22c55e
warning: #f59e0b
error: #ef4444
info: #0ea5e9
```

### Componentes
- **Botões** - `.btn`, `.btn-primary`, `.btn-secondary`
- **Inputs** - `.input`, `.input-error`
- **Cards** - `.card`, `.card-header`, `.card-body`
- **Badges** - `.badge`, `.badge-success`
- **Spinners** - `.spinner`, `.spinner-md`

### Animações
- **Fade In** - `.animate-fade-in`
- **Slide Up** - `.animate-slide-up`
- **Scale In** - `.animate-scale-in`

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# API URL
REACT_APP_API_URL=http://localhost:8000

# Porta do Frontend
PORT=3001

# Ambiente
REACT_APP_ENV=development

# Analytics (opcional)
REACT_APP_GA_TRACKING_ID=your-ga-id
```

### Tailwind CSS
O projeto usa Tailwind CSS com configuração customizada:
- Cores personalizadas
- Animações customizadas
- Componentes utilitários
- Suporte a tema escuro

### TypeScript
Configuração estrita com:
- Path mapping para imports
- Strict mode habilitado
- JSX transform automático

## 📱 PWA Features

### Manifest
- Nome e descrição do app
- Ícones em múltiplos tamanhos
- Tema e cores
- Shortcuts para ações rápidas

### Service Worker
- Cache de recursos estáticos
- Funcionalidade offline
- Atualizações automáticas

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com cobertura
npm test -- --coverage

# Testes em modo watch
npm test -- --watch
```

## 📦 Build

```bash
# Build de desenvolvimento
npm run build

# Build de produção
npm run build --production

# Analisar bundle
npm run build --analyze
```

## 🚀 Deploy

### Netlify
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Vercel
```bash
# Deploy automático
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Performance

### Otimizações
- **Code Splitting** - Carregamento sob demanda
- **Lazy Loading** - Componentes carregados quando necessário
- **Image Optimization** - Imagens otimizadas
- **Bundle Analysis** - Monitoramento de tamanho

### Métricas
- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

## 🛡️ Segurança

### Boas Práticas
- **HTTPS** - Comunicação segura
- **CSP** - Content Security Policy
- **XSS Protection** - Sanitização de entrada
- **CSRF Protection** - Tokens de segurança

## 📚 Documentação

### Componentes
Cada componente inclui:
- Props TypeScript
- Exemplos de uso
- Documentação JSDoc

### Hooks
Hooks personalizados com:
- Tipos TypeScript
- Exemplos de uso
- Documentação completa

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Siga o padrão de código
4. Adicione testes
5. Abra um Pull Request

### Padrões de Código
- **ESLint** - Linting de código
- **Prettier** - Formatação
- **TypeScript** - Tipagem estrita
- **Conventional Commits** - Mensagens de commit

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

- 📧 Email: suporte@obsidian-ai-sync.com
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/obsidian-ai-sync/issues)
- 📖 Documentação: [Wiki](https://github.com/seu-usuario/obsidian-ai-sync/wiki)

---

**Desenvolvido com ❤️ pela equipe ObsidianAI Sync** 