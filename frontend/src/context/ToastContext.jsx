import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastContainer } from '@/components/common/Toast/ToastContainer';

const ToastContext = createContext(null);

let toastCount = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, titleOrMsg, descOrOptions = '', maybeOptions = {}) => {
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

    // Deduplication Key: Prevents double toasts in React StrictMode & rapid re-renders
    const dedupKey = `${type || 'info'}_${title}_${message}`;
    const now = Date.now();
    const lastEmitted = recentToastsRef.current.get(dedupKey);

    if (lastEmitted && now - lastEmitted < 800) {
      return null;
    }
    recentToastsRef.current.set(dedupKey, now);

    // Periodic cleanup of stale dedup entries
    if (recentToastsRef.current.size > 40) {
      for (const [k, ts] of recentToastsRef.current.entries()) {
        if (now - ts > 3000) recentToastsRef.current.delete(k);
      }
    }

    toastCount += 1;
    const id = `toast_${Date.now()}_${toastCount}`;
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
      // Check if identical toast is already active in current visible list
      const isAlreadyVisible = prev.some(
        (t) => t.type === newToast.type && t.title === newToast.title && t.message === newToast.message
      );
      if (isAlreadyVisible) {
        return prev;
      }

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
