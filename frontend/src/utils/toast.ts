// Simple toast notification utility
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];
  private idCounter = 0;

  show(message: string, type: ToastType = 'info', duration: number = 3000) {
    const id = `toast-${this.idCounter++}`;
    const toast: Toast = { id, message, type };
    
    this.toasts = [...this.toasts, toast];
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  getToasts(): Toast[] {
    return this.toasts;
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

export const toastManager = new ToastManager();

// Convenience functions
export const toast = {
  success: (message: string, duration?: number) => toastManager.show(message, 'success', duration),
  error: (message: string, duration?: number) => toastManager.show(message, 'error', duration),
  info: (message: string, duration?: number) => toastManager.show(message, 'info', duration),
};



