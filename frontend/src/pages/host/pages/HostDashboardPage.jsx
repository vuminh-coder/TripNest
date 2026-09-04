import React, { useState, useEffect } from 'react';
import './HostDashboardPage.css';
import {
  TbCoin,
  TbCalendarEvent,
  TbBuildingCastle,
  TbArrowRight,
  TbLogin,
  TbLogout,
  TbCheck,
  TbPlus,
  TbSparkles,
  TbInbox,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { HostDashboardSkeleton } from '@/components/common/skeletons';

export const HostDashboardPage = ({
  listings = [],
  bookings = [],
  bankInfo = { bankName: 'Vietcombank (VCB)', accountNumber: '9988776655', accountHolder: 'MINH VŨ' },
  availableBalance = 0,
  pendingEscrowBalance = 0,
  onNavigate,
  onOpenWizard,
  onApproveBooking,
  onCheckInBooking,
  onCheckOutBooking,
  currency = 'VND',
}) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiService.getHostDashboardStats();
        if (res && res.success) {
          setStatsData(res);
        }
      } catch (e) {
        // Fallback to computed props
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading && !statsData && listings.length === 0 && bookings.length === 0) {
    return <HostDashboardSkeleton />;
  }

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round((val || 0) / 25000).toLocaleString()}`;
    return `${Number(val || 0).toLocaleString('vi-VN')} ₫`;
  };

  // Helper chuyển đổi định dạng ngày sang DD/MM/YYYY chuẩn tiếng Việt
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const validBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'completed'
  );
  const activeStayCount = bookings.filter((b) => b.status === 'checked_in').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="host-dash-container">
      {/* 1. Header Tinh Gọn: Tiêu đề & Nút Tạo chỗ ở mới */}
      <div className="host-dash-header">
        <div>
          <h2 className="host-dash-title">
            Tổng Quan Hoạt Động
          </h2>
          <p className="host-dash-subtitle">
            Hiệu suất kinh doanh và quản lý lưu trú thời gian thực của bạn
          </p>
        </div>

        <button
          type="button"
          className="host-btn-primary"
          onClick={onOpenWizard}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.84rem', gap: '6px' }}
        >
          <TbPlus style={{ fontSize: '1.1rem' }} /> Đăng Ký Chỗ Ở Mới
        </button>
      </div>

      {/* 2. Lưới 3 Thẻ Chỉ Số Cốt Lõi (Minimalist KPI Cards) */}
      <div className="host-dash-kpi-grid">
        {/* Thẻ 1: Số dư khả dụng & Tạm giữ Escrow */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Số dư khả dụng (Đã về ví)</div>
            <div className="host-stat-value" style={{ color: '#059669', whiteSpace: 'nowrap' }}>
              {formatPrice(statsData?.kpis?.netEarningsVND ?? availableBalance)}
            </div>
            <span className={`host-dash-balance-sub ${(statsData?.kpis?.escrowPendingVND ?? pendingEscrowBalance) > 0 ? 'pending' : 'cleared'}`}>
              {(statsData?.kpis?.escrowPendingVND ?? pendingEscrowBalance) > 0
                ? `⏳ ${formatPrice(statsData?.kpis?.escrowPendingVND ?? pendingEscrowBalance)} chờ Admin giải ngân`
                : 'Đã giải ngân toàn bộ'}
            </span>
          </div>
          <div className="host-stat-icon-wrap earnings">
            <TbCoin />
          </div>
        </div>

        {/* Thẻ 2: Lượt khách & Tình trạng lưu trú */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Đơn đặt & Lưu trú</div>
            <div className="host-stat-value" style={{ whiteSpace: 'nowrap' }}>
              {statsData?.kpis?.totalBookings ?? bookings.length} đơn
            </div>
            <span
              style={{
                fontSize: '0.76rem',
                color: activeStayCount > 0 ? '#0284c7' : pendingCount > 0 ? '#d97706' : '#64748b',
                fontWeight: activeStayCount > 0 || pendingCount > 0 ? 700 : 500,
                marginTop: '3px',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              {activeStayCount > 0
                ? `● ${activeStayCount} phòng đang lưu trú`
                : pendingCount > 0
                ? `● ${pendingCount} đơn chờ duyệt`
                : bookings.length > 0
                ? 'Tất cả đã xác nhận'
                : 'Sẵn sàng đón khách mới'}
            </span>
          </div>
          <div className="host-stat-icon-wrap bookings">
            <TbCalendarEvent />
          </div>
        </div>

        {/* Thẻ 3: Chỗ ở & Đánh giá uy tín */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Chỗ ở & Đánh giá</div>
            <div className="host-stat-value" style={{ whiteSpace: 'nowrap' }}>
              {statsData?.kpis?.totalAccommodations ?? listings.length} chỗ {listings.length > 0 && <span style={{ color: '#d97706', fontSize: '1.25rem' }}>· {statsData?.host?.rating || '4.96'} ★</span>}
            </div>
            <span className="host-dash-superhost-tag">
              <TbSparkles /> {statsData?.host?.isSuperhost !== false ? 'Danh hiệu Superhost 5 sao' : 'Chủ nhà TripNest uy tín'}
            </span>
          </div>
          <div className="host-stat-icon-wrap rating">
            <TbBuildingCastle />
          </div>
        </div>
      </div>

      {/* 3. Bảng Quản Lý Đơn Đặt Phòng Cốt Lõi (Anti-Wrapping Protected) */}
      <div className="host-panel-card" style={{ margin: 0 }}>
        <div className="host-panel-header">
          <div>
            <h3 className="host-panel-title" style={{ fontSize: '0.95rem' }}>
              <TbCalendarEvent style={{ color: 'var(--host-indigo)' }} /> Đơn Đặt Phòng Cần Xử Lý
            </h3>
          </div>

          {bookings.length > 0 && (
            <button
              type="button"
              className="host-dash-view-all-btn"
              onClick={() => onNavigate('bookings')}
            >
              Xem toàn bộ ({bookings.length}) <TbArrowRight />
            </button>
          )}
        </div>

        <div className="host-table-wrap">
          {bookings.length === 0 ? (
            /* Luxury Empty State Khi Chưa Có Đơn */
            <div className="host-dash-empty-state">
              <div className="host-dash-empty-icon-wrap">
                <TbInbox />
              </div>
              <h4 className="host-dash-empty-title">
                Chưa có đơn đặt phòng nào
              </h4>
              <p className="host-dash-empty-desc">
                Chỗ nghỉ của bạn đã mở bán và sẵn sàng đón tiếp khách. Các đơn đặt phòng mới cần xử lý sẽ xuất hiện tại đây.
              </p>
              <button
                type="button"
                className="host-btn-primary"
                onClick={onOpenWizard}
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                <TbPlus /> Đăng Ký Thêm Chỗ Ở
              </button>
            </div>
          ) : (
            <table className="host-saas-table" style={{ width: '100%', minWidth: '940px' }}>
              <thead>
                <tr>
                  <th style={{ width: '130px', whiteSpace: 'nowrap' }}>MÃ ĐẶT</th>
                  <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>KHÁCH HÀNG</th>
                  <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>CHỖ NGHỈ</th>
                  <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>THỜI GIAN LƯU TRÚ</th>
                  <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>THỰC NHẬN</th>
                  <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right', minWidth: '130px', whiteSpace: 'nowrap' }}>THAO TÁC NHANH</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id || b.code}>
                    {/* Mã đặt phòng: Luôn liền mạch 1 dòng */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong className="host-dash-code-tag">
                        {b.code || b.bookingCode || ('TN-' + b.id)}
                      </strong>
                    </td>

                    {/* Khách hàng */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--host-text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {b.guestName || 'Khách hàng TripNest'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap' }}>
                        {b.guestPhone || b.guestEmail || '0912 345 678'}
                      </div>
                    </td>

                    {/* Chỗ nghỉ */}
                    <td>
                      <div
                        className="host-dash-room-title"
                        title={b.roomTitle || b.listingName || b.roomName || 'Căn hộ nghỉ dưỡng cao cấp'}
                      >
                        {b.roomTitle || b.listingName || b.roomName || 'Căn hộ nghỉ dưỡng cao cấp'}
                      </div>
                      <div className="host-dash-room-city">
                        {b.city || 'Đà Lạt'}
                      </div>
                    </td>

                    {/* Lịch trình lưu trú: Chuẩn DD/MM/YYYY không xuống dòng */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, color: 'var(--host-text-main)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {formatDateVN(b.checkIn || b.check_in)} ➔ {formatDateVN(b.checkOut || b.check_out)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap' }}>
                        {b.guests || 2} khách · {b.nights || 1} đêm
                      </div>
                    </td>

                    {/* Thực nhận */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="host-dash-net-payout">
                        {formatPrice(
                          b.hostEarnings ??
                          b.hostPayoutAmount ??
                          (b.grossAmount && b.commissionFee ? b.grossAmount - b.commissionFee : null) ??
                          (b.basePrice && b.cleaningFee ? b.basePrice + b.cleaningFee - (b.serviceFee || Math.round(b.basePrice * 0.12)) : null) ??
                          (b.totalAmount ? Math.round(b.totalAmount * 0.88) : null) ??
                          (b.totalPrice ? Math.round(b.totalPrice * 0.88) : 0)
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap' }}>
                        {b.commissionFee || b.serviceFee
                          ? `Đã trừ 12% phí sàn (-${formatPrice(b.commissionFee || b.serviceFee)})`
                          : 'Đã trừ 12% phí sàn'}
                      </div>
                      {b.hasVoucher && (
                        <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                          🎟️ Voucher sàn {b.voucherCode ? `(${b.voucherCode})` : ''}
                        </div>
                      )}
                    </td>

                    {/* Trạng thái đơn */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`status-pill ${b.status}`}>
                        {b.status === 'confirmed'
                          ? 'ĐÃ DUYỆT'
                          : b.status === 'checked_in'
                          ? 'ĐANG Ở'
                          : b.status === 'completed'
                          ? 'HOÀN TẤT'
                          : b.status === 'cancelled'
                          ? 'ĐÃ HỦY'
                          : 'CHỜ DUYỆT'}
                      </span>
                    </td>

                    {/* Thao tác nhanh */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {b.status === 'pending' && (
                        <button
                          type="button"
                          className="host-btn-action success"
                          title="Phê duyệt nhận khách ngay"
                          onClick={() => onApproveBooking(b.id)}
                        >
                          <TbCheck /> <span>Duyệt</span>
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          className="host-btn-action info"
                          title="Xác nhận khách đã nhận phòng"
                          onClick={() => onCheckInBooking(b.id)}
                        >
                          <TbLogin /> <span>Check-in</span>
                        </button>
                      )}
                      {b.status === 'checked_in' && (
                        <button
                          type="button"
                          className="host-btn-action success"
                          title="Hoàn tất trả phòng & thanh toán"
                          onClick={() => onCheckOutBooking(b.id)}
                        >
                          <TbLogout /> <span>Check-out</span>
                        </button>
                      )}
                      {(b.status === 'completed' || b.status === 'cancelled') && (
                        <span style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)', fontStyle: 'italic' }}>
                          Đã lưu trữ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
