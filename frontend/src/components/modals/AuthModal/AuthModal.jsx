import './AuthModal.css';
import React, { useState, useEffect } from 'react';
import {
  TbX,
  TbShieldLock,
  TbMail,
  TbLock,
  TbUser,
  TbPhone,
  TbEye,
  TbEyeOff,
  TbSparkles,
  TbCheck,
  TbAlertCircle,
  TbUserShield,
  TbHome,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useDispatch } from 'react-redux';
import { ForgotPasswordModal } from '@/components/modals/ForgotPasswordModal/ForgotPasswordModal';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) => {
  const toast = useToast();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redux
  const dispatch = useDispatch();

  useEffect(() => {
    setTab(initialTab || 'login');
    setError('');
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  // Tính toán độ mạnh mật khẩu (Password Strength)
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', class: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) && pass.length >= 8) score += 1;

    if (score === 1) return { score: 1, label: 'Yếu', class: 'active-weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Trung bình', class: 'active-medium', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Rất mạnh', class: 'active-strong', color: '#10b981' };
    return { score: 1, label: 'Yếu', class: 'active-weak', color: '#ef4444' };
  };

  const strength = calculatePasswordStrength(password);

  const saveAuthSession = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      const userData = {
        ...data.user,
        token: data.token,
      };
      localStorage.setItem('tripnest_user', JSON.stringify(userData));
      dispatch({ type: 'UPDATE', payload: data.user });
      if (onAuthSuccess) {
        onAuthSuccess(userData);
      }
    }
  };

  // 1. Đăng nhập Email + Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      toast.warning('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.login({
        email: email.trim(),
        password,
      });

      setLoading(false);
      if (data.success) {
        toast.success(
          'Đăng nhập thành công!',
          `Chào mừng bạn quay trở lại, ${data.user?.full_name || 'Quý khách'}!`
        );

        saveAuthSession(data);
        onClose();
      } else {
        const msg = data.message || 'Đăng nhập thất bại.';
        setError(msg);
        toast.error('Đăng nhập thất bại', msg);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.message || err.message || 'Email hoặc mật khẩu không chính xác.';
      setError(msg);
      toast.error('Đăng nhập thất bại', msg);
    }
  };

  // 2. Đăng ký tài khoản người dùng mới
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên.');
      toast.warning('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      toast.warning('Thiếu thông tin', 'Vui lòng nhập địa chỉ email.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      toast.warning('Mật khẩu không hợp lệ', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      toast.warning('Không khớp mật khẩu', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone_number: phone.trim() || null,
      });

      setLoading(false);
      if (data.success) {
        toast.success(
          'Đăng ký thành công!',
          `Chào mừng ${data.user?.full_name || ''} đã gia nhập cộng đồng TripNest!`
        );

        saveAuthSession(data);
        onClose();
      } else {
        const msg = data.message || 'Đăng ký không thành công.';
        setError(msg);
        toast.error('Đăng ký thất bại', msg);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.message || err.message || 'Đăng ký tài khoản thất bại.';
      setError(msg);
      toast.error('Đăng ký thất bại', msg);
    }
  };

  // 3. Quick Demo Login Handlers (Email + Password)
  const handleQuickDemo = async (roleType) => {
    let demoEmail = 'demo.traveler@gmail.com';
    let demoPass = '123456';
    if (roleType === 'host') {
      demoEmail = 'minhhoang.dalat@gmail.com';
      demoPass = '123456';
    } else if (roleType === 'admin') {
      demoEmail = 'admin@tripnest.vn';
      demoPass = '123456';
    }
    setEmail(demoEmail);
    setPassword(demoPass);

    setLoading(true);
    setError('');
    try {
      const res = await apiService.login({ email: demoEmail, password: demoPass });
      setLoading(false);
      if (res.token && res.user) {
        toast.success(
          'Đăng nhập thành công!',
          `Chào mừng ${res.user?.full_name || 'bạn'} đến với TripNest!`
        );
        saveAuthSession(res);
        onClose();
      } else {
        const msg = res.message || 'Đăng nhập không thành công.';
        setError(msg);
        toast.error('Đăng nhập thất bại', msg);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.message || err.message || 'Đăng nhập thất bại.';
      setError(msg);
      toast.error('Đăng nhập thất bại', msg);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <h2>{tab === 'login' ? 'Đăng nhập vào TripNest' : 'Đăng ký tài khoản mới'}</h2>
          <button className="auth-modal-close-btn" onClick={onClose} title="Đóng cửa sổ">
            <TbX />
          </button>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          {/* Segmented Tab Switcher */}
          <div className="auth-segmented-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}
            >
              <TbSparkles style={{ color: '#ff385c' }} />
              <span>Tạo tài khoản</span>
            </button>
          </div>

          {/* Title Greetings */}
          <div className="auth-title-group">
            <h3>{tab === 'login' ? 'Chào mừng trở lại 👋' : 'Khám phá thế giới cùng TripNest ✨'}</h3>
            <p>
              {tab === 'login'
                ? 'Đăng nhập để quản lý lịch trình, chuyến đi và danh sách yêu thích.'
                : 'Đăng ký miễn phí chỉ trong vài giây để trải nghiệm hàng ngàn chỗ ở.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="auth-error-banner">
              <TbAlertCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={tab === 'login' ? handleEmailLogin : handleRegister}
            className="auth-form-stack"
          >
            {/* Full Name (Register Only) */}
            {tab === 'register' && (
              <div className="auth-input-group">
                <label>Họ và tên *</label>
                <div className="auth-input-box">
                  <TbUser className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input-field"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="auth-input-group">
              <label>Địa chỉ Email *</label>
              <div className="auth-input-box">
                <TbMail className="auth-input-icon" />
                <input
                  type="email"
                  className="auth-input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone Number (Register Only) */}
            {tab === 'register' && (
              <div className="auth-input-group">
                <label>Số điện thoại (tùy chọn)</label>
                <div className="auth-input-box">
                  <TbPhone className="auth-input-icon" />
                  <input
                    type="tel"
                    className="auth-input-field"
                    placeholder="0988 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="auth-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Mật khẩu *</label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    style={{ border: 'none', background: 'none', color: '#ff385c', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>

              <div className="auth-input-box">
                <TbLock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input-field"
                  placeholder={tab === 'login' ? 'Nhập mật khẩu' : 'Tối thiểu 6 ký tự'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>

              {/* Password Strength Indicator (Register only) */}
              {tab === 'register' && password && (
                <div className="auth-strength-meter">
                  <div className="auth-strength-bars">
                    <div className={`auth-strength-bar ${strength.score >= 1 ? strength.class : ''}`} />
                    <div className={`auth-strength-bar ${strength.score >= 2 ? strength.class : ''}`} />
                    <div className={`auth-strength-bar ${strength.score >= 3 ? strength.class : ''}`} />
                  </div>
                  <span className="auth-strength-text" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password (Register Only) */}
            {tab === 'register' && (
              <div className="auth-input-group">
                <label>Xác nhận lại mật khẩu *</label>
                <div className="auth-input-box">
                  <TbLock className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input-field"
                    placeholder="Nhập lại mật khẩu"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? <TbEyeOff /> : <TbEye />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="auth-primary-submit" disabled={loading}>
              {loading ? (
                <span>Đang xử lý dữ liệu...</span>
              ) : tab === 'login' ? (
                <>
                  <TbCheck />
                  <span>Đăng nhập</span>
                </>
              ) : (
                <>
                  <TbSparkles />
                  <span>Tạo tài khoản ngay</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="auth-demo-box">
            <div className="auth-demo-header">
              <span>Đăng nhập nhanh:</span>
            </div>
            <div className="auth-demo-buttons">
              <button
                type="button"
                className="auth-demo-pill guest"
                onClick={() => handleQuickDemo('guest')}
                title="Đăng nhập tài khoản Khách du lịch"
                disabled={loading}
              >
                <TbUser />
                <span>Khách</span>
              </button>

              <button
                type="button"
                className="auth-demo-pill host"
                onClick={() => handleQuickDemo('host')}
                title="Đăng nhập tài khoản Chủ nhà"
                disabled={loading}
              >
                <TbHome />
                <span>Chủ nhà</span>
              </button>

              <button
                type="button"
                className="auth-demo-pill admin"
                onClick={() => handleQuickDemo('admin')}
                title="Đăng nhập tài khoản Quản trị viên"
                disabled={loading}
              >
                <TbUserShield />
                <span>Quản trị</span>
              </button>
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="auth-security-badge">
            <TbShieldLock />
            <span>Bảo mật dữ liệu 100% qua chuẩn JSON Web Token (JWT)</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <ForgotPasswordModal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
          onSwitchToLogin={() => {
            setIsForgotOpen(false);
            setTab('login');
          }}
          onSwitchToRegister={() => {
            setIsForgotOpen(false);
            setTab('register');
          }}
          onResetSuccess={() => {
            setIsForgotOpen(false);
            setTab('login');
          }}
        />
      )}
    </div>
  );
};

export default AuthModal;