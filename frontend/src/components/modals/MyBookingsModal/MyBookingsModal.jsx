import './MyBookingsModal.css';
import React, { useState, useEffect, useCallback } from 'react';
import {
  TbX, TbCalendarCheck, TbTrash, TbMapPin, TbClock, TbUsers,
  TbPlaneDeparture, TbStar, TbLogin, TbLogout, TbAlertCircle,
  TbCircleCheck, TbInfoCircle, TbClockHour4, TbBan, TbRefresh,
  TbMoodSad, TbBeach, TbPlane,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { apiService } from '@/services/api';
import WriteReviewModal from '../WriteReviewModal/WriteReviewModal';

// ===== Status Configuration =====
const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: TbClockHour4 },
  confirmed: { label: 'Đã xác nhận', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: TbCircleCheck },
  checked_in: { label: 'Đang ở', color: '#0369a1', bg: '#eff6ff', border: '#93c5fd', icon: TbLogin },
  completed: { label: 'Đã hoàn thành', color: '#047857', bg: '#f0fdf4', border: '#86efac', icon: TbCircleCheck },
  cancelled: { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: TbBan },
  refunded: { label: 'Đã hoàn tiền', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: TbRefresh },
};

const TABS = [
  { key: 'all', label: 'Tất cả', icon: TbPlaneDeparture },
  { key: 'upcoming', label: 'Sắp tới', icon: TbPlane },
  { key: 'active', label: 'Đang ở', icon: TbBeach },
  { key: 'completed', label: 'Đã xong', icon: TbCircleCheck },
  { key: 'cancelled', label: 'Đã hủy', icon: TbBan },
];

const CANCEL_REASONS = [
  'Thay đổi lịch trình du lịch',
  'Tìm được chỗ ở tốt hơn',
  'Lý do cá nhân / sức khỏe',
  'Thay đổi số lượng khách',
  'Sai thông tin đặt phòng',
];

// ===== Cancel Dialog Component =====
const CancelDialog = ({ booking, onConfirm, onClose, isLoading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selectedReason === 'custom'
    ? customReason.trim() || 'Khách hàng yêu cầu hủy.'
    : selectedReason || 'Khách hàng yêu cầu hủy qua ứng dụng.';

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

          <div className="cancel-refund-notice">
            <TbInfoCircle />
            <div>
              <strong>Chính sách hoàn tiền:</strong> Số tiền{' '}
              <strong>{Number(booking.totalPrice).toLocaleString()} ₫</strong>{' '}
              sẽ được hoàn lại vào tài khoản thanh toán trong 5-10 ngày làm việc.
            </div>
          </div>
        </div>

        <div className="cancel-dialog-footer">
          <button className="cancel-btn-keep" onClick={onClose}>
            Giữ lại lịch trình
          </button>
          <button
            className="cancel-btn-confirm"
            disabled={isLoading}
            onClick={() => onConfirm(finalReason)}
          >
            {isLoading ? <span className="action-spinner" /> : <TbTrash />}
            {isLoading ? 'Đang hủy...' : 'Xác nhận hủy phòng'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Skeleton Loading =====
const BookingSkeleton = () => (
  <div className="booking-skeleton">
    <div className="skeleton-image" />
    <div className="skeleton-body">
      <div className="skeleton-line w-40" />
      <div className="skeleton-line w-80" />
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-30" />
    </div>
  </div>
);

// ===== Main Component =====
export const MyBookingsModal = ({
  isOpen,
  onClose,
  bookings: externalBookings = [],
  onCancelBooking,
  onCheckIn,
  onCheckOut,
  currency = 'VND',
}) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // bookingId being actioned
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_reviewed_bookings') || '[]');
    } catch {
      return [];
    }
  });

  // Fetch bookings from Backend when modal opens
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getMyBookings();
      if (Array.isArray(data) && data.length > 0) {
        setBookings(data);
      } else {
        // Fallback to external bookings from App state
        setBookings(externalBookings);
      }
    } catch {
      setBookings(externalBookings);
    } finally {
      setLoading(false);
    }
  }, [externalBookings]);

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen, fetchBookings]);

  // Sync external bookings when they change (new booking created)
  useEffect(() => {
    if (isOpen && externalBookings.length > bookings.length) {
      fetchBookings();
    }
  }, [externalBookings.length]);

  if (!isOpen) return null;

  // ===== Format Helpers =====
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

  // ===== Filter bookings by tab =====
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

  // ===== Tab counts =====
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

  // ===== Actions =====
  const handleCancelConfirm = async (reason) => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const result = await apiService.cancelBooking(cancelTarget.id, reason);

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelTarget.id
            ? {
                ...b,
                status: 'cancelled',
                statusLabel: 'Đã hủy',
                cancellationReason: reason,
                cancelledAt: new Date().toISOString(),
                canCancel: false,
                canCheckIn: false,
                canCheckOut: false,
              }
            : b
        )
      );

      // Propagate to parent
      if (onCancelBooking) onCancelBooking(cancelTarget.id, reason, result?.refund);

      toast.success(
        'Đã hủy đơn đặt phòng',
        `Đơn #${cancelTarget.id} đã được hủy. Hoàn tiền sẽ xử lý trong 5-10 ngày làm việc.`
      );
    } catch (err) {
      toast.error('Lỗi hủy đơn', err.message || 'Không thể hủy đơn đặt phòng.');
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  };

  const handleCheckIn = async (booking) => {
    setActionLoading(booking.id);
    try {
      const result = await apiService.checkIn(booking.id);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: 'checked_in',
                statusLabel: 'Đang ở',
                checkedInAt: new Date().toISOString(),
                canCancel: false,
                canCheckIn: false,
                canCheckOut: true,
              }
            : b
        )
      );

      if (onCheckIn) onCheckIn(booking.id);

      toast.success(
        'Nhận phòng thành công!',
        `Chào mừng bạn đến ${booking.roomTitle}. Chúc bạn có kỳ nghỉ tuyệt vời!`
      );
    } catch (err) {
      toast.error('Lỗi nhận phòng', err.message || 'Không thể xác nhận nhận phòng.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (booking) => {
    const isConfirmed = await confirm({
      title: 'Xác nhận trả phòng?',
      html: `Bạn có chắc chắn muốn trả phòng <b>${booking.roomTitle}</b>?<br><span style="color: #64748b; font-size: 0.85rem;">Sau khi trả phòng, bạn có thể đánh giá chất lượng chỗ ở.</span>`,
      type: 'info',
      confirmText: 'Xác nhận trả phòng',
      cancelText: 'Ở thêm',
    });

    if (!isConfirmed) return;

    setActionLoading(booking.id);
    try {
      const result = await apiService.checkOut(booking.id);

      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? {
                ...b,
                status: 'completed',
                statusLabel: 'Đã hoàn thành',
                checkedOutAt: new Date().toISOString(),
                canCancel: false,
                canCheckIn: false,
                canCheckOut: false,
                canReview: true,
              }
            : b
        )
      );

      if (onCheckOut) onCheckOut(booking.id);

      toast.success(
        'Trả phòng thành công!',
        `Cảm ơn bạn đã lưu trú tại ${booking.roomTitle}. Hãy để lại đánh giá cho chuyến đi nhé!`
      );
    } catch (err) {
      toast.error('Lỗi trả phòng', err.message || 'Không thể xác nhận trả phòng.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReviewSuccess = (bookingId) => {
    const nextList = [...reviewedBookingIds, bookingId];
    setReviewedBookingIds(nextList);
    localStorage.setItem('tripnest_reviewed_bookings', JSON.stringify(nextList));

    // Update local booking state
    setBookings((prev) =>
      prev.map((b) =>
        (b.id === bookingId || b.bookingId === bookingId)
          ? { ...b, canReview: false, hasReview: true }
          : b
      )
    );
  };

  // ===== Empty States =====
  const emptyMessages = {
    all: { title: 'Chưa có chuyến đi nào', desc: 'Khi bạn hoàn tất đặt phòng trên TripNest, toàn bộ lịch trình sẽ hiển thị tại đây.', icon: TbPlaneDeparture, color: '#ff385c', bg: '#fff1f2' },
    upcoming: { title: 'Không có chuyến sắp tới', desc: 'Bạn chưa có chuyến đi nào sắp tới. Hãy khám phá các điểm đến tuyệt vời!', icon: TbPlane, color: '#0ea5e9', bg: '#eff6ff' },
    active: { title: 'Không có chuyến đang diễn ra', desc: 'Hiện tại bạn không có chuyến đi nào đang diễn ra.', icon: TbBeach, color: '#059669', bg: '#ecfdf5' },
    completed: { title: 'Chưa hoàn thành chuyến nào', desc: 'Các chuyến đi đã hoàn thành sẽ được hiển thị tại đây.', icon: TbCircleCheck, color: '#047857', bg: '#f0fdf4' },
    cancelled: { title: 'Không có đơn bị hủy', desc: 'Tuyệt vời! Bạn không có đơn đặt phòng nào bị hủy.', icon: TbMoodSad, color: '#64748b', bg: '#f8fafc' },
  };

  const emptyState = emptyMessages[activeTab] || emptyMessages.all;

  // ===== Render =====
  return (
    <>
      <div className="auth-modal-overlay" onClick={onClose}>
        <div
          className="auth-modal-card"
          style={{ width: '800px', maxWidth: '95vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="auth-modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TbPlaneDeparture style={{ fontSize: '1.4rem', color: '#ff385c' }} />
              <h2>Chuyến đi của bạn</h2>
            </div>
            <button className="auth-modal-close-btn" onClick={onClose} title="Đóng">
              <TbX />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="bookings-tab-bar">
            {TABS.map((tab) => {
              const count = getTabCount(tab.key);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`bookings-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <Icon style={{ fontSize: '1rem' }} />
                  {tab.label}
                  {count > 0 && (
                    <span className="bookings-tab-badge">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div style={{ padding: '1.25rem 1.5rem', maxHeight: '62vh', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <BookingSkeleton />
                <BookingSkeleton />
                <BookingSkeleton />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="booking-empty-state">
                <div
                  className="booking-empty-icon"
                  style={{ background: emptyState.bg, color: emptyState.color }}
                >
                  <emptyState.icon />
                </div>
                <h3 className="booking-empty-title">{emptyState.title}</h3>
                <p className="booking-empty-desc">{emptyState.desc}</p>
                <button
                  className="auth-primary-submit"
                  style={{ width: 'auto', display: 'inline-flex', padding: '0.65rem 1.75rem', margin: '0 auto' }}
                  onClick={onClose}
                >
                  Khám phá các điểm đến ngay
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredBookings.map((b) => {
                  const status = b.status || 'confirmed';
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.confirmed;
                  const StatusIcon = config.icon;
                  const isReviewed = b.hasReview || reviewedBookingIds.includes(b.id) || reviewedBookingIds.includes(b.bookingId);
                  const isThisLoading = actionLoading === b.id;
                  const canCancel = b.canCancel !== undefined ? b.canCancel : (status === 'confirmed' || status === 'pending');
                  const canCheckIn = b.canCheckIn !== undefined ? b.canCheckIn : status === 'confirmed';
                  const canCheckOut = b.canCheckOut !== undefined ? b.canCheckOut : status === 'checked_in';
                  const canReview = (b.canReview !== undefined ? b.canReview : status === 'completed') && !isReviewed;

                  return (
                    <div
                      key={b.id}
                      className={`booking-card ${status === 'cancelled' || status === 'refunded' ? 'card-cancelled' : ''}`}
                    >
                      <img
                        className="booking-card-image"
                        src={b.roomImage || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=300&auto=format&fit=crop&q=80'}
                        alt={b.roomTitle}
                      />

                      <div className="booking-card-body">
                        <div className="booking-card-header">
                          <span
                            className={`booking-status-badge status-${status}`}
                          >
                            <StatusIcon style={{ fontSize: '0.85rem' }} />
                            {config.label} • #{b.id}
                          </span>
                          <span className="booking-card-meta">
                            <TbUsers style={{ fontSize: '0.95rem' }} /> {b.guests || 2} khách • {b.nights || 1} đêm
                          </span>
                        </div>

                        <h4 className="booking-card-title">{b.roomTitle}</h4>

                        <div className="booking-card-location">
                          <TbMapPin style={{ color: '#ff385c' }} /> {b.roomCity || 'Việt Nam'}
                        </div>

                        <div className="booking-card-footer">
                          <span className="booking-card-dates">
                            <TbClock style={{ color: '#0ea5e9' }} />
                            {formatDate(b.checkIn)} ➔ {formatDate(b.checkOut)}
                          </span>
                          <span className="booking-card-price">
                            {formatPrice(b.totalPrice, b.currency || currency)}
                          </span>
                        </div>

                        {/* Cancellation info */}
                        {(status === 'cancelled' || status === 'refunded') && b.cancellationReason && (
                          <div className="booking-cancel-info">
                            <TbAlertCircle />
                            <span>
                              <strong>Lý do:</strong> {b.cancellationReason}
                              {b.cancelledAt && (
                                <> • {formatDate(b.cancelledAt)}</>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Check-in time info */}
                        {status === 'checked_in' && b.checkedInAt && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '5px 10px', background: '#eff6ff', border: '1px solid #93c5fd',
                            borderRadius: '8px', fontSize: '0.75rem', color: '#1d4ed8', marginTop: '6px'
                          }}>
                            <TbLogin style={{ fontSize: '0.9rem' }} />
                            Nhận phòng lúc: {new Date(b.checkedInAt).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="booking-card-actions">
                        {canCheckIn && (
                          <button
                            className="booking-action-btn btn-checkin"
                            onClick={() => handleCheckIn(b)}
                            disabled={isThisLoading}
                            title="Xác nhận nhận phòng"
                          >
                            {isThisLoading ? <span className="action-spinner" /> : <TbLogin />}
                            Check-in
                          </button>
                        )}

                        {canCheckOut && (
                          <button
                            className="booking-action-btn btn-checkout"
                            onClick={() => handleCheckOut(b)}
                            disabled={isThisLoading}
                            title="Xác nhận trả phòng"
                          >
                            {isThisLoading ? <span className="action-spinner" /> : <TbLogout />}
                            Check-out
                          </button>
                        )}

                        {canReview && (
                          <button
                            className="booking-action-btn btn-review"
                            onClick={() => setSelectedReviewBooking(b)}
                            title="Đánh giá chất lượng chuyến đi"
                          >
                            <TbStar /> Đánh giá
                          </button>
                        )}

                        {isReviewed && status === 'completed' && (
                          <span style={{
                            padding: '5px 10px', background: '#f8fafc', color: '#059669',
                            border: '1px solid #cbd5e1', borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 700, textAlign: 'center',
                          }}>
                            ✓ Đã đánh giá
                          </span>
                        )}

                        {canCancel && (
                          <button
                            className="booking-action-btn btn-cancel"
                            onClick={() => setCancelTarget(b)}
                            disabled={isThisLoading}
                            title="Hủy đặt phòng"
                          >
                            <TbTrash /> Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Dialog */}
      {cancelTarget && (
        <CancelDialog
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          isLoading={cancelLoading}
        />
      )}

      {/* Review Modal */}
      {selectedReviewBooking && (
        <WriteReviewModal
          isOpen={Boolean(selectedReviewBooking)}
          booking={selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};

export default MyBookingsModal;
