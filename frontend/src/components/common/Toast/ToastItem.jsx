import React, { useEffect, useState, useRef } from 'react';
import {
  TbCircleCheck,
  TbAlertCircle,
  TbAlertTriangle,
  TbInfoCircle,
  TbX,
} from 'react-icons/tb';

const ICONS = {
  success: TbCircleCheck,
  error: TbAlertCircle,
  warning: TbAlertTriangle,
  info: TbInfoCircle,
};

export const ToastItem = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const IconComponent = ICONS[toast.type] || TbInfoCircle;

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 250); // Matches CSS exit animation duration
  };

  useEffect(() => {
    if (toast.duration <= 0) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, remainingTimeRef.current);

      const updateRateMs = 30;
      const totalDuration = toast.duration;

      progressIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = Date.now() - startTimeRef.current;
          const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
          const percent = (currentRemaining / totalDuration) * 100;
          setProgress(percent);
          if (percent <= 0) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, updateRateMs);
    };

    if (!isPaused) {
      startTimer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [toast.id, toast.duration, isPaused]);

  const handleMouseEnter = () => {
    if (toast.duration <= 0) return;
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    if (toast.duration <= 0) return;
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  return (
    <div
      className={`tripnest-toast-item toast-${toast.type} ${isExiting ? 'toast-exiting' : 'toast-entering'}`}
      role="alert"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="toast-icon-badge">
        <IconComponent className="toast-icon-svg" />
      </div>

      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-description">{toast.message}</div>}
      </div>

      <button
        type="button"
        className="toast-close-btn"
        onClick={handleDismiss}
        title="Đóng thông báo"
        aria-label="Đóng thông báo"
      >
        <TbX />
      </button>

      {toast.duration > 0 && (
        <div className="toast-progress-track">
          <div
            className="toast-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
