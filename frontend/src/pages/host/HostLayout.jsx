import React, { useState, useEffect } from 'react';
import './host.css';

import HostSidebar from './HostSidebar';
import HostHeader from './HostHeader';

// 6 Dedicated Admin-Style Pages
import HostDashboardPage from './pages/HostDashboardPage';
import HostAccommodationsPage from './pages/HostAccommodationsPage';
import HostListingWizardPage from './pages/HostListingWizardPage';
import HostBookingsPage from './pages/HostBookingsPage';
import HostReviewsPage from './pages/HostReviewsPage';
import HostFinancialsPage from './pages/HostFinancialsPage';

import { TbX, TbCheck } from 'react-icons/tb';
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
    thumbnail:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
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
    thumbnail:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
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
    thumbnail:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
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

export const HostLayout = ({
  onSwitchToClient,
  onOpenRoomDetail,
  currency = 'VND',
}) => {
  const getInitialTabFromUrl = () => {
    const path = window.location.pathname.replace('/host', '').replace('/', '');
    const validTabs = ['dashboard', 'accommodations', 'new_listing', 'bookings', 'reviews', 'financials'];
    return validTabs.includes(path) ? path : 'dashboard';
  };

  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState(getInitialTabFromUrl);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingListing, setEditingListing] = useState(null);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Listings State
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_listings');
      return saved ? JSON.parse(saved) : DEFAULT_LISTINGS;
    } catch {
      return DEFAULT_LISTINGS;
    }
  });

  // Bookings State
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_bookings');
      return saved ? JSON.parse(saved) : DEFAULT_BOOKINGS;
    } catch {
      return DEFAULT_BOOKINGS;
    }
  });

  // Bank Info State
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

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('tripnest_host_listings', JSON.stringify(listings));
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

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({}, '', `/host${tabId === 'dashboard' ? '' : `/${tabId}`}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listing Handlers
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

  const handleDeleteListing = async (id) => {
    const isConfirmed = await confirm({
      title: 'Xóa chỗ ở cho thuê?',
      message: 'Bạn có chắc chắn muốn xóa chỗ ở này khỏi danh sách cho thuê? Hành động này sẽ gỡ bỏ chỗ nghỉ khỏi kết quả tìm kiếm.',
      type: 'danger',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
    });

    if (isConfirmed) {
      setListings(listings.filter((item) => item.id !== id));
      toast.success('Đã xóa chỗ ở', 'Đã xóa chỗ ở thành công khỏi danh sách.');
    }
  };

  const handleListingCreated = (newListing) => {
    setListings([newListing, ...listings]);
    setActiveTab('accommodations');
    toast.success(
      'Đăng bán chỗ ở thành công!',
      'Chỗ nghỉ của bạn đã sẵn sàng đón tiếp khách du lịch trên TripNest.'
    );
  };

  const handleSaveEditListing = (e) => {
    e.preventDefault();
    if (!editingListing) return;
    setListings(
      listings.map((l) => (l.id === editingListing.id ? editingListing : l))
    );
    setEditingListing(null);
    toast.success('Cập nhật thành công', 'Đã lưu thông tin chỗ ở.');
  };

  // Booking Handlers
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
      toast.info('Đã hủy đơn', 'Đã hủy đơn đặt phòng thành công.');
    }
  };

  // Payout Handlers
  const handleRequestPayout = () => {
    const availableAmount = 14500000;
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
        `Đã chuyển tiền về số tài khoản ${bankInfo.accountNumber} thành công.`
      );
    }, 900);
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="host-portal-wrapper">
      {/* 1. Collapsible Sidebar */}
      <HostSidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pendingBookingsCount={pendingCount}
      />

      {/* 2. Main Content Container */}
      <div className="host-main-container">
        {/* Sticky SaaS Topbar */}
        <HostHeader
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onExitHost={onSwitchToClient}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currency={currency}
        />

        {/* Dynamic Page Views */}
        <main className="host-content-body">
          {activeTab === 'dashboard' && (
            <HostDashboardPage
              listings={listings}
              bookings={bookings}
              onNavigate={handleNavigate}
              onOpenWizard={() => handleNavigate('new_listing')}
              onApproveBooking={handleApproveBooking}
              currency={currency}
            />
          )}

          {activeTab === 'accommodations' && (
            <HostAccommodationsPage
              listings={listings}
              onOpenWizard={() => handleNavigate('new_listing')}
              onEditListing={(item) => setEditingListing({ ...item })}
              onToggleStatus={handleToggleStatus}
              onDeleteListing={handleDeleteListing}
              onOpenRoomDetail={onOpenRoomDetail}
              currency={currency}
            />
          )}

          {activeTab === 'new_listing' && (
            <HostListingWizardPage
              onCancel={() => handleNavigate('accommodations')}
              onListingCreated={(newListing) => {
                handleListingCreated(newListing);
              }}
              currency={currency}
            />
          )}

          {activeTab === 'bookings' && (
            <HostBookingsPage
              bookings={bookings}
              onApproveBooking={handleApproveBooking}
              onCancelBooking={handleCancelBooking}
              currency={currency}
            />
          )}

          {activeTab === 'reviews' && <HostReviewsPage />}

          {activeTab === 'financials' && (
            <HostFinancialsPage
              bankInfo={bankInfo}
              setBankInfo={setBankInfo}
              payoutHistory={payoutHistory}
              onRequestPayout={handleRequestPayout}
              isRequestingPayout={isRequestingPayout}
              currency={currency}
            />
          )}
        </main>
      </div>

      {/* Quick Edit Modal */}
      {editingListing && (
        <div className="wizard-modal-overlay" onClick={() => setEditingListing(null)}>
          <div
            className="wizard-modal-card"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wizard-top-header">
              <div className="wizard-title-group">
                <h3>Chỉnh sửa chỗ ở</h3>
                <p>Cập nhật giá và thông tin niêm yết</p>
              </div>
              <button
                type="button"
                className="host-action-btn"
                onClick={() => setEditingListing(null)}
              >
                <TbX />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditListing}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--host-text-main)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Tên chỗ ở
                </label>
                <input
                  type="text"
                  value={editingListing.nameVi}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, nameVi: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--host-radius-sm)',
                    border: '1.5px solid var(--host-border-strong)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--host-text-main)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Giá mỗi đêm (VND)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={editingListing.priceVND}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        priceVND: Number(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--host-radius-sm)',
                      border: '1.5px solid var(--host-border-strong)',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--host-text-main)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Số khách tối đa
                  </label>
                  <input
                    type="number"
                    value={editingListing.maxGuests}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        maxGuests: Number(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: 'var(--host-radius-sm)',
                      border: '1.5px solid var(--host-border-strong)',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--host-text-main)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editingListing.address}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, address: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: 'var(--host-radius-sm)',
                    border: '1.5px solid var(--host-border-strong)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '1rem',
                }}
              >
                <button
                  type="button"
                  className="host-btn-client"
                  onClick={() => setEditingListing(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="host-btn-primary">
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

export default HostLayout;
