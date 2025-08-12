import { useState, useEffect, useCallback } from 'react';
import { ProcessingPresenter } from '../presenters/ProcessingPresenter';
import { CategoryPresenter } from '../presenters/CategoryPresenter';
import { ProcessingJobModel } from '../models/ProcessingJobModel';
import { CategoryModel } from '../models/CategoryModel';
import { ProcessingController } from '../controllers/ProcessingController';
import { CategoryController } from '../controllers/CategoryController';
import { TextInputForm, ProcessingJob, ProcessingStatus } from '../types';

export const useProcessing = () => {
  // Initialize models
  const [jobModel] = useState(() => new ProcessingJobModel());
  const [categoryModel] = useState(() => new CategoryModel());

  // Initialize controllers
  const [processingController] = useState(() => new ProcessingController(jobModel, categoryModel));
  const [categoryController] = useState(() => new CategoryController(categoryModel));

  // Initialize presenters
  const [processingPresenter] = useState(() => new ProcessingPresenter(processingController, categoryController));
  const [categoryPresenter] = useState(() => new CategoryPresenter(categoryController));

  // State
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<{
    status?: ProcessingStatus;
    category?: string;
    search?: string;
  }>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Load jobs
  const loadJobs = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await processingController.getJobs(params);
      setJobs(response.jobs);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: Math.ceil(response.total / (params?.limit || prev.limit))
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jobs');
    } finally {
      setLoading(false);
    }
  }, [processingController]);

  // Process text
  const processText = useCallback(async (formData: TextInputForm): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const success = await processingPresenter.processText(formData);
      
      if (success) {
        // Reload jobs to show the new one
        await loadJobs();
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar texto');
      return false;
    } finally {
      setLoading(false);
    }
  }, [processingPresenter, loadJobs]);

  // Cancel job
  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const success = await processingPresenter.cancelJob(jobId);
      if (success) {
        // Reload jobs to update status
        await loadJobs();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar job');
      return false;
    }
  }, [processingPresenter, loadJobs]);

  // Retry job
  const retryJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const success = await processingPresenter.retryJob(jobId);
      if (success) {
        // Reload jobs to update status
        await loadJobs();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reprocessar job');
      return false;
    }
  }, [processingPresenter, loadJobs]);

  // Get job status
  const getJobStatus = useCallback(async (jobId: string) => {
    try {
      return await processingController.getJobStatus(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao obter status do job');
      return null;
    }
  }, [processingController]);

  // Filter jobs
  const filterJobs = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Get filtered jobs for display
  const getFilteredJobs = useCallback(() => {
    return processingPresenter.getJobsForDisplay(filters);
  }, [processingPresenter, filters]);

  // Get paginated jobs for display
  const getPaginatedJobs = useCallback(() => {
    return processingPresenter.getPaginatedJobsForDisplay(
      pagination.page,
      pagination.limit,
      filters
    );
  }, [processingPresenter, pagination.page, pagination.limit, filters]);

  // Set current job
  const setCurrentJobForDisplay = useCallback((job: ProcessingJob | null) => {
    setCurrentJob(job);
    if (job) {
      processingPresenter.setCurrentJob(job);
    }
  }, [processingPresenter]);

  // Get current job for display
  const getCurrentJobForDisplay = useCallback(() => {
    return processingPresenter.getCurrentJobForDisplay();
  }, [processingPresenter]);

  // Get stats for display
  const getStatsForDisplay = useCallback(() => {
    return processingPresenter.getStatsForDisplay();
  }, [processingPresenter]);

  // Get job filters for display
  const getJobFiltersForDisplay = useCallback(() => {
    return processingPresenter.getJobFiltersForDisplay();
  }, [processingPresenter]);

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Update stats when jobs change
  useEffect(() => {
    setStats(processingPresenter.getStatsForDisplay());
  }, [jobs, processingPresenter]);

  return {
    // State
    jobs,
    currentJob,
    loading,
    error,
    stats,
    filters,
    pagination,

    // Actions
    processText,
    cancelJob,
    retryJob,
    getJobStatus,
    loadJobs,
    filterJobs,
    setCurrentJobForDisplay,
    updatePagination,
    clearError,

    // Display data
    getFilteredJobs,
    getPaginatedJobs,
    getCurrentJobForDisplay,
    getStatsForDisplay,
    getJobFiltersForDisplay,

    // Utility
    canRetry: (job: ProcessingJob) => processingController.canRetry(job),
    canCancel: (job: ProcessingJob) => processingController.canCancel(job),
    getStatusColor: (status: ProcessingStatus) => processingController.getStatusColor(status),
    getStatusIcon: (status: ProcessingStatus) => processingController.getStatusIcon(status),
    getStatusText: (status: ProcessingStatus) => processingController.getStatusText(status)
  };
}; 