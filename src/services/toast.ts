/**
 * Global Toast Notification Service for ESP
 * Allows any component to dispatch visual toasts that App.tsx catches and renders.
 */

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'reward';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function showToast(message: string, type: ToastType = 'success', title?: string, duration: number = 3500) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ToastMessage>('esp-toast', {
        detail: {
          id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title,
          message,
          type,
          duration,
        },
      })
    );
  }
}
