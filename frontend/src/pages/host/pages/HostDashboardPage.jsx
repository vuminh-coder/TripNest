import React from 'react';
import {
  TbCoin,
  TbCalendarEvent,
  TbStarFilled,
  TbBuildingCastle,
  TbTrendingUp,
  TbCalendarCheck,
  TbAward,
  TbChartBar,
  TbClock,
  TbCheck,
  TbPlus,
  TbArrowRight,
  TbSparkles,
} from 'react-icons/tb';

export const HostDashboardPage = ({
  listings = [],
  bookings = [],
  onNavigate,
  onOpenWizard,
  onApproveBooking,
  currency = 'VND',
}) => {
  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalHostEarnings =
    confirmedBookings.reduce((sum, b) => sum + (b.hostEarnings || 0), 0) +
    44200000;
  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  return (
    <div>
      {/* 4 Standard SaaS Stat KPI Cards */}
      <div className="host-stats-grid">
        <div className="host-stat-card">
          <div>
            <div className="host-stat-label">Tổng doanh thu thực nhận</div>
            <div className="host-stat-value">{formatPrice(totalHostEarnings)}</div>
            <span className="host-stat-trend positive">
              <TbTrendingUp /> +18.4% tháng này
            </span>
          </div>
          <div className="host-stat-icon-wrap earnings">
            <TbCoin />
          </div>
        </div>

        <div className="host-stat-card">
          <div>
            <div className="host-stat-label">Lượt khách đặt phòng</div>
            <div className="host-stat-value">{bookings.length} đơn</div>
            <span className="host-stat-trend positive">
              <TbCalendarCheck />{' '}
              {pendingBookings.length > 0
                ? `${pendingBookings.length} đơn chờ duyệt`
                : 'Tất cả đã xác nhận'}
            </span>
          </div>
          <div className="host-stat-icon-wrap bookings">
            <TbCalendarEvent />
          </div>
        </div>

        <div className="host-stat-card">
          <div>
            <div className="host-stat-label">Điểm đánh giá uy tín</div>
            <div className="host-stat-value">4.96 ★</div>
            <span className="host-stat-trend" style={{ color: '#d97706' }}>
              <TbAward /> Chủ nhà Siêu cấp
            </span>
          </div>
          <div className="host-stat-icon-wrap rating">
            <TbStarFilled />
          </div>
        </div>

        <div className="host-stat-card">
          <div>
            <div className="host-stat-label">Tỷ lệ lấp đầy phòng</div>
            <div className="host-stat-value">86%</div>
            <span className="host-stat-trend positive">
              <TbTrendingUp /> Vượt 12% so với kỳ trước
            </span>
          </div>
          <div className="host-stat-icon-wrap occupancy">
            <TbBuildingCastle />
          </div>
        </div>
      </div>

      {/* Grid: Revenue Chart Visualizer & Recent Bookings Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Monthly Earnings Chart */}
        <div className="host-panel-card" style={{ margin: 0 }}>
          <div className="host-panel-header">
            <h3 className="host-panel-title">
              <TbChartBar style={{ color: 'var(--host-primary)' }} /> Doanh Thu 6 Tháng Gần Nhất
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--host-text-muted)' }}>Đơn vị: Triệu VNĐ</span>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '190px', borderBottom: '1px solid var(--host-border-subtle)', paddingBottom: '0.5rem' }}>
              {[
                { month: 'Thg 3', val: 18.5, heightPercent: '38%' },
                { month: 'Thg 4', val: 24.2, heightPercent: '50%' },
                { month: 'Thg 5', val: 31.0, heightPercent: '64%' },
                { month: 'Thg 6', val: 45.8, heightPercent: '88%' },
                { month: 'Thg 7', val: 52.6, heightPercent: '100%' },
                { month: 'Thg 8', val: 48.9, heightPercent: '92%' },
              ].map((bar) => (
                <div key={bar.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                  <div
                    style={{
                      width: '38px',
                      background: 'linear-gradient(180deg, #ff385c 0%, #fda4af 100%)',
                      borderRadius: '6px 6px 0 0',
                      height: bar.heightPercent,
                      cursor: 'pointer',
                      transition: 'height 0.4s ease, opacity 0.2s ease',
                    }}
                    title={`${bar.val} Triệu VNĐ`}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--host-text-muted)', marginTop: '8px' }}>
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Feed & Quick Approval */}
        <div className="host-panel-card" style={{ margin: 0 }}>
          <div className="host-panel-header">
            <h3 className="host-panel-title">
              <TbClock style={{ color: 'var(--host-indigo)' }} /> Đơn Đặt Phòng Mới
            </h3>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--host-primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => onNavigate('bookings')}
            >
              Xem tất cả ➔
            </button>
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.9rem',
                  borderRadius: 'var(--host-radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--host-border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
                    {b.guestName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>
                    {b.checkIn} ➔ {b.checkOut} ({b.nights} đêm)
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--host-text-main)', whiteSpace: 'nowrap' }}>
                    {formatPrice(b.totalAmount)}
                  </div>
                  {b.status === 'pending' ? (
                    <button
                      type="button"
                      className="host-btn-primary"
                      style={{ padding: '2px 8px', fontSize: '0.72rem', marginTop: '2px' }}
                      onClick={() => onApproveBooking(b.id)}
                    >
                      <TbCheck /> Duyệt đơn
                    </button>
                  ) : (
                    <span className={`host-chip ${b.status === 'confirmed' ? 'success' : 'neutral'}`}>
                      {b.status === 'confirmed' ? 'Đã xác nhận' : 'Đã hủy'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
