import React, { useState, useEffect } from 'react';
import { toastManager, Toast } from '../utils/toast';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => toastManager.remove(toast.id)}
        >
          <div className="toast-content">
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => toastManager.remove(toast.id)}>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;




