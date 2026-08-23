import React, { useState } from 'react';
import { TbCheck, TbEye, TbEyeOff, TbLock, TbX, TbShieldCheck, TbAlertCircle } from 'react-icons/tb';
import { apiService } from '../services/api';
import Swal from 'sweetalert2';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!newPassword || !confirmation) {
      setError('Vui lòng điền đầy đủ mật khẩu mới và xác nhận mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (currentPassword && currentPassword === newPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmation,
      });

      Swal.fire({
        icon: 'success',
        title: '🎉 Đổi mật khẩu thành công!',
        text: 'Mật khẩu của bạn đã được cập nhật an toàn trên hệ thống.',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
      });

      handleClose();
    } catch (submitError) {
      const msg = submitError.response?.message || submitError.message || 'Không thể đổi mật khẩu.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div
        className="auth-modal-card"
        style={{ width: '460px' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="auth-modal-header">
          <h2>Đổi mật khẩu tài khoản</h2>
          <button className="auth-modal-close-btn" onClick={handleClose} aria-label="Đóng">
            <TbX />
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-title-group">
            <p>
              Tạo mật khẩu mạnh với tối thiểu 6 ký tự để bảo vệ an toàn cho tài khoản và lịch trình của bạn.
            </p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <TbAlertCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-stack">
            {/* Current Password */}
            <div className="auth-input-group">
              <label>Mật khẩu hiện tại (nếu có)</label>
              <div className="auth-input-box">
                <TbLock className="auth-input-icon" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}
                  title={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showCurrent ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="auth-input-group">
              <label>Mật khẩu mới *</label>
              <div className="auth-input-box">
                <TbLock className="auth-input-icon" />
                <input
                  type={showNew ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowNew(!showNew)}
                  title={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNew ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="auth-input-group">
              <label>Xác nhận mật khẩu mới *</label>
              <div className="auth-input-box">
                <TbLock className="auth-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirm ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-primary-submit"
              disabled={isSubmitting}
              style={{ marginTop: '0.6rem' }}
            >
              {isSubmitting ? (
                <span>Đang cập nhật...</span>
              ) : (
                <>
                  <TbShieldCheck />
                  <span>Xác nhận đổi mật khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
