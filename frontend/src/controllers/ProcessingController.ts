import { ProcessingJobModel } from '../models/ProcessingJobModel';
import { CategoryModel } from '../models/CategoryModel';
import { apiService } from '../services/api';
import { notificationService } from '../services/notificationService';
import {
  TextProcessingRequest,
  TextProcessingResponse,
  JobStatusResponse,
  JobsListResponse,
  ProcessingJob,
  ProcessingStatus
} from '../types';

export class ProcessingController {
  private jobModel: ProcessingJobModel;
  private categoryModel: CategoryModel;
  private isPolling: boolean = false;
  private pollingJobs: Set<string> = new Set();

  constructor(jobModel: ProcessingJobModel, categoryModel: CategoryModel) {
    this.jobModel = jobModel;
    this.categoryModel = categoryModel;
  }

  // Process text and create job
  async processText(request: TextProcessingRequest): Promise<TextProcessingResponse> {
    try {
      // Validate request
      this.validateProcessingRequest(request);

      // Auto-suggest category if not provided
      if (!request.category || request.category === 'inbox') {
        request.category = this.categoryModel.suggestCategory(request.text);
      }

      // Call API
      const response = await apiService.processText(request);

      // Add job to model
      const job: ProcessingJob = {
        id: 0, // Will be set by backend
        job_id: response.job_id,
        user_id: 'anonymous', // Will be set by backend
        category: request.category,
        priority: request.priority,
        tags: request.tags,
        status: response.status,
        created_at: new Date().toISOString(),
        retry_count: 0
      };

      this.jobModel.addJob(job);

      // Start polling for status updates
      this.startPollingJob(response.job_id);

      // Show notification
      notificationService.jobStarted(response.job_id);

      return response;
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro no Processamento', apiError.error);
      throw apiError;
    }
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const status = await apiService.getJobStatus(jobId);
      
      // Update job in model
      this.jobModel.updateJob(jobId, {
        status: status.status,
        processed_at: status.processed_at,
        synced_at: status.synced_at,
        obsidian_file_path: status.obsidian_file_path,
        error_message: status.error_message,
        word_count: status.word_count,
        char_count: status.char_count,
        processing_time_seconds: status.processing_time_seconds
      });

      return status;
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro ao Obter Status', apiError.error);
      throw apiError;
    }
  }

  // Get jobs list
  async getJobs(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<JobsListResponse> {
    try {
      const response = await apiService.getJobs(params);
      
      // Update jobs in model
      this.jobModel.setJobs(response.jobs);
      
      return response;
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro ao Carregar Jobs', apiError.error);
      throw apiError;
    }
  }

  // Cancel job
  async cancelJob(jobId: string): Promise<void> {
    try {
      const job = this.jobModel.getJobById(jobId);
      if (!job) {
        throw new Error('Job não encontrado');
      }

      if (!this.jobModel.canCancel(job)) {
        throw new Error('Job não pode ser cancelado neste status');
      }

      await apiService.cancelJob(jobId);
      
      // Update job status
      this.jobModel.updateJob(jobId, { status: 'cancelled' });
      
      // Stop polling
      this.stopPollingJob(jobId);
      
      notificationService.jobCancelled(jobId);
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro ao Cancelar Job', apiError.error);
      throw apiError;
    }
  }

  // Retry job
  async retryJob(jobId: string): Promise<void> {
    try {
      const job = this.jobModel.getJobById(jobId);
      if (!job) {
        throw new Error('Job não encontrado');
      }

      if (!this.jobModel.canRetry(job)) {
        throw new Error('Job não pode ser reprocessado');
      }

      await apiService.retryJob(jobId);
      
      // Update job status
      this.jobModel.updateJob(jobId, { 
        status: 'queued',
        error_message: undefined,
        retry_count: job.retry_count + 1
      });
      
      // Start polling again
      this.startPollingJob(jobId);
      
      notificationService.info('Job Reprocessado', `Job ${jobId} foi enviado para reprocessamento.`);
    } catch (error) {
      const apiError = apiService.handleError(error);
      notificationService.error('Erro ao Reprocessar Job', apiError.error);
      throw apiError;
    }
  }

  // Poll job status
  private async startPollingJob(jobId: string): Promise<void> {
    if (this.pollingJobs.has(jobId)) {
      return; // Already polling
    }

    this.pollingJobs.add(jobId);

    try {
      const status = await apiService.pollJobStatus(jobId);
      
      // Update job in model
      this.jobModel.updateJob(jobId, {
        status: status.status,
        processed_at: status.processed_at,
        synced_at: status.synced_at,
        obsidian_file_path: status.obsidian_file_path,
        error_message: status.error_message,
        word_count: status.word_count,
        char_count: status.char_count,
        processing_time_seconds: status.processing_time_seconds
      });

      // Show appropriate notification
      if (status.status === 'synced') {
        notificationService.jobCompleted(jobId, status.obsidian_file_path);
      } else if (status.status === 'failed') {
        notificationService.jobFailed(jobId, status.error_message);
      }
    } catch (error) {
      notificationService.error('Erro no Polling', `Erro ao monitorar job ${jobId}`);
    } finally {
      this.pollingJobs.delete(jobId);
    }
  }

  // Stop polling job
  private stopPollingJob(jobId: string): void {
    this.pollingJobs.delete(jobId);
  }

  // Validate processing request
  private validateProcessingRequest(request: TextProcessingRequest): void {
    if (!request.text || request.text.trim().length === 0) {
      throw new Error('Texto não pode estar vazio');
    }

    if (request.text.length > 50000) {
      throw new Error('Texto muito longo (máximo 50.000 caracteres)');
    }

    if (!this.categoryModel.isValidCategory(request.category)) {
      throw new Error('Categoria inválida');
    }

    if (request.tags.length > 10) {
      throw new Error('Máximo 10 tags permitidas');
    }

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(request.priority)) {
      throw new Error('Prioridade inválida');
    }
  }

  // Get job statistics
  getStats() {
    return this.jobModel.getStats();
  }

  // Filter jobs
  filterJobs(filters: {
    status?: ProcessingStatus;
    category?: string;
    search?: string;
  }) {
    return this.jobModel.filterJobs(filters);
  }

  // Get paginated jobs
  getPaginatedJobs(page: number, limit: number, filters?: any) {
    return this.jobModel.getPaginatedJobs(page, limit, filters);
  }

  // Get current job
  getCurrentJob() {
    return this.jobModel.getCurrentJob();
  }

  // Set current job
  setCurrentJob(job: ProcessingJob | undefined) {
    this.jobModel.setCurrentJob(job);
  }

  // Check if job can be retried
  canRetry(job: ProcessingJob): boolean {
    return this.jobModel.canRetry(job);
  }

  // Check if job can be cancelled
  canCancel(job: ProcessingJob): boolean {
    return this.jobModel.canCancel(job);
  }

  // Get status color
  getStatusColor(status: ProcessingStatus): string {
    return this.jobModel.getStatusColor(status);
  }

  // Get status icon
  getStatusIcon(status: ProcessingStatus): string {
    return this.jobModel.getStatusIcon(status);
  }

  // Get status text
  getStatusText(status: ProcessingStatus): string {
    return this.jobModel.getStatusText(status);
  }
} 