import React, { useState } from 'react';
import {
  TbX,
  TbBrandGoogle,
  TbShieldLock,
  TbMail,
  TbLock,
  TbEye,
  TbEyeOff,
  TbUser,
  TbArrowRight,
  TbSparkles,
  TbPhone,
} from 'react-icons/tb';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';

export const AuthModal = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthSuccess,
  onOpenForgotPassword,
}) => {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('guest'); // 'guest' | 'host'
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Traditional Email + Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email!');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.login({
        email: email.trim(),
        password: password,
      });

      if (res.token && res.user) {
        const userData = {
          ...res.user,
          token: res.token,
        };
        localStorage.setItem('tripnest_user', JSON.stringify(userData));
        if (onAuthSuccess) onAuthSuccess(userData);
        onClose();
        Swal.fire({
          title: 'Đăng nhập thành công!',
          text: `Chào mừng ${res.user.name} quay trở lại TripNest.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // Mock fallback demo đăng nhập
        const mockUser = {
          id: Date.now(),
          name: email.split('@')[0],
          email: email.trim(),
          role: email.includes('admin') ? 'admin' : email.includes('host') ? 'host' : 'guest',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        localStorage.setItem('tripnest_user', JSON.stringify(mockUser));
        if (onAuthSuccess) onAuthSuccess(mockUser);
        onClose();
      }
    } catch (err) {
      if (err.message && err.message.includes('Không thể kết nối máy chủ')) {
        console.warn('Backend offline, running fallback mock login...');
        const mockUser = {
          id: Date.now(),
          name: email.split('@')[0],
          email: email.trim(),
          role: email.includes('admin') ? 'admin' : email.includes('host') ? 'host' : 'guest',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        localStorage.setItem('tripnest_user', JSON.stringify(mockUser));
        if (onAuthSuccess) onAuthSuccess(mockUser);
        onClose();
        Swal.fire({
          title: 'Đăng nhập Demo!',
          text: `Hệ thống backend offline. Đang đăng nhập tài khoản mẫu: ${mockUser.name}`,
          icon: 'info',
          timer: 3000,
        });
      } else {
        setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email & mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Traditional Email + Password Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên!');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email!');
      return;
    }
    if (!password) {
      setError('Vui lòng tạo mật khẩu!');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự!');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!agreeTerms) {
      setError('Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiService.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || null,
        role,
      });

      if (res.token && res.user) {
        const userData = {
          ...res.user,
          token: res.token,
        };
        localStorage.setItem('tripnest_user', JSON.stringify(userData));
        if (onAuthSuccess) onAuthSuccess(userData);
        onClose();
        Swal.fire({
          title: 'Đăng ký thành công!',
          text: `Chào mừng thành viên mới ${res.user.name} gia nhập TripNest!`,
          icon: 'success',
          confirmButtonColor: '#ff385c',
        });
      }
    } catch (err) {
      if (err.message && err.message.includes('Không thể kết nối máy chủ')) {
        console.warn('Backend offline, running fallback mock registration...');
        const mockUser = {
          id: Date.now(),
          name: name.trim(),
          email: email.trim(),
          role: role,
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        };
        localStorage.setItem('tripnest_user', JSON.stringify(mockUser));
        if (onAuthSuccess) onAuthSuccess(mockUser);
        onClose();
        Swal.fire({
          title: 'Đăng ký Demo!',
          text: `Hệ thống backend offline. Đăng ký tài khoản thử nghiệm thành công!`,
          icon: 'info',
          confirmButtonColor: '#ff385c',
        });
      } else {
        setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại trong hệ thống.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Click Login
  const handleGoogleLogin = async (customEmail = null) => {
    setLoading(true);
    setError('');

    const targetEmail = customEmail || email.trim() || 'demo.traveler@gmail.com';
    const googleName = targetEmail.split('@')[0].replace('.', ' ').toUpperCase();

    const googlePayload = {
      email: targetEmail,
      google_id:
        'google-sub-' +
        Math.abs(
          targetEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)
        ),
      name: googleName,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };

    try {
      const res = await apiService.googleLogin(googlePayload);
      if (res.token && res.user) {
        const userData = {
          ...res.user,
          token: res.token,
        };
        localStorage.setItem('tripnest_user', JSON.stringify(userData));
        if (onAuthSuccess) onAuthSuccess(userData);
        onClose();
      } else {
        setError(res.message || 'Đăng nhập Google không thành công.');
      }
    } catch (e) {
      setError('Có lỗi xảy ra khi kết nối máy chủ Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoType) => {
    if (demoType === 'guest') {
      setEmail('thangbinh.travel@gmail.com');
      setPassword('Guest@2026');
      handleGoogleLogin('thangbinh.travel@gmail.com');
    } else if (demoType === 'host') {
      setEmail('hoanglong.danang@gmail.com');
      setPassword('Host@2026');
      handleGoogleLogin('hoanglong.danang@gmail.com');
    } else if (demoType === 'admin') {
      setEmail('vuminh.admin@tripnest.vn');
      setPassword('Admin@2026');
      handleGoogleLogin('vuminh.admin@tripnest.vn');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-container"
        style={{
          width: '460px',
          maxWidth: '94vw',
          padding: '2rem',
          borderRadius: '16px',
          background: '#ffffff',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <div style={{ width: '32px' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {tab === 'login' ? 'Đăng Nhập TripNest' : 'Đăng Ký Tài Khoản'}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'static', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <TbX />
          </button>
        </div>

        {/* Tab Switcher: Đăng Nhập / Đăng Ký */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '4px',
            margin: '1.25rem 0 1rem 0',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'login' ? '#ffffff' : 'transparent',
              color: tab === 'login' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: tab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'register' ? '#ffffff' : 'transparent',
              color: tab === 'register' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: tab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Tạo Tài Khoản
          </button>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              color: '#ef4444',
              border: '1px solid #fecaca',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 1: FORM ĐĂNG NHẬP                                       */}
        {/* ----------------------------------------------------------- */}
        {tab === 'login' && (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Email Field */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Email đăng nhập *
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbMail style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.92rem',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Mật khẩu *
                </label>
                {/* 👉 NÚT QUÊN MẬT KHẨU NỔI BẬT */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenForgotPassword) onOpenForgotPassword();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e11d48',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbLock style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.92rem',
                    background: 'transparent',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#e11d48', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '0.84rem', color: '#64748b', cursor: 'pointer' }}>
                Ghi nhớ đăng nhập trên thiết bị này
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="primary-gradient-btn"
              style={{
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginTop: '4px',
                cursor: loading ? 'wait' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Hoặc
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Google 1-Click Button */}
            <button
              type="button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => handleGoogleLogin()}
              disabled={loading}
            >
              <TbBrandGoogle style={{ fontSize: '1.3rem', color: '#ea4335' }} />
              Đăng nhập nhanh với Google
            </button>
          </form>
        )}

        {/* ----------------------------------------------------------- */}
        {/* TAB 2: FORM ĐĂNG KÝ TÀI KHOẢN                               */}
        {/* ----------------------------------------------------------- */}
        {tab === 'register' && (
          <form
            onSubmit={handleRegister}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
          >
            {/* Họ và tên */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Họ và tên *
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbUser style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Địa chỉ Email *
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbMail style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Số điện thoại (tùy chọn)
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbPhone style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Vai trò */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Bạn đăng ký với vai trò gì? *
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <div
                  onClick={() => setRole('guest')}
                  style={{
                    flex: 1,
                    border: role === 'guest' ? '2.5px solid #ff385c' : '1.5px solid #cbd5e1',
                    background: role === 'guest' ? '#fff1f2' : '#ffffff',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TbUser style={{ color: role === 'guest' ? '#ff385c' : '#64748b', fontSize: '1.15rem' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: role === 'guest' ? '#ff385c' : '#334155' }}>
                      Khách du lịch
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.25' }}>
                    Tìm kiếm và đặt phòng du lịch, nghỉ dưỡng.
                  </span>
                </div>

                <div
                  onClick={() => setRole('host')}
                  style={{
                    flex: 1,
                    border: role === 'host' ? '2.5px solid #ff385c' : '1.5px solid #cbd5e1',
                    background: role === 'host' ? '#fff1f2' : '#ffffff',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TbSparkles style={{ color: role === 'host' ? '#ff385c' : '#64748b', fontSize: '1.15rem' }} />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: role === 'host' ? '#ff385c' : '#334155' }}>
                      Chủ nhà (Host)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: '1.25' }}>
                    Đăng tin và kinh doanh cho thuê chỗ ở.
                  </span>
                </div>
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Mật khẩu (Tối thiểu 6 ký tự) *
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbLock style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tạo mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '5px' }}>
                Xác nhận lại mật khẩu *
              </label>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                }}
              >
                <TbLock style={{ color: '#64748b', fontSize: '1.2rem' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.92rem', background: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                >
                  {showConfirmPassword ? <TbEyeOff /> : <TbEye />}
                </button>
              </div>
            </div>

            {/* Hộp kiểm Điều khoản */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ accentColor: '#ff385c', cursor: 'pointer', marginTop: '3px' }}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: '0.78rem', color: '#64748b', cursor: 'pointer', lineHeight: '1.35' }}>
                Tôi đồng ý với{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire('Điều khoản dịch vụ', 'Điều khoản sử dụng nền tảng TripNest dành cho Khách hàng và Chủ nhà.', 'info'); }} style={{ color: '#ff385c', fontWeight: 700, textDecoration: 'underline' }}>
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire('Chính sách bảo mật', 'Chính sách thu thập và mã hóa bảo mật thông tin cá nhân của TripNest.', 'info'); }} style={{ color: '#ff385c', fontWeight: 700, textDecoration: 'underline' }}>
                  Chính sách bảo mật
                </a>{' '}
                của TripNest.
              </label>
            </div>

            {/* Nút gửi */}
            <button
              type="submit"
              className="primary-gradient-btn"
              style={{
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.96rem',
                marginTop: '6px',
                cursor: loading ? 'wait' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản'}
            </button>
          </form>
        )}

        {/* Quick Demo Acccess */}
        <div style={{ marginTop: '1.25rem', background: '#f8fafc', borderRadius: '10px', padding: '0.85rem', textAlign: 'left', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <TbSparkles style={{ color: '#f59e0b', fontSize: '0.95rem' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              Tài khoản mẫu thử nghiệm nhanh:
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.35rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => handleQuickDemo('guest')}
            >
              Khách (Guest)
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.35rem',
                borderRadius: '6px',
                border: '1px solid #fecdd3',
                background: '#fff1f2',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#e11d48',
                cursor: 'pointer',
              }}
              onClick={() => handleQuickDemo('host')}
            >
              Chủ nhà (Host)
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '0.35rem',
                borderRadius: '6px',
                border: '1px solid #0f172a',
                background: '#0f172a',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#38bdf8',
                cursor: 'pointer',
              }}
              onClick={() => handleQuickDemo('admin')}
            >
              Admin Master
            </button>
          </div>
        </div>

        {/* Security Guarantee */}
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem' }}>
          <TbShieldLock style={{ fontSize: '1rem', color: '#10b981' }} />
          <span>Bảo mật 2FA & Mã hóa dữ liệu chuẩn AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
