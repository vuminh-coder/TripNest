import React, { useState, useEffect } from 'react';
import './host.css';
import HostListingWizard from './HostListingWizard';
import { TbCompass, TbBuildingCastle, TbArrowLeft, TbPlus, TbChartBar, TbHome, TbCalendarEvent, TbWallet, TbCoin, TbCalendarCheck, TbStarFilled, TbTrendingUp, TbToggleLeft, TbToggleRight, TbTrash, TbEye, TbEdit, TbCheck, TbBuildingBank, TbShieldCheck, TbClock, TbAward, TbUsers, TbSearch, TbFilter, TbX, TbDownload, TbChecklist, TbAlertCircle } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

const DEFAULT_LISTINGS = [
  {
    id: 'ACC-1',
    roomId: '1',
    nameVi: 'Biệt thự The Oasis Garden Retreat Đà Lạt',
    accommodationType: 'villa',
    city: 'Đà Lạt',
    district: 'Phường 10',
    address: '15 Đường Khe Sanh, Đà Lạt',
    priceVND: 2500000,
    priceUSD: 100,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    rating: 4.98,
    reviewsCount: 34,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    ],
    amenities: ['Hồ bơi riêng', 'WiFi tốc độ cao', 'Bếp nấu ăn đầy đủ', 'Bếp nướng BBQ'],
    createdAt: '12/06/2026',
  },
  {
    id: 'ACC-2',
    roomId: '2',
    nameVi: 'Grand Sunset Ocean Villa Phú Quốc',
    accommodationType: 'resort',
    city: 'Phú Quốc',
    district: 'Bãi Trường',
    address: 'Đường Trần Hưng Đạo, Dương Đông',
    priceVND: 4200000,
    priceUSD: 168,
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    bathrooms: 4,
    rating: 4.95,
    reviewsCount: 28,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
    ],
    amenities: ['View thiên nhiên tuyệt đẹp', 'Hồ bơi riêng', 'WiFi tốc độ cao', 'Điều hòa 2 chiều'],
    createdAt: '18/07/2026',
  },
  {
    id: 'ACC-3',
    roomId: '3',
    nameVi: 'Mây Homestay & Coffee View Thung Lũng Sapa',
    accommodationType: 'homestay',
    city: 'Sa Pa',
    district: 'Tả Van',
    address: 'Bản Tả Van, Sa Pa',
    priceVND: 1650000,
    priceUSD: 66,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1.5,
    rating: 4.92,
    reviewsCount: 19,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
    ],
    amenities: ['WiFi tốc độ cao', 'Chỗ đỗ xe miễn phí', 'Smart TV 4K'],
    createdAt: '02/08/2026',
  },
];

const DEFAULT_BOOKINGS = [
  {
    id: 'BK-101',
    code: 'TN-892145',
    guestName: 'Nguyễn Văn An',
    guestPhone: '0912 345 678',
    roomTitle: 'The Oasis Garden Retreat Đà Lạt',
    checkIn: '25/08/2026',
    checkOut: '28/08/2026',
    nights: 3,
    guests: 4,
    totalAmount: 7500000,
    hostEarnings: 6600000,
    status: 'confirmed',
  },
  {
    id: 'BK-102',
    code: 'TN-773412',
    guestName: 'Trần Thị Mai',
    guestPhone: '0988 776 554',
    roomTitle: 'Grand Sunset Ocean Villa Phú Quốc',
    checkIn: '29/08/2026',
    checkOut: '02/09/2026',
    nights: 4,
    guests: 6,
    totalAmount: 16800000,
    hostEarnings: 14784000,
    status: 'confirmed',
  },
  {
    id: 'BK-103',
    code: 'TN-654321',
    guestName: 'Lê Hoàng Nam',
    guestPhone: '0903 112 233',
    roomTitle: 'Mây Homestay & Coffee Sapa',
    checkIn: '05/09/2026',
    checkOut: '07/09/2026',
    nights: 2,
    guests: 2,
    totalAmount: 3300000,
    hostEarnings: 2904000,
    status: 'pending',
  },
];

export const HostDashboard = ({
  onSwitchToClient,
  onOpenRoomDetail,
  onListingsChange,
  currency = 'VND',
}) => {
  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'listings', 'bookings', 'payout'
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Edit Listing State
  const [editingListing, setEditingListing] = useState(null);

  // Filter & Search states
  const [listingSearch, setListingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // Listings State with LocalStorage
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_listings');
      return saved ? JSON.parse(saved) : DEFAULT_LISTINGS;
    } catch {
      return DEFAULT_LISTINGS;
    }
  });

  // Bookings State with LocalStorage
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  });

  // Bank Info State with LocalStorage
  const [bankInfo, setBankInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_bank');
      return saved
        ? JSON.parse(saved)
        : {
            bankName: 'Vietcombank (VCB)',
            accountNumber: '9988776655',
            accountHolder: 'NGUYEN VAN AN',
          };
    } catch {
      return {
        bankName: 'Vietcombank (VCB)',
        accountNumber: '9988776655',
        accountHolder: 'NGUYEN VAN AN',
      };
    }
  });

  const [payoutHistory, setPayoutHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_payout_history');
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'PO-103', date: '15/08/2026', amount: 23500000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
            { id: 'PO-102', date: '01/08/2026', amount: 18200000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
            { id: 'PO-101', date: '15/07/2026', amount: 26800000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
          ];
    } catch {
      return [
        { id: 'PO-103', date: '15/08/2026', amount: 23500000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
        { id: 'PO-102', date: '01/08/2026', amount: 18200000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
        { id: 'PO-101', date: '15/07/2026', amount: 26800000, note: 'Chuyển khoản Vietcombank', status: 'completed' },
      ];
    }
  });

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('tripnest_host_listings', JSON.stringify(listings));
    if (onListingsChange) onListingsChange(listings);
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('tripnest_host_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('tripnest_host_bank', JSON.stringify(bankInfo));
  }, [bankInfo]);

  useEffect(() => {
    localStorage.setItem('tripnest_host_payout_history', JSON.stringify(payoutHistory));
  }, [payoutHistory]);

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  // Dynamic KPI Calculations
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalHostEarnings = confirmedBookings.reduce((sum, b) => sum + (b.hostEarnings || 0), 0) + 44200000;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  // Toggle listing status
  const handleToggleStatus = (id) => {
    setListings(
      listings.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'published' ? 'paused' : 'published';
          if (nextStatus === 'published') {
            toast.success('Mở bán chỗ ở', 'Đã kích hoạt mở bán chỗ ở thành công!');
          } else {
            toast.info('Tạm dừng kinh doanh', 'Đã tạm dừng nhận khách cho chỗ ở.');
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  // Delete listing
  const handleDeleteListing = async (id) => {
    const isConfirmed = await confirm({
      title: 'Xóa chỗ ở cho thuê?',
      message: 'Bạn có chắc chắn muốn xóa chỗ ở này khỏi danh sách cho thuê không?',
      type: 'danger',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
    });

    if (isConfirmed) {
      setListings(listings.filter((item) => item.id !== id));
      toast.success('Đã xóa chỗ ở', 'Đã xóa chỗ ở thành công khỏi danh sách.');
    }
  };

  // Create new listing from wizard
  const handleListingCreated = (newListing) => {
    setListings([newListing, ...listings]);
    setActiveTab('listings');
    toast.success(
      'Đăng bán chỗ ở mới thành công!',
      'Chỗ nghỉ của bạn đã sẵn sàng đón tiếp khách du lịch trên TripNest.'
    );
  };

  // Update existing listing
  const handleSaveEditListing = (e) => {
    e.preventDefault();
    if (!editingListing) return;
    setListings(
      listings.map((l) => (l.id === editingListing.id ? editingListing : l))
    );
    setEditingListing(null);
    toast.success('Cập nhật thành công', 'Đã cập nhật thông tin chỗ ở thành công!');
  };

  // Booking Actions
  const handleApproveBooking = (id) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b))
    );
    toast.success('Duyệt đơn thành công', 'Đã xác nhận đơn đặt phòng cho khách.');
  };

  const handleCancelBooking = async (id) => {
    const isConfirmed = await confirm({
      title: 'Hủy đơn đặt phòng?',
      message: 'Bạn có chắc chắn muốn từ chối / hủy đơn đặt phòng này?',
      type: 'danger',
      confirmText: 'Xác nhận hủy',
      cancelText: 'Giữ lại',
    });

    if (isConfirmed) {
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
      toast.info('Đã hủy đơn', 'Đã hủy đơn đặt phòng.');
    }
  };

  // Request Payout Simulation
  const handleRequestPayout = () => {
    const availableAmount = 14500000;
    if (availableAmount <= 0) {
      toast.warning('Không đủ số dư', 'Số dư khả dụng hiện tại chưa đủ để thực hiện rút tiền.');
      return;
    }

    setIsRequestingPayout(true);
    setTimeout(() => {
      const newTransaction = {
        id: 'PO-' + Date.now().toString().slice(-4),
        date: new Date().toLocaleDateString('vi-VN'),
        amount: availableAmount,
        note: `Chuyển khoản ${bankInfo.bankName}`,
        status: 'completed',
      };
      setPayoutHistory([newTransaction, ...payoutHistory]);
      setIsRequestingPayout(false);
      toast.success(
        'Rút tiền thành công!',
        `Đã chuyển ${formatPrice(availableAmount)} về tài khoản ${bankInfo.accountNumber} thành công!`
      );
    }, 900);
  };

  // Filtered Listings
  const filteredListings = listings.filter((item) => {
    if (!listingSearch.trim()) return true;
    const q = listingSearch.toLowerCase();
    return item.nameVi.toLowerCase().includes(q) || item.city.toLowerCase().includes(q);
  });

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
    const matchSearch =
      !bookingSearch.trim() ||
      b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.roomTitle.toLowerCase().includes(bookingSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="host-portal-page">

      {/* Host Portal Fixed Header */}
      <header className="host-portal-header">
        <div className="host-header-inner">
          <div className="host-brand-wrap" onClick={onSwitchToClient} title="Về trang chủ TripNest">
            <TbCompass style={{ fontSize: '1.8rem', color: '#ff385c' }} />
            <span className="host-brand-logo">TripNest</span>
            <span className="host-brand-badge">
              <TbAward style={{ color: '#d97706' }} /> Kênh Chủ Nhà
            </span>
          </div>

          <div className="host-header-actions">
            <button
              type="button"
              className="host-create-listing-btn"
              onClick={() => setIsWizardOpen(true)}
            >
              <TbPlus /> Đăng ký chỗ ở mới
            </button>

            <button
              type="button"
              className="host-switch-client-btn"
              onClick={onSwitchToClient}
            >
              <TbArrowLeft /> Về chế độ khách
            </button>

            <div className="host-profile-chip">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Host Avatar"
                className="host-avatar-img"
              />
              <span className="host-profile-name">Minh Vũ (Host)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="host-dashboard-main">
        {/* Welcome Banner */}
        <div className="host-welcome-banner">
          <div>
            <h2 className="host-welcome-title">
              Xin chào Minh Vũ! <span style={{ fontSize: '1.2rem' }}>👋</span>
            </h2>
            <p className="host-welcome-sub">
              Chào mừng bạn đến với trung tâm quản lý chỗ ở & doanh thu cao cấp của TripNest.
            </p>
          </div>

          <div className="host-welcome-stats">
            <div className="host-mini-stat">
              <div className="mini-stat-num">{listings.length}</div>
              <div className="mini-stat-lbl">Chỗ ở đang quản lý</div>
            </div>
            <div className="host-mini-stat">
              <div className="mini-stat-num" style={{ color: '#10b981' }}>4.96 ★</div>
              <div className="mini-stat-lbl">Điểm đánh giá uy tín</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="host-nav-tabs-bar">
          <button
            type="button"
            className={`host-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TbChartBar /> Tổng quan & Báo cáo
          </button>

          <button
            type="button"
            className={`host-tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <TbHome /> Danh sách chỗ ở
            <span className="tab-counter-badge">{listings.length}</span>
          </button>

          <button
            type="button"
            className={`host-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <TbCalendarEvent /> Đơn đặt phòng
            <span className="tab-counter-badge">
              {bookings.length} {pendingCount > 0 ? `(${pendingCount} chờ)` : ''}
            </span>
          </button>

          <button
            type="button"
            className={`host-tab-btn ${activeTab === 'payout' ? 'active' : ''}`}
            onClick={() => setActiveTab('payout')}
          >
            <TbWallet /> Ví doanh thu & Ngân hàng
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                       */}
        {/* ================================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* 4 High-Impact KPI Cards */}
            <div className="host-kpi-grid">
              <div className="kpi-luxury-card">
                <div>
                  <div className="kpi-label">Tổng doanh thu thực nhận</div>
                  <div className="kpi-value">{formatPrice(totalHostEarnings)}</div>
                  <span className="kpi-change-tag positive">
                    <TbTrendingUp /> +18.4% so với tháng trước
                  </span>
                </div>
                <div className="kpi-icon-box earnings">
                  <TbCoin />
                </div>
              </div>

              <div className="kpi-luxury-card">
                <div>
                  <div className="kpi-label">Tổng lượt khách đặt phòng</div>
                  <div className="kpi-value">{bookings.length} đơn</div>
                  <span className="kpi-change-tag positive">
                    <TbCalendarCheck /> {pendingCount > 0 ? `${pendingCount} đơn chờ duyệt` : 'Tất cả đã xác nhận'}
                  </span>
                </div>
                <div className="kpi-icon-box bookings">
                  <TbCalendarEvent />
                </div>
              </div>

              <div className="kpi-luxury-card">
                <div>
                  <div className="kpi-label">Điểm đánh giá trung bình</div>
                  <div className="kpi-value">4.96 ★</div>
                  <span className="kpi-change-tag" style={{ color: '#d97706' }}>
                    <TbAward /> Chủ nhà Siêu cấp
                  </span>
                </div>
                <div className="kpi-icon-box rating">
                  <TbStarFilled />
                </div>
              </div>

              <div className="kpi-luxury-card">
                <div>
                  <div className="kpi-label">Tỷ lệ lấp đầy phòng</div>
                  <div className="kpi-value">86%</div>
                  <span className="kpi-change-tag positive">
                    <TbTrendingUp /> Cao hơn mức trung bình 12%
                  </span>
                </div>
                <div className="kpi-icon-box occupancy">
                  <TbBuildingCastle />
                </div>
              </div>
            </div>

            {/* Revenue Chart Visualizer & Recent Bookings */}
            <div className="host-analytics-row">
              {/* Monthly Earnings Chart */}
              <div className="analytics-card-white">
                <div className="card-heading-row">
                  <h3 className="card-heading-title">
                    <TbChartBar style={{ color: '#ff385c' }} /> Doanh thu 6 tháng gần nhất
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Đơn vị: Triệu VNĐ</span>
                </div>

                <div className="revenue-bars-container">
                  {[
                    { month: 'Thg 3', val: 18.5, heightPercent: '38%' },
                    { month: 'Thg 4', val: 24.2, heightPercent: '50%' },
                    { month: 'Thg 5', val: 31.0, heightPercent: '64%' },
                    { month: 'Thg 6', val: 45.8, heightPercent: '88%' },
                    { month: 'Thg 7', val: 52.6, heightPercent: '100%' },
                    { month: 'Thg 8', val: 48.9, heightPercent: '92%' },
                  ].map((bar) => (
                    <div key={bar.month} className="revenue-bar-item">
                      <div className="revenue-bar-pill" style={{ height: bar.heightPercent }}>
                        <span className="revenue-bar-tooltip">{bar.val} Tr</span>
                      </div>
                      <span className="revenue-bar-label">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings Feed */}
              <div className="analytics-card-white">
                <div className="card-heading-row">
                  <h3 className="card-heading-title">
                    <TbClock style={{ color: '#2563eb' }} /> Đơn đặt phòng mới
                  </h3>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ff385c', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => setActiveTab('bookings')}
                  >
                    Xem tất cả ➔
                  </button>
                </div>

                <div className="mini-bookings-list">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="mini-booking-item">
                      <div>
                        <div className="booking-guest-title">{b.guestName}</div>
                        <div className="booking-room-subtitle">
                          {b.checkIn} ➔ {b.checkOut} ({b.nights} đêm)
                        </div>
                      </div>
                      <div className="booking-price-badge">
                        <span className="b-price">{formatPrice(b.totalAmount)}</span>
                        <span className={`b-status-pill ${b.status}`}>
                          {b.status === 'confirmed' ? 'Đã xác nhận' : b.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MY LISTINGS TABLE & CONTROLS                               */}
        {/* ================================================================= */}
        {activeTab === 'listings' && (
          <div className="host-table-card">
            <div className="host-table-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Quản lý chỗ ở của bạn ({filteredListings.length}/{listings.length})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Bật/tắt trạng thái mở bán và cập nhật thông tin bất động sản
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Search in Listings */}
                <div style={{ position: 'relative' }}>
                  <TbSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc thành phố..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    style={{
                      padding: '0.45rem 0.85rem 0.45rem 2rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      outline: 'none',
                      width: '200px',
                    }}
                  />
                  {listingSearch && (
                    <button
                      onClick={() => setListingSearch('')}
                      style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <TbX />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="host-create-listing-btn"
                  onClick={() => setIsWizardOpen(true)}
                >
                  <TbPlus /> Đăng ký chỗ ở mới
                </button>
              </div>
            </div>

            <table className="host-table">
              <thead>
                <tr>
                  <th>Chỗ ở & Vị trí</th>
                  <th>Loại hình</th>
                  <th>Giá niêm yết</th>
                  <th>Sức chứa</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-listing-cell">
                        <img src={item.thumbnail} alt={item.nameVi} className="table-listing-thumb" />
                        <div>
                          <div className="table-listing-name">{item.nameVi}</div>
                          <div className="table-listing-loc">{item.address || item.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#475569' }}>
                        {item.accommodationType}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{formatPrice(item.priceVND)}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}> / đêm</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {item.maxGuests} khách · {item.bedrooms} phòng ngủ
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`table-status-toggle ${item.status === 'published' ? 'active' : 'paused'}`}
                        onClick={() => handleToggleStatus(item.id)}
                        title="Bấm để chuyển trạng thái mở bán"
                      >
                        {item.status === 'published' ? (
                          <>
                            <TbToggleRight style={{ fontSize: '1.2rem' }} /> Đang mở bán
                          </>
                        ) : (
                          <>
                            <TbToggleLeft style={{ fontSize: '1.2rem' }} /> Tạm dừng
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <div className="table-action-btns" style={{ justifyContent: 'flex-end' }}>
                        {onOpenRoomDetail && (
                          <button
                            type="button"
                            className="table-icon-btn"
                            onClick={() => onOpenRoomDetail(item.roomId || item.id)}
                            title="Xem trang khách"
                          >
                            <TbEye />
                          </button>
                        )}
                        <button
                          type="button"
                          className="table-icon-btn"
                          onClick={() => setEditingListing({ ...item })}
                          title="Chỉnh sửa thông tin"
                        >
                          <TbEdit />
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn delete"
                          onClick={() => handleDeleteListing(item.id)}
                          title="Xóa chỗ ở này"
                        >
                          <TbTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: RESERVATIONS & BOOKINGS                                    */}
        {/* ================================================================= */}
        {activeTab === 'bookings' && (
          <div className="host-table-card">
            <div className="host-table-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Danh sách khách đặt phòng ({filteredBookings.length}/{bookings.length})
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Theo dõi lịch trình đến, duyệt đơn và quản lý thanh toán
                </p>
              </div>

              {/* Status Filter Tabs & Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ duyệt' },
                    { id: 'confirmed', label: 'Đã xác nhận' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBookingFilterStatus(tab.id)}
                      style={{
                        padding: '4px 10px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: bookingFilterStatus === tab.id ? '#ffffff' : 'transparent',
                        color: bookingFilterStatus === tab.id ? '#ff385c' : '#64748b',
                        boxShadow: bookingFilterStatus === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <TbSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Tìm tên, mã đặt..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    style={{
                      padding: '0.45rem 0.85rem 0.45rem 2rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      outline: 'none',
                      width: '160px',
                    }}
                  />
                </div>
              </div>
            </div>

            <table className="host-table">
              <thead>
                <tr>
                  <th>Mã đặt</th>
                  <th>Khách hàng</th>
                  <th>Chỗ ở</th>
                  <th>Thời gian lưu trú</th>
                  <th>Số khách</th>
                  <th>Thực nhận (Host)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: '#ff385c', fontSize: '0.85rem' }}>{b.code}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.guestName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{b.guestPhone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.roomTitle}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {b.checkIn} ➔ {b.checkOut}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{b.nights} đêm</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{b.guests} khách</span>
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '0.95rem' }}>
                        {formatPrice(b.hostEarnings)}
                      </strong>
                    </td>
                    <td>
                      <span className={`b-status-pill ${b.status}`}>
                        {b.status === 'confirmed' ? 'Đã xác nhận' : b.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {b.status === 'pending' && (
                          <button
                            type="button"
                            className="host-create-listing-btn"
                            style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
                            onClick={() => handleApproveBooking(b.id)}
                          >
                            <TbCheck /> Duyệt
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            type="button"
                            className="table-icon-btn delete"
                            style={{ width: '28px', height: '28px' }}
                            onClick={() => handleCancelBooking(b.id)}
                            title="Hủy đơn này"
                          >
                            <TbX />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: WALLET & PAYOUT BANK ACCOUNT                              */}
        {/* ================================================================= */}
        {activeTab === 'payout' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Payout Bank Account Card */}
            <div className="analytics-card-white">
              <div className="card-heading-row">
                <h3 className="card-heading-title">
                  <TbBuildingBank style={{ color: '#059669' }} /> Tài khoản nhận tiền thanh toán (Payout)
                </h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                  onClick={() => setIsEditingBank(!isEditingBank)}
                >
                  {isEditingBank ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {!isEditingBank ? (
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Ngân hàng:</span>
                    <strong style={{ color: '#0f172a' }}>{bankInfo.bankName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Số tài khoản:</span>
                    <strong style={{ color: '#0f172a', letterSpacing: '1px' }}>{bankInfo.accountNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chủ tài khoản:</span>
                    <strong style={{ color: '#0f172a' }}>{bankInfo.accountHolder}</strong>
                  </div>

                  <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '6px 10px', borderRadius: '6px', fontWeight: 700 }}>
                    <TbShieldCheck style={{ fontSize: '1rem' }} /> Đã xác thực KYC & sẵn sàng nhận tiền tự động
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Tên ngân hàng</label>
                    <input
                      type="text"
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Số tài khoản</label>
                    <input
                      type="text"
                      value={bankInfo.accountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>Tên chủ thẻ (In hoa)</label>
                    <input
                      type="text"
                      value={bankInfo.accountHolder}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="host-create-listing-btn"
                    style={{ marginTop: '6px' }}
                    onClick={() => {
                      toast.success('Lưu tài khoản', 'Đã lưu thông tin tài khoản nhận tiền thành công!');
                      setIsEditingBank(false);
                    }}
                  >
                    Lưu thông tin tài khoản
                  </button>
                </div>
              )}

              {/* Instant Request Payout Button */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'block' }}>Số dư khả dụng</span>
                  <strong style={{ fontSize: '1.3rem', color: '#059669', fontWeight: 900 }}>
                    {formatPrice(14500000)}
                  </strong>
                </div>

                <button
                  type="button"
                  className="host-create-listing-btn"
                  style={{ background: '#059669' }}
                  disabled={isRequestingPayout}
                  onClick={handleRequestPayout}
                >
                  {isRequestingPayout ? 'Đang chuyển tiền...' : 'Rút tiền ngay ➔'}
                </button>
              </div>
            </div>

            {/* Payout History */}
            <div className="analytics-card-white">
              <h3 className="card-heading-title" style={{ marginBottom: '1.25rem' }}>
                <TbCoin style={{ color: '#d97706' }} /> Lịch sử chi trả gần đây
              </h3>

              <div className="mini-bookings-list">
                {payoutHistory.map((po) => (
                  <div key={po.id} className="mini-booking-item">
                    <div>
                      <div className="booking-guest-title">{po.note}</div>
                      <div className="booking-room-subtitle">Ngày {po.date} · #{po.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#059669', fontSize: '0.92rem' }}>
                        +{formatPrice(po.amount)}
                      </strong>
                      <span className="b-status-pill confirmed" style={{ display: 'block', marginTop: '2px' }}>
                        Thành công
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 6-Step Listing Creation Wizard Modal */}
      <HostListingWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onListingCreated={handleListingCreated}
        currency={currency}
      />

      {/* Quick Edit Listing Modal */}
      {editingListing && (
        <div className="wizard-modal-overlay" onClick={() => setEditingListing(null)}>
          <div className="wizard-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="wizard-top-header">
              <div className="wizard-title-group">
                <h3>Chỉnh sửa chỗ ở</h3>
                <p>Cập nhật giá và thông tin niêm yết</p>
              </div>
              <button className="table-icon-btn" onClick={() => setEditingListing(null)}>
                <TbX />
              </button>
            </div>

            <form onSubmit={handleSaveEditListing} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Tên chỗ ở
                </label>
                <input
                  type="text"
                  value={editingListing.nameVi}
                  onChange={(e) => setEditingListing({ ...editingListing, nameVi: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Giá mỗi đêm (VND)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={editingListing.priceVND}
                    onChange={(e) => setEditingListing({ ...editingListing, priceVND: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Số khách tối đa
                  </label>
                  <input
                    type="number"
                    value={editingListing.maxGuests}
                    onChange={(e) => setEditingListing({ ...editingListing, maxGuests: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editingListing.address}
                  onChange={(e) => setEditingListing({ ...editingListing, address: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="host-switch-client-btn"
                  onClick={() => setEditingListing(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="host-create-listing-btn">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostDashboard;
