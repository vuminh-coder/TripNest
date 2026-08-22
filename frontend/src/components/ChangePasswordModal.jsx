import React, { useState } from 'react';
import { TbCheck, TbEye, TbEyeOff, TbLock, TbX } from 'react-icons/tb';
import { apiService } from '../services/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visibleFields, setVisibleFields] = useState({});
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setVisibleFields({});
    setError('');
    setIsSaved(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleVisibility = (field) => {
    setVisibleFields((fields) => ({ ...fields, [field]: !fields[field] }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!newPassword || !confirmation) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (currentPassword === newPassword) {
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
      setIsSaved(true);
    } catch (submitError) {
      setError(submitError.message || 'Không thể đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { id: 'current', label: 'Mật khẩu hiện tại (nếu có)', value: currentPassword, setValue: setCurrentPassword },
    { id: 'new', label: 'Mật khẩu mới', value: newPassword, setValue: setNewPassword },
    { id: 'confirmation', label: 'Xác nhận mật khẩu mới', value: confirmation, setValue: setConfirmation },
  ];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-container"
        style={{ width: '460px', maxWidth: '95vw', padding: '2rem' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={handleClose} style={{ position: 'static' }} aria-label="Đóng">
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Đổi mật khẩu</h2>
          <div style={{ width: '36px' }} />
        </div>

        {isSaved ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem 1rem' }}>
            <TbCheck style={{ color: '#0d8a43', fontSize: '3.5rem', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Đổi mật khẩu thành công</h3>
            <p style={{ color: '#717171', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Mật khẩu của bạn đã được cập nhật.
            </p>
            <button className="primary-gradient-btn" style={{ width: 'auto', padding: '0.65rem 1.5rem' }} onClick={handleClose}>
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ paddingTop: '1.5rem' }}>
            <p style={{ color: '#717171', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Sử dụng mật khẩu mạnh với ít nhất 8 ký tự để bảo vệ tài khoản của bạn.
            </p>

            {error && (
              <div style={{ background: '#fff0f3', color: '#e00b41', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {fields.map((field) => (
                <label key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#484848', fontSize: '0.82rem', fontWeight: 700 }}>
                  {field.label}
                  <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '0.65rem 0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TbLock style={{ color: '#717171', fontSize: '1.1rem' }} />
                    <input
                      type={visibleFields[field.id] ? 'text' : 'password'}
                      value={field.value}
                      onChange={(event) => field.setValue(event.target.value)}
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem' }}
                      autoComplete={field.id === 'current' ? 'current-password' : 'new-password'}
                    />
                    <button type="button" onClick={() => toggleVisibility(field.id)} aria-label={visibleFields[field.id] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} style={{ color: '#717171', fontSize: '1.15rem' }}>
                      {visibleFields[field.id] ? <TbEyeOff /> : <TbEye />}
                    </button>
                  </div>
                </label>
              ))}
            </div>

            <button type="submit" className="primary-gradient-btn" style={{ padding: '0.75rem', marginTop: '1.25rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
