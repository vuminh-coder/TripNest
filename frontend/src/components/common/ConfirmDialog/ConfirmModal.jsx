import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TbAlertTriangle, TbTrash, TbCheck, TbInfoCircle, TbX } from 'react-icons/tb';
import './ConfirmModal.css';

export const ConfirmModal = ({
  isOpen,
  title = 'Xác nhận thao tác',
  message = '',
  html = null,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || typeof document === 'undefined') return null;

  const renderIcon = () => {
    if (type === 'danger') {
      return (
        <div className="tripnest-confirm-icon-badge badge-danger">
          <TbTrash />
        </div>
      );
    }
    if (type === 'warning') {
      return (
        <div className="tripnest-confirm-icon-badge badge-warning">
          <TbAlertTriangle />
        </div>
      );
    }
    return (
      <div className="tripnest-confirm-icon-badge badge-primary">
        <TbInfoCircle />
      </div>
    );
  };

  return createPortal(
    <div className="tripnest-confirm-backdrop" onClick={onCancel}>
      <div
        className="tripnest-confirm-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="tripnest-confirm-close-btn"
          onClick={onCancel}
          title="Đóng"
          aria-label="Đóng"
        >
          <TbX />
        </button>

        {renderIcon()}

        <h3 className="tripnest-confirm-title">{title}</h3>

        {html ? (
          <div
            className="tripnest-confirm-message"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="tripnest-confirm-message">{message}</p>
        )}

        <div className="tripnest-confirm-actions">
          <button
            type="button"
            className="tripnest-confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`tripnest-confirm-btn-submit btn-${type}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
