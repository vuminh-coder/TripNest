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
  TbTrendingUp,
  TbClock,
  TbCoins,
  TbFilter,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { HostDashboardSkeleton } from '@/components/common/skeletons';
import HostCashflowTimelineChart from '../components/charts/HostCashflowTimelineChart';
import HostAccommodationDonut from '../components/charts/HostAccommodationDonut';

export const HostDashboardPage = ({
  listings = [],
  bookings = [],
  bankInfo = null,
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

  // Period filters (Default: 7 ngày): 'week' | 'month' | 'quarter' | 'year'
  const [period, setPeriod] = useState('week');
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const res = await apiService.getHostDashboardStats({
          period,
          quarter: selectedQuarter,
          year: selectedYear,
        });
        if (res && res.success) {
          setStatsData(res);
        }
      } catch (e) {
        console.warn('Lỗi khi tải thống kê Host:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [period, selectedQuarter, selectedYear]);

  if (loading && !statsData) {
    return <HostDashboardSkeleton />;
  }

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round((val || 0) / 25000).toLocaleString()}`;
    return `${Number(val || 0).toLocaleString('vi-VN')} ₫`;
  };

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const activeStayCount = bookings.filter((b) => b.status === 'checked_in').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  const netBal = statsData?.kpis?.netEarningsVND ?? availableBalance;
  const escrowBal = statsData?.kpis?.escrowPendingVND ?? pendingEscrowBalance;
  const totalGmv = statsData?.kpis?.totalRevenueVND ?? (netBal + escrowBal);

  return (
    <div className={`host-dash-container ${loading ? 'sk-refresh-overlay' : ''}`}>
      {/* 1. Header Toolbar với Bộ Chọn Chu Kỳ Thời Gian (Period Selector) - Luxury SaaS Style */}
      <div className="host-dash-header-toolbar">
        <div className="host-dash-header-left">
          <h1 className="host-dash-title">
            Tổng Quan Kinh Doanh
          </h1>
          <p className="host-dash-subtitle">
            Hiệu suất doanh thu, cơ cấu cơ sở lưu trú và lịch trình dòng tiền
          </p>
        </div>

        <div className="host-dash-toolbar-controls">
          {/* Period Selector Pills */}
          <div className="host-dash-period-pills">
            <button
              type="button"
              className={`host-dash-pill ${period === 'week' ? 'active' : ''}`}
              onClick={() => setPeriod('week')}
            >
              7 Ngày
            </button>
            <button
              type="button"
              className={`host-dash-pill ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              Tháng Này
            </button>
            <button
              type="button"
              className={`host-dash-pill ${period === 'quarter' ? 'active' : ''}`}
              onClick={() => setPeriod('quarter')}
            >
              Quý {selectedQuarter}
            </button>
            <button
              type="button"
              className={`host-dash-pill ${period === 'year' ? 'active' : ''}`}
              onClick={() => setPeriod('year')}
            >
              Cả Năm
            </button>
          </div>

          {/* Sub-selects for Quarter/Year */}
          {period === 'quarter' && (
            <select
              className="host-dash-sub-select"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
            >
              <option value={1}>Quý 1 (T1-T3)</option>
              <option value={2}>Quý 2 (T4-T6)</option>
              <option value={3}>Quý 3 (T7-T9)</option>
              <option value={4}>Quý 4 (T10-T12)</option>
            </select>
          )}

          {period === 'year' && (
            <select
              className="host-dash-sub-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
            </select>
          )}

          {/* Action CTA Button */}
          <button
            type="button"
            className="host-dash-btn-add"
            onClick={onOpenWizard}
          >
            <TbPlus /> <span>Đăng Ký Chỗ Nghỉ</span>
          </button>
        </div>
      </div>

      {/* 2. Lưới 4 Thẻ Chỉ Số Cốt Lõi (Executive Glassmorphism KPI Cards) */}
      <div className="host-dash-kpi-grid">
        {/* Thẻ 1: Số dư khả dụng (Đã về ví - 88%) */}
        <div className="stat-card-glass card-border-emerald">
          <div className="stat-card-content">
            <span className="stat-label">Số Dư Ví Khả Dụng</span>
            <div className="stat-value text-emerald">
              {formatPrice(netBal)}
            </div>
            <div className="stat-trend trend-emerald">
              <TbSparkles />
              <span>Sẵn sàng rút về ví</span>
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbCoin />
          </div>
        </div>

        {/* Thẻ 2: Quỹ Escrow Tạm Giữ */}
        <div className="stat-card-glass card-border-amber">
          <div className="stat-card-content">
            <span className="stat-label">Quỹ Escrow Tạm Giữ</span>
            <div className="stat-value text-amber">
              {formatPrice(escrowBal)}
            </div>
            <div className="stat-trend trend-amber">
              <TbClock />
              <span>{escrowBal > 0 ? 'Chờ khách check-out' : 'Đã giải ngân hết'}</span>
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbClock />
          </div>
        </div>

        {/* Thẻ 3: Tổng Doanh Thu GMV Các Cơ Sở */}
        <div className="stat-card-glass card-border-coral">
          <div className="stat-card-content">
            <span className="stat-label">Tổng Doanh Thu GMV</span>
            <div className="stat-value text-coral">
              {formatPrice(totalGmv)}
            </div>
            <div className="stat-trend trend-up">
              <TbTrendingUp />
              <span>{statsData?.kpis?.totalAccommodations ?? listings.length} cơ sở hoạt động</span>
            </div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>

        {/* Thẻ 4: Lượt Khách & Tình Trạng Lưu Trú */}
        <div className="stat-card-glass card-border-indigo">
          <div className="stat-card-content">
            <span className="stat-label">Đơn Đặt & Lấp Phòng</span>
            <div className="stat-value text-indigo">
              {statsData?.kpis?.totalBookings ?? bookings.length} đơn
            </div>
            <div className="host-dash-progress-wrap">
              <div className="host-dash-progress-meta">
                <span>Tỷ lệ lấp đầy</span>
                <strong>
                  {statsData?.kpis?.occupancyRate !== undefined
                    ? `${statsData.kpis.occupancyRate}%`
                    : `${listings.length > 0 ? Math.round((activeStayCount / listings.length) * 100) : 0}%`}
                  {activeStayCount > 0 ? ` (${activeStayCount} phòng đang ở)` : ''}
                </strong>
              </div>
              <div className="host-dash-progress-track">
                <div
                  className="host-dash-progress-bar"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        statsData?.kpis?.occupancyRate !== undefined
                          ? statsData.kpis.occupancyRate
                          : (listings.length > 0 ? Math.round((activeStayCount / listings.length) * 100) : 0),
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <div className="stat-icon-wrap indigo">
            <TbCalendarEvent />
          </div>
        </div>
      </div>

      {/* 3. Khối 2 Biểu Đồ Chủ Lực (Dòng Tiền Đa Chu Kỳ + Cơ Cấu Chỗ Nghỉ) */}
      <div className="host-dash-charts-grid">
        {/* Biểu đồ 1: Dòng tiền đa chu kỳ (Left / Main) */}
        <div className="host-dash-chart-col-main">
          <HostCashflowTimelineChart
            timeline={statsData?.timeline || []}
            period={period}
            loading={loading}
          />
        </div>

        {/* Biểu đồ 2: Cơ cấu doanh thu các cơ sở lưu trú (Right) */}
        <div className="host-dash-chart-col-side">
          <HostAccommodationDonut
            accommodations={statsData?.accommodationBreakdown || []}
            financialBreakdown={statsData?.financialBreakdown || {}}
            totalGmv={totalGmv}
            currency={currency}
            onSelectAccommodation={() => {
              if (onNavigate) onNavigate('accommodations');
            }}
          />
        </div>
      </div>

      {/* 4. Bảng Quản Lý Đơn Đặt Phòng Cần Xử Lý */}
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
            /* Empty State Khi Chưa Có Đơn */
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
                    {/* Mã đặt phòng */}
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

                    {/* Lịch trình lưu trú */}
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
                        (Đã trừ phí dịch vụ)
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
                        <span style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)', fontStyle: 'normal', fontWeight: 600 }}>
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
