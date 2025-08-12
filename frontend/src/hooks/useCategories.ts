import { useState, useEffect, useCallback } from 'react';
import { CategoryPresenter } from '../presenters/CategoryPresenter';
import { CategoryModel } from '../models/CategoryModel';
import { CategoryController } from '../controllers/CategoryController';
import { Category } from '../types';

export const useCategories = () => {
  // Initialize model
  const [categoryModel] = useState(() => new CategoryModel());

  // Initialize controller
  const [categoryController] = useState(() => new CategoryController(categoryModel));

  // Initialize presenter
  const [categoryPresenter] = useState(() => new CategoryPresenter(categoryController));

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('inbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedCategories = await categoryPresenter.initializeCategories();
      setCategories(loadedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [categoryPresenter]);

  // Set selected category
  const selectCategory = useCallback((categoryId: string) => {
    const success = categoryPresenter.setSelectedCategory(categoryId);
    if (success) {
      setSelectedCategory(categoryId);
    }
    return success;
  }, [categoryPresenter]);

  // Get categories for display
  const getCategoriesForDisplay = useCallback(() => {
    return categoryPresenter.getCategoriesForDisplay();
  }, [categoryPresenter]);

  // Get selected category for display
  const getSelectedCategoryForDisplay = useCallback(() => {
    return categoryPresenter.getSelectedCategoryForDisplay();
  }, [categoryPresenter]);

  // Get category by ID for display
  const getCategoryByIdForDisplay = useCallback((id: string) => {
    return categoryPresenter.getCategoryByIdForDisplay(id);
  }, [categoryPresenter]);

  // Get category suggestions for text
  const getCategorySuggestionsForText = useCallback((text: string) => {
    return categoryPresenter.getCategorySuggestionsForText(text);
  }, [categoryPresenter]);

  // Get category statistics for display
  const getCategoryStatsForDisplay = useCallback((jobs: any[]) => {
    return categoryPresenter.getCategoryStatsForDisplay(jobs);
  }, [categoryPresenter]);

  // Get category recommendations for display
  const getCategoryRecommendationsForDisplay = useCallback((jobs: any[]) => {
    return categoryPresenter.getCategoryRecommendationsForDisplay(jobs);
  }, [categoryPresenter]);

  // Get category performance for display
  const getCategoryPerformanceForDisplay = useCallback((jobs: any[], categoryId: string) => {
    return categoryPresenter.getCategoryPerformanceForDisplay(jobs, categoryId);
  }, [categoryPresenter]);

  // Get category usage percentage for display
  const getCategoryUsagePercentageForDisplay = useCallback((jobs: any[], categoryId: string) => {
    return categoryPresenter.getCategoryUsagePercentageForDisplay(jobs, categoryId);
  }, [categoryPresenter]);

  // Get category trend for display
  const getCategoryTrendForDisplay = useCallback((jobs: any[], categoryId: string, days: number = 7) => {
    return categoryPresenter.getCategoryTrendForDisplay(jobs, categoryId, days);
  }, [categoryPresenter]);

  // Get most used category for display
  const getMostUsedCategoryForDisplay = useCallback((jobs: any[]) => {
    return categoryPresenter.getMostUsedCategoryForDisplay(jobs);
  }, [categoryPresenter]);

  // Validate category
  const isValidCategory = useCallback((categoryId: string) => {
    return categoryPresenter.isValidCategory(categoryId);
  }, [categoryPresenter]);

  // Get category color
  const getCategoryColor = useCallback((categoryId: string) => {
    return categoryPresenter.getCategoryColor(categoryId);
  }, [categoryPresenter]);

  // Get category priority
  const getCategoryPriority = useCallback((categoryId: string) => {
    return categoryPresenter.getCategoryPriority(categoryId);
  }, [categoryPresenter]);

  // Check if category is default
  const isDefaultCategory = useCallback((categoryId: string) => {
    return categoryPresenter.isDefaultCategory(categoryId);
  }, [categoryPresenter]);

  // Suggest category based on text content
  const suggestCategory = useCallback((text: string) => {
    return categoryController.suggestCategory(text);
  }, [categoryController]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    // State
    categories,
    selectedCategory,
    loading,
    error,

    // Actions
    loadCategories,
    selectCategory,
    clearError,

    // Display data
    getCategoriesForDisplay,
    getSelectedCategoryForDisplay,
    getCategoryByIdForDisplay,
    getCategorySuggestionsForText,
    getCategoryStatsForDisplay,
    getCategoryRecommendationsForDisplay,
    getCategoryPerformanceForDisplay,
    getCategoryUsagePercentageForDisplay,
    getCategoryTrendForDisplay,
    getMostUsedCategoryForDisplay,

    // Utility
    isValidCategory,
    getCategoryColor,
    getCategoryPriority,
    isDefaultCategory,
    suggestCategory
  };
}; 