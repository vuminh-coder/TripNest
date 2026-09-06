import React, { useState, useEffect, useCallback } from 'react';
import './MyTripsPage.css';
import {
  TbCompass,
  TbArrowLeft,
  TbMapPin,
  TbCalendar,
  TbMoon,
  TbUserCheck,
  TbStar,
  TbTrashX,
  TbCircleCheckFilled,
  TbCalendarCheck,
  TbClockPlay,
  TbCircleX,
  TbReceiptRefund,
  TbKey,
  TbLogout,
  TbAlertCircle,
  TbInfoCircle,
  TbX,
  TbCalendarEvent,
  TbBed,
  TbHome2,
  TbWriting,
  TbMessageCheck,
  TbEye,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/services/api';
import WriteReviewModal from '@/components/modals/WriteReviewModal/WriteReviewModal';
import ViewReviewModal from '@/components/modals/ViewReviewModal/ViewReviewModal';

// Status Configuration (READ-ONLY FOR USER)
const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: TbClockPlay },
  confirmed: { label: 'Đã xác nhận', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: TbCalendarCheck },
  checked_in: { label: 'Đang lưu trú', color: '#0369a1', bg: '#eff6ff', border: '#93c5fd', icon: TbKey },
  completed: { label: 'Đã hoàn thành', color: '#047857', bg: '#f0fdf4', border: '#86efac', icon: TbCircleCheckFilled },
  cancelled: { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: TbCircleX },
  refunded: { label: 'Đã hoàn tiền', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: TbReceiptRefund },
};

const TABS = [
  { key: 'all', label: 'Tất cả chuyến đi', icon: TbCompass },
  { key: 'upcoming', label: 'Sắp tới', icon: TbCalendarEvent },
  { key: 'active', label: 'Đang ở', icon: TbBed },
  { key: 'completed', label: 'Đã hoàn thành', icon: TbCircleCheckFilled },
  { key: 'cancelled', label: 'Đã hủy', icon: TbCircleX },
];

const EMPTY_STATE_CONFIG = {
  all: {
    icon: TbCompass,
    title: 'Chưa có chuyến đi nào',
    desc: 'Bạn chưa có chuyến đi nào trong lịch sử lưu trú. Hãy khám phá ngay hàng nghìn biệt thự, khách sạn và trải nghiệm độc đáo trên TripNest!',
    actionLabel: 'Khám phá phòng ngay',
    secondaryActionLabel: null,
  },
  upcoming: {
    icon: TbCalendarEvent,
    title: 'Không có chuyến đi sắp tới',
    desc: 'Bạn chưa có kỳ nghỉ nào sắp diễn ra. Hãy lên kế hoạch cho chuyến du lịch tiếp theo để tận hưởng không gian nghỉ dưỡng tuyệt hảo!',
    actionLabel: 'Tìm phòng sắp tới',
    secondaryActionLabel: 'Xem tất cả chuyến đi',
  },
  active: {
    icon: TbBed,
    title: 'Không có chuyến đi đang diễn ra',
    desc: 'Hiện tại bạn chưa nhận phòng (check-in) tại cơ sở lưu trú nào. Khi bạn check-in, phòng nghỉ sẽ hiển thị tại đây.',
    actionLabel: 'Khám phá phòng ngay',
    secondaryActionLabel: 'Xem tất cả chuyến đi',
  },
  completed: {
    icon: TbCircleCheckFilled,
    title: 'Chưa có chuyến đi hoàn thành',
    desc: 'Các chuyến đi sau khi bạn trả phòng (check-out) thành công sẽ hiển thị ở đây để bạn có thể xem lại và chia sẻ đánh giá thực tế.',
    actionLabel: 'Khám phá phòng ngay',
    secondaryActionLabel: 'Xem tất cả chuyến đi',
  },
  cancelled: {
    icon: TbCircleX,
    title: 'Không có chuyến đi nào bị hủy',
    desc: 'Tuyệt vời! Bạn không có đơn đặt phòng nào bị hủy hoặc hoàn tiền. Mọi hành trình của bạn đều được đảm bảo trọn vẹn.',
    actionLabel: 'Khám phá phòng ngay',
    secondaryActionLabel: 'Xem tất cả chuyến đi',
  },
};

const CANCEL_REASONS = [
  'Thay đổi lịch trình du lịch',
  'Tìm được chỗ ở tốt hơn',
  'Lý do cá nhân / sức khỏe',
  'Thay đổi số lượng khách',
  'Sai thông tin đặt phòng',
];

// Cancel Dialog Modal — với Preview hoàn tiền realtime từ Backend
const CancelDialog = ({ booking, onConfirm, onClose, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [refundPreview, setRefundPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const finalReason = selectedReason === 'custom'
    ? customReason.trim() || 'Khách hàng yêu cầu hủy.'
    : selectedReason || 'Khách hàng yêu cầu hủy qua ứng dụng.';

  // Fetch refund preview on mount
  useEffect(() => {
    const loadPreview = async () => {
      setPreviewLoading(true);
      try {
        const data = await apiService.getCancelPreview(booking.id);
        if (data?.success && data.refund) {
          setRefundPreview(data);
        }
      } catch (e) {
        console.warn('Refund preview error:', e);
      } finally {
        setPreviewLoading(false);
      }
    };
    loadPreview();
  }, [booking.id]);

  const refund = refundPreview?.refund;
  const pct = refund?.percentage ?? 100;
  const refundAmt = refund?.amount ?? Number(booking.totalPrice);
  const policyColor = pct >= 100 ? '#059669' : pct > 0 ? '#d97706' : '#dc2626';
  const policyBg = pct >= 100 ? '#f0fdf4' : pct > 0 ? '#fffbeb' : '#fef2f2';
  const policyBorder = pct >= 100 ? '#a7f3d0' : pct > 0 ? '#fde68a' : '#fecaca';
  const policyIcon = pct >= 100 ? '✅' : pct > 0 ? '⚠️' : '❌';

  return (
    <div className="cancel-dialog-overlay" onClick={onClose}>
      <div className="cancel-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-dialog-header">
          <h3>
            <TbAlertCircle style={{ color: '#ef4444' }} />
            Hủy đơn đặt phòng
          </h3>
          <button
            className="auth-modal-close-btn"
            onClick={onClose}
            style={{ position: 'static', width: 32, height: 32 }}
          >
            <TbX />
          </button>
        </div>

        <div className="cancel-dialog-body">
          <div className="cancel-dialog-booking-info">
            <img
              src={booking.roomImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&auto=format&fit=crop&q=80'}
              alt={booking.roomTitle}
            />
            <div>
              <h4>{booking.roomTitle}</h4>
              <p>Mã: #{booking.id} • {booking.checkIn} → {booking.checkOut}</p>
            </div>
          </div>

          {/* Refund Policy Preview */}
          <div
            style={{
              background: policyBg,
              border: `1.5px solid ${policyBorder}`,
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '14px',
            }}
          >
            {previewLoading ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '10px 0' }}>
                <span className="action-spinner" style={{ marginRight: 8 }} />
                Đang tính toán chính sách hoàn tiền...
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.3rem' }}>{policyIcon}</span>
                  <strong style={{ color: policyColor, fontSize: '0.92rem' }}>
                    {refund?.policy_description || `Hoàn tiền ${pct}%`}
                  </strong>
                </div>

                {refund?.breakdown && (
                  <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: 4, color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phí phòng hoàn lại:</span>
                      <span style={{ fontWeight: 600 }}>
                        {Number(refund.breakdown.base_price_refund).toLocaleString()} ₫
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phí vệ sinh hoàn lại:</span>
                      <span style={{ fontWeight: 600 }}>
                        {Number(refund.breakdown.cleaning_fee_refund).toLocaleString()} ₫
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phí dịch vụ {refund.service_fee_refundable ? '(hoàn)' : '(không hoàn)'}:</span>
                      <span style={{ fontWeight: 600, color: refund.service_fee_refundable ? '#059669' : '#dc2626' }}>
                        {refund.service_fee_refundable
                          ? `${Number(refund.breakdown.service_fee_refund).toLocaleString()} ₫`
                          : '0 ₫'}
                      </span>
                    </div>
                    <hr style={{ border: 'none', borderTop: `1px solid ${policyBorder}`, margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                      <strong style={{ color: policyColor }}>
                        💰 {pct >= 100 ? 'HOÀN TIỀN TOÀN BỘ' : pct > 0 ? `HOÀN TIỀN ${pct}%` : 'KHÔNG HOÀN TIỀN'}
                      </strong>
                      <strong style={{ color: policyColor, fontSize: '1.1rem' }}>
                        {Number(refundAmt).toLocaleString()} ₫
                      </strong>
                    </div>
                  </div>
                )}

                {refundAmt > 0 && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 8 }}>
                    Phương thức: {refund?.refund_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' : refund?.refund_method || 'Cổng thanh toán'} •
                    Thời gian: {refund?.estimated_days || '5-10 ngày làm việc'}
                  </div>
                )}
              </>
            )}
          </div>

          <span className="cancel-reason-label">Lý do hủy đặt phòng:</span>

          <div className="cancel-reason-options">
            {CANCEL_REASONS.map((reason) => (
              <label
                key={reason}
                className={`cancel-reason-option ${selectedReason === reason ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                />
                {reason}
              </label>
            ))}
            <label className={`cancel-reason-option ${selectedReason === 'custom' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="cancelReason"
                value="custom"
                checked={selectedReason === 'custom'}
                onChange={() => setSelectedReason('custom')}
              />
              Lý do khác
            </label>
          </div>

          {selectedReason === 'custom' && (
            <textarea
              className="cancel-reason-textarea"
              placeholder="Mô tả lý do hủy phòng của bạn..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              maxLength={255}
            />
          )}
        </div>

        <div className="cancel-dialog-footer">
          <button className="cancel-btn-keep" onClick={onClose}>
            Giữ lại lịch trình
          </button>
          <button
            className="cancel-btn-confirm"
            disabled={isLoading || previewLoading}
            onClick={() => onConfirm(finalReason)}
          >
            {isLoading ? <span className="action-spinner" /> : <TbTrashX />}
            {isLoading ? 'Đang hủy...' : `Xác nhận hủy${pct < 100 ? ` (hoàn ${pct}%)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MyTripsPage = ({
  onBack,
  onSelectRoom,
  onSelectAccommodation,
  onCancelBooking,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [selectedViewReviewBooking, setSelectedViewReviewBooking] = useState(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_reviewed_bookings') || '[]');
    } catch {
      return [];
    }
  });

  // Fetch bookings directly from Backend MySQL Database
  const fetchBookingsFromDB = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyBookings();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.bookings)
        ? data.bookings
        : [];
      setBookings(list);
    } catch (err) {
      console.warn('Lỗi kết nối cơ sở dữ liệu khi tải chuyến đi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookingsFromDB();
  }, [fetchBookingsFromDB]);

  // Periodic background sync from MySQL DB (e.g. when Host checks in / checks out in another window)
  useEffect(() => {
    const fetchQuietly = async () => {
      try {
        const data = await apiService.getMyBookings();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.bookings)
          ? data.bookings
          : [];
        setBookings(list);
      } catch (e) {
        // silent background sync
      }
    };

    const intervalId = setInterval(fetchQuietly, 10000);
    const handleFocus = () => fetchQuietly();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Format Helpers
  const formatPrice = (val, cur) => {
    if (cur === 'USD') return `$${Number(val).toLocaleString()}`;
    if (cur === 'EUR') return `€${Math.round(Number(val) * 0.92).toLocaleString()}`;
    return `${Number(val).toLocaleString()} ₫`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filter Bookings by active tab
  const getFilteredBookings = () => {
    if (activeTab === 'all') return bookings;
    return bookings.filter((b) => {
      const status = b.status || 'confirmed';
      switch (activeTab) {
        case 'upcoming':
          return status === 'confirmed' || status === 'pending';
        case 'active':
          return status === 'checked_in';
        case 'completed':
          return status === 'completed';
        case 'cancelled':
          return status === 'cancelled' || status === 'refunded';
        default:
          return true;
      }
    });
  };

  const filteredBookings = getFilteredBookings();

  const getTabCount = (key) => {
    if (key === 'all') return bookings.length;
    return bookings.filter((b) => {
      const status = b.status || 'confirmed';
      switch (key) {
        case 'upcoming': return status === 'confirmed' || status === 'pending';
        case 'active': return status === 'checked_in';
        case 'completed': return status === 'completed';
        case 'cancelled': return status === 'cancelled' || status === 'refunded';
        default: return false;
      }
    }).length;
  };

  // Handle Cancel Booking — Save to Database via API
  const handleCancelConfirm = async (reason) => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      // Call Backend API -> MySQL DB update
      const res = await apiService.cancelBooking(cancelTarget.id, reason);
      const refundInfo = res?.refund;

      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTarget.id
            ? {
                ...b,
                status: 'cancelled',
                statusLabel: 'Đã hủy',
                cancellationReason: reason,
                cancelledAt: new Date().toISOString(),
                refundAmount: refundInfo?.amount ?? b.refundAmount ?? 0,
                refundPercentage: refundInfo?.percentage ?? b.refundPercentage ?? 0,
                refundSummary: refundInfo ?? b.refundSummary,
                canCancel: false,
              }
            : b
        )
      );

      if (onCancelBooking) onCancelBooking(cancelTarget.id, reason, refundInfo);

      const refundMsg = refundInfo
        ? refundInfo.percentage > 0
          ? `Đã tạo lệnh hoàn tiền ${refundInfo.percentage}% (${(refundInfo.amount || 0).toLocaleString('vi-VN')} ₫). Tiền sẽ về tài khoản sau 3-5 ngày làm việc.`
          : 'Đơn hủy không nằm trong điều kiện hoàn tiền theo chính sách phòng.'
        : 'Thông tin hủy đơn đã được cập nhật vào cơ sở dữ liệu.';

      toast.success('Đã hủy đặt phòng thành công!', refundMsg);
    } catch (err) {
      toast.error('Không thể hủy phòng', err.message || 'Lỗi hệ thống khi gửi yêu cầu hủy.');
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  };

  // Handle Review Submission Success
  const handleReviewSuccess = (bookingId) => {
    const nextList = [...reviewedBookingIds, bookingId];
    setReviewedBookingIds(nextList);
    localStorage.setItem('tripnest_reviewed_bookings', JSON.stringify(nextList));

    setBookings((prev) =>
      prev.map((b) =>
        (b.id === bookingId || b.bookingId === bookingId)
          ? { ...b, canReview: false, hasReview: true }
          : b
      )
    );

    // Tải lại trực tiếp từ CSDL để nhận toàn bộ thông tin review vừa lưu
    fetchBookingsFromDB();
  };

  return (
    <div className="my-trips-page-container">
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1.5px solid #e2e8f0',
          background: '#ffffff',
          color: '#334155',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '1.5rem',
          transition: 'all 0.2s ease',
        }}
      >
        <TbArrowLeft /> Về trang khám phá
      </button>

      {/* Hero Header */}
      <div className="my-trips-hero">
        <div className="my-trips-hero-badge">
          <TbCompass /> TripNest Vacation Manager
        </div>
        <h1>Chuyến Đi Của Tôi</h1>
        <p>
          Quản lý toàn bộ lịch trình lưu trú, theo dõi trạng thái nhận/trả phòng thực tế,
          viết bài đăng đánh giá và yêu cầu hủy phòng trực tiếp.
        </p>
      </div>

      {/* Tabs Filter Bar */}
      <div className="my-trips-tab-bar">
        {TABS.map((tab) => {
          const count = getTabCount(tab.key);
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`my-trips-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon style={{ fontSize: '1.1rem' }} />
              {tab.label}
              {count > 0 && <span className="my-trips-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Trips Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          <span className="action-spinner" style={{ width: 24, height: 24, margin: '0 auto 1rem' }} />
          <p style={{ fontWeight: 600 }}>Đang kết nối cơ sở dữ liệu và tải chuyến đi...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        (() => {
          const currentEmpty = EMPTY_STATE_CONFIG[activeTab] || EMPTY_STATE_CONFIG.all;
          const EmptyIcon = currentEmpty.icon;
          return (
            <div className="trip-empty-state-card">
              <div className="trip-empty-state-icon-wrap">
                <EmptyIcon />
              </div>
              <h3 className="trip-empty-state-title">{currentEmpty.title}</h3>
              <p className="trip-empty-state-desc">{currentEmpty.desc}</p>
              <div className="trip-empty-state-actions">
                <button
                  type="button"
                  className="trip-empty-btn-primary"
                  onClick={onBack}
                >
                  <TbCompass /> {currentEmpty.actionLabel}
                </button>
                {currentEmpty.secondaryActionLabel && (
                  <button
                    type="button"
                    className="trip-empty-btn-secondary"
                    onClick={() => setActiveTab('all')}
                  >
                    {currentEmpty.secondaryActionLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="my-trips-grid">
          {filteredBookings.map((b) => {
            const status = b?.status || 'confirmed';
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;
            const StatusIcon = config?.icon || STATUS_CONFIG.confirmed.icon;
            const isReviewed = b.hasReview || reviewedBookingIds.includes(b.id) || reviewedBookingIds.includes(b.bookingId);
            const canCancel = b.canCancel !== undefined ? b.canCancel : (status === 'confirmed' || status === 'pending');
            const canReview = (b.canReview !== undefined ? b.canReview : status === 'completed') && !isReviewed;

            return (
              <div
                key={b.id}
                className={`trip-card-item ${status === 'cancelled' || status === 'refunded' ? 'cancelled' : ''}`}
              >
                <img
                  className="trip-card-img"
                  src={b.roomImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=80'}
                  alt={b.roomTitle}
                />

                <div className="trip-card-content">
                  <div>
                    <div className="trip-card-top">
                      {/* READ-ONLY STATUS BADGE */}
                      <span className={`trip-status-chip status-${status}`}>
                        <StatusIcon style={{ fontSize: '0.9rem' }} />
                        {config.label}
                      </span>

                      <span className="trip-code-tag">Mã đặt phòng: #{b.id}</span>
                    </div>

                    <h3 className="trip-card-title">{b.roomTitle}</h3>

                    <div className="trip-card-info-row">
                      <span className="trip-info-item">
                        <TbMapPin style={{ color: '#ff385c' }} /> {b.roomCity || 'Việt Nam'}
                      </span>
                      <span className="trip-info-item">
                        <TbCalendar style={{ color: '#0ea5e9' }} /> {formatDate(b.checkIn)} ➔ {formatDate(b.checkOut)}
                      </span>
                      <span className="trip-info-item">
                        <TbMoon style={{ color: '#8b5cf6' }} /> {b.nights || 1} đêm
                      </span>
                      <span className="trip-info-item">
                        <TbUserCheck style={{ color: '#10b981' }} /> {b.guests || 2} khách
                      </span>
                    </div>

                    {/* READ-ONLY Timestamp Display */}
                    {status === 'checked_in' && b.checkedInAt && (
                      <div className="trip-timestamp-box" style={{ color: '#0369a1', background: '#eff6ff', borderColor: '#93c5fd' }}>
                        <TbKey /> Đã nhận phòng lúc: {new Date(b.checkedInAt).toLocaleString('vi-VN')}
                      </div>
                    )}

                    {status === 'completed' && b.checkedOutAt && (
                      <div className="trip-timestamp-box" style={{ color: '#047857', background: '#f0fdf4', borderColor: '#86efac' }}>
                        <TbCircleCheckFilled /> Đã trả phòng lúc: {new Date(b.checkedOutAt).toLocaleString('vi-VN')}
                      </div>
                    )}

                    {(status === 'cancelled' || status === 'refunded') && b.cancellationReason && (
                      <div className="trip-cancel-reason-box">
                        <TbAlertCircle /> <strong>Lý do hủy đơn (Đã lưu CSDL):</strong> {b.cancellationReason}
                      </div>
                    )}

                    {/* Refund Info for Cancelled Bookings */}
                    {(status === 'cancelled' || status === 'refunded') && (b.refundAmount > 0 || b.refundPercentage > 0) && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          marginTop: 6,
                          background: b.refundPercentage >= 100 ? '#f0fdf4' : b.refundPercentage > 0 ? '#fffbeb' : '#fef2f2',
                          color: b.refundPercentage >= 100 ? '#059669' : b.refundPercentage > 0 ? '#d97706' : '#dc2626',
                          border: `1px solid ${b.refundPercentage >= 100 ? '#a7f3d0' : b.refundPercentage > 0 ? '#fde68a' : '#fecaca'}`,
                        }}
                      >
                        <TbReceiptRefund style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                        <span>
                          Hoàn tiền {b.refundPercentage}% = {Number(b.refundAmount).toLocaleString()} ₫
                          {b.refundSummary?.status === 'processing' && ' • Đang xử lý'}
                          {b.refundSummary?.status === 'completed' && ' • Đã hoàn tiền'}
                        </span>
                      </div>
                    )}

                    {(status === 'cancelled' || status === 'refunded') && b.refundPercentage === 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          marginTop: 6,
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                        }}
                      >
                        <TbCircleX style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                        <span>Không hoàn tiền — đã quá giờ nhận phòng</span>
                      </div>
                    )}
                  </div>

                  <div className="trip-card-bottom">
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>Tổng chi phí</span>
                      <span className="trip-price-val">
                        {formatPrice(b.totalPrice, b.currency || currency)}
                      </span>
                    </div>

                    {/* ACTION BUTTONS: ONLY Cancel Booking & Post Review (NO Check-in/Check-out for user) */}
                    <div className="trip-actions-row">
                      {(onSelectAccommodation || onSelectRoom) && (
                        <button
                          className="trip-btn"
                          style={{ background: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' }}
                          onClick={() => {
                            if (b.accommodationId && onSelectAccommodation) {
                              onSelectAccommodation({ id: b.accommodationId, nameVi: b.accommodationName, title: b.accommodationName });
                            } else if (onSelectRoom) {
                              onSelectRoom(b.roomId || b.id);
                            }
                          }}
                        >
                          <TbHome2 /> Xem chỗ ở
                        </button>
                      )}

                      {canReview && (
                        <button
                          className="trip-btn trip-btn-review"
                          onClick={() => setSelectedReviewBooking(b)}
                        >
                          <TbWriting /> Đăng bài đánh giá
                        </button>
                      )}

                      {isReviewed && (
                        <button
                          className="trip-btn"
                          style={{ background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}
                          onClick={() => setSelectedViewReviewBooking(b)}
                        >
                          <TbMessageCheck /> Xem bài đánh giá đã đăng
                        </button>
                      )}

                      {canCancel && (
                        <button
                          className="trip-btn trip-btn-cancel"
                          onClick={() => setCancelTarget(b)}
                        >
                          <TbTrashX /> Hủy phòng
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog Modal */}
      {cancelTarget && (
        <CancelDialog
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          isLoading={cancelLoading}
        />
      )}

      {/* Write Review / Post Review Modal */}
      {selectedReviewBooking && (
        <WriteReviewModal
          isOpen={Boolean(selectedReviewBooking)}
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* View Submitted Review Modal */}
      {selectedViewReviewBooking && (
        <ViewReviewModal
          isOpen={Boolean(selectedViewReviewBooking)}
          booking={selectedViewReviewBooking}
          onClose={() => setSelectedViewReviewBooking(null)}
        />
      )}
    </div>
  );
};

export default MyTripsPage;
