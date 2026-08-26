import React from 'react';
import { createPortal } from 'react-dom';
import { ToastItem } from './ToastItem';
import './Toast.css';

export const ToastContainer = ({ toasts = [], onRemove }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="tripnest-toast-container"
      aria-label="Thông báo hệ thống"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>,
    document.body
  );
};
