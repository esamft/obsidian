import { CategoryModel } from '../models/CategoryModel';
import { apiService } from '../services/api';
import { notificationService } from '../services/notificationService';
import { Category } from '../types';

export class CategoryController {
  private categoryModel: CategoryModel;

  constructor(categoryModel: CategoryModel) {
    this.categoryModel = categoryModel;
  }

  // Load categories from API
  async loadCategories(): Promise<Category[]> {
    try {
      const categories = await apiService.getCategories();
      this.categoryModel.setCategories(categories);
      return categories;
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro ao Carregar Categorias', apiError.error);
      
      // Fallback to default categories
      const defaultCategories = this.categoryModel.getDefaultCategories();
      this.categoryModel.setCategories(defaultCategories);
      notificationService.warning(
        'Usando Categorias Padrão',
        'Não foi possível carregar categorias do servidor. Usando categorias padrão.'
      );
      
      return defaultCategories;
    }
  }

  // Get all categories
  getCategories(): Category[] {
    return this.categoryModel.getCategories();
  }

  // Get sorted categories
  getSortedCategories(): Category[] {
    return this.categoryModel.getSortedCategories();
  }

  // Get selected category
  getSelectedCategory(): string {
    return this.categoryModel.getSelectedCategory();
  }

  // Set selected category
  setSelectedCategory(categoryId: string): void {
    if (!this.categoryModel.isValidCategory(categoryId)) {
      throw new Error('Categoria inválida');
    }
    this.categoryModel.setSelectedCategory(categoryId);
  }

  // Get category by ID
  getCategoryById(id: string): Category | undefined {
    return this.categoryModel.getCategoryById(id);
  }

  // Get category by name
  getCategoryByName(name: string): Category | undefined {
    return this.categoryModel.getCategoryByName(name);
  }

  // Get category icon
  getCategoryIcon(categoryId: string): string {
    return this.categoryModel.getCategoryIcon(categoryId);
  }

  // Get category name
  getCategoryName(categoryId: string): string {
    return this.categoryModel.getCategoryName(categoryId);
  }

  // Get category description
  getCategoryDescription(categoryId: string): string {
    return this.categoryModel.getCategoryDescription(categoryId);
  }

  // Get category folder
  getCategoryFolder(categoryId: string): string {
    return this.categoryModel.getCategoryFolder(categoryId);
  }

  // Get category color
  getCategoryColor(categoryId: string): string {
    return this.categoryModel.getCategoryColor(categoryId);
  }

  // Validate category
  isValidCategory(categoryId: string): boolean {
    return this.categoryModel.isValidCategory(categoryId);
  }

  // Suggest category based on text content
  suggestCategory(text: string): string {
    return this.categoryModel.suggestCategory(text);
  }

  // Initialize categories
  initialize(): void {
    this.categoryModel.initialize();
  }

  // Get category statistics
  getCategoryStats(jobs: any[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.categoryModel.getCategories().forEach(category => {
      stats[category.id] = jobs.filter(job => job.category === category.id).length;
    });
    
    return stats;
  }

  // Get category with most jobs
  getMostUsedCategory(jobs: any[]): string {
    const stats = this.getCategoryStats(jobs);
    let mostUsed = 'inbox';
    let maxCount = 0;
    
    Object.entries(stats).forEach(([categoryId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = categoryId;
      }
    });
    
    return mostUsed;
  }

  // Get category suggestions for text
  getCategorySuggestions(text: string): Category[] {
    const suggestedCategoryId = this.categoryModel.suggestCategory(text);
    const allCategories = this.categoryModel.getCategories();
    
    // Return categories with suggested one first
    return allCategories.sort((a, b) => {
      if (a.id === suggestedCategoryId) return -1;
      if (b.id === suggestedCategoryId) return 1;
      return 0;
    });
  }

  // Get category priority
  getCategoryPriority(categoryId: string): number {
    return this.categoryModel.getCategoryPriority(categoryId);
  }

  // Check if category is default
  isDefaultCategory(categoryId: string): boolean {
    const defaultCategories = this.categoryModel.getDefaultCategories();
    return defaultCategories.some(cat => cat.id === categoryId);
  }

  // Get category usage percentage
  getCategoryUsagePercentage(jobs: any[], categoryId: string): number {
    if (jobs.length === 0) return 0;
    
    const categoryJobs = jobs.filter(job => job.category === categoryId).length;
    return (categoryJobs / jobs.length) * 100;
  }

  // Get category trend (increasing/decreasing usage)
  getCategoryTrend(jobs: any[], categoryId: string, days: number = 7): 'increasing' | 'decreasing' | 'stable' {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const recentJobs = jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      return jobDate >= cutoffDate && job.category === categoryId;
    });
    
    const olderJobs = jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      return jobDate < cutoffDate && job.category === categoryId;
    });
    
    const recentCount = recentJobs.length;
    const olderCount = olderJobs.length;
    
    if (recentCount > olderCount) return 'increasing';
    if (recentCount < olderCount) return 'decreasing';
    return 'stable';
  }

  // Get category performance metrics
  getCategoryPerformance(jobs: any[], categoryId: string) {
    const categoryJobs = jobs.filter(job => job.category === categoryId);
    
    if (categoryJobs.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        averageProcessingTime: 0
      };
    }
    
    const successful = categoryJobs.filter(job => job.status === 'synced').length;
    const failed = categoryJobs.filter(job => job.status === 'failed').length;
    const successRate = (successful / categoryJobs.length) * 100;
    
    const processingTimes = categoryJobs
      .filter(job => job.processing_time_seconds)
      .map(job => job.processing_time_seconds || 0);
    
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;
    
    return {
      total: categoryJobs.length,
      successful,
      failed,
      successRate,
      averageProcessingTime
    };
  }

  // Get category recommendations
  getCategoryRecommendations(jobs: any[]): string[] {
    const recommendations: string[] = [];
    const stats = this.getCategoryStats(jobs);
    
    // Recommend categories with low usage
    const lowUsageCategories = Object.entries(stats)
      .filter(([_, count]) => count < 3)
      .map(([categoryId, _]) => categoryId);
    
    if (lowUsageCategories.length > 0) {
      recommendations.push(...lowUsageCategories.slice(0, 2));
    }
    
    // Recommend based on recent activity
    const recentJobs = jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return jobDate >= weekAgo;
    });
    
    if (recentJobs.length > 0) {
      const recentCategories = [...new Set(recentJobs.map(job => job.category))];
      recommendations.push(...recentCategories.slice(0, 2));
    }
    
    // Remove duplicates and limit to 3 recommendations
    return [...new Set(recommendations)].slice(0, 3);
  }
} 