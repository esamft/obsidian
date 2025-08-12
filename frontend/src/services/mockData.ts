// Dados mockados baseados na PLANILHA_EXPANDIDA.md
// Estes dados serão usados enquanto o backend não está implementado

import {
  Plano,
  ProblemaInteligencia,
  AspectoConhecer,
  Insumo,
  Nota,
  Entidade,
  Usuario,
  DashboardMetrics,
  ChartData,
  RecentActivity,
  PaginatedResponse
} from '../types';

// Usuários mockados
export const mockUsuarios: Usuario[] = [
  {
    id: 'usr-001',
    nome: 'Ana Silva',
    email: 'ana.silva@instituicao.gov.br',
    role: 'coordenador',
    departamento: 'Inteligência Estratégica',
    telefone: '(61) 98765-4321',
    ativo: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'usr-002',
    nome: 'Carlos Mendes',
    email: 'carlos.mendes@instituicao.gov.br',
    role: 'coletor',
    departamento: 'Operações de Campo',
    telefone: '(61) 98765-4322',
    ativo: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'usr-003',
    nome: 'Marina Costa',
    email: 'marina.costa@instituicao.gov.br',
    role: 'coletor',
    departamento: 'Operações de Campo',
    telefone: '(61) 98765-4323',
    ativo: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'usr-004',
    nome: 'Roberto Lima',
    email: 'roberto.lima@instituicao.gov.br',
    role: 'coletor',
    departamento: 'OSINT',
    telefone: '(61) 98765-4324',
    ativo: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 'usr-005',
    nome: 'Paula Santos',
    email: 'paula.santos@instituicao.gov.br',
    role: 'validador',
    departamento: 'Análise e Validação',
    telefone: '(61) 98765-4325',
    ativo: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Planos mockados baseados na planilha
export const mockPlanos: Plano[] = [
  {
    id: 'pln-001',
    codigo: 'PLN-2024-001',
    titulo: 'Vulnerabilidades na Fronteira Norte',
    descricao: 'Investigação sobre como organizações criminosas exploram vulnerabilidades da fronteira norte',
    status: 'ativo',
    prioridade: 'alta',
    coordenador_id: 'usr-001',
    data_criacao: '2024-01-15',
    prazo_estimado: 180,
    orcamento: 150000,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'pln-002',
    codigo: 'PLN-2024-002',
    titulo: 'Lavagem de Dinheiro no Setor Imobiliário',
    descricao: 'Análise de métodos de lavagem de dinheiro via setor imobiliário',
    status: 'ativo',
    prioridade: 'alta',
    coordenador_id: 'usr-001',
    data_criacao: '2024-02-01',
    prazo_estimado: 120,
    orcamento: 100000,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'pln-003',
    codigo: 'PLN-2024-003',
    titulo: 'Ameaças Cibernéticas a Infraestruturas Críticas',
    descricao: 'Investigação sobre grupos APT que ameaçam infraestruturas brasileiras',
    status: 'ativo',
    prioridade: 'critica',
    coordenador_id: 'usr-001',
    data_criacao: '2024-02-15',
    prazo_estimado: 90,
    orcamento: 200000,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  }
];

// Problemas de inteligência mockados
export const mockProblemas: ProblemaInteligencia[] = [
  {
    id: 'prb-001',
    plano_id: 'pln-001',
    codigo: 'PRB-2024-001-001',
    enunciado: 'Como as organizações criminosas exploram as vulnerabilidades da fronteira norte para atividades ilícitas transnacionais?',
    contexto: 'Aumento de 300% nas apreensões na região nos últimos 12 meses',
    impacto_esperado: 'Subsidiar operações de controle fronteiriço e políticas públicas',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'prb-002',
    plano_id: 'pln-002',
    codigo: 'PRB-2024-002-001',
    enunciado: 'Como organizações criminosas utilizam o setor imobiliário para lavagem de dinheiro?',
    contexto: 'Aumento significativo em transações imobiliárias suspeitas',
    impacto_esperado: 'Identificar métodos e fortalecer controle financeiro',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
];

// Aspectos a conhecer mockados
export const mockAspectos: AspectoConhecer[] = [
  {
    id: 'asp-001',
    problema_id: 'prb-001',
    codigo: '1.1',
    descricao: 'Atores criminosos atuantes',
    prazo: 60,
    responsavel_id: 'usr-002',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'asp-002',
    problema_id: 'prb-001',
    codigo: '1.2',
    descricao: 'Vulnerabilidades estruturais',
    prazo: 45,
    responsavel_id: 'usr-003',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Insumos mockados
export const mockInsumos: Insumo[] = [
  {
    id: 'ins-001',
    aspecto_id: 'asp-001',
    codigo: '1.1.1',
    titulo: 'Identificação de lideranças criminosas',
    descricao_detalhada: 'Coletar informações sobre líderes de organizações criminosas, incluindo nomes, apelidos, características físicas, histórico criminal e área de atuação',
    tipo_coleta: ['HUMINT', 'OSINT', 'Documentos Policiais'],
    orientacoes: 'Priorizar líderes com atuação confirmada nos últimos 6 meses',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'ins-002',
    aspecto_id: 'asp-001',
    codigo: '1.1.2',
    titulo: 'Modus operandi das organizações',
    descricao_detalhada: 'Documentar métodos, técnicas e procedimentos utilizados pelas organizações criminosas',
    tipo_coleta: ['HUMINT', 'SIGINT', 'Vigilância'],
    orientacoes: 'Focar em inovações táticas e vulnerabilidades exploradas',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];

// Entidades mockadas baseadas na planilha
export const mockEntidades: Entidade[] = [
  {
    id: 'ent-001',
    nome: 'Marcos Silva',
    tipo: 'PESSOA',
    subtipo: 'Líder Criminal',
    descricao: 'Conhecido como "O Dentista", coordena operações de contrabando',
    confianca: 'ALTA',
    contexto: 'Aparece em múltiplas notas como coordenador de rede criminosa',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'ent-002',
    nome: 'DentistaDigital',
    tipo: 'PESSOA',
    subtipo: 'Hacker',
    descricao: 'Hacker que oferece serviços de invasão a sistemas bancários',
    confianca: 'MEDIA',
    contexto: 'Pseudônimo usado em fóruns da dark web',
    created_at: '2024-03-08T00:00:00Z',
    updated_at: '2024-03-08T00:00:00Z'
  },
  {
    id: 'ent-003',
    nome: 'Clínica Sorriso Perfeito',
    tipo: 'ORGANIZACAO',
    subtipo: 'Clínica Odontológica',
    descricao: 'Clínica odontológica usada como fachada para contrabando',
    confianca: 'ALTA',
    contexto: 'Aparece em múltiplas notas como ponto de operações',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'ent-004',
    nome: 'Boa Vista/RR',
    tipo: 'LOCAL',
    subtipo: 'Cidade',
    descricao: 'Cidade de Roraima onde ocorrem operações criminosas',
    confianca: 'ALTA',
    contexto: 'Local principal de operações da rede criminosa',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  }
];

// Notas mockadas baseadas na planilha
export const mockNotas: Nota[] = [
  {
    id: 'not-001',
    codigo: 'NOT-2024-001-001',
    insumo_id: 'ins-001',
    tipo: 'DADO',
    conteudo: 'José "Chicão" visto negociando com caminhoneiros venezuelanos',
    fonte: 'Informante DELTA-7',
    tipo_fonte: 'HUMINT',
    metodo_coleta: 'Entrevista presencial',
    local_coleta: 'Pacaraima/RR',
    coletor_id: 'usr-002',
    data_hora_coleta: '2024-02-15T14:32:00Z',
    classificacao_confiabilidade: 'B-2',
    classificacao_seguranca: 'reservado',
    status: 'validado',
    validador_id: 'usr-005',
    data_validacao: '2024-02-16T09:15:00Z',
    observacoes_validador: 'Informação corroborada por relatório policial RRP-2024-0234',
    o_que: 'Negociação suspeita',
    quem: 'José "Chicão", caminhoneiros venezuelanos',
    quando: '[LACUNA - data específica]',
    onde: '[LACUNA - local exato]',
    por_que: '[LACUNA]',
    como: '[LACUNA - tipo de negociação]',
    entidades: [
      { ...mockEntidades[0], confianca: 'ALTA' },
      { id: 'ent-temp-1', nome: 'José "Chicão"', tipo: 'PESSOA', confianca: 'ALTA', created_at: '2024-02-15T00:00:00Z', updated_at: '2024-02-15T00:00:00Z' }
    ],
    lacunas_criticas: [
      'Data e horário da negociação',
      'Local específico do encontro',
      'Objeto da negociação'
    ],
    created_at: '2024-02-15T14:32:00Z',
    updated_at: '2024-02-16T09:15:00Z'
  },
  {
    id: 'not-002',
    codigo: 'NOT-2024-002-020',
    insumo_id: 'ins-001',
    tipo: 'CONHECIMENTO',
    conteudo: 'Apartamento Diamond Tower vendido por R$ 15 milhões (87,5% acima do mercado)',
    fonte: 'RIF COAF 2024-SP-1234',
    tipo_fonte: 'Documento Oficial',
    metodo_coleta: 'Análise documental',
    local_coleta: 'São Paulo/SP',
    coletor_id: 'usr-003',
    data_hora_coleta: '2024-03-01T11:15:00Z',
    classificacao_confiabilidade: 'A-1',
    classificacao_seguranca: 'reservado',
    status: 'validado',
    validador_id: 'usr-005',
    data_validacao: '2024-03-01T14:30:00Z',
    observacoes_validador: 'Documento oficial verificado',
    o_que: 'Superfaturamento imobiliário',
    quem: 'GOLDEN INVESTMENTS LLC (comprador), Maria Silva (vendedora)',
    quando: 'Transação recente (2024)',
    onde: 'Edifício Diamond Tower, São Paulo/SP',
    por_que: 'Lavagem de dinheiro via superfaturamento',
    como: '90% em espécie (notas de R$ 100), 15 depósitos no Banco XYZ',
    entidades: [
      { id: 'ent-temp-2', nome: 'GOLDEN INVESTMENTS LLC', tipo: 'ORGANIZACAO', confianca: 'ALTA', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' },
      { id: 'ent-temp-3', nome: 'Maria Silva', tipo: 'PESSOA', confianca: 'ALTA', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z' }
    ],
    lacunas_criticas: [],
    created_at: '2024-03-01T11:15:00Z',
    updated_at: '2024-03-01T14:30:00Z'
  }
];

// Dashboard metrics mockados
export const mockDashboardMetrics: DashboardMetrics = {
  total_planos: 10,
  total_notas: 200,
  total_usuarios: 8,
  notas_por_tipo: {
    DADO: 60,
    INFORMAÇÃO: 74,
    CONHECIMENTO: 66
  },
  status_validacao: {
    validado: 174,
    pendente: 20,
    rejeitado: 6
  },
  lacunas_criticas: 155,
  entidades_identificadas: 45
};

// Chart data mockado
export const mockChartData: ChartData[] = [
  { data: '2024-05-01', notas_coletadas: 12, notas_validadas: 10, lacunas_identificadas: 8 },
  { data: '2024-05-02', notas_coletadas: 15, notas_validadas: 12, lacunas_identificadas: 10 },
  { data: '2024-05-03', notas_coletadas: 8, notas_validadas: 7, lacunas_identificadas: 5 },
  { data: '2024-05-04', notas_coletadas: 20, notas_validadas: 18, lacunas_identificadas: 12 },
  { data: '2024-05-05', notas_coletadas: 14, notas_validadas: 13, lacunas_identificadas: 9 },
  { data: '2024-05-06', notas_coletadas: 18, notas_validadas: 16, lacunas_identificadas: 11 },
  { data: '2024-05-07', notas_coletadas: 22, notas_validadas: 20, lacunas_identificadas: 15 }
];

// Recent activities mockados
export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'act-001',
    tipo: 'nota_criada',
    descricao: 'Nova nota criada: Marcos Silva solicitou 50 fuzis AK-47',
    usuario: 'Carlos Mendes',
    timestamp: '2024-05-08T10:45:00Z',
    dados: { nota_id: 'not-105', plano_id: 'pln-004' }
  },
  {
    id: 'act-002',
    tipo: 'nota_validada',
    descricao: 'Nota validada: DentistaDigital recebeu 2.5 BTC de Marcos Silva',
    usuario: 'Paula Santos',
    timestamp: '2024-05-08T18:30:00Z',
    dados: { nota_id: 'not-106', validador: 'Paula Santos' }
  },
  {
    id: 'act-003',
    tipo: 'entidade_identificada',
    descricao: 'Nova entidade identificada: Clínica Sorriso Perfeito',
    usuario: 'Marina Costa',
    timestamp: '2024-05-09T08:15:00Z',
    dados: { entidade_id: 'ent-003', tipo: 'ORGANIZACAO' }
  },
  {
    id: 'act-004',
    tipo: 'plano_criado',
    descricao: 'Novo plano criado: Vulnerabilidades na Fronteira Norte',
    usuario: 'Ana Silva',
    timestamp: '2024-05-10T09:00:00Z',
    dados: { plano_id: 'pln-001', coordenador: 'Ana Silva' }
  }
];

// Funções utilitárias para simular paginação
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  limit: number = 10,
  offset: number = 0
): PaginatedResponse<T> => {
  return {
    data: data.slice(offset, offset + limit),
    total,
    limit,
    offset,
    total_pages: Math.ceil(total / limit),
    current_page: Math.floor(offset / limit) + 1
  };
};

// Simular delay de rede
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 