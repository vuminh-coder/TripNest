import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-icons/tb';

export const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id_card_number: '',
    address: '',
    role: 'guest',
    status: 'active',
    avatar: '',
  });

  const [previewAvatar,setPreviewAvatar] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");

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
        avatar: user.avatar || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        id_card_number: '',
        address: '',
        role: 'guest',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      });
    }
  }, [user]);

  const handleChangeAvatar = (e) => {
    const urlImage = URL.createObjectURL(e.target.files[0]);
    setFormData({...formData,"avatar": e.target.files[0]});
    setPreviewAvatar(urlImage);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Vui lòng nhập họ tên và email!');
      return;
    }
    // onSave({
    //   ...(user ? { id: user.id } : {}),
    //   ...formData,
    // });

    const data = new FormData();

    data.append("full_name", formData.name);
    data.append("email", formData.email);
    data.append("phone_number", formData.phone);
    data.append("id_card_number", formData.id_card_number);
    data.append("address", formData.address);
    data.append("role", formData.role);
    data.append("status", formData.status);

    // Chỉ append nếu người dùng chọn ảnh mới
    if (formData.avatar instanceof File) {
      data.append("avatar", formData.avatar);
    }

    fetch("http://localhost:8000/api/admin/user/create",{
      method: "POST",
      credentials: "include",
      body: data
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{
          width: '100%',
          maxWidth: '520px',
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
                width: '36px',
                height: '36px',
                borderRadius: 'var(--adm-radius-md)',
                background: 'var(--adm-primary-soft)',
                color: 'var(--adm-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
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
                {user ? `Mã tài khoản #${user.id} • ${user.email}` : 'Tạo mới người dùng và phân quyền hệ thống'}
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
                  padding: '0.45rem 0.75rem',
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
                  padding: '0.45rem 0.75rem',
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
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--adm-radius-sm)',
                  border: '1px solid var(--adm-border-strong)',
                  fontSize: '0.84rem',
                  color: 'var(--adm-text-main)',
                  outline: 'none',
                }}
              />
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
                  padding: '0.45rem 0.75rem',
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
                  padding: '0.45rem 0.75rem',
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
                Vai Trò (Cố Định)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
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
                  padding: '0.45rem 0.75rem',
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
                <option value="banned">Tạm khóa tài khoản</option>
              </select>
            </div>

            {/* Avatar URL with Live Preview */}
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
                Ảnh Đại Diện (Avatar URL)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={previewAvatar}
                  alt="Preview"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--adm-radius-md)',
                    objectFit: 'cover',
                    border: '1.5px solid var(--adm-border)',
                    flexShrink: 0,
                  }}
                />
                <label htmlFor='change-avatar'> Chọn ảnh</label>
                <input type = "file" hidden id = "change-avatar" onChange={handleChangeAvatar}>
                </input>
                {/* <input
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--adm-radius-sm)',
                    border: '1px solid var(--adm-border-strong)',
                    fontSize: '0.84rem',
                    color: 'var(--adm-text-main)',
                    outline: 'none',
                  }}
                /> */}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '6px',
              borderTop: '1px solid var(--adm-border-subtle)',
              paddingTop: '0.85rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.45rem 0.95rem',
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
            <button type="submit" className="btn-admin-primary">
              <TbCheck />
              <span>{user ? 'Cập Nhật Người Dùng' : 'Tạo Mới Người Dùng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
