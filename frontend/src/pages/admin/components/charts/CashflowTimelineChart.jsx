import React, { useState, useMemo, useEffect } from 'react';
import './CashflowTimelineChart.css';
import { 
  TbCoins, 
  TbSparkles, 
  TbCircleCheck, 
  TbArrowBackUp, 
  TbClock,
  TbTrendingUp,
  TbCalendar,
  TbBuildingBank,
  TbChartAreaLine,
  TbShieldCheck
} from 'react-icons/tb';

export const CashflowTimelineChart = ({
  data = [],
  timeline = [],
  loading = false,
  period = 'month',
}) => {
  // 4 Dedicated Stream Tabs: 'all' | 'commission' | 'payouts' | 'escrow'
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Safe normalized data
  const rawList = data && data.length > 0 ? data : (timeline && timeline.length > 0 ? timeline : []);

  // Reset hover state when period or raw data changes to prevent index out of bounds
  useEffect(() => {
    setHoveredIndex(null);
  }, [period, rawList]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num}`;
  };

  const safeData = useMemo(() => {
    if (!Array.isArray(rawList) || rawList.length === 0) {
      if (period === 'week') {
        return [
          { label: 'Thứ 2', subLabel: '04/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Thứ 3', subLabel: '05/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Thứ 4', subLabel: '06/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Thứ 5', subLabel: '07/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Thứ 6', subLabel: '08/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Thứ 7', subLabel: '09/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'CN', subLabel: '10/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
        ];
      }
      if (period === 'quarter') {
        return [
          { label: 'Tháng 7', subLabel: '07/2026', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Tháng 8', subLabel: '08/2026', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
          { label: 'Tháng 9', subLabel: '09/2026', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
        ];
      }
      if (period === 'year') {
        return Array.from({ length: 12 }, (_, i) => ({
          label: `T${i + 1}`,
          subLabel: `T${i + 1}`,
          gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0
        }));
      }
      return [
        { label: 'Tuần 1', subLabel: '01/09 - 07/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
        { label: 'Tuần 2', subLabel: '08/09 - 14/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
        { label: 'Tuần 3', subLabel: '15/09 - 21/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
        { label: 'Tuần 4', subLabel: '22/09 - 30/09', gmv: 0, commission: 0, payouts: 0, escrow: 0, refunds: 0, booking_count: 0 },
      ];
    }
    return rawList.map((item, idx) => ({
      ...item,
      label: item.label || item.time_label || `Mốc ${idx + 1}`,
      subLabel: item.subLabel !== item.label ? (item.subLabel || item.date || item.month || item.week || '') : (item.date || ''),
      gmv: Number(item.gmv) || 0,
      commission: Number(item.commission) || 0,
      payouts: Number(item.host_payouts) || Number(item.payout) || Number(item.host_net) || 0,
      escrow: Number(item.escrow) || 0,
      refunds: Number(item.refunds) || Number(item.refund) || 0,
      booking_count: item.booking_count !== undefined ? item.booking_count : (item.bookings_count !== undefined ? item.bookings_count : 0),
    }));
  }, [rawList, period]);

  // Tab configurations & dynamic Y-axis scaling
  const tabConfig = {
    all: {
      title: 'Toàn Cảnh Dòng Tiền (GMV Thu Hộ)',
      subtitle: 'Theo dõi tổng quy mô dòng tiền khách đặt phòng lưu chuyển trên sàn',
      primaryKey: 'gmv',
      color: '#ff385c',
      gradId: 'gmvAreaGrad',
      icon: TbCoins,
      tag: 'GMV Tổng Thể',
    },
    commission: {
      title: 'Doanh Thu Hoa Hồng Sàn (12%)',
      subtitle: 'Lợi nhuận thuần trích lại từ các đơn đặt phòng thành công',
      primaryKey: 'commission',
      color: '#10b981',
      gradId: 'commAreaGrad',
      icon: TbSparkles,
      tag: '12% Cố Định',
    },
    payouts: {
      title: 'Dòng Tiền Giải Ngân Cho Host (88%)',
      subtitle: 'Tổng số tiền chuyển khoản thực nhận của các chủ nhà đối tác',
      primaryKey: 'payouts',
      color: '#0ea5e9',
      gradId: 'payoutAreaGrad',
      icon: TbBuildingBank,
      tag: '88% Thực Nhận',
    },
    escrow: {
      title: 'Quỹ Ký Quỹ Escrow & Hoàn Tiền Hủy',
      subtitle: 'Bóc tách tiền tạm giữ chờ check-out và số tiền đã hoàn trả khách',
      primaryKey: 'escrow',
      color: '#f59e0b',
      gradId: 'escrowAreaGrad',
      icon: TbShieldCheck,
      tag: 'Bảo Chứng An Toàn',
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig.all;

  // Dynamic maximum value with clean rounded thresholds for Y-axis
  const getNiceMax = (rawMax) => {
    if (rawMax <= 0) return 1000000;
    const target = rawMax * 1.15;
    const magnitude = Math.pow(10, Math.floor(Math.log10(target)));
    const factor = target / magnitude;
    let niceFactor;
    if (factor <= 1.2) niceFactor = 1.2;
    else if (factor <= 1.5) niceFactor = 1.5;
    else if (factor <= 2) niceFactor = 2;
    else if (factor <= 2.5) niceFactor = 2.5;
    else if (factor <= 3) niceFactor = 3;
    else if (factor <= 4) niceFactor = 4;
    else if (factor <= 5) niceFactor = 5;
    else if (factor <= 6) niceFactor = 6;
    else if (factor <= 8) niceFactor = 8;
    else niceFactor = 10;
    return niceFactor * magnitude;
  };

  const maxVal = useMemo(() => {
    let max = 0;
    if (activeTab === 'all') {
      safeData.forEach((d) => { if (d.gmv > max) max = d.gmv; });
    } else if (activeTab === 'commission') {
      safeData.forEach((d) => { if (d.commission > max) max = d.commission; });
    } else if (activeTab === 'payouts') {
      safeData.forEach((d) => { if (d.payouts > max) max = d.payouts; });
    } else if (activeTab === 'escrow') {
      safeData.forEach((d) => {
        if (d.escrow > max) max = d.escrow;
        if (d.refunds > max) max = d.refunds;
      });
    }
    return getNiceMax(max);
  }, [safeData, activeTab]);

  // Tab Totals for Quick Stat Banner
  const tabTotals = useMemo(() => {
    const totalGmv = safeData.reduce((acc, d) => acc + d.gmv, 0);
    const totalComm = safeData.reduce((acc, d) => acc + d.commission, 0);
    const totalPayout = safeData.reduce((acc, d) => acc + d.payouts, 0);
    const totalEscrow = safeData.reduce((acc, d) => acc + d.escrow, 0);
    const totalRefund = safeData.reduce((acc, d) => acc + d.refunds, 0);

    return {
      all: totalGmv,
      commission: totalComm,
      payouts: totalPayout,
      escrow: totalEscrow,
      refunds: totalRefund,
    };
  }, [safeData]);

  // Chart dimensions & internal coordinate system
  const width = 850;
  const height = 250;
  const paddingLeft = 56;
  const paddingRight = 20;
  const paddingTop = 18;
  const paddingBottom = 42;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Coordinates calculators
  const getX = (index) => {
    if (safeData.length <= 1) return paddingLeft + chartWidth / 2;
    const clampedIndex = Math.max(0, Math.min(index, safeData.length - 1));
    return paddingLeft + (clampedIndex / (safeData.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(0, val || 0);
    return paddingTop + chartHeight - (clamped / maxVal) * chartHeight;
  };

  // Precise, gap-free hitbox slicing for seamless cursor interaction
  const getHitbox = (index) => {
    if (safeData.length <= 1) {
      return { x: paddingLeft, width: chartWidth };
    }
    const step = chartWidth / (safeData.length - 1);
    if (index === 0) {
      return { x: paddingLeft, width: step / 2 };
    }
    if (index === safeData.length - 1) {
      return { x: getX(index) - step / 2, width: step / 2 + paddingRight };
    }
    return { x: getX(index) - step / 2, width: step };
  };

  // Build Smooth Cubic Bézier Curve Path
  const buildSmoothPath = (key) => {
    if (safeData.length === 0) return '';
    if (safeData.length === 1) return `M ${getX(0)} ${getY(safeData[0][key])}`;

    const points = safeData.map((d, i) => ({ x: getX(i), y: getY(d[key]) }));

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const buildSmoothAreaPath = (key) => {
    const linePath = buildSmoothPath(key);
    if (!linePath) return '';
    const lastX = getX(safeData.length - 1);
    const firstX = getX(0);
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Y-axis tick intervals
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const activePoint = hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < safeData.length
    ? safeData[hoveredIndex]
    : null;

  return (
    <div className="adm-timeline-card">
      {/* 4 Dedicated Stream Tabs Navigation */}
      <div className="adm-stream-tabs-nav">
        <button
          type="button"
          className={`adm-stream-tab ${activeTab === 'all' ? 'active tab-all' : ''}`}
          onClick={() => { setActiveTab('all'); setHoveredIndex(null); }}
          title="Toàn cảnh tổng GMV thu hộ"
        >
          <TbCoins className="tab-icon" />
          <span className="tab-text">GMV Thu Hộ</span>
          <span className="tab-pill-val">{formatShortCurrency(tabTotals.all)}</span>
        </button>

        <button
          type="button"
          className={`adm-stream-tab ${activeTab === 'commission' ? 'active tab-commission' : ''}`}
          onClick={() => { setActiveTab('commission'); setHoveredIndex(null); }}
          title="Doanh thu hoa hồng sàn (12%)"
        >
          <TbSparkles className="tab-icon" />
          <span className="tab-text">Hoa Hồng 12%</span>
          <span className="tab-pill-val">{formatShortCurrency(tabTotals.commission)}</span>
        </button>

        <button
          type="button"
          className={`adm-stream-tab ${activeTab === 'payouts' ? 'active tab-payouts' : ''}`}
          onClick={() => { setActiveTab('payouts'); setHoveredIndex(null); }}
          title="Dòng tiền giải ngân cho Host (88%)"
        >
          <TbBuildingBank className="tab-icon" />
          <span className="tab-text">Giải Ngân Host</span>
          <span className="tab-pill-val">{formatShortCurrency(tabTotals.payouts)}</span>
        </button>

        <button
          type="button"
          className={`adm-stream-tab ${activeTab === 'escrow' ? 'active tab-escrow' : ''}`}
          onClick={() => { setActiveTab('escrow'); setHoveredIndex(null); }}
          title="Quỹ ký quỹ Escrow & hoàn tiền"
        >
          <TbShieldCheck className="tab-icon" />
          <span className="tab-text">Quỹ Escrow</span>
          <span className="tab-pill-val">{formatShortCurrency(tabTotals.escrow)}</span>
        </button>
      </div>

      {/* Sub-toolbar: Left Legend & Right Snapshot */}
      <div className="adm-timeline-subbar">
        <div className="adm-timeline-subbar-left">
          {activeTab === 'all' && (
            <div className="adm-chart-legend">
              <span className="legend-item">
                <span className="legend-line gmv" />
                <span>GMV Thu Hộ</span>
              </span>
              <span className="legend-item">
                <span className="legend-line payouts-dash" />
                <span>Giải Ngân Host (88%)</span>
              </span>
            </div>
          )}
          {activeTab === 'commission' && (
            <div className="adm-chart-legend">
              <span className="legend-item">
                <span className="legend-line commission" />
                <span>Hoa Hồng Sàn (12%)</span>
              </span>
            </div>
          )}
          {activeTab === 'payouts' && (
            <div className="adm-chart-legend">
              <span className="legend-item">
                <span className="legend-line payouts" />
                <span>Giải Ngân Cho Host (88%)</span>
              </span>
            </div>
          )}
          {activeTab === 'escrow' && (
            <div className="adm-chart-legend">
              <span className="legend-item">
                <span className="legend-line escrow" />
                <span>Quỹ Escrow Tạm Giữ</span>
              </span>
              <span className="legend-item">
                <span className="legend-line refunds-dash" />
                <span>Hoàn Tiền Hủy</span>
              </span>
            </div>
          )}
        </div>

        <div className="adm-timeline-subbar-right">
          <div className="snapshot-box">
            <span className="snapshot-lbl">Tổng trong kỳ:</span>
            <span className="snapshot-val" style={{ color: currentTab.color }}>
              {formatCurrency(tabTotals[activeTab] || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="adm-timeline-chart-container">
        {loading && (
          <div className="adm-chart-loader-overlay">
            <div className="adm-chart-spinner" />
            <span>Đang tải dữ liệu dòng tiền...</span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="adm-timeline-svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* 1. GMV Area Gradient (Coral) */}
            <linearGradient id="gmvAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff385c" stopOpacity="0.28" />
              <stop offset="80%" stopColor="#ff385c" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#ff385c" stopOpacity="0" />
            </linearGradient>

            {/* 2. Commission Area Gradient (Emerald) */}
            <linearGradient id="commAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="80%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>

            {/* 3. Payouts Area Gradient (Sky) */}
            <linearGradient id="payoutAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.30" />
              <stop offset="80%" stopColor="#0ea5e9" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>

            {/* 4. Escrow Area Gradient (Amber) */}
            <linearGradient id="escrowAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
              <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            {/* Soft Glow Filter for Primary Curve */}
            <filter id="glowStreamLine" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor={currentTab.color} floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-Axis Labels */}
          {yTicks.map((tickVal, index) => {
            const y = getY(tickVal);
            return (
              <g key={index} className="adm-grid-group">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="adm-grid-line"
                />
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="adm-axis-label-y"
                >
                  {formatShortCurrency(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Area Gradients */}
          {activeTab === 'all' && (
            <path
              d={buildSmoothAreaPath('gmv')}
              fill="url(#gmvAreaGrad)"
            />
          )}

          {activeTab === 'commission' && (
            <path
              d={buildSmoothAreaPath('commission')}
              fill="url(#commAreaGrad)"
            />
          )}

          {activeTab === 'payouts' && (
            <path
              d={buildSmoothAreaPath('payouts')}
              fill="url(#payoutAreaGrad)"
            />
          )}

          {activeTab === 'escrow' && (
            <path
              d={buildSmoothAreaPath('escrow')}
              fill="url(#escrowAreaGrad)"
            />
          )}

          {/* Smooth Lines for each Tab (Thinner elegant strokes) */}
          {activeTab === 'all' && (
            <>
              {/* Secondary Reference Curve: Host Payouts in Tab All */}
              <path
                d={buildSmoothPath('payouts')}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
                opacity="0.75"
              />
              {/* Primary Curve: GMV */}
              <path
                d={buildSmoothPath('gmv')}
                fill="none"
                stroke="#ff385c"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#glowStreamLine)"
              />
            </>
          )}

          {activeTab === 'commission' && (
            <path
              d={buildSmoothPath('commission')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#glowStreamLine)"
            />
          )}

          {activeTab === 'payouts' && (
            <path
              d={buildSmoothPath('payouts')}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#glowStreamLine)"
            />
          )}

          {activeTab === 'escrow' && (
            <>
              {/* Curve 1: Escrow Pending (Amber) */}
              <path
                d={buildSmoothPath('escrow')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#glowStreamLine)"
              />
              {/* Curve 2: Refunds (Red) */}
              <path
                d={buildSmoothPath('refunds')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="4 3"
              />
            </>
          )}

          {/* Data Points & Vertical Hover Guide */}
          {safeData.map((item, index) => {
            const x = getX(index);
            const isHovered = hoveredIndex === index;
            const primaryVal = item[currentTab.primaryKey];
            const hitbox = getHitbox(index);
            const isDense = safeData.length > 8;

            return (
              <g key={index}>
                {/* Vertical Cursor Line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke={currentTab.color}
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* X Axis 2-line Label (Title + Date range) */}
                <text
                  x={x}
                  y={paddingTop + chartHeight + (isDense ? 18 : 20)}
                  textAnchor="middle"
                  className={`adm-axis-label-x ${isHovered ? 'active' : ''}`}
                  style={{ fontSize: isDense ? '10px' : '11px' }}
                >
                  {item.label}
                </text>
                {item.subLabel && (
                  <text
                    x={x}
                    y={paddingTop + chartHeight + (isDense ? 30 : 34)}
                    textAnchor="middle"
                    className={`adm-axis-sublabel-x ${isHovered ? 'active' : ''}`}
                    style={{ fontSize: isDense ? '8.5px' : '9.5px' }}
                  >
                    {item.subLabel}
                  </text>
                )}

                {/* Only display dot & radar pulse on HOVER (no static dots) */}
                {isHovered && (
                  <>
                    <circle
                      cx={x}
                      cy={getY(primaryVal)}
                      r={13}
                      fill={currentTab.color}
                      fillOpacity="0.18"
                      className="adm-pulse-ring"
                    />
                    <circle
                      cx={x}
                      cy={getY(primaryVal)}
                      r={5.5}
                      fill="#ffffff"
                      stroke={currentTab.color}
                      strokeWidth={2.5}
                      className="adm-chart-dot"
                    />
                  </>
                )}

                {/* Full-height Hitbox Slice for effortless hover interaction */}
                <rect
                  x={hitbox.x}
                  y={0}
                  width={hitbox.width}
                  height={height}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Focused Floating Tooltip */}
        {activePoint && (
          <div
            className="adm-timeline-tooltip"
            style={{
              left: `${Math.min(Math.max((getX(hoveredIndex) / width) * 100, 16), 84)}%`,
              top: '4px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="adm-tooltip-header">
              <div className="tooltip-header-left">
                <TbCalendar className="tooltip-icon" style={{ color: currentTab.color }} />
                <span>{activePoint.label} {activePoint.subLabel ? `(${activePoint.subLabel})` : ''}</span>
              </div>
              {activePoint.booking_count !== undefined && (
                <span className="tooltip-badge">{activePoint.booking_count} đơn</span>
              )}
            </div>

            <div className="adm-tooltip-body">
              {activeTab === 'all' && (
                <>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot gmv" />
                    <span className="tooltip-name">GMV Thu Hộ:</span>
                    <span className="tooltip-val font-bold text-coral">{formatCurrency(activePoint.gmv)}</span>
                  </div>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot payouts" />
                    <span className="tooltip-name">Giải Ngân Host (88%):</span>
                    <span className="tooltip-val text-sky">{formatCurrency(activePoint.payouts || Math.round(activePoint.gmv * 0.88))}</span>
                  </div>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot commission" />
                    <span className="tooltip-name">Hoa Hồng Sàn (12%):</span>
                    <span className="tooltip-val text-emerald">{formatCurrency(activePoint.commission)}</span>
                  </div>
                </>
              )}

              {activeTab === 'commission' && (
                <>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot commission" />
                    <span className="tooltip-name">Hoa Hồng Sàn (12%):</span>
                    <span className="tooltip-val font-bold text-emerald">{formatCurrency(activePoint.commission)}</span>
                  </div>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot gmv" />
                    <span className="tooltip-name">Từ Tổng GMV:</span>
                    <span className="tooltip-val text-muted-sub">{formatCurrency(activePoint.gmv)}</span>
                  </div>
                </>
              )}

              {activeTab === 'payouts' && (
                <>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot payouts" />
                    <span className="tooltip-name">Giải Ngân Cho Host:</span>
                    <span className="tooltip-val font-bold text-sky">{formatCurrency(activePoint.payouts)}</span>
                  </div>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot escrow" />
                    <span className="tooltip-name">Tỷ Trọng Giải Ngân:</span>
                    <span className="tooltip-val font-bold text-sky">88.0%</span>
                  </div>
                </>
              )}

              {activeTab === 'escrow' && (
                <>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot escrow" />
                    <span className="tooltip-name">Quỹ Escrow Tạm Giữ:</span>
                    <span className="tooltip-val font-bold text-amber">{formatCurrency(activePoint.escrow)}</span>
                  </div>
                  <div className="adm-tooltip-row">
                    <span className="tooltip-dot refunds" />
                    <span className="tooltip-name">Hoàn Tiền Hủy Đơn:</span>
                    <span className="tooltip-val font-bold text-rose">{formatCurrency(activePoint.refunds)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashflowTimelineChart;
