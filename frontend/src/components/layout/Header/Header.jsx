import './Header.css';
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
  TbLogout,
  TbX,
  TbMapPin,
} from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';

export const Header = ({
  onSearch,
  searchParams = {},
  currency,
  setCurrency,
  onOpenAuth,
  onOpenBookings,
  onOpenWishlist,
  onOpenChangePassword,
  onOpenHost,
  onOpenAdmin,
  wishlistCount = 0,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [destination, setDestination] = useState(searchParams.destination || '');
  const [guests, setGuests] = useState(searchParams.guests || 1);
  const [checkInDate, setCheckInDate] = useState(searchParams.checkInDate || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.checkOutDate || '');
  const [activeField, setActiveField] = useState('where');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const whereInputRef = useRef(null);
  const checkInInputRef = useRef(null);
  const checkOutInputRef = useRef(null);

  // Sync with external searchParams changes
  useEffect(() => {
    setDestination(searchParams.destination || '');
    setGuests(searchParams.guests || 1);
    setCheckInDate(searchParams.checkInDate || '');
    setCheckOutDate(searchParams.checkOutDate || '');
  }, [searchParams]);

  // Redux user state
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userInfo);

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
    if (e) e.stopPropagation();
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

        {/* In-Place Expandable Search Bar */}
        <div className={`search-bar-container ${isSearchExpanded ? 'is-expanded' : ''}`} ref={searchRef}>
          {!isSearchExpanded ? (
            /* Mode 1: Compact Search Pill */
            <div
              className="search-bar-compact"
              onClick={() => {
                setIsSearchExpanded(true);
                setActiveField('where');
              }}
              title="Nhấp để mở rộng tìm kiếm"
            >
              <button type="button" className="search-item-btn">
                {destination || 'Bất cứ đâu'}
              </button>
              <div className="search-divider" />
              <button type="button" className="search-item-btn">
                {checkInDate ? `${checkInDate} - ${checkOutDate || '...'}` : 'Tuần bất kỳ'}
              </button>
              <div className="search-divider" />
              <button type="button" className="search-item-btn muted">
                {guests > 1 ? `${guests} khách` : 'Thêm khách'}
              </button>
              <div
                className="search-action-circle"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchExpanded(true);
                  setActiveField('where');
                }}
              >
                <TbSearch />
              </div>
            </div>
          ) : (
            /* Mode 2: In-Place Full Search Bar */
            <div className="search-bar-expanded-inline" onClick={(e) => e.stopPropagation()}>
              {/* Field 1: Địa điểm */}
              <div
                className={`search-inline-field where ${activeField === 'where' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveField('where');
                  whereInputRef.current?.focus();
                }}
              >
                <span className="search-inline-label">Địa điểm</span>
                <input
                  ref={whereInputRef}
                  type="text"
                  placeholder="Bạn muốn đi đâu? (Đà Lạt, Phú Quốc...)"
                  className="search-inline-input"
                  value={destination}
                  onFocus={() => setActiveField('where')}
                  onChange={(e) => setDestination(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(e)}
                />

                {/* Quick Cities Dropdown */}
                {activeField === 'where' && (
                  <div className="header-dest-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="header-dest-title">Điểm đến nổi bật tại Việt Nam (50 chỗ ở)</div>
                    <div className="header-dest-grid">
                      {['Đà Lạt', 'Phú Quốc', 'Hội An', 'Nha Trang', 'Sa Pa', 'Đà Nẵng', 'Hạ Long', 'Hà Nội', 'Quy Nhơn', 'Vũng Tàu'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="header-dest-item"
                          onClick={() => {
                            setDestination(c);
                            setActiveField('checkIn');
                            checkInInputRef.current?.showPicker?.();
                          }}
                        >
                          <span className="header-dest-pin">📍</span>
                          <span className="header-dest-name">{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`search-inline-divider ${activeField === 'where' || activeField === 'checkIn' ? 'hidden' : ''}`} />

              {/* Field 2: Nhận phòng */}
              <div
                className={`search-inline-field date ${activeField === 'checkIn' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveField('checkIn');
                  checkInInputRef.current?.showPicker?.();
                }}
              >
                <span className="search-inline-label">Nhận phòng</span>
                <input
                  ref={checkInInputRef}
                  type="date"
                  className="search-inline-input date-input"
                  value={checkInDate}
                  onFocus={() => setActiveField('checkIn')}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>

              <div className={`search-inline-divider ${activeField === 'checkIn' || activeField === 'checkOut' ? 'hidden' : ''}`} />

              {/* Field 3: Trả phòng */}
              <div
                className={`search-inline-field date ${activeField === 'checkOut' ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveField('checkOut');
                  checkOutInputRef.current?.showPicker?.();
                }}
              >
                <span className="search-inline-label">Trả phòng</span>
                <input
                  ref={checkOutInputRef}
                  type="date"
                  className="search-inline-input date-input"
                  value={checkOutDate}
                  onFocus={() => setActiveField('checkOut')}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>

              <div className={`search-inline-divider ${activeField === 'checkOut' || activeField === 'guests' ? 'hidden' : ''}`} />

              {/* Field 4: Số khách */}
              <div
                className={`search-inline-field guests ${activeField === 'guests' ? 'is-active' : ''}`}
                onClick={() => setActiveField('guests')}
              >
                <span className="search-inline-label">Số khách</span>
                <div className="search-inline-guest-row">
                  <button
                    type="button"
                    className="search-guest-counter-btn"
                    onClick={(e) => { e.stopPropagation(); setGuests(Math.max(1, guests - 1)); }}
                    title="Giảm khách"
                  >-</button>
                  <span className="search-guest-count-val">{guests} khách</span>
                  <button
                    type="button"
                    className="search-guest-counter-btn"
                    onClick={(e) => { e.stopPropagation(); setGuests(guests + 1); }}
                    title="Tăng khách"
                  >+</button>
                </div>
              </div>

              {/* Search Submit CTA Button */}
              <button
                type="button"
                className="search-cta-submit-btn"
                onClick={handleExecuteSearch}
              >
                <TbSearch style={{ fontSize: '1.1rem' }} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="header-actions">
          {user?.role === 'host' ? (
            <button className="host-btn" onClick={onOpenHost}>
              Kênh Chủ Nhà
            </button>
          ) : user?.role !== 'admin' ? (
            <button className="host-btn" onClick={onOpenHost}>
              Cho thuê chỗ ở
            </button>
          ) : null}

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
                  $ USD (Đô la Mỹ)
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

          {/* User Profile Pill Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              className="user-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <TbMenu2 style={{ fontSize: '1.1rem' }} />
              <div className="user-avatar-circle">
                {user?.avatar_url || user?.avatar ? (
                  <img
                    src={user.avatar_url || user.avatar}
                    alt={user.full_name || user.name || "Avatar"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
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
                {Object.keys(user || {}).length > 0 && (user?.id || user?.email) ? (
                  <>
                    <div style={{ padding: '0.85rem 1.15rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.full_name || user.name || 'Người dùng'}
                        </p>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            background:
                              user.role === 'admin'
                                ? '#eef2ff'
                                : user.role === 'host'
                                ? '#ecfdf5'
                                : '#f1f5f9',
                            color:
                              user.role === 'admin'
                                ? '#4f46e5'
                                : user.role === 'host'
                                ? '#059669'
                                : '#64748b',
                            border: user.role === 'admin' ? '1px solid #c7d2fe' : 'none',
                          }}
                        >
                          {user.role === 'admin' ? 'Quản Trị' : user.role === 'host' ? 'Chủ Nhà' : 'Khách'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </p>
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

                    {user?.role === 'admin' && (
                      <>
                        <div className="menu-separator" />
                        <button
                          className="menu-option-item"
                          onClick={() => { setIsMenuOpen(false); onOpenAdmin(); }}
                          style={{ color: '#4f46e5', fontWeight: 800 }}
                        >
                          <TbCompass /> Cổng Quản trị Admin
                        </button>
                      </>
                    )}

                    {user?.role === 'host' && (
                      <>
                        <div className="menu-separator" />
                        <button
                          className="menu-option-item"
                          onClick={() => { setIsMenuOpen(false); onOpenHost(); }}
                          style={{ color: '#059669', fontWeight: 700 }}
                        >
                          <TbHomePlus /> Kênh Quản lý Chủ Nhà
                        </button>
                      </>
                    )}

                    {user?.role !== 'admin' && user?.role !== 'host' && (
                      <>
                        <div className="menu-separator" />
                        <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenHost(); }}>
                          <TbHomePlus /> Đăng ký trở thành Chủ Nhà
                        </button>
                      </>
                    )}

                    <div className="menu-separator" />
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onLogout(); }} style={{ color: '#ef4444', fontWeight: 600 }}>
                      <TbLogout /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="menu-option-item highlight"
                      onClick={() => { setIsMenuOpen(false); onOpenAuth('login'); }}
                    >
                      Đăng nhập
                    </button>
                    <button
                      className="menu-option-item"
                      onClick={() => { setIsMenuOpen(false); onOpenAuth('register'); }}
                    >
                      Đăng ký tài khoản
                    </button>
                    <div className="menu-separator" />
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); onOpenHost(); }}>
                      <TbHomePlus /> Cho thuê chỗ ở trên TripNest
                    </button>
                    <button className="menu-option-item" onClick={() => { setIsMenuOpen(false); alert('Trung tâm trợ giúp khách hàng TripNest 24/7 Hotline: 1900 6868'); }}>
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
