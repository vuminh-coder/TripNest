import React, { useState, useEffect, useRef } from 'react';
import {
  TbCompass,
  TbSearch,
  TbWorld,
  TbMenu2,
  TbUserCircle,
  TbHeart,
  TbCalendarEvent,
  TbLock,
  TbHomePlus,
  TbHelpCircle,
  TbX,
} from 'react-icons/tb';

export const Header = ({
  onSearch,
  currency,
  setCurrency,
  onOpenAuth,
  onOpenBookings,
  onOpenWishlist,
  onOpenChangePassword,
  onOpenHost,
  onOpenAdmin,
  wishlistCount = 0,
  user = null,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [destination, setDestination] = useState('');
  const [guests, setGuests] = useState(1);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExecuteSearch = (e) => {
    if (e) e.stopPropagation();
    onSearch({
      destination: destination.trim(),
      guests,
      checkInDate,
      checkOutDate,
    });
    setIsSearchExpanded(false);
  };

  const clearSearch = (e) => {
    e.stopPropagation();
    setDestination('');
    setGuests(1);
    setCheckInDate('');
    setCheckOutDate('');
    onSearch({});
  };

  return (
    <header className={`header-sticky ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* Brand Logo */}
        <div
          className="brand-logo"
          onClick={() => {
            clearSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="logo-icon-badge">
            <TbCompass />
          </div>
          <div className="logo-text-group">
            <span className="logo-brand-title">TripNest</span>
            <span className="logo-brand-tagline">Đặt phòng & Trải nghiệm</span>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="search-bar-container" ref={searchRef} style={{ position: 'relative' }}>
          <div
            className="search-bar-compact"
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          >
            <button className="search-item-btn">
              {destination || 'Bất cứ đâu'}
            </button>
            <div className="search-divider" />
            <button className="search-item-btn">
              {checkInDate ? `${checkInDate} - ${checkOutDate || '...'}` : 'Tuần bất kỳ'}
            </button>
            <div className="search-divider" />
            <button className="search-item-btn muted">
              {guests > 1 ? `${guests} khách` : 'Thêm khách'}
            </button>
            <div className="search-action-circle" onClick={handleExecuteSearch}>
              <TbSearch />
            </div>
          </div>

          {/* Expanded Search Flyout Modal */}
          {isSearchExpanded && (
            <div className="search-expanded-flyout">
              <div className="search-box-field active">
                <span className="search-label">Địa điểm</span>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu? (Đà Lạt, Phú Quốc...)"
                  className="search-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(e)}
                />
              </div>

              <div className="search-box-field">
                <span className="search-label">Nhận phòng</span>
                <input
                  type="date"
                  className="search-input"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>

              <div className="search-box-field">
                <span className="search-label">Trả phòng</span>
                <input
                  type="date"
                  className="search-input"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>

              <div className="search-box-field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="search-label">Số khách</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      style={{ border: '1px solid #ccc', borderRadius: '50%', width: '24px', height: '24px' }}
                      onClick={(e) => { e.stopPropagation(); setGuests(Math.max(1, guests - 1)); }}
                    >-</button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{guests}</span>
                    <button
                      type="button"
                      style={{ border: '1px solid #ccc', borderRadius: '50%', width: '24px', height: '24px' }}
                      onClick={(e) => { e.stopPropagation(); setGuests(guests + 1); }}
                    >+</button>
                  </div>
                </div>

                <button
                  className="primary-gradient-btn"
                  style={{ width: 'auto', padding: '0.65rem 1.25rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleExecuteSearch}
                >
                  <TbSearch /> Tìm kiếm
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="header-actions">
          {/* Quick Admin Access Button */}
          <button
            className="host-btn"
            style={{
              background: '#fff1f2',
              color: '#e11d48',
              borderColor: '#fecdd3',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
            }}
            onClick={onOpenAdmin}
            title="Mở Trang Quản Trị Hệ Thống TripNest"
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e11d48' }} />
            Quản trị Admin
          </button>

          <button className="host-btn" onClick={onOpenHost}>
            Cho thuê chỗ ở
          </button>

          {/* Currency Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-pill-btn"
              title="Chọn tiền tệ / ngôn ngữ"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <TbWorld />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, marginLeft: '4px' }}>
                {currency}
              </span>
            </button>

            {isLangOpen && (
              <div
                className="user-dropdown-card"
                style={{ width: '160px', top: '40px' }}
                onMouseLeave={() => setIsLangOpen(false)}
              >
                <div style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#717171' }}>
                  CHỌN TIỀN TỆ
                </div>
                <button
                  className={`menu-option-item ${currency === 'VND' ? 'highlight' : ''}`}
                  onClick={() => { setCurrency('VND'); setIsLangOpen(false); }}
                >
                  ₫ VND (Việt Nam)
                </button>
                <button
                  className={`menu-option-item ${currency === 'USD' ? 'highlight' : ''}`}
                  onClick={() => { setCurrency('USD'); setIsLangOpen(false); }}
                >
                  $ USD (United States)
                </button>
                <button
                  className={`menu-option-item ${currency === 'EUR' ? 'highlight' : ''}`}
                  onClick={() => { setCurrency('EUR'); setIsLangOpen(false); }}
                >
                  € EUR (Euro)
                </button>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Button */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <TbMenu2 style={{ fontSize: '1.1rem' }} />
              <div className="user-avatar-circle">
                {user ? (
                  <span style={{ fontWeight: 700, color: '#ff385c' }}>{user.name[0]}</span>
                ) : (
                  <TbUserCircle />
                )}
              </div>
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ff385c',
                    color: 'white',
                    fontSize: '0.68rem',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="user-dropdown-card">
                {user ? (
                  <>
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #ebebeb' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>{user.name}</p>
                      <p style={{ color: '#717171', fontSize: '0.8rem' }}>{user.email}</p>
                    </div>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenBookings(); }}>
                      <TbCalendarEvent /> Chuyến đi của tôi
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenWishlist(); }}>
                      <TbHeart /> Danh sách yêu thích ({wishlistCount})
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenChangePassword(); }}>
                      <TbLock /> Đổi mật khẩu
                    </button>
                    <div className="menu-separator" />
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenAdmin(); }} style={{ color: '#0284c7', fontWeight: 700 }}>
                      <TbCompass /> Trang quản trị Admin
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenHost(); }}>
                      <TbHomePlus /> Quản lý cho thuê phòng
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onLogout(); }}>
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button className="menu-option-item highlight" onClick={() => { setIsMenuOpen(false); onOpenAuth('register'); }}>
                      Đăng ký tài khoản
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenAuth('login'); }}>
                      Đăng nhập
                    </button>
                    <div className="menu-separator" />
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenWishlist(); }}>
                      <TbHeart /> Danh sách yêu thích ({wishlistCount})
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenHost(); }}>
                      <TbHomePlus /> Cho thuê chỗ ở cùng TripNest
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); alert('Trung tâm hỗ trợ TripNest 24/7: support@tripnest.com'); }}>
                      <TbHelpCircle /> Trợ giúp
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
