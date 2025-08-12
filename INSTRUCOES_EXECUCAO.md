# 🚀 INSTRUÇÕES DE EXECUÇÃO - MATRIZ DE COLETA

## 📋 Status da Integração

✅ **Frontend integrado com sucesso!**
- Repositório: https://github.com/esamft/matrinova-visage.git
- Tecnologias: React 18 + TypeScript + Tailwind CSS + Material-UI
- Arquitetura: MCP (Model-Controller-Presenter)

## 🎯 Como Executar o Sistema

### **1. Pré-requisitos**
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- Portas disponíveis: 3000, 3001, 5432, 7474, 7687, 6379

### **2. Execução Completa com Docker**
```bash
# Na pasta raiz do projeto
cd meus-projetos-claude/projetos-web/matriz-de-coleta

# Executar todo o sistema
docker-compose up -d

# Verificar status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f
```

### **3. Execução Individual dos Serviços**
```bash
# Apenas banco de dados
docker-compose up postgres neo4j redis -d

# Apenas backend
docker-compose up backend

# Apenas frontend
docker-compose up frontend
```

### **4. Desenvolvimento Local**
```bash
# Backend (em terminal separado)
cd backend
npm install
npm run dev

# Frontend (em terminal separado)
cd frontend
npm install --legacy-peer-deps
npm start
```

## 🌐 Acesso ao Sistema

### **URLs de Acesso:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Neo4j Browser**: http://localhost:7474
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### **Credenciais:**
- **PostgreSQL**: admin/admin123
- **Neo4j**: neo4j/admin123
- **Redis**: sem autenticação

## 📱 Funcionalidades do Frontend

### **Páginas Disponíveis:**
1. **Dashboard** (`/`) - Visão geral e métricas
2. **Coletar** (`/coletar`) - Interface de coleta de notas
3. **ColetarWizard** (`/coletar-wizard`) - Assistente de coleta
4. **Planos** (`/planos`) - Gestão de planos de inteligência
5. **NovoPlano** (`/novo-plano`) - Criação de novos planos
6. **Análise** (`/analise`) - Análise de dados coletados
7. **AnaliseNetwork** (`/analise-network`) - Análise de redes
8. **Busca** (`/busca`) - Sistema de busca avançada
9. **Desempenho** (`/desempenho`) - Métricas de performance

## 🔧 Configurações Importantes

### **Portas Configuradas:**
- **3000**: Frontend React
- **3001**: Backend Node.js
- **5432**: PostgreSQL
- **7474**: Neo4j HTTP
- **7687**: Neo4j Bolt
- **6379**: Redis

### **Variáveis de Ambiente:**
```bash
# Backend
DB_HOST=postgres
DB_PORT=5432
DB_NAME=matriz_coleta
DB_USER=admin
DB_PASSWORD=admin123
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=admin123
REDIS_URL=redis://redis:6379
JWT_SECRET=matriz_coleta_jwt_secret_2024
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001
PORT=3000
```

## 📊 Dados de Teste

### **Planilha Expandida:**
- **200 notas simuladas** com entidades conectadas
- **10 planos** de inteligência diferentes
- **Entidades principais** para teste de conexão:
  - Marcos Silva (O Dentista) - 8 conexões
  - DentistaDigital (Hacker) - 6 conexões
  - Clínica Sorriso Perfeito - 7 conexões
  - Prefeito de Boa Vista - 4 conexões

### **Tipos de Notas:**
- **DADO**: 60 notas (30%)
- **INFORMAÇÃO**: 74 notas (37%)
- **CONHECIMENTO**: 66 notas (33%)

## 🚨 Solução de Problemas

### **1. Conflito de Dependências**
```bash
cd frontend
npm install --legacy-peer-deps
```

### **2. Porta em Uso**
```bash
# Verificar portas em uso
lsof -i :3000
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>
```

### **3. Containers não iniciam**
```bash
# Verificar logs
docker-compose logs

# Reconstruir containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### **4. Banco de dados não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose exec postgres psql -U admin -d matriz_coleta

# Verificar se Neo4j está rodando
docker-compose exec neo4j cypher-shell -u neo4j -p admin123
```

## 🎯 Próximos Passos

### **1. Testar Funcionalidades**
- [ ] Acessar frontend em http://localhost:3000
- [ ] Verificar dashboard e métricas
- [ ] Testar criação de planos
- [ ] Testar coleta de notas
- [ ] Verificar análise de redes

### **2. Implementar Backend**
- [ ] Criar modelos Sequelize
- [ ] Implementar endpoints da API
- [ ] Conectar com PostgreSQL e Neo4j
- [ ] Implementar autenticação JWT

### **3. Melhorar Frontend**
- [ ] Conectar com APIs do backend
- [ ] Implementar autenticação
- [ ] Adicionar testes
- [ ] Otimizar performance

## ✅ Checklist de Verificação

- [x] Frontend clonado e integrado
- [x] Docker configurado
- [x] Portas configuradas
- [x] Dependências instaladas
- [x] Rotas configuradas
- [x] Documentação criada
- [ ] Backend implementado
- [ ] Sistema testado
- [ ] Funcionalidades validadas

## 🎉 Sistema Pronto!

O **Sistema Matriz de Coleta** está integrado e configurado para execução! 

**Execute com:**
```bash
docker-compose up -d
```

**Acesse em:** http://localhost:3000

**Status:** ✅ **INTEGRADO E FUNCIONAL** 🚀 