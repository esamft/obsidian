import { CategoryController } from '../controllers/CategoryController';
import { Category } from '../types';

export class CategoryPresenter {
  private categoryController: CategoryController;

  constructor(categoryController: CategoryController) {
    this.categoryController = categoryController;
  }

  // Get categories for display
  getCategoriesForDisplay() {
    const categories = this.categoryController.getSortedCategories();
    return categories.map(category => this.formatCategoryForDisplay(category));
  }

  // Get selected category for display
  getSelectedCategoryForDisplay() {
    const selectedId = this.categoryController.getSelectedCategory();
    const category = this.categoryController.getCategoryById(selectedId);
    
    if (!category) {
      return {
        id: 'inbox',
        name: '📥 Inbox',
        description: 'Categoria padrão',
        folder: '📥 Inbox',
        icon: '📥',
        displayData: {
          color: this.categoryController.getCategoryColor('inbox'),
          isSelected: true,
          isDefault: true
        }
      };
    }

    return this.formatCategoryForDisplay(category, true);
  }

  // Format category for display
  private formatCategoryForDisplay(category: Category, isSelected: boolean = false) {
    return {
      ...category,
      displayData: {
        color: this.categoryController.getCategoryColor(category.id),
        isSelected,
        isDefault: this.categoryController.isDefaultCategory(category.id),
        priority: this.categoryController.getCategoryPriority(category.id)
      }
    };
  }

  // Set selected category
  setSelectedCategory(categoryId: string): boolean {
    try {
      this.categoryController.setSelectedCategory(categoryId);
      return true;
    } catch (error) {
      console.error('Error setting selected category:', error);
      return false;
    }
  }

  // Get category by ID for display
  getCategoryByIdForDisplay(id: string) {
    const category = this.categoryController.getCategoryById(id);
    if (!category) return null;
    return this.formatCategoryForDisplay(category);
  }

  // Get category suggestions for text
  getCategorySuggestionsForText(text: string) {
    return this.categoryController.getCategorySuggestions(text).map(category => ({
      ...category,
      displayData: {
        color: this.categoryController.getCategoryColor(category.id),
        isSuggested: category.id === this.categoryController.suggestCategory(text),
        isDefault: this.categoryController.isDefaultCategory(category.id)
      }
    }));
  }

  // Get category statistics for display
  getCategoryStatsForDisplay(jobs: any[]) {
    const stats = this.categoryController.getCategoryStats(jobs);
    const categories = this.categoryController.getCategories();

    return categories.map(category => {
      const count = stats[category.id] || 0;
      const percentage = jobs.length > 0 ? ((count / jobs.length) * 100) : 0;
      const performance = this.categoryController.getCategoryPerformance(jobs, category.id);
      const trend = this.categoryController.getCategoryTrend(jobs, category.id);

      return {
        ...category,
        displayData: {
          color: this.categoryController.getCategoryColor(category.id),
          count,
          percentage: percentage.toFixed(1),
          performance: {
            ...performance,
            successRateFormatted: `${performance.successRate.toFixed(1)}%`,
            averageTimeFormatted: performance.averageProcessingTime > 0
              ? `${performance.averageProcessingTime.toFixed(1)}s`
              : 'N/A'
          },
          trend: {
            value: trend,
            icon: this.getTrendIcon(trend),
            color: this.getTrendColor(trend)
          },
          isDefault: this.categoryController.isDefaultCategory(category.id)
        }
      };
    });
  }

  // Get category recommendations for display
  getCategoryRecommendationsForDisplay(jobs: any[]) {
    const recommendations = this.categoryController.getCategoryRecommendations(jobs);
    return recommendations.map(categoryId => {
      const category = this.categoryController.getCategoryById(categoryId);
      if (!category) return null;

      return {
        ...category,
        displayData: {
          color: this.categoryController.getCategoryColor(category.id),
          isRecommended: true,
          isDefault: this.categoryController.isDefaultCategory(category.id)
        }
      };
    }).filter(Boolean);
  }

  // Get category performance for display
  getCategoryPerformanceForDisplay(jobs: any[], categoryId: string) {
    const performance = this.categoryController.getCategoryPerformance(jobs, categoryId);
    const category = this.categoryController.getCategoryById(categoryId);

    return {
      ...performance,
      category: category ? this.formatCategoryForDisplay(category) : null,
      displayData: {
        successRateFormatted: `${performance.successRate.toFixed(1)}%`,
        averageTimeFormatted: performance.averageProcessingTime > 0
          ? `${performance.averageProcessingTime.toFixed(1)}s`
          : 'N/A',
        totalFormatted: performance.total.toString(),
        successfulFormatted: performance.successful.toString(),
        failedFormatted: performance.failed.toString()
      }
    };
  }

  // Get category usage percentage for display
  getCategoryUsagePercentageForDisplay(jobs: any[], categoryId: string) {
    const percentage = this.categoryController.getCategoryUsagePercentage(jobs, categoryId);
    const category = this.categoryController.getCategoryById(categoryId);

    return {
      category: category ? this.formatCategoryForDisplay(category) : null,
      percentage: percentage.toFixed(1),
      displayData: {
        percentageFormatted: `${percentage.toFixed(1)}%`,
        color: this.categoryController.getCategoryColor(categoryId),
        intensity: this.getUsageIntensity(percentage)
      }
    };
  }

  // Get category trend for display
  getCategoryTrendForDisplay(jobs: any[], categoryId: string, days: number = 7) {
    const trend = this.categoryController.getCategoryTrend(jobs, categoryId, days);
    const category = this.categoryController.getCategoryById(categoryId);

    return {
      category: category ? this.formatCategoryForDisplay(category) : null,
      trend,
      days,
      displayData: {
        trendText: this.getTrendText(trend),
        trendIcon: this.getTrendIcon(trend),
        trendColor: this.getTrendColor(trend)
      }
    };
  }

  // Get most used category for display
  getMostUsedCategoryForDisplay(jobs: any[]) {
    const mostUsedId = this.categoryController.getMostUsedCategory(jobs);
    const category = this.categoryController.getCategoryById(mostUsedId);
    
    if (!category) return null;

    const usagePercentage = this.categoryController.getCategoryUsagePercentage(jobs, mostUsedId);

    return {
      ...category,
      displayData: {
        color: this.categoryController.getCategoryColor(category.id),
        usagePercentage: usagePercentage.toFixed(1),
        usagePercentageFormatted: `${usagePercentage.toFixed(1)}%`,
        isMostUsed: true,
        isDefault: this.categoryController.isDefaultCategory(category.id)
      }
    };
  }

  // Validate category ID
  isValidCategory(categoryId: string): boolean {
    return this.categoryController.isValidCategory(categoryId);
  }

  // Get trend icon
  private getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
    const icons = {
      increasing: '📈',
      decreasing: '📉',
      stable: '➡️'
    };
    return icons[trend];
  }

  // Get trend color
  private getTrendColor(trend: 'increasing' | 'decreasing' | 'stable'): string {
    const colors = {
      increasing: '#4CAF50',
      decreasing: '#F44336',
      stable: '#9E9E9E'
    };
    return colors[trend];
  }

  // Get trend text
  private getTrendText(trend: 'increasing' | 'decreasing' | 'stable'): string {
    const texts = {
      increasing: 'Crescendo',
      decreasing: 'Diminuindo',
      stable: 'Estável'
    };
    return texts[trend];
  }

  // Get usage intensity
  private getUsageIntensity(percentage: number): 'low' | 'medium' | 'high' {
    if (percentage < 10) return 'low';
    if (percentage < 30) return 'medium';
    return 'high';
  }

  // Get category color
  getCategoryColor(categoryId: string): string {
    return this.categoryController.getCategoryColor(categoryId);
  }

  // Get category priority
  getCategoryPriority(categoryId: string): number {
    return this.categoryController.getCategoryPriority(categoryId);
  }

  // Check if category is default
  isDefaultCategory(categoryId: string): boolean {
    return this.categoryController.isDefaultCategory(categoryId);
  }

  // Initialize categories
  async initializeCategories(): Promise<Category[]> {
    try {
      return await this.categoryController.loadCategories();
    } catch (error) {
      console.error('Error initializing categories:', error);
      this.categoryController.initialize();
      return this.categoryController.getCategories();
    }
  }
} 