import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbUser,
  TbMail,
  TbPhone,
  TbId,
  TbMapPin,
  TbShield,
  TbPhoto,
  TbCheck,
  TbLock,
  TbEye,
  TbEyeOff,
  TbUpload,
} from 'react-icons/tb';
import Swal from 'sweetalert2';

export const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_card_number: '',
    address: '',
    role: 'guest',
    status: 'active',
    password: '',
    avatar: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const [previewAvatar, setPreviewAvatar] = useState(defaultAvatar);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        id_card_number: user.id_card_number || '',
        address: user.address || '',
        role: user.role || 'guest',
        status: user.status || 'active',
        password: '',
        avatar: user.avatar || defaultAvatar,
      });
      setPreviewAvatar(user.avatar || defaultAvatar);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        id_card_number: '',
        address: '',
        role: 'guest',
        status: 'active',
        password: '',
        avatar: defaultAvatar,
      });
      setPreviewAvatar(defaultAvatar);
    }
  }, [user]);

  const handleChangeAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const urlImage = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewAvatar(urlImage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin!',
        text: 'Vui lòng nhập họ tên và email.',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu quá ngắn!',
        text: 'Mật khẩu phải có tối thiểu 6 ký tự.',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.append('full_name', formData.name.trim());
    data.append('email', formData.email.trim());
    data.append('phone_number', formData.phone ? formData.phone.trim() : '');
    data.append('id_card_number', formData.id_card_number ? formData.id_card_number.trim() : '');
    data.append('address', formData.address ? formData.address.trim() : '');
    data.append('role', formData.role);
    data.append('status', formData.status);

    if (formData.password.trim()) {
      data.append('password', formData.password.trim());
    }

    if (formData.avatar instanceof File) {
      data.append('avatar', formData.avatar);
    }

    // Endpoint: Update nếu có user (lấy ID DB), Create nếu thêm mới
    const url = user
      ? `http://localhost:8000/api/admin/users/${user.id}/update`
      : 'http://localhost:8000/api/admin/user/create';

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: data,
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: user ? '🎉 Cập nhật thành công!' : '🎉 Thêm người dùng thành công!',
          text: result.message || 'Dữ liệu người dùng đã được lưu vào hệ thống.',
          position: 'top-end',
          toast: true,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });

        if (onSave) {
          onSave(
            result.data || {
              ...(user ? { id: user.id } : {}),
              ...formData,
              avatar: previewAvatar,
            }
          );
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: user ? '❌ Cập nhật thất bại!' : '❌ Thêm người dùng thất bại!',
          text: result.message || 'Không thể lưu dữ liệu.',
          position: 'top-end',
          toast: true,
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: '❌ Lỗi kết nối API!',
        text: 'Không thể kết nối đến máy chủ Backend: ' + err.message,
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: 'var(--adm-radius-xl)',
          background: '#ffffff',
          boxShadow: 'var(--adm-shadow-modal)',
          border: '1px solid var(--adm-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--adm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fbfcfd',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-primary-soft)',
                color: 'var(--adm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                border: '1px solid var(--adm-primary-border)',
                flexShrink: 0,
              }}
            >
              <TbUser />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--adm-text-main)',
                  fontFamily: 'var(--adm-font-display)',
                  letterSpacing: '-0.3px',
                }}
              >
                {user ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Tài Khoản Mới'}
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--adm-text-muted)', marginTop: '1px' }}>
                {user
                  ? `Mã người dùng (DB ID: #${user.id}) • ${user.email}`
                  : 'Tạo mới người dùng và phân quyền hệ thống'}
              </p>
            </div>
          </div>

          <button className="btn-action-icon" onClick={onClose} title="Đóng">
            <TbX />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            {/* Full Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbUser style={{ color: 'var(--adm-primary)' }} />
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbMail style={{ color: '#0ea5e9' }} />
                Email Đăng Nhập *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbPhone style={{ color: '#10b981' }} />
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0987654321"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password Field (Update & Create) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TbLock style={{ color: '#8b5cf6' }} />
                  {user ? 'Mật Khẩu Mới (Đổi mật khẩu)' : 'Mật Khẩu Khởi Tạo'}
                </span>
                {user && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
                    (Để trống nếu không muốn đổi mật khẩu)
                  </span>
                )}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={user ? 'Nhập mật khẩu mới (tối thiểu 6 ký tự)...' : 'Nhập mật khẩu tài khoản...'}
                  style={{
                    width: '100%',
                    padding: '0.5rem 2.4rem 0.5rem 0.75rem',
                    borderRadius: 'var(--adm-radius-sm)',
                    border: '1px solid var(--adm-border-strong)',
                    fontSize: '0.84rem',
                    color: 'var(--adm-text-main)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* ID Card / CCCD */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbId style={{ color: '#6366f1' }} />
                Số CCCD / Hộ Chiếu
              </label>
              <input
                type="text"
                value={formData.id_card_number}
                onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                placeholder="001095012345"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbMapPin style={{ color: '#f59e0b' }} />
                Địa Chỉ
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Quận/Huyện, Tỉnh/TP"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Role */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbShield style={{ color: '#ec4899' }} />
                Vai Trò Tài Khoản
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="guest">Khách hàng (Guest)</option>
                <option value="host">Chủ nhà (Host)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                Trạng Thái Hoạt Động
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="active">Hoạt động bình thường</option>
                <option value="inactive">Chưa kích hoạt (Inactive)</option>
                <option value="banned">Tạm khóa tài khoản (Banned)</option>
              </select>
            </div>

            {/* Avatar Upload with Live Preview */}
            <div style={{ gridColumn: 'span 2' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '4px',
                }}
              >
                <TbPhoto style={{ color: '#0ea5e9' }} />
                Ảnh Đại Diện (Avatar)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.65rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px dashed var(--adm-border-strong)',
                  background: '#f8fafc',
                }}
              >
                <img
                  src={previewAvatar}
                  alt="Avatar Preview"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--adm-border)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="change-avatar-input"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--adm-radius-sm)',
                      background: '#ffffff',
                      border: '1px solid var(--adm-border-strong)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'var(--adm-text-main)',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <TbUpload style={{ fontSize: '1rem', color: 'var(--adm-primary)' }} />
                    {user ? 'Tải ảnh mới thay thế...' : 'Chọn ảnh đại diện...'}
                  </label>
                  <input
                    type="file"
                    id="change-avatar-input"
                    accept="image/*"
                    hidden
                    onChange={handleChangeAvatar}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-light)', marginTop: '3px' }}>
                    Hỗ trợ định dạng JPG, PNG, WEBP tối đa 5MB (Upload Cloudinary)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              borderTop: '1px solid var(--adm-border-subtle)',
              paddingTop: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--adm-radius-sm)',
                border: '1px solid var(--adm-border)',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hủy Bỏ
            </button>
            <button type="submit" className="btn-admin-primary" disabled={submitting}>
              <TbCheck />
              <span>{submitting ? 'Đang lưu...' : user ? 'Cập Nhật Người Dùng' : 'Tạo Mới Người Dùng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
