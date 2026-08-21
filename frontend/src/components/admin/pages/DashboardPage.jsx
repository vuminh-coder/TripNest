import React from 'react';
import {
  TbCoins,
  TbCalendarEvent,
  TbTrendingUp,
  TbIdBadge2,
  TbCircleCheck,
  TbArrowRight,
  TbShieldCheck,
  TbBuildingCastle,
  TbSparkles,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';

export const DashboardPage = ({ stats, bookings, hosts, onNavigate, onOpenKycModal }) => {
  const formatVND = (val) => `${(val || 0).toLocaleString()} ₫`;

  const pendingKycList = hosts.filter((h) => h.kyc_status === 'pending');
  const recentBookings = bookings.slice(0, 5);

  return (
    <div>
      {/* Page Header */}
      <AdminPageHeader
        title="Tổng Quan Vận Hành"
        subtitle="Chỉ số hiệu suất và trung tâm giám sát hệ thống thời gian thực"
        actionButton={
          <button className="btn-admin-primary" onClick={() => onNavigate('accommodations')}>
            <TbBuildingCastle />
            <span>Chỗ Ở & Hạng Phòng</span>
          </button>
        }
      />

      {/* 4 Stats Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Tổng GMV Đã Đặt</span>
            <div className="stat-value">{formatVND(stats.totalRevenueVND)}</div>
            <div className="stat-trend trend-up">
              <TbTrendingUp />
              <span>+{stats.growthRatePercent || 18.5}% tăng trưởng</span>
            </div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>

        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Hoa Hồng Sàn (11%)</span>
            <div className="stat-value" style={{ color: '#059669' }}>
              {formatVND(stats.commissionRevenueVND)}
            </div>
            <div className="stat-trend trend-up">
              <TbSparkles />
              <span>Lợi nhuận sàn giữ lại</span>
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbCoins />
          </div>
        </div>

        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Đơn Đặt Phòng</span>
            <div className="stat-value">{stats.totalBookings || 0}</div>
            {/* Progress bar */}
            <div style={{ marginTop: '4px', width: '130px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '2px' }}>
                <span>Lấp phòng</span>
                <strong>{stats.occupancyRate || 82}%</strong>
              </div>
              <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.occupancyRate || 82}%`, height: '100%', background: '#0ea5e9', borderRadius: '999px' }} />
              </div>
            </div>
          </div>
          <div className="stat-icon-wrap blue">
            <TbCalendarEvent />
          </div>
        </div>

        <div className="stat-card-glass">
          <div>
            <span className="stat-label">KYC Cần Thẩm Định</span>
            <div className="stat-value" style={{ color: stats.pendingKycCount > 0 ? '#e11d48' : '#059669' }}>
              {stats.pendingKycCount || 0}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              Tổng <strong>{hosts.length}</strong> chủ nhà
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbIdBadge2 />
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: KYC Pending Notice & Recent Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Left: KYC Pending List */}
        <div className="admin-card-box" style={{ marginBottom: 0 }}>
          <div className="admin-card-box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <h3 className="admin-card-box-title">Hồ Sơ KYC Chờ Duyệt</h3>
            </div>
            <button
              style={{ fontSize: '0.8rem', color: '#ff385c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate('hosts_kyc')}
            >
              Xem tất cả <TbArrowRight />
            </button>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            {pendingKycList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.75rem 0', color: '#059669' }}>
                <TbCircleCheck style={{ fontSize: '2.2rem', marginBottom: '4px' }} />
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tất cả hồ sơ chủ nhà đã được thẩm định an toàn!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingKycList.map((host) => (
                  <div
                    key={host.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #edf2f7',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={host.avatar}
                        alt={host.name}
                        style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {host.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          CCCD: <strong style={{ fontFamily: 'monospace' }}>{host.id_card_number}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-admin-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                      onClick={() => onOpenKycModal(host)}
                    >
                      <TbShieldCheck />
                      <span>Thẩm Định</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Bookings */}
        <div className="admin-card-box" style={{ marginBottom: 0 }}>
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">Đơn Đặt Phòng Mới Nhất</h3>
            <button
              style={{ fontSize: '0.8rem', color: '#ff385c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => onNavigate('bookings')}
            >
              Xem tất cả <TbArrowRight />
            </button>
          </div>

          <div style={{ padding: '0.5rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>#{b.id}</strong>
                      <span className={`status-pill ${b.status}`} style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      {b.guest_name} • {b.check_in}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                      {formatVND(b.total_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
