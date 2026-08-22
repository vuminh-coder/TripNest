import React, { useState, useEffect, useRef } from 'react';
import {
  TbX,
  TbMail,
  TbMailFast,
  TbShieldCheck,
  TbKey,
  TbEye,
  TbEyeOff,
  TbArrowLeft,
  TbCheck,
  TbRefresh,
  TbSparkles,
  TbCircleCheckFilled,
  TbLockCheck,
  TbAlertTriangle,
  TbUserPlus,
  TbBrandGoogle,
} from 'react-icons/tb';
import { apiService } from '../services/api';

export const ForgotPasswordModal = ({
  isOpen,
  onClose,
  onSwitchToLogin,
  onSwitchToRegister,
  onResetSuccess,
}) => {
  // Steps: 'email' | 'otp' | 'reset' | 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Refs for 6 OTP inputs
  const otpInputRefs = useRef([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setDemoOtp('');
      setResetToken('');
      setIsGoogleAccount(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setErrorCode('');
      setLoading(false);
    }
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  if (!isOpen) return null;

  // Calculate Password Strength (0 to 4)
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(newPassword);

  const getStrengthLabel = (score) => {
    if (!newPassword) return { text: 'Chưa nhập', color: '#94a3b8' };
    if (score <= 1) return { text: 'Yếu (Cần >= 6 ký tự)', color: '#ef4444' };
    if (score === 2) return { text: 'Trung bình (Nên thêm số & chữ hoa)', color: '#f59e0b' };
    if (score === 3) return { text: 'Khá mạnh (Tốt)', color: '#3b82f6' };
    return { text: 'Rất mạnh (Bảo mật tối đa)', color: '#10b981' };
  };

  // 🟢 STEP 1: Gửi Yêu Cầu Email Khôi Phục (Gọi API Backend)
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ email hợp lệ!');
      setErrorCode('INVALID_FORMAT');
      return;
    }
    setError('');
    setErrorCode('');
    setLoading(true);

    try {
      const res = await apiService.forgotPassword(email.trim());

      if (res.success) {
        setDemoOtp(res.otp_demo || '892341');
        setIsGoogleAccount(Boolean(res.is_google_account));
        setStep('otp');
        setCountdown(60);
        setIsCounting(true);
        // Auto-focus ô OTP đầu tiên
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 100);
      } else {
        setError(res.message || 'Không thể xử lý yêu cầu khôi phục mật khẩu.');
        setErrorCode(res.code || 'UNKNOWN_ERROR');
      }
    } catch (err) {
      setError('Lỗi kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP box changes
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const split = pasted.split('');
      setOtp(split);
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
    }
  };

  // 🟢 STEP 2: Xác Thực Mã OTP (Gọi API Backend)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã OTP!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiService.verifyOtp(email.trim(), enteredOtp);

      if (res.success && res.reset_token) {
        setResetToken(res.reset_token);
        setStep('reset');
      } else {
        setError(res.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
        setErrorCode(res.code || 'OTP_INVALID');
      }
    } catch (err) {
      setError('Lỗi xác thực mã OTP với máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // Gửi Lại Mã OTP
  const handleResendOtp = async () => {
    if (isCounting) return;
    setLoading(true);
    setError('');

    try {
      const res = await apiService.forgotPassword(email.trim());
      if (res.success) {
        setDemoOtp(res.otp_demo || '892341');
        setOtp(['', '', '', '', '', '']);
        setCountdown(60);
        setIsCounting(true);
        if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Không thể gửi lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 STEP 3: Đặt Lại Mật Khẩu Mới (Gọi API Backend)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiService.resetPassword(email.trim(), resetToken, newPassword);

      if (res.success) {
        if (res.token && res.user) {
          localStorage.setItem('tripnest_user', JSON.stringify({ ...res.user, token: res.token }));
        }
        setStep('success');
        if (onResetSuccess) {
          onResetSuccess(email, newPassword);
        }
      } else {
        setError(res.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ khi cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = getStrengthLabel(strengthScore);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-container"
        style={{
          width: '470px',
          maxWidth: '94vw',
          padding: '2rem',
          borderRadius: '16px',
          background: '#ffffff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          fontFamily: "'Be Vietnam Pro', sans-serif",
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {step !== 'email' && step !== 'success' ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setErrorCode('');
                if (step === 'otp') setStep('email');
                if (step === 'reset') setStep('otp');
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <TbArrowLeft style={{ fontSize: '1.1rem' }} />
            </button>
          ) : (
            <div style={{ width: '34px' }} />
          )}

          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {step === 'email' && 'Khôi Phục Mật Khẩu'}
            {step === 'otp' && 'Xác Thực Mã OTP'}
            {step === 'reset' && 'Tạo Mật Khẩu Mới'}
            {step === 'success' && 'Thành Công'}
          </h2>

          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'static', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <TbX />
          </button>
        </div>

        {/* 3-Step Progress Indicator */}
        {step !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1.2rem 0 0.5rem 0' }}>
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '4px',
                background: '#e11d48',
                transition: 'all 0.3s ease',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '4px',
                background: step === 'otp' || step === 'reset' ? '#e11d48' : '#e2e8f0',
                transition: 'all 0.3s ease',
              }}
            />
            <div
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '4px',
                background: step === 'reset' ? '#e11d48' : '#e2e8f0',
                transition: 'all 0.3s ease',
              }}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* THÔNG BÁO LỖI & CẢNH BÁO CHI TIẾT (ERROR & SECURITY ALERTS)     */}
        {/* ------------------------------------------------------------- */}
        {error && (
          <div
            style={{
              background: errorCode === 'ACCOUNT_BANNED' ? '#fff7ed' : '#fef2f2',
              color: errorCode === 'ACCOUNT_BANNED' ? '#c2410c' : '#ef4444',
              border: `1px solid ${errorCode === 'ACCOUNT_BANNED' ? '#fed7aa' : '#fecaca'}`,
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginTop: '1rem',
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <TbAlertTriangle style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{error}</strong>
                {/* Gợi ý Tạo Tài Khoản Nhanh khi Email không tồn tại */}
                {errorCode === 'EMAIL_NOT_FOUND' && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onSwitchToRegister) onSwitchToRegister();
                      }}
                      style={{
                        background: '#e11d48',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <TbUserPlus /> Đăng ký tài khoản mới ngay
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: NHẬP EMAIL                                            */}
        {/* ------------------------------------------------------------- */}
        {step === 'email' && (
          <div style={{ textAlign: 'center', paddingTop: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontSize: '2rem',
                boxShadow: '0 8px 20px rgba(225, 29, 72, 0.15)',
              }}
            >
              <TbMailFast />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
              Quên mật khẩu đăng nhập?
            </h3>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.88rem',
                lineHeight: 1.55,
                maxWidth: '350px',
                margin: '0 auto 1.5rem auto',
              }}
            >
              Nhập địa chỉ email tài khoản TripNest đã đăng ký để hệ thống kiểm tra và gửi mã xác thực OTP 6 số.
            </p>

            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  transition: 'border-color 0.2s',
                }}
              >
                <TbMail style={{ color: '#64748b', fontSize: '1.25rem' }} />
                <input
                  type="email"
                  placeholder="Ví dụ: vuminh.admin@tripnest.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.94rem',
                    background: 'transparent',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                className="primary-gradient-btn"
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'wait' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Đang kiểm tra tài khoản...' : 'Kiểm Tra & Gửi Mã OTP'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={onSwitchToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e11d48',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Quay lại màn hình Đăng nhập
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: NHẬP MÃ XÁC THỰC OTP                                  */}
        {/* ------------------------------------------------------------- */}
        {step === 'otp' && (
          <div style={{ textAlign: 'center', paddingTop: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontSize: '2rem',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.15)',
              }}
            >
              <TbShieldCheck />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Nhập mã OTP 6 chữ số
            </h3>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.86rem',
                lineHeight: 1.5,
                maxWidth: '340px',
                margin: '0 auto 1.25rem auto',
              }}
            >
              Mã xác nhận bảo mật đã được tạo cho email: <br />
              <strong style={{ color: '#0f172a' }}>{email}</strong>
            </p>

            {/* Google Account Special Badge */}
            {isGoogleAccount && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textAlign: 'left',
                }}
              >
                <TbBrandGoogle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                <span>
                  Tài khoản này liên kết với Google. Bạn có thể tạo mật khẩu mới để đăng nhập trực tiếp.
                </span>
              </div>
            )}

            {/* Quick Demo OTP Tester Badge */}
            {demoOtp && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.82rem',
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '1.25rem',
                }}
              >
                <TbSparkles style={{ color: '#f59e0b' }} />
                <span>
                  Mã OTP thử nghiệm nhanh: <strong style={{ color: '#e11d48', letterSpacing: '2px' }}>{demoOtp}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(demoOtp.split(''))}
                  style={{
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '4px',
                  }}
                >
                  Nhập nhanh
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 6 OTP Input Boxes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      borderRadius: '10px',
                      border: digit ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
                      background: digit ? '#fff1f2' : '#f8fafc',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      color: '#0f172a',
                      outline: 'none',
                      boxShadow: digit ? '0 0 0 3px rgba(225, 29, 72, 0.1)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="primary-gradient-btn"
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  cursor: loading ? 'wait' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Đang xác minh OTP...' : 'Xác Nhận & Tiếp Tục'}
              </button>
            </form>

            {/* Resend Countdown */}
            <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
              {isCounting ? (
                <span>
                  Chưa nhận được mã? Gửi lại sau <strong style={{ color: '#e11d48' }}>{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e11d48',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TbRefresh /> Gửi lại mã OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: TẠO MẬT KHẨU MỚI                                      */}
        {/* ------------------------------------------------------------- */}
        {step === 'reset' && (
          <div style={{ paddingTop: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  fontSize: '2rem',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.15)',
                }}
              >
                <TbKey />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Thiết Lập Mật Khẩu Mới
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                Mật khẩu mới cho tài khoản <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* New Password Input */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Mật khẩu mới (Tối thiểu 6 ký tự) *
                </label>
                <div
                  style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.7rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                  }}
                >
                  <TbKey style={{ color: '#64748b', fontSize: '1.2rem' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
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

                {/* Password Strength Meter */}
                {newPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                      <div
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background: strengthScore >= 1 ? strengthLabel.color : '#e2e8f0',
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background: strengthScore >= 2 ? strengthLabel.color : '#e2e8f0',
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background: strengthScore >= 3 ? strengthLabel.color : '#e2e8f0',
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          borderRadius: '2px',
                          background: strengthScore >= 4 ? strengthLabel.color : '#e2e8f0',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthLabel.color }}>
                      Độ mạnh: {strengthLabel.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Xác nhận lại mật khẩu mới *
                </label>
                <div
                  style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.7rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f8fafc',
                  }}
                >
                  <TbLockCheck style={{ color: '#64748b', fontSize: '1.2rem' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                  >
                    {showConfirmPassword ? <TbEyeOff /> : <TbEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="primary-gradient-btn"
                style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  marginTop: '0.5rem',
                  cursor: loading ? 'wait' : 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Đang cập nhật mật khẩu...' : 'Đổi Mật Khẩu & Đăng Nhập'}
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STEP 4: MÀN HÌNH THÀNH CÔNG                                   */}
        {/* ------------------------------------------------------------- */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                fontSize: '2.5rem',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.2)',
              }}
            >
              <TbCircleCheckFilled />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Đổi Mật Khẩu Thành Công!
            </h3>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                maxWidth: '320px',
                margin: '0 auto 1.75rem auto',
              }}
            >
              Mật khẩu mới của tài khoản <strong style={{ color: '#0f172a' }}>{email}</strong> đã được cập nhật thành công vào cơ sở dữ liệu.
            </p>

            <button
              type="button"
              className="primary-gradient-btn"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.96rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                onClose();
                if (onSwitchToLogin) onSwitchToLogin();
              }}
            >
              Đăng Nhập Ngay Bây Giờ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
