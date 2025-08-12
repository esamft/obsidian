import { Category } from '../types';

export class CategoryModel {
  private categories: Category[] = [];
  private selectedCategory: string = 'inbox';

  // Getters
  getCategories(): Category[] {
    return this.categories;
  }

  getSelectedCategory(): string {
    return this.selectedCategory;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(category => category.id === id);
  }

  getCategoryByName(name: string): Category | undefined {
    return this.categories.find(category => category.name === name);
  }

  // Setters
  setCategories(categories: Category[]): void {
    this.categories = categories;
  }

  setSelectedCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  // Business Logic
  getCategoryIcon(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.icon || '📄';
  }

  getCategoryName(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.name || 'Categoria Desconhecida';
  }

  getCategoryDescription(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.description || '';
  }

  getCategoryFolder(categoryId: string): string {
    const category = this.getCategoryById(categoryId);
    return category?.folder || '';
  }

  // Validation
  isValidCategory(categoryId: string): boolean {
    return this.categories.some(category => category.id === categoryId);
  }

  // Default categories for fallback
  getDefaultCategories(): Category[] {
    return [
      {
        id: 'inbox',
        name: '📥 Inbox',
        description: 'Notas gerais e captura rápida',
        folder: '📥 Inbox',
        icon: '📥'
      },
      {
        id: 'ideas',
        name: '💡 Ideias',
        description: 'Brainstorms e insights criativos',
        folder: '💡 Ideas',
        icon: '💡'
      },
      {
        id: 'tasks',
        name: '✅ Tarefas',
        description: 'TODOs e gerenciamento de tarefas',
        folder: '✅ Tasks',
        icon: '✅'
      },
      {
        id: 'articles',
        name: '📚 Artigos',
        description: 'Conteúdo longo e referências',
        folder: '📚 Articles',
        icon: '📚'
      },
      {
        id: 'meetings',
        name: '🤝 Reuniões',
        description: 'Notas de reuniões e encontros',
        folder: '🤝 Meetings',
        icon: '🤝'
      },
      {
        id: 'references',
        name: '📖 Referências',
        description: 'Citações e material de referência',
        folder: '📖 References',
        icon: '📖'
      }
    ];
  }

  // Initialize with default categories if none provided
  initialize(): void {
    if (this.categories.length === 0) {
      this.categories = this.getDefaultCategories();
    }
  }

  // Category suggestions based on content
  suggestCategory(text: string): string {
    const textLower = text.toLowerCase();
    
    // Keywords for each category
    const keywords = {
      ideas: ['ideia', 'idea', 'brainstorm', 'conceito', 'concept', 'inovação', 'innovation', 'criativo', 'creative'],
      tasks: ['tarefa', 'task', 'todo', 'fazer', 'do', 'ação', 'action', 'prazo', 'deadline'],
      articles: ['artigo', 'article', 'leitura', 'reading', 'pesquisa', 'research', 'estudo', 'study'],
      meetings: ['reunião', 'meeting', 'encontro', 'call', 'apresentação', 'presentation'],
      references: ['referência', 'reference', 'citação', 'citation', 'fonte', 'source']
    };

    // Check for keywords
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => textLower.includes(word))) {
        return category;
      }
    }

    // Check for URLs
    if (text.includes('http://') || text.includes('https://')) {
      return 'articles';
    }

    // Check for email addresses
    if (text.includes('@') && text.includes('.')) {
      return 'meetings';
    }

    // Check for task-like patterns
    if (text.includes('- [ ]') || text.includes('- [x]') || text.includes('•')) {
      return 'tasks';
    }

    // Default to inbox
    return 'inbox';
  }

  // Get category color for UI
  getCategoryColor(categoryId: string): string {
    const colors = {
      inbox: '#2196F3',
      ideas: '#FF9800',
      tasks: '#4CAF50',
      articles: '#9C27B0',
      meetings: '#FF5722',
      references: '#607D8B'
    };
    return colors[categoryId as keyof typeof colors] || '#757575';
  }

  // Get category priority for sorting
  getCategoryPriority(categoryId: string): number {
    const priorities = {
      inbox: 1,
      tasks: 2,
      ideas: 3,
      articles: 4,
      meetings: 5,
      references: 6
    };
    return priorities[categoryId as keyof typeof priorities] || 999;
  }

  // Sort categories by priority
  getSortedCategories(): Category[] {
    return [...this.categories].sort((a, b) => {
      const priorityA = this.getCategoryPriority(a.id);
      const priorityB = this.getCategoryPriority(b.id);
      return priorityA - priorityB;
    });
  }
} 