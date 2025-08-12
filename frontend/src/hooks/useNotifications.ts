import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    return notificationService.add(notification);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    notificationService.remove(id);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    notificationService.clear();
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notificationService.getByType(type);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message: string, duration?: number) => {
    return notificationService.success(title, message, duration);
  }, []);

  const error = useCallback((title: string, message: string, duration?: number) => {
    return notificationService.error(title, message, duration);
  }, []);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    return notificationService.warning(title, message, duration);
  }, []);

  const info = useCallback((title: string, message: string, duration?: number) => {
    return notificationService.info(title, message, duration);
  }, []);

  // Processing specific notifications
  const jobStarted = useCallback((jobId: string) => {
    return notificationService.jobStarted(jobId);
  }, []);

  const jobCompleted = useCallback((jobId: string, filePath?: string) => {
    return notificationService.jobCompleted(jobId, filePath);
  }, []);

  const jobFailed = useCallback((jobId: string, error?: string) => {
    return notificationService.jobFailed(jobId, error);
  }, []);

  const jobCancelled = useCallback((jobId: string) => {
    return notificationService.jobCancelled(jobId);
  }, []);

  // Connection notifications
  const connectionLost = useCallback(() => {
    return notificationService.connectionLost();
  }, []);

  const connectionRestored = useCallback(() => {
    return notificationService.connectionRestored();
  }, []);

  // Validation notifications
  const validationError = useCallback((field: string, message: string) => {
    return notificationService.validationError(field, message);
  }, []);

  // File operations
  const fileSaved = useCallback((filePath: string) => {
    return notificationService.fileSaved(filePath);
  }, []);

  const fileError = useCallback((operation: string, error: string) => {
    return notificationService.fileError(operation, error);
  }, []);

  // AI processing notifications
  const aiProcessingStarted = useCallback(() => {
    return notificationService.aiProcessingStarted();
  }, []);

  const aiProcessingCompleted = useCallback((timeSeconds: number) => {
    return notificationService.aiProcessingCompleted(timeSeconds);
  }, []);

  const aiProcessingFailed = useCallback((error: string) => {
    return notificationService.aiProcessingFailed(error);
  }, []);

  // Sync notifications
  const syncStarted = useCallback(() => {
    return notificationService.syncStarted();
  }, []);

  const syncCompleted = useCallback((filePath: string) => {
    return notificationService.syncCompleted(filePath);
  }, []);

  const syncFailed = useCallback((error: string) => {
    return notificationService.syncFailed(error);
  }, []);

  return {
    // State
    notifications,

    // Actions
    addNotification,
    removeNotification,
    clearNotifications,
    getNotificationsByType,

    // Convenience methods
    success,
    error,
    warning,
    info,

    // Processing specific
    jobStarted,
    jobCompleted,
    jobFailed,
    jobCancelled,

    // Connection
    connectionLost,
    connectionRestored,

    // Validation
    validationError,

    // File operations
    fileSaved,
    fileError,

    // AI processing
    aiProcessingStarted,
    aiProcessingCompleted,
    aiProcessingFailed,

    // Sync
    syncStarted,
    syncCompleted,
    syncFailed
  };
}; 