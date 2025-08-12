// Tipos da Matriz de Coleta - Baseados na PLANILHA_EXPANDIDA.md

// Estrutura hierárquica: Plano → Problema → Aspecto → Insumo → Nota

export interface Plano {
  id: string;
  codigo: string; // PLN-2024-001
  titulo: string;
  descricao?: string;
  status: 'ativo' | 'concluido' | 'suspenso';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  coordenador_id: string;
  data_criacao: string;
  prazo_estimado?: number; // dias
  orcamento?: number;
  created_at: string;
  updated_at: string;
}

export interface ProblemaInteligencia {
  id: string;
  plano_id: string;
  codigo: string; // PRB-2024-001-001
  enunciado: string;
  contexto?: string;
  impacto_esperado?: string;
  created_at: string;
  updated_at: string;
}

export interface AspectoConhecer {
  id: string;
  problema_id: string;
  codigo: string; // 1.1, 1.2, etc
  descricao: string;
  prazo?: number; // dias
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Insumo {
  id: string;
  aspecto_id: string;
  codigo: string; // 1.1.1, 1.1.2, etc
  titulo: string;
  descricao_detalhada?: string;
  tipo_coleta?: string[]; // ['HUMINT', 'OSINT', 'SIGINT']
  orientacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Nota {
  id: string;
  codigo: string; // NOT-2024-001-001
  insumo_id: string;
  tipo: 'DADO' | 'INFORMACAO' | 'CONHECIMENTO';
  conteudo: string;
  fonte?: string;
  tipo_fonte?: string; // HUMINT, OSINT, SIGINT, etc
  metodo_coleta?: string;
  local_coleta?: string;
  
  // Metadados de coleta
  coletor_id: string;
  data_hora_coleta: string;
  
  // Classificação
  classificacao_confiabilidade?: string; // A-1, B-2, C-3, D-4, E-5
  classificacao_seguranca?: 'ostensivo' | 'reservado' | 'confidencial' | 'secreto';
  
  // Status e validação
  status: 'coletado' | 'validado' | 'rejeitado' | 'requer_complementacao';
  validador_id?: string;
  data_validacao?: string;
  observacoes_validador?: string;
  
  // Campos 5W2H
  o_que?: string;
  quem?: string;
  quando?: string;
  onde?: string;
  por_que?: string;
  como?: string;
  
  // Entidades identificadas
  entidades?: Entidade[];
  
  // Lacunas críticas
  lacunas_criticas?: string[];
  
  // Metadados do sistema
  created_at: string;
  updated_at: string;
}

export interface Entidade {
  id: string;
  nome: string;
  tipo: 'PESSOA' | 'ORGANIZACAO' | 'LOCAL' | 'EVENTO' | 'OBJETO';
  subtipo?: string; // ex: "Empresa", "Cidade", "Veículo"
  descricao?: string;
  metadados?: Record<string, any>; // dados específicos por tipo
  confianca?: 'BAIXA' | 'MEDIA' | 'ALTA';
  contexto?: string; // Como a entidade aparece na nota
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'coordenador' | 'coletor' | 'validador' | 'analista';
  departamento?: string;
  telefone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipePlano {
  id: string;
  plano_id: string;
  usuario_id: string;
  funcao: string; // "Coordenador", "Coletor Sênior", etc
  data_inicio: string;
  data_fim?: string;
  ativo: boolean;
  created_at: string;
}

export interface NotaRelacionamento {
  id: string;
  nota_origem_id: string;
  nota_destino_id: string;
  tipo_relacao: 'complementa' | 'contradiz' | 'confirma' | 'relacionado';
  descricao?: string;
  created_at: string;
}

export interface Arquivo {
  id: string;
  nota_id: string;
  nome_original: string;
  nome_arquivo: string; // nome no sistema
  tipo_mime?: string;
  tamanho?: number;
  caminho?: string;
  hash_arquivo?: string; // Para detectar duplicatas
  created_at: string;
}

// Tipos para Dashboard e Métricas
export interface DashboardMetrics {
  total_planos: number;
  total_notas: number;
  total_usuarios: number;
  notas_por_tipo: {
    DADO: number;
    INFORMAÇÃO: number;
    CONHECIMENTO: number;
  };
  status_validacao: {
    validado: number;
    pendente: number;
    rejeitado: number;
  };
  lacunas_criticas: number;
  entidades_identificadas: number;
}

export interface ChartData {
  data: string;
  notas_coletadas: number;
  notas_validadas: number;
  lacunas_identificadas: number;
}

export interface RecentActivity {
  id: string;
  tipo: 'nota_criada' | 'nota_validada' | 'plano_criado' | 'entidade_identificada';
  descricao: string;
  usuario: string;
  timestamp: string;
  dados?: Record<string, any>;
}

// Tipos para Busca
export interface BuscaRequest {
  query: string;
  filtros?: {
    planos?: string[];
    tipos_nota?: string[];
    status?: string[];
    data_inicio?: string;
    data_fim?: string;
    coletor?: string;
    entidades?: string[];
  };
  limit?: number;
  offset?: number;
}

export interface BuscaResponse {
  resultados: Nota[];
  total: number;
  tempo_busca: number;
  sugestoes?: string[];
}

// Tipos para Análise de Rede
export interface NetworkNode {
  id: string;
  label: string;
  tipo: 'pessoa' | 'organizacao' | 'local' | 'evento' | 'objeto';
  grupo?: string;
  tamanho?: number;
  cor?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  label?: string;
  peso?: number;
  tipo?: string;
}

export interface NetworkAnalysis {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  metricas: {
    total_nos: number;
    total_conexoes: number;
    densidade: number;
    componentes_conectados: number;
    nos_centrais: string[];
  };
}

// Tipos para Formulários
export interface NovaNotaRequest {
  insumo_id: string;
  tipo: 'DADO' | 'INFORMACAO' | 'CONHECIMENTO';
  conteudo: string;
  fonte?: string;
  tipo_fonte?: string;
  metodo_coleta?: string;
  local_coleta?: string;
  o_que?: string;
  quem?: string;
  quando?: string;
  onde?: string;
  por_que?: string;
  como?: string;
  classificacao_confiabilidade?: string;
  classificacao_seguranca?: string;
}

export interface NovoPlanoRequest {
  titulo: string;
  descricao?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  prazo_estimado?: number;
  orcamento?: number;
  coordenador_id: string;
}

// Tipos para API Responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  total_pages: number;
  current_page: number;
}

// Tipos para Notificações
export interface Notification {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  acao?: {
    texto: string;
    url: string;
  };
}

// Tipos para Configurações
export interface ConfiguracaoSistema {
  nome_sistema: string;
  versao: string;
  ambiente: 'development' | 'production' | 'staging';
  configuracao_neo4j: {
    url: string;
    usuario: string;
    senha: string;
  };
  configuracao_postgres: {
    host: string;
    porta: number;
    database: string;
    usuario: string;
    senha: string;
  };
  configuracao_redis: {
    url: string;
  };
} 