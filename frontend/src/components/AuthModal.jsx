import React, { useState } from 'react';
import { TbX, TbMail, TbLock, TbUser, TbBrandGoogle, TbBrandFacebook } from 'react-icons/tb';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) => {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || (tab === 'register' && !name)) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const userData = {
      name: tab === 'register' ? name : email.split('@')[0],
      email: email,
      token: 'mock-token-' + Date.now(),
    };

    localStorage.setItem('tripnest_user', JSON.stringify(userData));
    if (onAuthSuccess) onAuthSuccess(userData);
    onClose();
  };

  const handleSocialMock = (provider) => {
    const userData = {
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      token: 'social-token-' + Date.now(),
    };
    localStorage.setItem('tripnest_user', JSON.stringify(userData));
    if (onAuthSuccess) onAuthSuccess(userData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ width: '480px', maxWidth: '95vw', padding: '2rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #ebebeb' }}>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {tab === 'login' ? 'Đăng nhập vào TripNest' : 'Tạo tài khoản TripNest'}
          </h2>
          <div style={{ width: '36px' }} />
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ebebeb', margin: '1.25rem 0' }}>
          <button
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderBottom: tab === 'login' ? '2px solid #ff385c' : '2px solid transparent',
              color: tab === 'login' ? '#ff385c' : '#717171',
            }}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Đăng nhập
          </button>
          <button
            style={{
              flex: 1,
              padding: '0.75rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderBottom: tab === 'register' ? '2px solid #ff385c' : '2px solid transparent',
              color: tab === 'register' ? '#ff385c' : '#717171',
            }}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div style={{ background: '#fff0f3', color: '#e00b41', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TbUser style={{ color: '#717171', fontSize: '1.2rem' }} />
              <input
                type="text"
                placeholder="Họ và tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ border: 'none', width: '100%', fontSize: '0.92rem' }}
              />
            </div>
          )}

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbMail style={{ color: '#717171', fontSize: '1.2rem' }} />
            <input
              type="email"
              placeholder="Địa chỉ Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ border: 'none', width: '100%', fontSize: '0.92rem' }}
            />
          </div>

          <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TbLock style={{ color: '#717171', fontSize: '1.2rem' }} />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ border: 'none', width: '100%', fontSize: '0.92rem' }}
            />
          </div>

          <button type="submit" className="primary-gradient-btn" style={{ marginTop: '0.5rem' }}>
            {tab === 'login' ? 'Tiếp tục đăng nhập' : 'Hoàn tất đăng ký'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#ebebeb' }} />
          <span style={{ fontSize: '0.78rem', color: '#717171', textTransform: 'uppercase' }}>hoặc tiếp tục với</span>
          <div style={{ flex: 1, height: '1px', background: '#ebebeb' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '1px solid #222',
              padding: '0.65rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            onClick={() => handleSocialMock('Google')}
          >
            <TbBrandGoogle style={{ fontSize: '1.2rem' }} /> Tiếp tục với Google
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '1px solid #222',
              padding: '0.65rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            onClick={() => handleSocialMock('Facebook')}
          >
            <TbBrandFacebook style={{ fontSize: '1.2rem', color: '#1877f2' }} /> Tiếp tục với Facebook
          </button>
        </div>
      </div>
    </div>
  );
};
export default AuthModal;
