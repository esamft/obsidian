# 🔗 INTEGRAÇÃO FRONTEND - MATRIZ DE COLETA

## 📋 Visão Geral

Este documento descreve a integração do frontend React com o projeto da Matriz de Coleta, incluindo configurações, rotas e funcionalidades implementadas.

## 🚀 Frontend Implementado

### **Repositório**: https://github.com/esamft/matrinova-visage.git

### **Tecnologias**:
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Material-UI (MUI)** para componentes
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **Framer Motion** para animações

## 🏗️ Arquitetura MCP

O frontend segue a arquitetura **Model-Controller-Presenter**:

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

## 📱 Páginas Implementadas

### **1. Dashboard** (`/`)
- Visão geral do sistema
- Métricas e estatísticas
- Atividades recentes
- Seleção de planos

### **2. Coletar** (`/coletar`)
- Interface para coleta de notas
- Formulários de entrada
- Validação de dados

### **3. ColetarWizard** (`/coletar-wizard`)
- Assistente de coleta passo a passo
- Validação em tempo real
- Guia de preenchimento

### **4. Planos** (`/planos`)
- Listagem de planos de inteligência
- Status e progresso
- Gerenciamento de planos

### **5. NovoPlano** (`/novo-plano`)
- Criação de novos planos
- Configuração de problemas
- Definição de aspectos

### **6. Análise** (`/analise`)
- Análise de dados coletados
- Relatórios e insights
- Métricas de performance

### **7. AnaliseNetwork** (`/analise-network`)
- Análise de redes e conexões
- Visualização de grafos
- Descoberta de padrões

### **8. Busca** (`/busca`)
- Sistema de busca avançada
- Filtros e critérios
- Resultados em tempo real

### **9. DesempenhoColetadores** (`/desempenho`)
- Métricas de performance
- Ranking de coletores
- Estatísticas de validação

## ⚙️ Configuração

### **Portas**:
- **Frontend**: 3000
- **Backend**: 3001
- **PostgreSQL**: 5432
- **Neo4j**: 7474 (HTTP), 7687 (Bolt)
- **Redis**: 6379

### **Variáveis de Ambiente**:
```bash
REACT_APP_API_URL=http://localhost:3001
PORT=3000
```

### **Proxy**:
O frontend está configurado para fazer proxy das requisições para `http://localhost:3001` (backend).

## 🐳 Docker

### **Comando para executar**:
```bash
# Executar todo o sistema
docker-compose up -d

# Executar apenas o frontend
docker-compose up frontend

# Executar apenas o backend
docker-compose up backend
```

### **Acesso**:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Neo4j Browser**: http://localhost:7474

## 🔧 Desenvolvimento

### **Instalar dependências**:
```bash
cd frontend
npm install
```

### **Executar em desenvolvimento**:
```bash
npm start
```

### **Build para produção**:
```bash
npm run build
```

### **Testes**:
```bash
npm test
```

## 📊 Funcionalidades Principais

### **1. Sistema de Coleta**
- Interface intuitiva para entrada de notas
- Validação em tempo real
- Assistente passo a passo
- Suporte a diferentes tipos de fonte

### **2. Gestão de Planos**
- Criação e edição de planos
- Hierarquia: Plano → Problema → Aspecto → Insumo → Nota
- Status e progresso em tempo real

### **3. Análise de Dados**
- Dashboard com métricas
- Visualização de redes
- Descoberta de padrões
- Relatórios automáticos

### **4. Sistema de Busca**
- Busca semântica
- Filtros avançados
- Resultados em tempo real
- Histórico de buscas

## 🔗 Integração com Backend

### **APIs Consumidas**:
- `/api/planos` - Gestão de planos
- `/api/notas` - CRUD de notas
- `/api/entidades` - Gestão de entidades
- `/api/usuarios` - Gestão de usuários
- `/api/auth` - Autenticação

### **WebSocket**:
- Notificações em tempo real
- Atualizações de status
- Colaboração em tempo real

## 🎯 Próximos Passos

### **1. Implementar Autenticação**
- Sistema de login/logout
- Controle de acesso por roles
- JWT tokens

### **2. Adicionar Testes**
- Testes unitários
- Testes de integração
- Testes E2E

### **3. Melhorar Performance**
- Lazy loading de componentes
- Otimização de imagens
- Service Worker para cache

### **4. Implementar PWA**
- Instalação offline
- Notificações push
- Sincronização de dados

## ✅ Status da Integração

- [x] Frontend clonado e integrado
- [x] Rotas configuradas
- [x] Docker configurado
- [x] Portas ajustadas
- [x] Proxy configurado
- [x] README criado

**Frontend integrado com sucesso ao projeto da Matriz de Coleta!** 🎯 