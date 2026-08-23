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
  TbDice,
  TbUpload,
} from 'react-icons/tb';
import Swal from 'sweetalert2';

export const UserEditModal = ({ user, onClose, onSave }) => {
  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    id_card_number: '',
    address: '',
    role: 'guest',
    status: 'active',
    avatar: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(defaultAvatar);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        id_card_number: user.id_card_number || '',
        address: user.address || '',
        role: user.role || 'guest',
        status: user.status || 'active',
        avatar: user.avatar || defaultAvatar,
      });

      setPreviewAvatar(user.avatar || defaultAvatar);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        id_card_number: '',
        address: '',
        role: 'guest',
        status: 'active',
        avatar: defaultAvatar,
      });

      setPreviewAvatar(defaultAvatar);
    }
  }, [user]);

  const handleChangeAvatar = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      const urlImage = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));

      setPreviewAvatar(urlImage);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';

    let pass = 'TN@';

    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setFormData((prev) => ({
      ...prev,
      password: pass,
    }));
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

    // Khi tạo user mới: bắt buộc mật khẩu ít nhất 6 ký tự
    if (
      !user &&
      (!formData.password ||
        formData.password.trim().length < 6)
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu chưa hợp lệ!',
        text: 'Vui lòng nhập mật khẩu tối thiểu 6 ký tự.',
        position: 'top-end',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      return;
    }

    // Khi sửa user: nếu có nhập mật khẩu mới thì phải >= 6 ký tự
    if (
      user &&
      formData.password &&
      formData.password.trim().length < 6
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Mật khẩu quá ngắn!',
        text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.',
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
    data.append(
      'phone_number',
      formData.phone ? formData.phone.trim() : ''
    );
    data.append(
      'id_card_number',
      formData.id_card_number
        ? formData.id_card_number.trim()
        : ''
    );
    data.append(
      'address',
      formData.address ? formData.address.trim() : ''
    );
    data.append('role', formData.role);
    data.append('status', formData.status);

    if (formData.password.trim()) {
      data.append(
        'password',
        formData.password.trim()
      );
    }

    if (formData.avatar instanceof File) {
      data.append('avatar', formData.avatar);
    }

    // Nếu có user -> cập nhật
    // Nếu không có user -> tạo mới
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
          title: user
            ? '🎉 Cập nhật thành công!'
            : '🎉 Thêm người dùng thành công!',
          text:
            result.message ||
            'Dữ liệu người dùng đã được lưu vào hệ thống.',
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
          title: user
            ? '❌ Cập nhật thất bại!'
            : '❌ Thêm người dùng thất bại!',
          text:
            result.message ||
            'Không thể lưu dữ liệu.',
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
        text:
          'Không thể kết nối đến máy chủ Backend: ' +
          err.message,
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
            borderBottom:
              '1px solid var(--adm-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fbfcfd',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
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
                border:
                  '1px solid var(--adm-primary-border)',
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
                  fontFamily:
                    'var(--adm-font-display)',
                  letterSpacing: '-0.3px',
                }}
              >
                {user
                  ? 'Chỉnh Sửa Thông Tin Thành Viên'
                  : 'Thêm Tài Khoản Mới'}
              </h2>

              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--adm-text-muted)',
                  marginTop: '1px',
                }}
              >
                {user
                  ? `Mã người dùng (DB ID: #${user.id}) • ${user.email}`
                  : 'Tạo mới người dùng, cấp mật khẩu và phân quyền hệ thống'}
              </p>
            </div>
          </div>

          <button
            className="btn-action-icon"
            onClick={onClose}
            title="Đóng"
          >
            <TbX />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '1.25rem' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {/* Full Name */}
            <div style={{ gridColumn: 'span 2' }}>
              <label>
                <TbUser /> Họ và Tên *
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            {/* Email */}
            <div>
              <label>
                <TbMail /> Email Đăng Nhập *
              </label>

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <label>
                  <TbLock />
                  {user
                    ? 'Mật Khẩu Mới'
                    : 'Mật Khẩu Khởi Tạo *'}
                </label>

                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  title="Tạo mật khẩu ngẫu nhiên"
                >
                  <TbDice />
                  Random
                </button>
              </div>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  required={!user}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    user
                      ? 'Để trống nếu không đổi'
                      : 'Tối thiểu 6 ký tự...'
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <TbEyeOff />
                  ) : (
                    <TbEye />
                  )}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label>
                <TbPhone /> Số Điện Thoại
              </label>

              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                placeholder="0987654321"
              />
            </div>

            {/* CCCD */}
            <div>
              <label>
                <TbId /> Số CCCD / Hộ Chiếu
              </label>

              <input
                type="text"
                value={formData.id_card_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id_card_number: e.target.value,
                  })
                }
                placeholder="001095012345"
              />
            </div>

            {/* Address */}
            <div>
              <label>
                <TbMapPin /> Địa Chỉ
              </label>

              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: e.target.value,
                  })
                }
                placeholder="Quận/Huyện, Tỉnh/TP"
              />
            </div>

            {/* Role */}
            <div>
              <label>
                <TbShield /> Vai Trò Tài Khoản
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
              >
                <option value="guest">
                  Khách hàng (Guest)
                </option>
                <option value="host">
                  Chủ nhà (Host)
                </option>
                <option value="admin">
                  Quản trị viên (Admin)
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label>
                Trạng Thái Hoạt Động
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                <option value="active">
                  Hoạt động bình thường
                </option>
                <option value="inactive">
                  Chưa kích hoạt
                </option>
                <option value="banned">
                  Tạm khóa tài khoản
                </option>
              </select>
            </div>

            {/* Avatar */}
            <div style={{ gridColumn: 'span 2' }}>
              <label>
                <TbPhoto /> Ảnh Đại Diện (Avatar)
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
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
                  }}
                />

                <div>
                  <label
                    htmlFor="change-avatar-input"
                  >
                    <TbUpload />
                    {user
                      ? 'Tải ảnh mới thay thế...'
                      : 'Chọn ảnh đại diện...'}
                  </label>

                  <input
                    type="file"
                    id="change-avatar-input"
                    accept="image/*"
                    hidden
                    onChange={handleChangeAvatar}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="btn-admin-primary"
              disabled={submitting}
            >
              <TbCheck />

              <span>
                {submitting
                  ? 'Đang lưu...'
                  : user
                  ? 'Cập Nhật Người Dùng'
                  : 'Tạo Mới Người Dùng'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;