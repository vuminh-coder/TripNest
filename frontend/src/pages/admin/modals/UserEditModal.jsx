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
import './UserEditModal.css';

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const showToast = (icon, title, text, timer = 3000) => {
    Swal.fire({
      icon,
      title,
      text,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast(
        'warning',
        'Thiếu thông tin!',
        'Vui lòng nhập họ tên và email.'
      );
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast(
        'warning',
        'Mật khẩu quá ngắn!',
        'Mật khẩu phải có tối thiểu 6 ký tự.'
      );
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
      data.append('password', formData.password.trim());
    }

    if (formData.avatar instanceof File) {
      data.append('avatar', formData.avatar);
    }

    let token = localStorage.getItem('token');
    if (!token) {
      const storedUser = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
      token = storedUser?.token;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const url = user
      ? `${API_BASE_URL}/admin/users/${user.id}/update`
      : `${API_BASE_URL}/admin/user/create`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
        body: data,
      });

      const result = await response.json();
      console.log(result);
      if (result.success && result.data) {
        showToast(
          'success',
          user
            ? '🎉 Cập nhật thành công!'
            : '🎉 Thêm người dùng thành công!',
          result.message || 'Dữ liệu người dùng đã được lưu vào hệ thống.'
        );

        onSave(result.data);
      } else {
        showToast(
          'error',
          user
            ? '❌ Cập nhật thất bại!'
            : '❌ Thêm người dùng thất bại!',
          result.message || 'Không thể lưu dữ liệu.',
          3500
        );
      }
    } catch (err) {
      showToast(
        'error',
        '❌ Lỗi kết nối API!',
        'Không thể kết nối đến máy chủ Backend: ' + err.message,
        3500
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-edit-overlay" onClick={onClose}>
      <div
        className="user-edit-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-edit-header">
          <div className="user-edit-title-wrapper">
            <div className="user-edit-title-icon">
              <TbUser />
            </div>

            <div>
              <h2>
                {user
                  ? 'Chỉnh Sửa Thông Tin Thành Viên'
                  : 'Thêm Tài Khoản Mới'}
              </h2>

              <p>
                {user
                  ? `Mã người dùng (DB ID: #${user.id}) • ${user.email}`
                  : 'Tạo mới người dùng và phân quyền hệ thống'}
              </p>
            </div>
          </div>

          <button
            className="user-edit-close"
            onClick={onClose}
            title="Đóng"
          >
            <TbX />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="user-edit-form"
        >
          <div className="user-edit-grid">
            <div className="user-edit-field full">
              <label>
                <TbUser />
                Họ và Tên *
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  handleChange('name', e.target.value)
                }
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            <div className="user-edit-field">
              <label>
                <TbMail />
                Email Đăng Nhập *
              </label>

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  handleChange('email', e.target.value)
                }
                placeholder="name@example.com"
              />
            </div>

            <div className="user-edit-field">
              <label>
                <TbPhone />
                Số Điện Thoại
              </label>

              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  handleChange('phone', e.target.value)
                }
                placeholder="0987654321"
              />
            </div>

            <div className="user-edit-field full">
              <label className="password-label">
                <span>
                  <TbLock />
                  {user
                    ? 'Mật Khẩu Mới (Đổi mật khẩu)'
                    : 'Mật Khẩu Khởi Tạo'}
                </span>

                {user && (
                  <small>
                    (Để trống nếu không muốn đổi mật khẩu)
                  </small>
                )}
              </label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    handleChange('password', e.target.value)
                  }
                  placeholder={
                    user
                      ? 'Nhập mật khẩu mới (tối thiểu 6 ký tự)...'
                      : 'Nhập mật khẩu tài khoản...'
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  title={
                    showPassword
                      ? 'Ẩn mật khẩu'
                      : 'Hiển thị mật khẩu'
                  }
                >
                  {showPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            <div className="user-edit-field">
              <label>
                <TbId />
                Số CCCD / Hộ Chiếu
              </label>

              <input
                type="text"
                value={formData.id_card_number}
                onChange={(e) =>
                  handleChange(
                    'id_card_number',
                    e.target.value
                  )
                }
                placeholder="001095012345"
              />
            </div>

            <div className="user-edit-field">
              <label>
                <TbMapPin />
                Địa Chỉ
              </label>

              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  handleChange('address', e.target.value)
                }
                placeholder="Quận/Huyện, Tỉnh/TP"
              />
            </div>

            <div className="user-edit-field">
              <label>
                <TbShield />
                Vai Trò Tài Khoản
              </label>

              <select
                value={formData.role}
                onChange={(e) =>
                  handleChange('role', e.target.value)
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

            <div className="user-edit-field">
              <label>Trạng Thái Hoạt Động</label>

              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', e.target.value)
                }
              >
                <option value="active">
                  Hoạt động bình thường
                </option>

                <option value="inactive">
                  Chưa kích hoạt (Inactive)
                </option>

                <option value="banned">
                  Tạm khóa tài khoản (Banned)
                </option>
              </select>
            </div>

            <div className="user-edit-field full">
              <label>
                <TbPhoto />
                Ảnh Đại Diện (Avatar)
              </label>

              <div className="avatar-upload">
                <img
                  src={previewAvatar}
                  alt="Avatar Preview"
                />

                <div className="avatar-upload-content">
                  <label
                    htmlFor="change-avatar-input"
                    className="avatar-upload-button"
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

                  <div className="avatar-upload-note">
                    Hỗ trợ định dạng JPG, PNG, WEBP tối đa 5MB
                    (Upload Cloudinary)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="user-edit-actions">
            <button
              type="button"
              className="user-edit-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              className="user-edit-submit"
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