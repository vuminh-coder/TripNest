import React from 'react';
import './DashboardPage.css';
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
  const formatVND = (val) => `${(Number(val) || 0).toLocaleString('vi-VN')} ₫`;

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const pendingKycList = hosts.filter((h) => h.kyc_status === 'pending');
  const recentBookings = bookings.slice(0, 5);
  const commission12 = Math.round((stats.totalRevenueVND || 0) * 0.12);

  return (
    <div className="adm-dashboard-container">
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
      <div className="admin-stats-grid adm-dash-stats-grid">
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
            <span className="stat-label">Hoa Hồng Nền Tảng</span>
            <div className="stat-value adm-dash-stat-green">
              {formatVND(commission12 || stats.commissionRevenueVND)}
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
            <div className="adm-dash-progress-wrap">
              <div className="adm-dash-progress-meta">
                <span>Lấp phòng</span>
                <strong>{stats.occupancyRate || 82}%</strong>
              </div>
              <div className="adm-dash-progress-track">
                <div
                  className="adm-dash-progress-bar"
                  style={{ width: `${stats.occupancyRate || 82}%` }}
                />
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
            <div
              className={`stat-value ${stats.pendingKycCount > 0 ? 'adm-dash-kyc-alert' : 'adm-dash-stat-green'}`}
            >
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
      <div className="adm-dash-2col-grid">
        {/* Left: KYC Pending List */}
        <div className="admin-card-box adm-dash-box">
          <div className="admin-card-box-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="adm-dash-dot-red" />
              <h3 className="admin-card-box-title">Hồ Sơ KYC Chờ Duyệt</h3>
            </div>
            <button
              className="adm-dash-view-all-btn"
              onClick={() => onNavigate('hosts_kyc')}
            >
              Xem tất cả <TbArrowRight />
            </button>
          </div>

          <div style={{ padding: '1rem 1.25rem' }}>
            {pendingKycList.length === 0 ? (
              <div className="adm-dash-empty-kyc">
                <TbCircleCheck className="adm-dash-empty-icon" />
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tất cả hồ sơ chủ nhà đã được thẩm định an toàn!</p>
              </div>
            ) : (
              <div className="adm-dash-kyc-list">
                {pendingKycList.map((host) => (
                  <div key={host.id} className="adm-dash-kyc-card">
                    <div className="adm-dash-kyc-info">
                      <img
                        src={host.avatar}
                        alt={host.name}
                        className="adm-dash-kyc-avatar"
                      />
                      <div>
                        <div className="adm-dash-kyc-name">
                          {host.name}
                        </div>
                        <div className="adm-dash-kyc-idcard">
                          CCCD: <strong className="adm-dash-kyc-idcard-code">{host.id_card_number}</strong>
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
        <div className="admin-card-box adm-dash-box">
          <div className="admin-card-box-header">
            <h3 className="admin-card-box-title">Đơn Đặt Phòng Mới Nhất</h3>
            <button
              className="adm-dash-view-all-btn"
              onClick={() => onNavigate('bookings')}
            >
              Xem tất cả <TbArrowRight />
            </button>
          </div>

          <div style={{ padding: '0.5rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentBookings.map((b) => (
                <div key={b.id} className="adm-dash-recent-row">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong className="adm-dash-recent-id">#{b.id}</strong>
                      <span
                        className={`status-pill ${b.status}`}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          ...(b.status === 'checked_in'
                            ? { background: '#e0f2fe', color: '#0284c7', borderColor: '#bae6fd' }
                            : b.status === 'completed'
                            ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }
                            : {}),
                        }}
                      >
                        {b.status === 'confirmed'
                          ? 'ĐÃ XÁC NHẬN'
                          : b.status === 'checked_in'
                          ? 'ĐANG LƯU TRÚ'
                          : b.status === 'completed'
                          ? 'HOÀN TẤT'
                          : b.status === 'pending'
                          ? 'CHỜ DUYỆT'
                          : 'ĐÃ HỦY'}
                      </span>
                    </div>
                    <div className="adm-dash-recent-guest">
                      {b.guest_name || b.guestName} • {formatDateVN(b.check_in || b.checkIn)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="adm-dash-recent-price">
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
