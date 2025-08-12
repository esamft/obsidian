import { ProcessingController } from '../controllers/ProcessingController';
import { CategoryController } from '../controllers/CategoryController';
import { notificationService } from '../services/notificationService';
import {
  TextProcessingRequest,
  ProcessingJob,
  ProcessingStatus,
  TextInputForm
} from '../types';

export class ProcessingPresenter {
  private processingController: ProcessingController;
  private categoryController: CategoryController;

  constructor(processingController: ProcessingController, categoryController: CategoryController) {
    this.processingController = processingController;
    this.categoryController = categoryController;
  }

  // Process text with form validation and UI updates
  async processText(formData: TextInputForm): Promise<boolean> {
    try {
      // Validate form data
      const validationErrors = this.validateForm(formData);
      if (validationErrors.length > 0) {
        validationErrors.forEach(error => {
          notificationService.validationError(error.field, error.message);
        });
        return false;
      }

      // Prepare request
      const request: TextProcessingRequest = {
        text: formData.text.trim(),
        category: formData.category,
        priority: formData.priority,
        tags: formData.tags.filter(tag => tag.trim().length > 0)
      };

      // Process text
      const response = await this.processingController.processText(request);

      // Show success notification
      notificationService.success(
        'Texto Enviado',
        `Job ${response.job_id} foi criado e está sendo processado.`
      );

      return true;
    } catch (error) {
      console.error('Error processing text:', error);
      return false;
    }
  }

  // Get jobs for display
  getJobsForDisplay(filters?: {
    status?: ProcessingStatus;
    category?: string;
    search?: string;
  }) {
    const jobs = this.processingController.filterJobs(filters || {});
    return jobs.map(job => this.formatJobForDisplay(job));
  }

  // Get paginated jobs for display
  getPaginatedJobsForDisplay(page: number, limit: number, filters?: any) {
    const result = this.processingController.getPaginatedJobs(page, limit, filters);
    return {
      ...result,
      jobs: result.jobs.map(job => this.formatJobForDisplay(job))
    };
  }

  // Format job for display
  private formatJobForDisplay(job: ProcessingJob) {
    const category = this.categoryController.getCategoryById(job.category);
    const statusColor = this.processingController.getStatusColor(job.status);
    const statusIcon = this.processingController.getStatusIcon(job.status);
    const statusText = this.processingController.getStatusText(job.status);

    return {
      ...job,
      displayData: {
        categoryName: category?.name || job.category,
        categoryIcon: category?.icon || '📄',
        categoryColor: this.categoryController.getCategoryColor(job.category),
        statusColor,
        statusIcon,
        statusText,
        canRetry: this.processingController.canRetry(job),
        canCancel: this.processingController.canCancel(job),
        formattedCreatedAt: this.formatDate(job.created_at),
        formattedProcessedAt: job.processed_at ? this.formatDate(job.processed_at) : null,
        formattedSyncedAt: job.synced_at ? this.formatDate(job.synced_at) : null,
        processingTimeFormatted: job.processing_time_seconds 
          ? `${job.processing_time_seconds.toFixed(1)}s` 
          : null,
        tagsFormatted: job.tags.map(tag => `#${tag}`).join(' '),
        priorityFormatted: this.formatPriority(job.priority)
      }
    };
  }

  // Get current job for display
  getCurrentJobForDisplay() {
    const currentJob = this.processingController.getCurrentJob();
    if (!currentJob) return null;
    return this.formatJobForDisplay(currentJob);
  }

  // Set current job
  setCurrentJob(job: ProcessingJob | undefined) {
    this.processingController.setCurrentJob(job);
  }

  // Cancel job with confirmation
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      await this.processingController.cancelJob(jobId);
      return true;
    } catch (error) {
      console.error('Error cancelling job:', error);
      return false;
    }
  }

  // Retry job
  async retryJob(jobId: string): Promise<boolean> {
    try {
      await this.processingController.retryJob(jobId);
      return true;
    } catch (error) {
      console.error('Error retrying job:', error);
      return false;
    }
  }

  // Get statistics for display
  getStatsForDisplay() {
    const stats = this.processingController.getStats();
    return {
      ...stats,
      displayData: {
        successRate: stats.total_jobs > 0 
          ? ((stats.successful_jobs / stats.total_jobs) * 100).toFixed(1)
          : '0.0',
        averageTimeFormatted: stats.average_processing_time > 0
          ? `${stats.average_processing_time.toFixed(1)}s`
          : 'N/A',
        jobsByCategoryFormatted: Object.entries(stats.jobs_by_category).map(([category, count]) => ({
          category: this.categoryController.getCategoryName(category),
          count,
          percentage: ((count / stats.total_jobs) * 100).toFixed(1)
        })),
        jobsByStatusFormatted: Object.entries(stats.jobs_by_status).map(([status, count]) => ({
          status: this.processingController.getStatusText(status as ProcessingStatus),
          count,
          color: this.processingController.getStatusColor(status as ProcessingStatus)
        }))
      }
    };
  }

  // Validate form data
  private validateForm(formData: TextInputForm): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate text
    if (!formData.text || formData.text.trim().length === 0) {
      errors.push({ field: 'text', message: 'Texto é obrigatório' });
    } else if (formData.text.length > 50000) {
      errors.push({ field: 'text', message: 'Texto muito longo (máximo 50.000 caracteres)' });
    }

    // Validate category
    if (!this.categoryController.isValidCategory(formData.category)) {
      errors.push({ field: 'category', message: 'Categoria inválida' });
    }

    // Validate priority
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(formData.priority)) {
      errors.push({ field: 'priority', message: 'Prioridade inválida' });
    }

    // Validate tags
    if (formData.tags.length > 10) {
      errors.push({ field: 'tags', message: 'Máximo 10 tags permitidas' });
    }

    // Validate individual tags
    formData.tags.forEach((tag, index) => {
      if (tag.trim().length === 0) return; // Skip empty tags
      
      if (tag.length > 50) {
        errors.push({ field: `tags[${index}]`, message: 'Tag muito longa (máximo 50 caracteres)' });
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(tag)) {
        errors.push({ field: `tags[${index}]`, message: 'Tag contém caracteres inválidos' });
      }
    });

    return errors;
  }

  // Format date for display
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} dias atrás`;
    }
  }

  // Format priority for display
  private formatPriority(priority: string): string {
    const priorityMap = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  }

  // Get category suggestions for text
  getCategorySuggestionsForText(text: string) {
    return this.categoryController.getCategorySuggestions(text).map(category => ({
      ...category,
      displayData: {
        color: this.categoryController.getCategoryColor(category.id),
        isSuggested: category.id === this.categoryController.suggestCategory(text)
      }
    }));
  }

  // Get job filters for display
  getJobFiltersForDisplay() {
    const categories = this.categoryController.getCategories();
    const statuses: ProcessingStatus[] = ['queued', 'processing', 'processed', 'syncing', 'synced', 'failed', 'cancelled'];

    return {
      categories: categories.map(category => ({
        value: category.id,
        label: category.name,
        icon: category.icon,
        color: this.categoryController.getCategoryColor(category.id)
      })),
      statuses: statuses.map(status => ({
        value: status,
        label: this.processingController.getStatusText(status),
        icon: this.processingController.getStatusIcon(status),
        color: this.processingController.getStatusColor(status)
      }))
    };
  }
} 