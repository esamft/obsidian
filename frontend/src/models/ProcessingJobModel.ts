import { ProcessingJob, ProcessingStatus } from '../types';

export class ProcessingJobModel {
  private jobs: ProcessingJob[] = [];
  private currentJob?: ProcessingJob;

  // Getters
  getJobs(): ProcessingJob[] {
    return this.jobs;
  }

  getCurrentJob(): ProcessingJob | undefined {
    return this.currentJob;
  }

  getJobById(jobId: string): ProcessingJob | undefined {
    return this.jobs.find(job => job.job_id === jobId);
  }

  getJobsByStatus(status: ProcessingStatus): ProcessingJob[] {
    return this.jobs.filter(job => job.status === status);
  }

  getJobsByCategory(category: string): ProcessingJob[] {
    return this.jobs.filter(job => job.category === category);
  }

  getStats() {
    const total = this.jobs.length;
    const successful = this.jobs.filter(job => job.status === 'synced').length;
    const failed = this.jobs.filter(job => job.status === 'failed').length;
    const averageTime = this.jobs
      .filter(job => job.processing_time_seconds)
      .reduce((acc, job) => acc + (job.processing_time_seconds || 0), 0) / 
      this.jobs.filter(job => job.processing_time_seconds).length || 0;

    const jobsByCategory = this.jobs.reduce((acc, job) => {
      acc[job.category] = (acc[job.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobsByStatus = this.jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<ProcessingStatus, number>);

    return {
      total_jobs: total,
      successful_jobs: successful,
      failed_jobs: failed,
      average_processing_time: averageTime,
      jobs_by_category: jobsByCategory,
      jobs_by_status: jobsByStatus
    };
  }

  // Setters
  setJobs(jobs: ProcessingJob[]): void {
    this.jobs = jobs;
  }

  addJob(job: ProcessingJob): void {
    this.jobs.unshift(job); // Adiciona no início
  }

  updateJob(jobId: string, updates: Partial<ProcessingJob>): void {
    const index = this.jobs.findIndex(job => job.job_id === jobId);
    if (index !== -1) {
      this.jobs[index] = { ...this.jobs[index], ...updates };
    }
  }

  setCurrentJob(job: ProcessingJob | undefined): void {
    this.currentJob = job;
  }

  // Business Logic
  canRetry(job: ProcessingJob): boolean {
    return job.status === 'failed' && job.retry_count < 3;
  }

  canCancel(job: ProcessingJob): boolean {
    return ['queued', 'processing'].includes(job.status);
  }

  getStatusColor(status: ProcessingStatus): string {
    const colors = {
      queued: '#FFA726',
      processing: '#42A5F5',
      processed: '#66BB6A',
      syncing: '#AB47BC',
      synced: '#26A69A',
      failed: '#EF5350',
      cancelled: '#9E9E9E'
    };
    return colors[status];
  }

  getStatusIcon(status: ProcessingStatus): string {
    const icons = {
      queued: '⏳',
      processing: '🔄',
      processed: '✅',
      syncing: '📤',
      synced: '🎉',
      failed: '❌',
      cancelled: '🚫'
    };
    return icons[status];
  }

  getStatusText(status: ProcessingStatus): string {
    const texts = {
      queued: 'Na fila',
      processing: 'Processando',
      processed: 'Processado',
      syncing: 'Sincronizando',
      synced: 'Sincronizado',
      failed: 'Falhou',
      cancelled: 'Cancelado'
    };
    return texts[status];
  }

  // Filtering and Sorting
  filterJobs(filters: {
    status?: ProcessingStatus;
    category?: string;
    search?: string;
  }): ProcessingJob[] {
    return this.jobs.filter(job => {
      if (filters.status && job.status !== filters.status) return false;
      if (filters.category && job.category !== filters.category) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          job.job_id.toLowerCase().includes(searchLower) ||
          job.category.toLowerCase().includes(searchLower) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }

  sortJobs(jobs: ProcessingJob[], sortBy: 'created_at' | 'status' | 'category' = 'created_at'): ProcessingJob[] {
    return [...jobs].sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  }

  // Pagination
  getPaginatedJobs(page: number, limit: number, filters?: any): {
    jobs: ProcessingJob[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const filteredJobs = filters ? this.filterJobs(filters) : this.jobs;
    const sortedJobs = this.sortJobs(filteredJobs);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = sortedJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      page,
      totalPages: Math.ceil(filteredJobs.length / limit)
    };
  }
} 