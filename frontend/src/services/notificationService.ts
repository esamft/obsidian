import { Notification } from '../types';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Add notification
  add(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  // Remove notification
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getAll(): Notification[] {
    return [...this.notifications];
  }

  // Get notifications by type
  getByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Subscribe to notifications changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Convenience methods
  success(title: string, message: string, duration?: number): string {
    return this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.add({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.add({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.add({ type: 'info', title, message, duration });
  }

  // Processing specific notifications
  jobStarted(jobId: string): string {
    return this.info(
      'Processamento Iniciado',
      `Job ${jobId} foi adicionado à fila de processamento.`,
      3000
    );
  }

  jobCompleted(jobId: string, filePath?: string): string {
    return this.success(
      'Processamento Concluído',
      filePath 
        ? `Job ${jobId} foi processado e sincronizado com Obsidian.`
        : `Job ${jobId} foi processado com sucesso.`,
      5000
    );
  }

  jobFailed(jobId: string, error?: string): string {
    return this.error(
      'Processamento Falhou',
      error 
        ? `Job ${jobId} falhou: ${error}`
        : `Job ${jobId} falhou durante o processamento.`,
      8000
    );
  }

  jobCancelled(jobId: string): string {
    return this.warning(
      'Processamento Cancelado',
      `Job ${jobId} foi cancelado.`,
      3000
    );
  }

  // Connection notifications
  connectionLost(): string {
    return this.error(
      'Conexão Perdida',
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      0 // Don't auto-remove
    );
  }

  connectionRestored(): string {
    return this.success(
      'Conexão Restaurada',
      'Conexão com o servidor foi restaurada.',
      3000
    );
  }

  // Validation notifications
  validationError(field: string, message: string): string {
    return this.error(
      'Erro de Validação',
      `${field}: ${message}`,
      5000
    );
  }

  // File operations
  fileSaved(filePath: string): string {
    return this.success(
      'Arquivo Salvo',
      `Nota salva em: ${filePath}`,
      4000
    );
  }

  fileError(operation: string, error: string): string {
    return this.error(
      'Erro de Arquivo',
      `${operation}: ${error}`,
      6000
    );
  }

  // AI processing notifications
  aiProcessingStarted(): string {
    return this.info(
      'IA Processando',
      'Texto está sendo processado pela IA...',
      2000
    );
  }

  aiProcessingCompleted(timeSeconds: number): string {
    return this.success(
      'IA Concluída',
      `Processamento pela IA concluído em ${timeSeconds.toFixed(1)}s.`,
      4000
    );
  }

  aiProcessingFailed(error: string): string {
    return this.error(
      'IA Falhou',
      `Erro no processamento pela IA: ${error}`,
      6000
    );
  }

  // Sync notifications
  syncStarted(): string {
    return this.info(
      'Sincronizando',
      'Sincronizando com Obsidian...',
      2000
    );
  }

  syncCompleted(filePath: string): string {
    return this.success(
      'Sincronizado',
      `Nota sincronizada: ${filePath}`,
      4000
    );
  }

  syncFailed(error: string): string {
    return this.error(
      'Sincronização Falhou',
      `Erro na sincronização: ${error}`,
      6000
    );
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService; 