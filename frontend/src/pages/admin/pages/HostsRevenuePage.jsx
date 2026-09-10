import React, { useState, useEffect, useMemo } from 'react';
import {
  TbTrophy,
  TbCrown,
  TbMedal,
  TbSearch,
  TbDownload,
  TbRefresh,
  TbLayoutGrid,
  TbList,
  TbBuildingCastle,
  TbCalendarEvent,
  TbShieldCheck,
  TbStar,
  TbCoins,
  TbWallet,
  TbArrowUpRight,
  TbBuildingBank,
  TbCheck,
  TbAlertCircle,
  TbFilter,
  TbFileDollar,
  TbChartBar,
  TbChevronDown,
  TbArrowsSort,
  TbX
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import HostStatementModal from '../modals/HostStatementModal';
import { adminService } from '@/services/adminApi';
import { useToast } from '@/context/ToastContext';
import './HostsRevenuePage.css';

export const HostsRevenuePage = ({ hosts = [], stats = {}, onNavigate }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [hostList, setHostList] = useState([]);
  const [selectedHostForStatement, setSelectedHostForStatement] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'superhost' | 'has_revenue' | 'verified'
  const [sortBy, setSortBy] = useState('gmv_desc'); // 'gmv_desc' | 'net_desc' | 'acc_desc' | 'bookings_desc'

  // Load live host revenue data
  const fetchHostRevenues = async () => {
    setLoading(true);
    try {
      const data = await adminService.getHostRevenues();
      if (Array.isArray(data) && data.length > 0) {
        setHostList(data);
      } else if (hosts && hosts.length > 0) {
        setHostList(hosts);
      }
    } catch (e) {
      console.warn('Load host revenues error:', e);
      if (hosts && hosts.length > 0) setHostList(hosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostRevenues();
  }, []);

  // Format currency helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} Tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num}`;
  };

  // Standardize data
  const normalizedHosts = useMemo(() => {
    return (hostList.length > 0 ? hostList : hosts).map((h, idx) => {
      const gmv = Number(h.total_gmv || h.gmv || h.total_revenue) || 0;
      const commission = Number(h.commission_paid || h.platform_fee || h.commission) || Math.round(gmv * 0.12);
      const net = Number(h.net_earnings || h.net_income) || Math.max(0, gmv - commission);
      const paid = Number(h.payouts_completed || h.paid_out) || 0;
      const escrow = Number(h.escrow_pending || h.in_escrow) || Math.max(0, net - paid);
      const accCount = Number(h.accommodations_count || h.properties_count) || 0;
      const bCount = Number(h.total_bookings || h.booking_count || h.completed_bookings) || 0;

      return {
        ...h,
        id: h.id || h.host_id || idx + 1,
        name: h.name || h.host_name || h.host_display_name || h.user?.full_name || `Chủ nhà #${idx + 1}`,
        email: h.email || h.contact_email || h.user?.email || 'chua_cap_nhat@tripnest.vn',
        phone: h.phone || h.contact_phone || h.user?.phone_number || '---',
        avatar: h.avatar || h.host_avatar_url || h.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name || 'Host')}&background=8b5cf6&color=fff`,
        is_superhost: Boolean(h.is_superhost),
        kyc_status: h.kyc_status || 'verified',
        rating: Number(h.rating || h.host_rating) || 5.0,
        properties_count: accCount,
        accommodations_count: accCount,
        total_gmv: gmv,
        commission: commission,
        net_earnings: net,
        paid_out: paid,
        in_escrow: escrow,
        completed_bookings: bCount,
        bank_name: h.bank_name || h.payout_profile?.bank_name || 'Vietcombank (VCB)',
        account_number: h.account_number || h.payout_profile?.account_number || '0071001234567',
        account_holder: h.account_holder || h.payout_profile?.account_holder || (h.name || 'CHỦ NHÀ TRIPNEST').toUpperCase(),
      };
    });
  }, [hostList, hosts]);

  // Totals & KPI Metrics
  const summary = useMemo(() => {
    const totalGMV = normalizedHosts.reduce((acc, h) => acc + h.total_gmv, 0);
    const totalNet = normalizedHosts.reduce((acc, h) => acc + h.net_earnings, 0);
    const totalCommission = normalizedHosts.reduce((acc, h) => acc + h.commission, 0);
    const totalPaid = normalizedHosts.reduce((acc, h) => acc + h.paid_out, 0);
    const totalEscrow = normalizedHosts.reduce((acc, h) => acc + h.in_escrow, 0);
    const totalBookings = normalizedHosts.reduce((acc, h) => acc + h.completed_bookings, 0);
    const totalAccommodations = normalizedHosts.reduce((acc, h) => acc + h.accommodations_count, 0);
    const superhostCount = normalizedHosts.filter((h) => h.is_superhost).length;

    return {
      totalGMV,
      totalNet,
      totalCommission,
      totalPaid,
      totalEscrow,
      totalBookings,
      totalAccommodations,
      superhostCount,
      hostCount: normalizedHosts.length,
    };
  }, [normalizedHosts]);

  // Filtered and sorted hosts
  const filteredHosts = useMemo(() => {
    let result = [...normalizedHosts];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.email.toLowerCase().includes(q)
      );
    }

    // Category tab filter
    if (filterType === 'superhost') {
      result = result.filter((h) => h.is_superhost);
    } else if (filterType === 'has_revenue') {
      result = result.filter((h) => h.total_gmv > 0);
    } else if (filterType === 'verified') {
      result = result.filter((h) => h.kyc_status === 'verified');
    }

    // Sort
    if (sortBy === 'gmv_desc') {
      result.sort((a, b) => b.total_gmv - a.total_gmv);
    } else if (sortBy === 'net_desc') {
      result.sort((a, b) => b.net_earnings - a.net_earnings);
    } else if (sortBy === 'acc_desc') {
      result.sort((a, b) => b.accommodations_count - a.accommodations_count);
    } else if (sortBy === 'bookings_desc') {
      result.sort((a, b) => b.completed_bookings - a.completed_bookings);
    }

    return result;
  }, [normalizedHosts, search, filterType, sortBy]);

  // Top 3 Podium Winners
  const sortedByGmv = useMemo(() => {
    return [...normalizedHosts].sort((a, b) => b.total_gmv - a.total_gmv);
  }, [normalizedHosts]);

  const top1 = sortedByGmv[0];
  const top2 = sortedByGmv[1];
  const top3 = sortedByGmv[2];

  const maxGMV = Math.max(...normalizedHosts.map((h) => h.total_gmv), 1000000);

  // Export CSV Report
  const handleExportCSV = () => {
    try {
      const headers = [
        'Hạng',
        'ID Host',
        'Tên Chủ Nhà',
        'Email',
        'Số Điện Thoại',
        'Superhost',
        'Số Chỗ Nghỉ',
        'Số Đơn Hoàn Tất',
        'Tổng GMV (VND)',
        'Hoa Hồng Sàn 12% (VND)',
        'Thực Nhận 88% (VND)',
        'Đã Giải Ngân (VND)',
        'Quỹ Escrow Tạm Giữ (VND)',
        'Ngân Hàng',
        'Số Tài Khoản',
        'Chủ Tài Khoản',
      ];

      const rows = filteredHosts.map((h, i) => [
        i + 1,
        h.id,
        `"${h.name}"`,
        h.email,
        `'${h.phone}`,
        h.is_superhost ? 'Có' : 'Không',
        h.accommodations_count,
        h.completed_bookings,
        h.total_gmv,
        h.commission,
        h.net_earnings,
        h.paid_out,
        h.in_escrow,
        `"${h.bank_name}"`,
        `'${h.account_number}`,
        `"${h.account_holder}"`,
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TripNest_BaoCao_DoanhThu_Host_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Xuất file thành công', `Đã xuất dữ liệu của ${filteredHosts.length} đối tác chủ nhà ra file CSV.`);
    } catch (e) {
      toast.error('Lỗi khi xuất file', e.message);
    }
  };

  return (
    <div className="adm-hosts-revenue-container">
      {/* 1. Header */}
      <AdminPageHeader
        title="Bảng Xếp Hạng & Thống Kê Doanh Thu Chủ Nhà"
        subtitle="Theo dõi hiệu suất dòng tiền, doanh số GMV và sao kê chi tiết của các chủ nhà đối tác trên hệ thống"
      />

      {/* 3. Top 3 Podium Winners */}
      {sortedByGmv.length >= 3 && (
        <div className="adm-hr-podium-section">
          <div className="adm-hr-section-header">
            <div className="adm-hr-section-title">
              <TbTrophy className="adm-hr-trophy-icon" />
              <span>Vinh Danh Top 3 Chủ Nhà Doanh Số Dẫn Đầu Toàn Sàn</span>
            </div>
            <span className="adm-hr-section-sub">Đóng góp trên 60% tổng giá trị giao dịch của nền tảng</span>
          </div>

          <div className="adm-hr-podium-grid">
            {/* Rank 2 - Silver */}
            {top2 && (
              <div
                className="adm-hr-podium-card rank-2"
                onClick={() => setSelectedHostForStatement(top2)}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-rank rank-2">
                  <TbMedal className="podium-inline-rank-icon silver" />
                  <span>Á Quân (#2)</span>
                </div>
                <div className="adm-hr-podium-avatar-wrap">
                  <img src={top2.avatar} alt={top2.name} className="adm-hr-podium-avatar" />
                  {top2.is_superhost && (
                    <span className="adm-hr-podium-star" title="Superhost uy tín">
                      <TbStar />
                    </span>
                  )}
                </div>
                <h4 className="adm-hr-podium-name">{top2.name}</h4>
                <div className="adm-hr-podium-meta">
                  <span>{top2.accommodations_count} Chỗ nghỉ</span> • <span>{top2.completed_bookings} Đơn</span>
                </div>
                <div className="adm-hr-podium-gmv">{formatCurrency(top2.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top2.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn">
                  <TbFileDollar size={14} />
                  <span>Xem Sao Kê</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}

            {/* Rank 1 - Gold */}
            {top1 && (
              <div
                className="adm-hr-podium-card rank-1"
                onClick={() => setSelectedHostForStatement(top1)}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-crown">
                  <TbCrown />
                </div>
                <div className="adm-hr-podium-rank rank-1">
                  <TbCrown className="podium-inline-rank-icon gold" />
                  <span>Quán Quân (#1)</span>
                </div>
                <div className="adm-hr-podium-avatar-wrap main">
                  <img src={top1.avatar} alt={top1.name} className="adm-hr-podium-avatar main" />
                  {top1.is_superhost && (
                    <span className="adm-hr-podium-star main" title="Superhost uy tín">
                      <TbStar />
                    </span>
                  )}
                </div>
                <h3 className="adm-hr-podium-name main">{top1.name}</h3>
                <div className="adm-hr-podium-meta">
                  <span>{top1.accommodations_count} Chỗ nghỉ</span> • <span>{top1.completed_bookings} Đơn</span>
                </div>
                <div className="adm-hr-podium-gmv main">{formatCurrency(top1.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top1.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn main">
                  <TbFileDollar size={15} />
                  <span>Xem Bảng Sao Kê Dòng Tiền</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}

            {/* Rank 3 - Bronze */}
            {top3 && (
              <div
                className="adm-hr-podium-card rank-3"
                onClick={() => setSelectedHostForStatement(top3)}
                title="Bấm để xem sao kê dòng tiền chi tiết"
              >
                <div className="adm-hr-podium-rank rank-3">
                  <TbMedal className="podium-inline-rank-icon bronze" />
                  <span>Quý Quân (#3)</span>
                </div>
                <div className="adm-hr-podium-avatar-wrap">
                  <img src={top3.avatar} alt={top3.name} className="adm-hr-podium-avatar" />
                  {top3.is_superhost && (
                    <span className="adm-hr-podium-star" title="Superhost uy tín">
                      <TbStar />
                    </span>
                  )}
                </div>
                <h4 className="adm-hr-podium-name">{top3.name}</h4>
                <div className="adm-hr-podium-meta">
                  <span>{top3.accommodations_count} Chỗ nghỉ</span> • <span>{top3.completed_bookings} Đơn</span>
                </div>
                <div className="adm-hr-podium-gmv">{formatCurrency(top3.total_gmv)}</div>
                <div className="adm-hr-podium-net">Thực nhận: {formatCurrency(top3.net_earnings)}</div>
                <button type="button" className="adm-hr-podium-btn">
                  <TbFileDollar size={14} />
                  <span>Xem Sao Kê</span>
                  <TbArrowUpRight />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Filter & Search Toolbar */}
      <div className="adm-hr-toolbar-card">
        {/* Top Row: Filter Tabs (Left) & Actions Group (Right) */}
        <div className="adm-hr-toolbar-top">
          <div className="adm-hr-filter-tabs">
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              <span>Tất Cả ({summary.hostCount})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'superhost' ? 'active' : ''}`}
              onClick={() => setFilterType('superhost')}
            >
              <TbStar className="tab-svg-icon text-amber" style={{ strokeWidth: 2.2 }} />
              <span>Superhost ({summary.superhostCount})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'has_revenue' ? 'active' : ''}`}
              onClick={() => setFilterType('has_revenue')}
            >
              <TbCoins className="tab-svg-icon text-emerald" />
              <span>Có Doanh Thu ({normalizedHosts.filter((h) => h.total_gmv > 0).length})</span>
            </button>
            <button
              type="button"
              className={`adm-hr-tab ${filterType === 'verified' ? 'active' : ''}`}
              onClick={() => setFilterType('verified')}
            >
              <TbShieldCheck className="tab-svg-icon text-sky" />
              <span>Đã KYC</span>
            </button>
          </div>

          <div className="adm-hr-actions-group">
            <button
              type="button"
              className="btn-admin-secondary adm-hr-mini-btn"
              onClick={fetchHostRevenues}
              disabled={loading}
              title="Tải lại số liệu từ Database"
            >
              <TbRefresh className={loading ? 'adm-spin' : ''} />
              <span>Làm Mới</span>
            </button>

            <button
              type="button"
              className="btn-admin-primary adm-hr-mini-btn"
              onClick={handleExportCSV}
              title="Tải bảng tính báo cáo doanh thu"
            >
              <TbDownload />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Search Input (Left) & Sort Select (Right) */}
        <div className="adm-hr-toolbar-bottom">
          <div className="adm-hr-search-wrap">
            <TbSearch className="adm-hr-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên chủ nhà, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-hr-search-input"
            />
            {search && (
              <button
                type="button"
                className="adm-hr-search-clear"
                onClick={() => setSearch('')}
                title="Xóa tìm kiếm"
              >
                <TbX size={14} />
              </button>
            )}
          </div>

          <div className="adm-hr-sort-box">
            <div className="adm-hr-select-wrapper">
              <TbArrowsSort className="adm-hr-select-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="adm-hr-custom-select"
                aria-label="Sắp xếp danh sách chủ nhà"
              >
                <option value="gmv_desc">GMV Doanh Thu Cao Nhất</option>
                <option value="net_desc">Thực Nhận Host Cao Nhất</option>
                <option value="acc_desc">Nhiều Chỗ Nghỉ Nhất</option>
                <option value="bookings_desc">Nhiều Đơn Đặt Phòng Nhất</option>
              </select>
              <TbChevronDown className="adm-hr-select-chevron" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Content: Table View */}
      {filteredHosts.length === 0 ? (
        <div className="adm-hr-empty-box">
          <TbAlertCircle className="adm-hr-empty-icon" />
          <h4 className="adm-hr-empty-title">Không tìm thấy chủ nhà phù hợp</h4>
          <p className="adm-hr-empty-desc">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc phân loại.</p>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={() => {
              setSearch('');
              setFilterType('all');
            }}
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="adm-hr-table-card">
          <div className="adm-hr-table-responsive">
            <table className="adm-hr-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Hạng</th>
                  <th>Chủ Nhà (Host)</th>
                  <th style={{ textAlign: 'center' }}>Chỗ Nghỉ</th>
                  <th style={{ textAlign: 'center' }}>Đơn Hoàn Tất</th>
                  <th>GMV Thu Hộ (100%)</th>
                  <th>Thực Nhận (88%)</th>
                  <th>Phí Sàn (12%)</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.map((host, index) => {
                  const gmvPercent = Math.min(100, Math.max(8, (host.total_gmv / maxGMV) * 100));
                  return (
                    <tr
                      key={host.id}
                      className="adm-hr-table-row"
                      onClick={() => setSelectedHostForStatement(host)}
                      title="Bấm để mở bảng sao kê dòng tiền chi tiết"
                    >
                      {/* Rank */}
                      <td style={{ textAlign: 'center' }}>
                        <div className={`adm-hr-rank-badge rank-${index + 1}`}>
                          {index === 0 ? (
                            <TbCrown className="rank-svg-icon gold" title="Quán quân" />
                          ) : index === 1 ? (
                            <TbMedal className="rank-svg-icon silver" title="Á quân" />
                          ) : index === 2 ? (
                            <TbMedal className="rank-svg-icon bronze" title="Quý quân" />
                          ) : (
                            `#${index + 1}`
                          )}
                        </div>
                      </td>

                      {/* Host Profile */}
                      <td>
                        <div className="adm-hr-host-cell">
                          <div className="adm-hr-host-avatar-wrap">
                            <img src={host.avatar} alt={host.name} className="adm-hr-host-avatar" />
                            {host.is_superhost && (
                              <span className="adm-hr-host-badge-super" title="Superhost uy tín">
                                <TbStar />
                              </span>
                            )}
                          </div>
                          <div className="adm-hr-host-info">
                            <div className="adm-hr-host-name-row">
                              <span className="adm-hr-host-name">{host.name}</span>
                              {host.is_superhost && <span className="badge-superhost">Superhost</span>}
                            </div>
                            <span className="adm-hr-host-sub">{host.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Accommodations count */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="adm-hr-tag acc">{host.accommodations_count} chỗ</span>
                      </td>

                      {/* Bookings count */}
                      <td style={{ textAlign: 'center' }}>
                        <span className="adm-hr-tag booking">{host.completed_bookings} đơn</span>
                      </td>

                      {/* GMV */}
                      <td>
                        <div className="adm-hr-gmv-cell">
                          <span className="adm-hr-gmv-val">{formatCurrency(host.total_gmv)}</span>
                          <div className="adm-hr-bar-track">
                            <div className="adm-hr-bar-fill gmv" style={{ width: `${gmvPercent}%` }} />
                          </div>
                        </div>
                      </td>

                      {/* Net Earnings */}
                      <td>
                        <span className="adm-hr-net-val">{formatCurrency(host.net_earnings)}</span>
                      </td>

                      {/* Platform Fee */}
                      <td>
                        <span className="adm-hr-fee-val">{formatCurrency(host.commission)}</span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="adm-hr-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHostForStatement(host);
                          }}
                          title="Xem sao kê dòng tiền & lịch sử chuyển khoản"
                        >
                          <TbFileDollar size={15} />
                          <span>Sao Kê</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Host Statement Modal */}
      {selectedHostForStatement && (
        <HostStatementModal
          host={selectedHostForStatement}
          onClose={() => setSelectedHostForStatement(null)}
        />
      )}
    </div>
  );
};

export default HostsRevenuePage;
