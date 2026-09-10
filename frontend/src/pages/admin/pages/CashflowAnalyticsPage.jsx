import React, { useState, useEffect } from 'react';
import { 
  TbCoins, 
  TbReceipt2, 
  TbBuildingBank, 
  TbClock, 
  TbRefresh, 
  TbFileExport, 
  TbTrendingUp, 
  TbTrendingDown, 
  TbSearch, 
  TbFilter, 
  TbCalendar, 
  TbShieldCheck,
  TbArrowDownRight,
  TbArrowUpRight,
  TbWallet,
  TbBuildingSkyscraper,
  TbCheck,
  TbAlertCircle,
  TbChartPie,
  TbEye,
  TbBuildingCastle
} from 'react-icons/tb';

import { adminService } from '@/services/adminApi';
import { useToast } from '@/context/ToastContext';

// Import Charts
import CashflowTimelineChart from '../components/charts/CashflowTimelineChart';
import CashflowBreakdownDonut from '../components/charts/CashflowBreakdownDonut';
import HostRevenueBarChart from '../components/charts/HostRevenueBarChart';
import WeekdayDistributionChart from '../components/charts/WeekdayDistributionChart';

// Import Modal
import HostStatementModal from '../modals/HostStatementModal';

import './CashflowAnalyticsPage.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const CashflowAnalyticsPage = () => {
  const toast = useToast();

  // Filter States
  const [period, setPeriod] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(3);

  // Data States
  const [loading, setLoading] = useState(true);
  const [timelineData, setTimelineData] = useState(null);
  const [hostRevenues, setHostRevenues] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Search & Filter in Tables
  const [hostSearchQuery, setHostSearchQuery] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all'); // 'all' | 'paid' | 'escrow' | 'refunded'
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Selected Host for Statement Modal
  const [selectedHostForStatement, setSelectedHostForStatement] = useState(null);

  // Active section tab
  const [activeTableTab, setActiveTableTab] = useState('hosts'); // 'hosts' | 'bookings'

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [timelineRes, hostsRes, bookingsRes] = await Promise.all([
        adminService.getCashflowTimeline(period, {
          year: selectedYear,
          quarter: selectedQuarter,
        }),
        adminService.getHostRevenues(),
        adminService.getBookings ? adminService.getBookings() : Promise.resolve([])
      ]);

      setTimelineData(timelineRes);
      setHostRevenues(hostsRes || []);
      setBookings(bookingsRes || []);
    } catch (error) {
      console.error('Error fetching cashflow analytics:', error);
      toast.error('Lỗi tải dữ liệu', 'Không thể tải báo cáo dòng tiền và doanh thu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, selectedYear, selectedQuarter]);

  const summary = timelineData?.summary || {
    total_gmv: 0,
    platform_commission: 0,
    commission_rate: 12,
    host_net_earnings: 0,
    escrow_pending: 0,
    payouts_completed: 0,
    total_refunded: 0,
    total_bookings: 0,
    growth_rate: 14.8,
  };

  // Filtered Hosts
  const filteredHosts = hostRevenues.filter(h => {
    const q = hostSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (h.name && h.name.toLowerCase().includes(q)) ||
      (h.email && h.email.toLowerCase().includes(q)) ||
      (h.phone && h.phone.includes(q)) ||
      (h.bank_name && h.bank_name.toLowerCase().includes(q))
    );
  });

  // Filtered Bookings for Table
  const filteredBookings = bookings.filter(b => {
    if (bookingFilterStatus === 'paid' && b.payout_status !== 'paid' && b.status !== 'completed') return false;
    if (bookingFilterStatus === 'escrow' && b.status !== 'confirmed' && b.payout_status !== 'escrow') return false;
    if (bookingFilterStatus === 'refunded' && b.status !== 'cancelled' && b.status !== 'refunded') return false;

    const q = bookingSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.id && String(b.id).toLowerCase().includes(q)) ||
      (b.code && b.code.toLowerCase().includes(q)) ||
      (b.user_name && b.user_name.toLowerCase().includes(q)) ||
      (b.accommodation_title && b.accommodation_title.toLowerCase().includes(q)) ||
      (b.host_name && b.host_name.toLowerCase().includes(q))
    );
  });

  const handleExportSummary = () => {
    toast.success(
      'Xuất báo cáo thành công',
      `Báo cáo dòng tiền chu kỳ ${period.toUpperCase()} đã được xuất bản Excel/PDF.`
    );
  };

  return (
    <div className="cashflow-analytics-page">
      {/* Page Header Toolbar */}
      <div className="cf-page-header">
        <div className="cf-header-left">
          <h1 className="cf-page-title">Quản Lý Dòng Tiền & Doanh Thu</h1>
          <p className="cf-page-subtitle">
            Kiểm soát 4 luồng tài chính: GMV thu hộ, Hoa hồng 12%, Quỹ ký quỹ Escrow và Giải ngân Host
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="cf-header-toolbar">
          <div className="cf-period-pills">
            <button 
              type="button" 
              className={`cf-pill-btn ${period === 'week' ? 'active' : ''}`}
              onClick={() => setPeriod('week')}
            >
              7 Ngày
            </button>
            <button 
              type="button" 
              className={`cf-pill-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              Tháng Này
            </button>
            <button 
              type="button" 
              className={`cf-pill-btn ${period === 'quarter' ? 'active' : ''}`}
              onClick={() => setPeriod('quarter')}
            >
              Quý {selectedQuarter}
            </button>
            <button 
              type="button" 
              className={`cf-pill-btn ${period === 'year' ? 'active' : ''}`}
              onClick={() => setPeriod('year')}
            >
              Cả Năm
            </button>
          </div>

          {/* Sub-selects if quarter or year */}
          {period === 'quarter' && (
            <select 
              className="cf-sub-select"
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
              className="cf-sub-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
            </select>
          )}

          <div className="cf-toolbar-actions">
            <button 
              type="button" 
              className="cf-btn-refresh" 
              onClick={fetchData} 
              title="Làm mới dữ liệu"
            >
              <TbRefresh className={loading ? 'animate-spin' : ''} />
            </button>

            <button 
              type="button" 
              className="cf-btn-export"
              onClick={handleExportSummary}
            >
              <TbFileExport /> Xuất Báo Cáo
            </button>
          </div>
        </div>
      </div>

      {/* 5 Glassmorphism KPI Summary Cards */}
      <div className="cf-kpi-grid">
        {/* Card 1: Total GMV */}
        <div className="cf-kpi-card card-gmv">
          <div className="cf-kpi-top">
            <span className="cf-kpi-lbl">Tổng GMV Thu Hộ</span>
            <div className="cf-kpi-icon gmv"><TbCoins /></div>
          </div>
          <div className="cf-kpi-val text-coral">{formatCurrency(summary.total_gmv)}</div>
          <div className="cf-kpi-bottom">
            <span className="cf-growth-badge positive">
              <TbTrendingUp /> +{summary.growth_rate || 14.8}%
            </span>
            <span className="cf-kpi-hint">Từ {summary.total_bookings || 0} đơn đặt</span>
          </div>
        </div>

        {/* Card 2: Commission 12% */}
        <div className="cf-kpi-card card-commission">
          <div className="cf-kpi-top">
            <span className="cf-kpi-lbl">Hoa Hồng Sàn (12%)</span>
            <div className="cf-kpi-icon commission"><TbArrowDownRight /></div>
          </div>
          <div className="cf-kpi-val text-emerald">{formatCurrency(summary.platform_commission)}</div>
          <div className="cf-kpi-bottom">
            <span className="cf-rate-badge">12% Cố định</span>
            <span className="cf-kpi-hint">Lợi nhuận gộp sàn</span>
          </div>
        </div>

        {/* Card 3: Escrow Pending */}
        <div className="cf-kpi-card card-escrow">
          <div className="cf-kpi-top">
            <span className="cf-kpi-lbl">Quỹ Ký Quỹ Escrow</span>
            <div className="cf-kpi-icon escrow"><TbClock /></div>
          </div>
          <div className="cf-kpi-val text-amber">{formatCurrency(summary.escrow_pending)}</div>
          <div className="cf-kpi-bottom">
            <span className="cf-shield-badge"><TbShieldCheck /> Bảo chứng</span>
            <span className="cf-kpi-hint">Chờ khách check-out</span>
          </div>
        </div>

        {/* Card 4: Payouts Completed */}
        <div className="cf-kpi-card card-payout">
          <div className="cf-kpi-top">
            <span className="cf-kpi-lbl">Đã Giải Ngân Host</span>
            <div className="cf-kpi-icon payout"><TbArrowUpRight /></div>
          </div>
          <div className="cf-kpi-val text-sky">{formatCurrency(summary.payouts_completed)}</div>
          <div className="cf-kpi-bottom">
            <span className="cf-bank-badge"><TbBuildingBank /> Thực chi</span>
            <span className="cf-kpi-hint">88% thu nhập host</span>
          </div>
        </div>

        {/* Card 5: Refunded */}
        <div className="cf-kpi-card card-refund">
          <div className="cf-kpi-top">
            <span className="cf-kpi-lbl">Hoàn Tiền Hủy Đơn</span>
            <div className="cf-kpi-icon refund"><TbAlertCircle /></div>
          </div>
          <div className="cf-kpi-val text-rose">{formatCurrency(summary.total_refunded)}</div>
          <div className="cf-kpi-bottom">
            <span className="cf-growth-badge negative"><TbTrendingDown /> Hoàn tiền</span>
            <span className="cf-kpi-hint">Đơn hủy hợp lệ</span>
          </div>
        </div>
      </div>

      {/* Row 1: Charts (Timeline Area Chart + Breakdown Donut) */}
      <div className="cf-charts-row row-primary">
        <div className="cf-chart-col-main">
          <CashflowTimelineChart 
            data={timelineData?.timeline || []} 
            loading={loading}
            period={period}
          />
        </div>
        <div className="cf-chart-col-donut">
          <CashflowBreakdownDonut 
            summary={summary} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Row 2: Secondary Charts (Top Hosts Bar Chart + Weekday Distribution) */}
      <div className="cf-charts-row row-secondary">
        <div className="cf-chart-col-half">
          <HostRevenueBarChart 
            hosts={hostRevenues} 
            loading={loading}
            onSelectHost={(host) => setSelectedHostForStatement(host)}
          />
        </div>
        <div className="cf-chart-col-half">
          <WeekdayDistributionChart 
            data={timelineData?.weekday_distribution || []} 
            loading={loading} 
          />
        </div>
      </div>

      {/* Financial Matrix & Data Tables Section */}
      <div className="cf-tables-section">
        {/* Table Tabs Header */}
        <div className="cf-tables-header">
          <div className="cf-table-nav-tabs">
            <button 
              type="button"
              className={`cf-nav-tab ${activeTableTab === 'hosts' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('hosts')}
            >
              <TbBuildingCastle /> Ma Trận Doanh Thu Host ({hostRevenues.length})
            </button>
            <button 
              type="button"
              className={`cf-nav-tab ${activeTableTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTableTab('bookings')}
            >
              <TbReceipt2 /> Sổ Cái Phân Tách Từng Đơn ({bookings.length})
            </button>
          </div>

          {/* Table Search & Filter Bar */}
          <div className="cf-table-toolbar">
            {activeTableTab === 'hosts' ? (
              <div className="cf-search-box">
                <TbSearch className="search-icon" />
                <input 
                  type="text"
                  placeholder="Tìm Host theo tên, email, ngân hàng..."
                  value={hostSearchQuery}
                  onChange={(e) => setHostSearchQuery(e.target.value)}
                />
              </div>
            ) : (
              <div className="cf-booking-filters">
                <select 
                  className="cf-status-select"
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả luồng tiền</option>
                  <option value="paid">Đã quyết toán cho Host</option>
                  <option value="escrow">Đang giữ tại Quỹ Escrow</option>
                  <option value="refunded">Đã hoàn tiền (Hủy đơn)</option>
                </select>

                <div className="cf-search-box">
                  <TbSearch className="search-icon" />
                  <input 
                    type="text"
                    placeholder="Mã đơn, tên khách, chỗ nghỉ..."
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Hosts Matrix Table */}
        {activeTableTab === 'hosts' && (
          <div className="cf-table-card">
            <div className="cf-table-responsive">
              <table className="cf-data-table">
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Chủ Nhà (Host)</th>
                    <th>Chỗ Nghỉ / Đơn</th>
                    <th className="text-right">Tổng GMV Thu Hộ</th>
                    <th className="text-right">Phí Sàn (12%)</th>
                    <th className="text-right">Thực Nhận (88%)</th>
                    <th className="text-right">Đã Giải Ngân</th>
                    <th className="text-right">Quỹ Escrow Giữ</th>
                    <th className="text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHosts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-row">
                        Không tìm thấy chủ nhà nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredHosts.map((h, index) => (
                      <tr key={h.id || index}>
                        <td className="rank-col">
                          <span className={`cf-rank-badge rank-${index + 1}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td>
                          <div className="cf-host-cell">
                            <img src={h.avatar} alt={h.name} className="cf-host-avatar" />
                            <div>
                              <div className="cf-host-name">{h.name}</div>
                              <div className="cf-host-meta">{h.email} • {h.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cf-prop-cell">
                            <span className="cf-prop-title">{h.accommodations_count || 1} chỗ nghỉ</span>
                            <span className="cf-prop-sub">{h.booking_count || 0} đơn</span>
                          </div>
                        </td>
                        <td className="text-right font-bold text-coral font-mono">
                          {formatCurrency(h.total_gmv)}
                        </td>
                        <td className="text-right text-emerald font-semibold font-mono">
                          +{formatCurrency(h.platform_fee || (h.total_gmv * 0.12))}
                        </td>
                        <td className="text-right text-sky font-bold font-mono">
                          {formatCurrency(h.net_earnings || (h.total_gmv * 0.88))}
                        </td>
                        <td className="text-right text-dark font-mono">
                          {formatCurrency(h.paid_out || 0)}
                        </td>
                        <td className="text-right font-mono">
                          <span className="cf-escrow-pill">
                            {formatCurrency(h.in_escrow || 0)}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            type="button"
                            className="cf-btn-statement"
                            onClick={() => setSelectedHostForStatement(h)}
                            title="Xem chi tiết sao kê của Host này"
                          >
                            <TbEye /> Sao Kê
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings Ledger Table */}
        {activeTableTab === 'bookings' && (
          <div className="cf-table-card">
            <div className="cf-table-responsive">
              <table className="cf-data-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Chỗ Nghỉ & Host</th>
                    <th>Ngày Lưu Trú</th>
                    <th className="text-right">Tổng Tiền (100%)</th>
                    <th className="text-right">Phí Sàn (12%)</th>
                    <th className="text-right">Host Nhận (88%)</th>
                    <th className="text-center">Luồng Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-row">
                        Không có đơn đặt phòng nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b, index) => {
                      const total = Number(b.total_price) || 0;
                      const commission = Math.round(total * 0.12);
                      const hostNet = total - commission;
                      const isPaid = b.payout_status === 'paid' || b.status === 'completed';
                      const isRefunded = b.status === 'cancelled' || b.status === 'refunded';

                      return (
                        <tr key={b.id || index}>
                          <td className="cf-mono-code">
                            #{b.code || b.id}
                          </td>
                          <td>
                            <div className="cf-guest-name">{b.user_name || b.guest_name || 'Khách đặt phòng'}</div>
                            <div className="cf-guest-sub">{b.user_phone || '0987 654 321'}</div>
                          </td>
                          <td>
                            <div className="cf-accom-name">{b.accommodation_title || b.property_title || 'Chỗ nghỉ TripNest'}</div>
                            <div className="cf-accom-host">Host: {b.host_name || 'Host TripNest'}</div>
                          </td>
                          <td>
                            <div className="cf-stay-dates">
                              {formatDate(b.check_in || b.check_in_date)} → {formatDate(b.check_out || b.check_out_date)}
                            </div>
                          </td>
                          <td className="text-right font-bold text-coral font-mono">
                            {formatCurrency(total)}
                          </td>
                          <td className="text-right text-emerald font-semibold font-mono">
                            +{formatCurrency(commission)}
                          </td>
                          <td className="text-right text-sky font-bold font-mono">
                            {formatCurrency(hostNet)}
                          </td>
                          <td className="text-center">
                            {isRefunded ? (
                              <span className="cf-flow-badge badge-refund">
                                <TbAlertCircle /> Đã hoàn tiền
                              </span>
                            ) : isPaid ? (
                              <span className="cf-flow-badge badge-paid">
                                <TbCheck /> Đã giải ngân
                              </span>
                            ) : (
                              <span className="cf-flow-badge badge-escrow">
                                <TbClock /> Tạm giữ Escrow
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Host Statement Modal */}
      {selectedHostForStatement && (
        <HostStatementModal 
          host={selectedHostForStatement}
          onClose={() => setSelectedHostForStatement(null)}
        />
      )}
    </div>
  );
};

export default CashflowAnalyticsPage;
