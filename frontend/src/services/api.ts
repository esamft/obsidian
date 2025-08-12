import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Plano,
  ProblemaInteligencia,
  AspectoConhecer,
  Insumo,
  Nota,
  Entidade,
  Usuario,
  EquipePlano,
  NotaRelacionamento,
  Arquivo,
  DashboardMetrics,
  ChartData,
  RecentActivity,
  BuscaRequest,
  BuscaResponse,
  NetworkAnalysis,
  NovaNotaRequest,
  NovoPlanoRequest,
  ApiResponse,
  PaginatedResponse,
  Notification,
  ConfiguracaoSistema
} from '../types';

// Importar dados mockados
import {
  mockUsuarios,
  mockPlanos,
  mockProblemas,
  mockAspectos,
  mockInsumos,
  mockNotas,
  mockEntidades,
  mockDashboardMetrics,
  mockChartData,
  mockRecentActivities,
  createPaginatedResponse,
  simulateApiDelay
} from './mockData';

class MatrizColetaApiService {
  private api: AxiosInstance;
  private useMockData: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        // Se não conseguir conectar ao backend, usar dados mockados
        if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
          this.useMockData = true;
        }
        return Promise.reject(error);
      }
    );

    // Verificar se deve usar dados mockados
    this.checkBackendAvailability();
  }

  private async checkBackendAvailability(): Promise<void> {
    try {
      await this.api.get('/health');
      this.useMockData = false;
    } catch (error) {
      console.log('Backend não disponível, usando dados mockados');
      this.useMockData = true;
    }
  }

  // ===== DASHBOARD E MÉTRICAS =====
  
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockDashboardMetrics;
    }
    
    try {
      const response: AxiosResponse<DashboardMetrics> = await this.api.get('/api/dashboard/metrics');
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockDashboardMetrics;
    }
  }

  async getChartData(periodo: string = '7d'): Promise<ChartData[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockChartData;
    }
    
    try {
      const response: AxiosResponse<ChartData[]> = await this.api.get(`/api/dashboard/chart-data?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockChartData;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockRecentActivities.slice(0, limit);
    }
    
    try {
      const response: AxiosResponse<RecentActivity[]> = await this.api.get(`/api/dashboard/recent-activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockRecentActivities.slice(0, limit);
    }
  }

  // ===== PLANOS =====

  async getPlanos(params?: {
    status?: string;
    prioridade?: string;
    coordenador?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Plano>> {
    if (this.useMockData) {
      await simulateApiDelay();
      let filteredPlanos = [...mockPlanos];
      
      if (params?.status) {
        filteredPlanos = filteredPlanos.filter(p => p.status === params.status);
      }
      if (params?.prioridade) {
        filteredPlanos = filteredPlanos.filter(p => p.prioridade === params.prioridade);
      }
      
      return createPaginatedResponse(
        filteredPlanos,
        filteredPlanos.length,
        params?.limit || 10,
        params?.offset || 0
      );
    }
    
    try {
      const response: AxiosResponse<PaginatedResponse<Plano>> = await this.api.get('/api/planos', { params });
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return createPaginatedResponse(mockPlanos, mockPlanos.length, params?.limit || 10, params?.offset || 0);
    }
  }

  async getPlano(id: string): Promise<Plano> {
    if (this.useMockData) {
      await simulateApiDelay();
      const plano = mockPlanos.find(p => p.id === id);
      if (!plano) throw new Error('Plano não encontrado');
      return plano;
    }
    
    try {
      const response: AxiosResponse<Plano> = await this.api.get(`/api/planos/${id}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      const plano = mockPlanos.find(p => p.id === id);
      if (!plano) throw new Error('Plano não encontrado');
      return plano;
    }
  }

  async createPlano(plano: NovoPlanoRequest): Promise<Plano> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newPlano: Plano = {
        id: `pln-${Date.now()}`,
        codigo: `PLN-2024-${String(mockPlanos.length + 1).padStart(3, '0')}`,
        titulo: plano.titulo,
        descricao: plano.descricao,
        status: 'ativo',
        prioridade: plano.prioridade,
        coordenador_id: plano.coordenador_id,
        data_criacao: new Date().toISOString().split('T')[0],
        prazo_estimado: plano.prazo_estimado,
        orcamento: plano.orcamento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockPlanos.push(newPlano);
      return newPlano;
    }
    
    const response: AxiosResponse<Plano> = await this.api.post('/api/planos', plano);
    return response.data;
  }

  async updatePlano(id: string, plano: Partial<Plano>): Promise<Plano> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockPlanos.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Plano não encontrado');
      
      mockPlanos[index] = { ...mockPlanos[index], ...plano, updated_at: new Date().toISOString() };
      return mockPlanos[index];
    }
    
    const response: AxiosResponse<Plano> = await this.api.put(`/api/planos/${id}`, plano);
    return response.data;
  }

  async deletePlano(id: string): Promise<{ success: boolean; message: string }> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockPlanos.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Plano não encontrado');
      
      mockPlanos.splice(index, 1);
      return { success: true, message: 'Plano deletado com sucesso' };
    }
    
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/api/planos/${id}`);
    return response.data;
  }

  // ===== PROBLEMAS DE INTELIGÊNCIA =====

  async getProblemas(plano_id: string): Promise<ProblemaInteligencia[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockProblemas.filter(p => p.plano_id === plano_id);
    }
    
    try {
      const response: AxiosResponse<ProblemaInteligencia[]> = await this.api.get(`/api/planos/${plano_id}/problemas`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockProblemas.filter(p => p.plano_id === plano_id);
    }
  }

  async createProblema(plano_id: string, problema: Partial<ProblemaInteligencia>): Promise<ProblemaInteligencia> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newProblema: ProblemaInteligencia = {
        id: `prb-${Date.now()}`,
        plano_id,
        codigo: `PRB-2024-${String(mockProblemas.length + 1).padStart(3, '0')}`,
        enunciado: problema.enunciado || '',
        contexto: problema.contexto,
        impacto_esperado: problema.impacto_esperado,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockProblemas.push(newProblema);
      return newProblema;
    }
    
    const response: AxiosResponse<ProblemaInteligencia> = await this.api.post(`/api/planos/${plano_id}/problemas`, problema);
    return response.data;
  }

  // ===== ASPECTOS A CONHECER =====

  async getAspectos(problema_id: string): Promise<AspectoConhecer[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockAspectos.filter(a => a.problema_id === problema_id);
    }
    
    try {
      const response: AxiosResponse<AspectoConhecer[]> = await this.api.get(`/api/problemas/${problema_id}/aspectos`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockAspectos.filter(a => a.problema_id === problema_id);
    }
  }

  async createAspecto(problema_id: string, aspecto: Partial<AspectoConhecer>): Promise<AspectoConhecer> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newAspecto: AspectoConhecer = {
        id: `asp-${Date.now()}`,
        problema_id,
        codigo: aspecto.codigo || '1.1',
        descricao: aspecto.descricao || '',
        prazo: aspecto.prazo,
        responsavel_id: aspecto.responsavel_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockAspectos.push(newAspecto);
      return newAspecto;
    }
    
    const response: AxiosResponse<AspectoConhecer> = await this.api.post(`/api/problemas/${problema_id}/aspectos`, aspecto);
    return response.data;
  }

  // ===== INSUMOS =====

  async getInsumos(aspecto_id: string): Promise<Insumo[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockInsumos.filter(i => i.aspecto_id === aspecto_id);
    }
    
    try {
      const response: AxiosResponse<Insumo[]> = await this.api.get(`/api/aspectos/${aspecto_id}/insumos`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return mockInsumos.filter(i => i.aspecto_id === aspecto_id);
    }
  }

  async createInsumo(aspecto_id: string, insumo: Partial<Insumo>): Promise<Insumo> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newInsumo: Insumo = {
        id: `ins-${Date.now()}`,
        aspecto_id,
        codigo: insumo.codigo || '1.1.1',
        titulo: insumo.titulo || '',
        descricao_detalhada: insumo.descricao_detalhada,
        tipo_coleta: insumo.tipo_coleta,
        orientacoes: insumo.orientacoes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockInsumos.push(newInsumo);
      return newInsumo;
    }
    
    const response: AxiosResponse<Insumo> = await this.api.post(`/api/aspectos/${aspecto_id}/insumos`, insumo);
    return response.data;
  }

  // ===== NOTAS =====

  async getNotas(params?: {
    insumo_id?: string;
    tipo?: string;
    status?: string;
    coletor?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Nota>> {
    if (this.useMockData) {
      await simulateApiDelay();
      let filteredNotas = [...mockNotas];
      
      if (params?.insumo_id) {
        filteredNotas = filteredNotas.filter(n => n.insumo_id === params.insumo_id);
      }
      if (params?.tipo) {
        filteredNotas = filteredNotas.filter(n => n.tipo === params.tipo);
      }
      if (params?.status) {
        filteredNotas = filteredNotas.filter(n => n.status === params.status);
      }
      
      return createPaginatedResponse(
        filteredNotas,
        filteredNotas.length,
        params?.limit || 10,
        params?.offset || 0
      );
    }
    
    try {
      const response: AxiosResponse<PaginatedResponse<Nota>> = await this.api.get('/api/notas', { params });
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return createPaginatedResponse(mockNotas, mockNotas.length, params?.limit || 10, params?.offset || 0);
    }
  }

  async getNota(id: string): Promise<Nota> {
    if (this.useMockData) {
      await simulateApiDelay();
      const nota = mockNotas.find(n => n.id === id);
      if (!nota) throw new Error('Nota não encontrada');
      return nota;
    }
    
    try {
      const response: AxiosResponse<Nota> = await this.api.get(`/api/notas/${id}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      const nota = mockNotas.find(n => n.id === id);
      if (!nota) throw new Error('Nota não encontrada');
      return nota;
    }
  }

  async createNota(nota: NovaNotaRequest): Promise<Nota> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newNota: Nota = {
        id: `not-${Date.now()}`,
        codigo: `NOT-2024-${String(mockNotas.length + 1).padStart(3, '0')}`,
        insumo_id: nota.insumo_id,
        tipo: nota.tipo,
        conteudo: nota.conteudo,
        fonte: nota.fonte,
        tipo_fonte: nota.tipo_fonte,
        metodo_coleta: nota.metodo_coleta,
        local_coleta: nota.local_coleta,
        coletor_id: 'usr-002', // Mock user
        data_hora_coleta: new Date().toISOString(),
        classificacao_confiabilidade: nota.classificacao_confiabilidade,
        classificacao_seguranca: nota.classificacao_seguranca || 'ostensivo',
        status: 'coletado',
        o_que: nota.o_que,
        quem: nota.quem,
        quando: nota.quando,
        onde: nota.onde,
        por_que: nota.por_que,
        como: nota.como,
        entidades: [],
        lacunas_criticas: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockNotas.push(newNota);
      return newNota;
    }
    
    const response: AxiosResponse<Nota> = await this.api.post('/api/notas', nota);
    return response.data;
  }

  async updateNota(id: string, nota: Partial<Nota>): Promise<Nota> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockNotas.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Nota não encontrada');
      
      mockNotas[index] = { ...mockNotas[index], ...nota, updated_at: new Date().toISOString() };
      return mockNotas[index];
    }
    
    const response: AxiosResponse<Nota> = await this.api.put(`/api/notas/${id}`, nota);
    return response.data;
  }

  async deleteNota(id: string): Promise<{ success: boolean; message: string }> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockNotas.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Nota não encontrada');
      
      mockNotas.splice(index, 1);
      return { success: true, message: 'Nota deletada com sucesso' };
    }
    
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/api/notas/${id}`);
    return response.data;
  }

  async validarNota(id: string, validacao: {
    status: string;
    observacoes?: string;
  }): Promise<Nota> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockNotas.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Nota não encontrada');
      
      mockNotas[index] = {
        ...mockNotas[index],
        status: validacao.status as any,
        validador_id: 'usr-005', // Mock validator
        data_validacao: new Date().toISOString(),
        observacoes_validador: validacao.observacoes,
        updated_at: new Date().toISOString()
      };
      return mockNotas[index];
    }
    
    const response: AxiosResponse<Nota> = await this.api.post(`/api/notas/${id}/validar`, validacao);
    return response.data;
  }

  // ===== ENTIDADES =====

  async getEntidades(params?: {
    tipo?: string;
    nome?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Entidade>> {
    if (this.useMockData) {
      await simulateApiDelay();
      let filteredEntidades = [...mockEntidades];
      
      if (params?.tipo) {
        filteredEntidades = filteredEntidades.filter(e => e.tipo === params.tipo);
      }
      if (params?.nome) {
        filteredEntidades = filteredEntidades.filter(e => 
          e.nome.toLowerCase().includes(params.nome!.toLowerCase())
        );
      }
      
      return createPaginatedResponse(
        filteredEntidades,
        filteredEntidades.length,
        params?.limit || 10,
        params?.offset || 0
      );
    }
    
    try {
      const response: AxiosResponse<PaginatedResponse<Entidade>> = await this.api.get('/api/entidades', { params });
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return createPaginatedResponse(mockEntidades, mockEntidades.length, params?.limit || 10, params?.offset || 0);
    }
  }

  async getEntidade(id: string): Promise<Entidade> {
    if (this.useMockData) {
      await simulateApiDelay();
      const entidade = mockEntidades.find(e => e.id === id);
      if (!entidade) throw new Error('Entidade não encontrada');
      return entidade;
    }
    
    try {
      const response: AxiosResponse<Entidade> = await this.api.get(`/api/entidades/${id}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      const entidade = mockEntidades.find(e => e.id === id);
      if (!entidade) throw new Error('Entidade não encontrada');
      return entidade;
    }
  }

  async createEntidade(entidade: Partial<Entidade>): Promise<Entidade> {
    if (this.useMockData) {
      await simulateApiDelay();
      const newEntidade: Entidade = {
        id: `ent-${Date.now()}`,
        nome: entidade.nome || '',
        tipo: entidade.tipo || 'PESSOA',
        subtipo: entidade.subtipo,
        descricao: entidade.descricao,
        metadados: entidade.metadados,
        confianca: entidade.confianca || 'MEDIA',
        contexto: entidade.contexto,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockEntidades.push(newEntidade);
      return newEntidade;
    }
    
    const response: AxiosResponse<Entidade> = await this.api.post('/api/entidades', entidade);
    return response.data;
  }

  async updateEntidade(id: string, entidade: Partial<Entidade>): Promise<Entidade> {
    if (this.useMockData) {
      await simulateApiDelay();
      const index = mockEntidades.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Entidade não encontrada');
      
      mockEntidades[index] = { ...mockEntidades[index], ...entidade, updated_at: new Date().toISOString() };
      return mockEntidades[index];
    }
    
    const response: AxiosResponse<Entidade> = await this.api.put(`/api/entidades/${id}`, entidade);
    return response.data;
  }

  // ===== USUÁRIOS =====

  async getUsuarios(params?: {
    role?: string;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Usuario>> {
    if (this.useMockData) {
      await simulateApiDelay();
      let filteredUsuarios = [...mockUsuarios];
      
      if (params?.role) {
        filteredUsuarios = filteredUsuarios.filter(u => u.role === params.role);
      }
      if (params?.ativo !== undefined) {
        filteredUsuarios = filteredUsuarios.filter(u => u.ativo === params.ativo);
      }
      
      return createPaginatedResponse(
        filteredUsuarios,
        filteredUsuarios.length,
        params?.limit || 10,
        params?.offset || 0
      );
    }
    
    try {
      const response: AxiosResponse<PaginatedResponse<Usuario>> = await this.api.get('/api/usuarios', { params });
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return createPaginatedResponse(mockUsuarios, mockUsuarios.length, params?.limit || 10, params?.offset || 0);
    }
  }

  async getUsuario(id: string): Promise<Usuario> {
    if (this.useMockData) {
      await simulateApiDelay();
      const usuario = mockUsuarios.find(u => u.id === id);
      if (!usuario) throw new Error('Usuário não encontrado');
      return usuario;
    }
    
    try {
      const response: AxiosResponse<Usuario> = await this.api.get(`/api/usuarios/${id}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      const usuario = mockUsuarios.find(u => u.id === id);
      if (!usuario) throw new Error('Usuário não encontrado');
      return usuario;
    }
  }

  // ===== BUSCA =====

  async buscar(request: BuscaRequest): Promise<BuscaResponse> {
    if (this.useMockData) {
      await simulateApiDelay();
      let resultados = [...mockNotas];
      
      if (request.query) {
        const query = request.query.toLowerCase();
        resultados = resultados.filter(n => 
          n.conteudo.toLowerCase().includes(query) ||
          n.fonte?.toLowerCase().includes(query) ||
          n.o_que?.toLowerCase().includes(query) ||
          n.quem?.toLowerCase().includes(query)
        );
      }
      
      return {
        resultados: resultados.slice(0, request.limit || 10),
        total: resultados.length,
        tempo_busca: Math.random() * 1000,
        sugestoes: ['Marcos Silva', 'DentistaDigital', 'Clínica Sorriso Perfeito']
      };
    }
    
    const response: AxiosResponse<BuscaResponse> = await this.api.post('/api/busca', request);
    return response.data;
  }

  async getSugestoesBusca(query: string): Promise<string[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return ['Marcos Silva', 'DentistaDigital', 'Clínica Sorriso Perfeito', 'Boa Vista/RR'];
    }
    
    try {
      const response: AxiosResponse<string[]> = await this.api.get(`/api/busca/sugestoes?q=${query}`);
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return ['Marcos Silva', 'DentistaDigital', 'Clínica Sorriso Perfeito', 'Boa Vista/RR'];
    }
  }

  // ===== ANÁLISE DE REDE =====

  async getNetworkAnalysis(params?: {
    plano_id?: string;
    entidades?: string[];
    profundidade?: number;
  }): Promise<NetworkAnalysis> {
    if (this.useMockData) {
      await simulateApiDelay();
      return {
        nodes: [
          { id: 'ent-001', label: 'Marcos Silva', tipo: 'pessoa', grupo: 'lideres', tamanho: 20, cor: '#ff6b6b' },
          { id: 'ent-002', label: 'DentistaDigital', tipo: 'pessoa', grupo: 'hackers', tamanho: 15, cor: '#4ecdc4' },
          { id: 'ent-003', label: 'Clínica Sorriso Perfeito', tipo: 'organizacao', grupo: 'empresas', tamanho: 18, cor: '#45b7d1' },
          { id: 'ent-004', label: 'Boa Vista/RR', tipo: 'local', grupo: 'locais', tamanho: 12, cor: '#96ceb4' }
        ],
        edges: [
          { source: 'ent-001', target: 'ent-002', label: 'Parceria', peso: 0.8, tipo: 'parceria' },
          { source: 'ent-001', target: 'ent-003', label: 'Coordena', peso: 0.9, tipo: 'coordenacao' },
          { source: 'ent-003', target: 'ent-004', label: 'Localizada em', peso: 0.7, tipo: 'localizacao' },
          { source: 'ent-002', target: 'ent-003', label: 'Ataca', peso: 0.6, tipo: 'ataque' }
        ],
        metricas: {
          total_nos: 4,
          total_conexoes: 4,
          densidade: 0.67,
          componentes_conectados: 1,
          nos_centrais: ['ent-001', 'ent-003']
        }
      };
    }
    
    const response: AxiosResponse<NetworkAnalysis> = await this.api.get('/api/analise/network', { params });
    return response.data;
  }

  async getEntidadesConectadas(entidade_id: string): Promise<{
    entidade: Entidade;
    conexoes: Entidade[];
    relacionamentos: NotaRelacionamento[];
  }> {
    if (this.useMockData) {
      await simulateApiDelay();
      const entidade = mockEntidades.find(e => e.id === entidade_id);
      if (!entidade) throw new Error('Entidade não encontrada');
      
      return {
        entidade,
        conexoes: mockEntidades.filter(e => e.id !== entidade_id),
        relacionamentos: []
      };
    }
    
    const response: AxiosResponse<{
      entidade: Entidade;
      conexoes: Entidade[];
      relacionamentos: NotaRelacionamento[];
    }> = await this.api.get(`/api/analise/entidades/${entidade_id}/conexoes`);
    return response.data;
  }

  // ===== ARQUIVOS =====

  async uploadArquivo(nota_id: string, file: File): Promise<Arquivo> {
    if (this.useMockData) {
      await simulateApiDelay();
      const arquivo: Arquivo = {
        id: `arq-${Date.now()}`,
        nota_id,
        nome_original: file.name,
        nome_arquivo: `upload_${Date.now()}_${file.name}`,
        tipo_mime: file.type,
        tamanho: file.size,
        caminho: `/uploads/${file.name}`,
        hash_arquivo: 'mock_hash',
        created_at: new Date().toISOString()
      };
      return arquivo;
    }
    
    const formData = new FormData();
    formData.append('arquivo', file);
    
    const response: AxiosResponse<Arquivo> = await this.api.post(`/api/notas/${nota_id}/arquivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getArquivos(nota_id: string): Promise<Arquivo[]> {
    if (this.useMockData) {
      await simulateApiDelay();
      return [];
    }
    
    const response: AxiosResponse<Arquivo[]> = await this.api.get(`/api/notas/${nota_id}/arquivos`);
    return response.data;
  }

  async deleteArquivo(arquivo_id: string): Promise<{ success: boolean; message: string }> {
    if (this.useMockData) {
      await simulateApiDelay();
      return { success: true, message: 'Arquivo deletado com sucesso' };
    }
    
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/api/arquivos/${arquivo_id}`);
    return response.data;
  }

  // ===== NOTIFICAÇÕES =====

  async getNotificacoes(params?: {
    lida?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Notification>> {
    if (this.useMockData) {
      await simulateApiDelay();
      const mockNotificacoes: Notification[] = [
        {
          id: 'notif-001',
          tipo: 'info',
          titulo: 'Nova nota coletada',
          mensagem: 'Carlos Mendes coletou uma nova nota sobre Marcos Silva',
          timestamp: new Date().toISOString(),
          lida: false
        }
      ];
      
      return createPaginatedResponse(
        mockNotificacoes,
        mockNotificacoes.length,
        params?.limit || 10,
        params?.offset || 0
      );
    }
    
    try {
      const response: AxiosResponse<PaginatedResponse<Notification>> = await this.api.get('/api/notificacoes', { params });
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return createPaginatedResponse([], 0, params?.limit || 10, params?.offset || 0);
    }
  }

  async marcarNotificacaoComoLida(id: string): Promise<Notification> {
    if (this.useMockData) {
      await simulateApiDelay();
      return {
        id,
        tipo: 'info',
        titulo: 'Notificação lida',
        mensagem: 'Notificação marcada como lida',
        timestamp: new Date().toISOString(),
        lida: true
      };
    }
    
    const response: AxiosResponse<Notification> = await this.api.put(`/api/notificacoes/${id}/lida`);
    return response.data;
  }

  // ===== CONFIGURAÇÕES =====

  async getConfiguracaoSistema(): Promise<ConfiguracaoSistema> {
    if (this.useMockData) {
      await simulateApiDelay();
      return {
        nome_sistema: 'Matriz de Coleta',
        versao: '1.0.0',
        ambiente: 'development',
        configuracao_neo4j: {
          url: 'bolt://localhost:7687',
          usuario: 'neo4j',
          senha: 'admin123'
        },
        configuracao_postgres: {
          host: 'localhost',
          porta: 5432,
          database: 'matriz_coleta',
          usuario: 'admin',
          senha: 'admin123'
        },
        configuracao_redis: {
          url: 'redis://localhost:6379'
        }
      };
    }
    
    const response: AxiosResponse<ConfiguracaoSistema> = await this.api.get('/api/configuracao');
    return response.data;
  }

  // ===== HEALTH CHECK =====

  async getHealthCheck(): Promise<{
    status: string;
    timestamp: string;
    services: {
      postgres: string;
      neo4j: string;
      redis: string;
    };
  }> {
    if (this.useMockData) {
      await simulateApiDelay();
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
          postgres: 'connected',
          neo4j: 'connected',
          redis: 'connected'
        }
      };
    }
    
    try {
      const response: AxiosResponse<{
        status: string;
        timestamp: string;
        services: {
          postgres: string;
          neo4j: string;
          redis: string;
        };
      }> = await this.api.get('/health');
      return response.data;
    } catch (error) {
      await simulateApiDelay();
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        services: {
          postgres: 'disconnected',
          neo4j: 'disconnected',
          redis: 'disconnected'
        }
      };
    }
  }

  // ===== AUTENTICAÇÃO =====

  async login(credentials: { email: string; senha: string }): Promise<{
    token: string;
    usuario: Usuario;
  }> {
    if (this.useMockData) {
      await simulateApiDelay();
      const usuario = mockUsuarios.find(u => u.email === credentials.email);
      if (!usuario) throw new Error('Credenciais inválidas');
      
      return {
        token: 'mock_jwt_token_' + Date.now(),
        usuario
      };
    }
    
    const response: AxiosResponse<{
      token: string;
      usuario: Usuario;
    }> = await this.api.post('/api/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    if (this.useMockData) {
      await simulateApiDelay();
      return { success: true, message: 'Logout realizado com sucesso' };
    }
    
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.post('/api/auth/logout');
    return response.data;
  }

  async getPerfil(): Promise<Usuario> {
    if (this.useMockData) {
      await simulateApiDelay();
      return mockUsuarios[0]; // Retorna o primeiro usuário como mock
    }
    
    const response: AxiosResponse<Usuario> = await this.api.get('/api/auth/perfil');
    return response.data;
  }

  // ===== UTILITÁRIOS =====

  setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isConnected(): boolean {
    return this.api.defaults.baseURL !== undefined;
  }

  getBaseUrl(): string {
    return this.api.defaults.baseURL || '';
  }

  // ===== TRATAMENTO DE ERROS =====

  handleError(error: any): {
    error: string;
    detail?: string;
    status_code: number;
  } {
    if (error.response) {
      return {
        error: error.response.data.error || 'Erro desconhecido',
        detail: error.response.data.detail,
        status_code: error.response.status
      };
    } else if (error.request) {
      return {
        error: 'Erro de conexão',
        detail: 'Não foi possível conectar ao servidor',
        status_code: 0
      };
    } else {
      return {
        error: 'Erro interno',
        detail: error.message,
        status_code: 500
      };
    }
  }
}

// Export singleton instance
export const apiService = new MatrizColetaApiService();
export default apiService; 