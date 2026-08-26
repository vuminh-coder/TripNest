import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer } from '@/components/common/Toast/ToastContainer';

const ToastContext = createContext(null);

let toastCount = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, titleOrMsg, descOrOptions = '', maybeOptions = {}) => {
    toastCount += 1;
    const id = `toast_${Date.now()}_${toastCount}`;

    let title = '';
    let message = '';
    let options = {};

    if (typeof descOrOptions === 'object' && descOrOptions !== null) {
      // Called like: toast.success('Message', { duration: 4000 })
      title = titleOrMsg;
      message = '';
      options = descOrOptions;
    } else if (typeof descOrOptions === 'string' && descOrOptions) {
      // Called like: toast.success('Title', 'Detailed Message', { duration: 4000 })
      title = titleOrMsg;
      message = descOrOptions;
      options = maybeOptions || {};
    } else {
      // Called like: toast.success('Message only')
      title = titleOrMsg;
      message = '';
      options = maybeOptions || {};
    }

    const duration = options.duration !== undefined ? options.duration : 4000;

    const newToast = {
      id,
      type: type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title,
      message,
      duration,
      ...options,
    };

    setToasts((prev) => {
      // Keep at most 4 toasts visible to avoid viewport clutter
      const filtered = prev.length >= 4 ? prev.slice(prev.length - 3) : prev;
      return [...filtered, newToast];
    });

    return id;
  }, []);

  const toast = useCallback((type, title, message, options) => {
    return addToast(type, title, message, options);
  }, [addToast]);

  toast.success = useCallback((title, desc, opts) => addToast('success', title, desc, opts), [addToast]);
  toast.error = useCallback((title, desc, opts) => addToast('error', title, desc, opts), [addToast]);
  toast.warning = useCallback((title, desc, opts) => addToast('warning', title, desc, opts), [addToast]);
  toast.info = useCallback((title, desc, opts) => addToast('info', title, desc, opts), [addToast]);
  toast.remove = removeToast;
  toast.clear = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
