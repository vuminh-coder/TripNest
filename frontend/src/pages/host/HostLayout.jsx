import React, { useState, useEffect } from 'react';
import './host.css';

import HostSidebar from './HostSidebar';
import HostHeader from './HostHeader';

// 6 Dedicated Admin-Style Pages
import HostDashboardPage from './pages/HostDashboardPage';
import HostAccommodationsPage from './pages/HostAccommodationsPage';
import HostListingWizardPage from './pages/HostListingWizardPage';
import HostListingEditPage from './pages/HostListingEditPage';
import HostBookingsPage from './pages/HostBookingsPage';
import HostReviewsPage from './pages/HostReviewsPage';
import HostFinancialsPage from './pages/HostFinancialsPage';

import { TbX, TbCheck, TbPlus, TbTrash } from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { apiService } from '@/services/api';

const DEFAULT_LISTINGS = [];
const DEFAULT_BOOKINGS = [];

export const HostLayout = ({
  onSwitchToClient,
  onOpenRoomDetail,
  onOpenBookings,
  onAccommodationCreated,
  currency = 'VND',
  onLogout,
}) => {
  const getInitialTabFromUrl = () => {
    const path = window.location.pathname.replace('/host', '').replace('/', '');
    if (path.startsWith('edit_listing')) return 'edit_listing';
    const validTabs = ['dashboard', 'accommodations', 'new_listing', 'edit_listing', 'bookings', 'reviews', 'financials'];
    return validTabs.includes(path) ? path : 'dashboard';
  };

  const getInitialEditIdFromUrl = () => {
    const path = window.location.pathname;
    const match = path.match(/\/host\/edit_listing\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const toast = useToast();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState(getInitialTabFromUrl);
  const [editingAccommodationId, setEditingAccommodationId] = useState(getInitialEditIdFromUrl);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingListings, setLoadingListings] = useState(false);

  // Listings State với LocalStorage cache đồng bộ (Sửa lỗi async ở useState)
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_listings');
      return saved ? JSON.parse(saved) : DEFAULT_LISTINGS;
    } catch {
      return DEFAULT_LISTINGS;
    }
  });

  // Bookings State với LocalStorage cache fallback
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
      const currentUser = JSON.parse(localStorage.getItem('tripnest_user') || '{}');
      const defaultName = (currentUser?.name || currentUser?.full_name || 'MINH VŨ').toUpperCase();
      return saved
        ? JSON.parse(saved)
        : {
            bankName: 'Vietcombank (VCB)',
            accountNumber: '9988776655',
            accountHolder: defaultName,
          };
    } catch {
      return {
        bankName: 'Vietcombank (VCB)',
        accountNumber: '9988776655',
        accountHolder: 'MINH VŨ',
      };
    }
  });

  const [payoutHistory, setPayoutHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('tripnest_host_payout_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch Accommodations, Bookings, Payouts,Amenities từ Backend
  const refreshAccommodations = async () => {
    setLoadingListings(true);
    try {
      const data = await apiService.getHostAccommodations();
      const list = Array.isArray(data) ? data : (data?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        setListings(list);
      }
    } catch (e) {
      console.error('Error loading host accommodations:', e);
    } finally {
      setLoadingListings(false);
    }
  };

  const refreshBookings = async () => {
    try {
      const data = await apiService.getHostBookings();
      const list = Array.isArray(data) ? data : data?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setBookings(list);
      }
    } catch (e) {
      console.error('Error loading host bookings:', e);
    }
  };

  const refreshPayouts = async () => {
    try {
      const data = await apiService.getHostPayouts();
      if (data) {
        if (data.payoutAccount) {
          setBankInfo({
            bankName: data.payoutAccount.bank_name || 'Vietcombank (VCB)',
            accountNumber: data.payoutAccount.account_number || '9988776655',
            accountHolder: data.payoutAccount.account_holder_name || 'NGUYEN VAN AN',
          });
        }
        const txList = Array.isArray(data.transactions) ? data.transactions : (data.payoutHistory || []);
        if (Array.isArray(txList)) {
          setPayoutHistory(txList);
        }
        if (typeof data.availableBalance === 'number') {
          setAvailableBalance(data.availableBalance);
        }
      }
    } catch (e) {
      console.error('Error loading host payouts:', e);
    }
  };

  useEffect(() => {
    refreshAccommodations();
    refreshBookings();
    refreshPayouts();
  }, []);

  useEffect(() => {
    if (activeTab !== 'financials') return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshPayouts();
    };
    const intervalId = window.setInterval(refreshPayouts, 30000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [activeTab]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('tripnest_host_listings', JSON.stringify(listings));
  }, [listings]);

  // Clean up legacy localStorage on mount
  useEffect(() => {
    localStorage.removeItem('tripnest_host_bookings');
    localStorage.removeItem('tripnest_host_payout_history');
  }, []);

  const handleNavigate = (tabId, extraId = null) => {
    setActiveTab(tabId);
    if (tabId === 'edit_listing') {
      const id = extraId || editingAccommodationId;
      if (id) setEditingAccommodationId(id);
      window.history.pushState({}, '', `/host/edit_listing/${id || ''}`);
    } else {
      window.history.pushState({}, '', `/host${tabId === 'dashboard' ? '' : `/${tabId}`}`);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
      setEditingAccommodationId(getInitialEditIdFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Live Data từ Backend API khi Mount
  useEffect(() => {
    let isMounted = true;
    const fetchHostBackend = async () => {
      try {
        const statsRes = await apiService.getHostDashboardStats();
        if (isMounted && statsRes?.success) {
          const bList = statsRes.recentBookings || statsRes.data?.recentBookings;
          if (Array.isArray(bList) && bList.length > 0) {
            setBookings(bList);
          }
        }
        const payoutsRes = await apiService.getHostPayouts?.();
        if (isMounted && payoutsRes?.success) {
          const pList = payoutsRes.transactions || payoutsRes.payoutHistory || [];
          if (Array.isArray(pList)) {
            setPayoutHistory(pList);
          }
          if (typeof payoutsRes.availableBalance === 'number') {
            setAvailableBalance(payoutsRes.availableBalance);
          }
        }
      } catch (err) {
        console.warn('Sync Host Backend Data:', err);
      }
    };
    fetchHostBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listing Handlers
  const handleToggleStatus = async (id) => {
    try {
      const res = await apiService.toggleHostAccommodationStatus(id);
      setListings((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextStatus = res.status || (item.status === 'published' ? 'paused' : 'published');
            return { ...item, status: nextStatus };
          }
          return item;
        })
      );
      toast.success(
        'Cập nhật trạng thái',
        res.message || 'Đã cập nhật trạng thái mở bán chỗ ở thành công!'
      );
    } catch (e) {
      toast.error('Lỗi', 'Không thể cập nhật trạng thái chỗ ở.');
    }
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
      try {
        await apiService.deleteHostAccommodation(id);
        setListings((prev) => prev.filter((item) => item.id !== id));
        toast.success('Đã xóa chỗ ở', 'Đã xóa chỗ ở thành công khỏi danh sách.');
      } catch (e) {
        toast.error('Lỗi xóa', 'Không thể xóa chỗ ở.');
      }
    }
  };

  const handleListingCreated = async (newListing) => {
    await refreshAccommodations();
    if (onAccommodationCreated) {
      onAccommodationCreated(newListing);
    }
    setActiveTab('accommodations');
    toast.success(
      'Đăng bán chỗ ở thành công!',
      'Chỗ nghỉ của bạn đã sẵn sàng đón tiếp khách du lịch trên TripNest.'
    );
  };

  const handleSaveEditListing = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      await apiService.updateHostAccommodation(editingListing.id, editingListing);
      setListings((prev) =>
        prev.map((l) => (l.id === editingListing.id ? { ...l, ...editingListing } : l))
      );
      setEditingListing(null);
      toast.success('Cập nhật thành công', 'Đã lưu thông tin chỗ ở lên hệ thống.');
      refreshAccommodations();
    } catch (err) {
      toast.error('Lỗi lưu', err.message || 'Không thể lưu thay đổi thông tin chỗ ở.');
    }
  };

  const handleAddEditImage = (e) => {
    e.preventDefault();
    const imageUrl = editImageUrl.trim();
    if (!imageUrl || !editingListing) return;

    const images = editingListing.images || (editingListing.thumbnail ? [editingListing.thumbnail] : []);
    if (images.includes(imageUrl)) {
      toast.info('Ảnh đã tồn tại', 'Vui lòng sử dụng một đường dẫn ảnh khác.');
      return;
    }

    setEditingListing({
      ...editingListing,
      images: [...images, imageUrl],
      thumbnail: editingListing.thumbnail || imageUrl,
    });
    setEditImageUrl('');
  };

  const handleRemoveEditImage = (index) => {
    const images = editingListing?.images || [];
    if (images.length <= 1) {
      toast.warning('Yêu cầu hình ảnh', 'Chỗ ở cần ít nhất 1 ảnh đại diện.');
      return;
    }

    const updatedImages = images.filter((_, imageIndex) => imageIndex !== index);
    setEditingListing({
      ...editingListing,
      images: updatedImages,
      thumbnail: updatedImages[0],
    });
  };

  // Booking Handlers
  const handleApproveBooking = (id) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b))
    );
    toast.success('Duyệt đơn thành công', 'Đã xác nhận đơn đặt phòng cho khách.');
  };

  const handleCheckInBooking = async (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id || b.code === id ? { ...b, status: 'checked_in' } : b))
    );

    try {
      apiService.checkIn(id).catch(() => {});
    } catch {
      // ignore
    }

    try {
      const STORAGE_KEY = 'tripnest_admin_data_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const adminData = JSON.parse(raw);
        if (adminData.bookings) {
          adminData.bookings = adminData.bookings.map((b) =>
            b.id === id || b.code === id ? { ...b, status: 'checked_in' } : b
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
        }
      }
    } catch {
      // ignore
    }

    toast.success('Khách đã nhận phòng!', 'Đã cập nhật trạng thái đơn thành Đang lưu trú.');
  };

  const handleCheckOutBooking = async (id) => {
    const target = bookings.find((b) => b.id === id || b.code === id);
    const updatedBookings = bookings.map((b) =>
      b.id === id || b.code === id ? { ...b, status: 'completed' } : b
    );
    setBookings(updatedBookings);

    const grossAmount = target?.grossAmount || (target?.basePrice && target?.cleaningFee ? target.basePrice + target.cleaningFee : (target?.totalAmount || 7500000));
    const commissionFee = target?.commissionFee || target?.serviceFee || Math.round(grossAmount * 0.12);
    const netPayoutAmount = target?.hostEarnings || target?.hostPayoutAmount || Math.max(0, grossAmount - commissionFee);

    try {
      apiService.checkOut(id).catch(() => {});
    } catch {
      // ignore
    }

    const hostPayoutId = 'POT-' + Math.floor(100000 + Math.random() * 900000);
    const newPayout = {
      id: hostPayoutId,
      date: new Date().toLocaleDateString('vi-VN'),
      amount: netPayoutAmount,
      note: `Doanh thu đơn ${target?.code || target?.id || id}`,
      status: 'pending',
    };
    setPayoutHistory((prev) => [newPayout, ...prev]);

    try {
      const STORAGE_KEY = 'tripnest_admin_data_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const adminData = JSON.parse(raw);
        if (adminData.bookings) {
          adminData.bookings = adminData.bookings.map((b) =>
            b.id === id || b.code === id ? { ...b, status: 'completed' } : b
          );
        }
        if (adminData.payouts) {
          const adminPayoutId = 'PO-' + Math.floor(10000 + Math.random() * 90000);
          const newAdminPayout = {
            id: adminPayoutId,
            host_name: bankInfo.accountHolder || 'Minh Vũ',
            booking_code: target?.code || target?.id || id,
            gross_amount: grossAmount,
            commission_fee: commissionFee,
            net_payout: netPayoutAmount,
            currency: 'VND',
            bank_name: bankInfo.bankName || 'Vietcombank',
            account_number: bankInfo.accountNumber || '9988776655',
            account_holder: bankInfo.accountHolder || 'MINH VŨ',
            status: 'pending',
            transaction_ref: '',
            created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
          adminData.payouts = [newAdminPayout, ...adminData.payouts];
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
      }
    } catch {
      // ignore
    }

    toast.success(
      'Check-out thành công & Đã tạo Lệnh Payout!',
      `Đã hoàn tất kỳ nghỉ và tạo lệnh giải ngân ${netPayoutAmount.toLocaleString('vi-VN')} ₫ cho bạn.`
    );
  };

  const handleCancelBooking = async (id) => {
    const isConfirmed = await confirm({
      title: 'Hủy đơn đặt phòng?',
      message: 'Lưu ý: Nếu Host chủ động hủy đơn, hệ thống sẽ hoàn tiền 100% cho khách hàng và hủy lệnh thanh toán tương ứng cho Host.',
      type: 'danger',
      confirmText: 'Xác nhận hủy đơn',
      cancelText: 'Giữ lại',
    });

    if (isConfirmed) {
      try {
        await apiService.cancelBooking(id, 'Chủ nhà chủ động hủy đơn đặt phòng.', true);
        toast.info('Đã hủy đơn', 'Đã hủy đơn đặt phòng thành công và hoàn trả 100% cho khách.');
      } catch (err) {
        console.warn('Backend cancel booking error:', err);
        toast.info('Đã hủy đơn', 'Đã cập nhật trạng thái hủy đơn.');
      }
      refreshBookings();
      refreshPayouts();
    }
  };

  // Payout Handlers & Dynamic Balance strictly based on Admin Payout Lifecycle
  const dynamicAvailableBalance =
    availableBalance > 0
      ? availableBalance
      : payoutHistory
          .filter((p) => p.status === 'completed')
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const dynamicPendingBalance =
    payoutHistory
      .filter((p) => p.status === 'pending' || !p.status)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleRequestPayout = async () => {
    setIsRequestingPayout(true);
    try {
      const result = await apiService.requestHostPayout();
      setAvailableBalance(Number(result.availableBalance || 0));
      await refreshPayouts();
      toast.success(
        'Rút tiền thành công!',
        result.message || `Đã tạo yêu cầu chuyển tiền về số tài khoản ${bankInfo.accountNumber}.`
      );
    } catch (err) {
      toast.error('Lỗi rút tiền', err.message || 'Không thể tạo yêu cầu rút tiền.');
    } finally {
      setIsRequestingPayout(false);
    }
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
        onOpenBookings={onOpenBookings}
        pendingBookingsCount={pendingCount}
        onSwitchToClient={onSwitchToClient}
        onLogout={onLogout}
      />

      {/* 2. Main Content Container */}
      <div className="host-main-container">
        {/* Sticky SaaS Topbar */}
        <HostHeader
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onExitHost={onSwitchToClient}
          onOpenBookings={onOpenBookings}
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
              bankInfo={bankInfo}
              availableBalance={dynamicAvailableBalance}
              pendingEscrowBalance={dynamicPendingBalance}
              onNavigate={handleNavigate}
              onOpenWizard={() => handleNavigate('new_listing')}
              onApproveBooking={handleApproveBooking}
              onCheckInBooking={handleCheckInBooking}
              onCheckOutBooking={handleCheckOutBooking}
              currency={currency}
            />
          )}

          {activeTab === 'accommodations' && (
            <HostAccommodationsPage
              listings={listings}
              onOpenWizard={() => handleNavigate('new_listing')}
              onEditListing={(item) => {
                setEditingAccommodationId(item.id);
                handleNavigate('edit_listing', item.id);
              }}
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

          {activeTab === 'edit_listing' && (
            <HostListingEditPage
              accommodationId={editingAccommodationId}
              onCancel={() => handleNavigate('accommodations')}
              onListingUpdated={async (updatedData) => {
                if (updatedData && updatedData.id) {
                  setListings((prev) =>
                    prev.map((l) =>
                      String(l.id) === String(updatedData.id)
                        ? {
                            ...l,
                            ...updatedData,
                            nameVi: updatedData.nameVi || l.nameVi,
                            title: updatedData.nameVi || l.title,
                            priceVND: updatedData.priceVND || l.priceVND,
                            thumbnail: updatedData.images?.[0] || l.thumbnail,
                          }
                        : l
                    )
                  );
                }
                await refreshAccommodations();
                handleNavigate('accommodations');
              }}
              currency={currency}
            />
          )}

          {activeTab === 'bookings' && (
            <HostBookingsPage
              bookings={bookings}
              onApproveBooking={handleApproveBooking}
              onCancelBooking={handleCancelBooking}
              onCheckInBooking={handleCheckInBooking}
              onCheckOutBooking={handleCheckOutBooking}
              currency={currency}
            />
          )}

          {activeTab === 'reviews' && <HostReviewsPage />}

          {activeTab === 'financials' && (
            <HostFinancialsPage
              bankInfo={bankInfo}
              setBankInfo={setBankInfo}
              payoutHistory={payoutHistory}
              availableBalance={dynamicAvailableBalance}
              pendingEscrowBalance={dynamicPendingBalance}
              onRequestPayout={handleRequestPayout}
              isRequestingPayout={isRequestingPayout}
              currency={currency}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default HostLayout;