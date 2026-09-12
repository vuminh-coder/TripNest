import React, { useState, useMemo, useEffect } from 'react';
import './HostCashflowTimelineChart.css';
import {
  TbCoins,
  TbSparkles,
  TbCircleCheck,
  TbClock,
  TbTrendingUp,
  TbBuildingBank,
  TbChartAreaLine,
  TbCalendarEvent,
} from 'react-icons/tb';

export const HostCashflowTimelineChart = ({
  data = [],
  timeline = [],
  loading = false,
  period = 'week',
}) => {
  // 3 stream tabs: 'all' (GMV) | 'net' (Thực nhận ví 88%) | 'escrow' (Quỹ Escrow)
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const rawList = data && data.length > 0 ? data : (timeline && timeline.length > 0 ? timeline : []);

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

  // Chuẩn hóa dữ liệu fallback an toàn
  const safeData = useMemo(() => {
    if (!Array.isArray(rawList) || rawList.length === 0) {
      if (period === 'week') {
        return [
          { label: 'Thứ 2', subLabel: '04/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Thứ 3', subLabel: '05/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Thứ 4', subLabel: '06/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Thứ 5', subLabel: '07/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Thứ 6', subLabel: '08/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Thứ 7', subLabel: '09/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'CN', subLabel: '10/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
        ];
      }
      if (period === 'quarter') {
        return [
          { label: 'Tháng 7', subLabel: '07/2026', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Tháng 8', subLabel: '08/2026', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
          { label: 'Tháng 9', subLabel: '09/2026', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
        ];
      }
      if (period === 'year') {
        return Array.from({ length: 12 }, (_, i) => ({
          label: `T${i + 1}`,
          subLabel: `T${i + 1}`,
          gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0,
        }));
      }
      return [
        { label: 'Tuần 1', subLabel: '01/09 - 07/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
        { label: 'Tuần 2', subLabel: '08/09 - 14/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
        { label: 'Tuần 3', subLabel: '15/09 - 21/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
        { label: 'Tuần 4', subLabel: '22/09 - 30/09', gmv: 0, net_earnings: 0, escrow: 0, bookings_count: 0 },
      ];
    }

    return rawList.map((item, idx) => ({
      ...item,
      label: item.label || item.time_label || `Mốc ${idx + 1}`,
      subLabel: item.subLabel || item.date || '',
      gmv: Number(item.gmv) || 0,
      net_earnings: Number(item.net_earnings) || Number(item.net) || Number(item.host_net) || (Number(item.gmv || 0) * 0.88),
      escrow: Number(item.escrow) || Number(item.escrowPending) || 0,
      bookings_count: Number(item.bookings_count !== undefined ? item.bookings_count : (item.booking_count || 0)),
    }));
  }, [rawList, period]);

  // Cấu hình tab & màu sắc
  const tabConfig = {
    all: {
      title: 'Doanh Thu GMV',
      subtitle: 'Tổng giá trị đặt phòng phát sinh trong kỳ',
      primaryKey: 'gmv',
      color: '#ff385c',
      gradId: 'hostGmvGrad',
      icon: TbCoins,
      tag: 'Tổng GMV',
    },
    net: {
      title: 'Thu Nhập Thực Nhận',
      subtitle: 'Doanh thu thực nhận sau khi hoàn tất lưu trú',
      primaryKey: 'net_earnings',
      color: '#059669',
      gradId: 'hostNetGrad',
      icon: TbBuildingBank,
      tag: 'Thực Nhận',
    },
    escrow: {
      title: 'Quỹ Escrow Tạm Giữ',
      subtitle: 'Tạm giữ an toàn và sẽ giải ngân khi khách check-out',
      primaryKey: 'escrow',
      color: '#d97706',
      gradId: 'hostEscrowGrad',
      icon: TbClock,
      tag: 'Escrow',
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig.all;
  const primaryKey = currentTab.primaryKey;

  // Tính toán số liệu từng stream để hiển thị trên tabs
  const totalGmvVal = useMemo(() => safeData.reduce((sum, d) => sum + (d.gmv || 0), 0), [safeData]);
  const totalNetVal = useMemo(() => safeData.reduce((sum, d) => sum + (d.net_earnings || 0), 0), [safeData]);
  const totalEscrowVal = useMemo(() => safeData.reduce((sum, d) => sum + (d.escrow || 0), 0), [safeData]);

  // Tính toán trục tọa độ SVG
  const values = safeData.map((d) => Number(d[primaryKey]) || 0);
  const maxValRaw = Math.max(...values, 0);
  const maxVal = maxValRaw > 0 ? maxValRaw * 1.18 : 10000000;
  const totalVal = values.reduce((sum, v) => sum + v, 0);
  const totalBookings = safeData.reduce((sum, d) => sum + (d.bookings_count || 0), 0);

  // SVG dimensions - Trục Ox, Oy sát ra ngoài mép & cố định chuẩn theo khối chỗ nghỉ (420px)
  const svgWidth = 820;
  const svgHeight = 285;
  const padLeft = 44; // Sát mép trái
  const padRight = 10; // Sát mép phải
  const padTop = 18; // Sát mép trên
  const padBottom = 28; // Sát mép dưới
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const points = safeData.map((d, i) => {
    const x = padLeft + (i / Math.max(safeData.length - 1, 1)) * chartW;
    const ratio = Math.min((Number(d[primaryKey]) || 0) / maxVal, 1);
    const y = padTop + chartH - ratio * chartH;
    return { x, y, data: d, val: Number(d[primaryKey]) || 0 };
  });

  // Đường cong Bézier mượt mà
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`
    : '';

  // 6 đường lưới ngang Y-axis (tăng thêm 2 mốc theo yêu cầu, bỏ nhãn 0 tránh đè mốc X)
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => ({
    ratio,
    val: maxVal * ratio,
    y: padTop + chartH - ratio * chartH,
  }));

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="host-timeline-card">
      {/* 1. Header Toolbar với Title & Tóm Tắt Trong Kỳ */}
      <div className="host-timeline-header">
        <div className="host-timeline-title-group">
          <div className="host-timeline-icon-badge" style={{ color: currentTab.color }}>
            <currentTab.icon />
          </div>
          <div>
            <div className="host-timeline-title-row">
              <h3 className="host-timeline-title">{currentTab.title}</h3>
              <span className="host-timeline-badge" style={{ color: currentTab.color, borderColor: `${currentTab.color}33`, background: `${currentTab.color}12` }}>
                {currentTab.tag}
              </span>
            </div>
            <p className="host-timeline-subtitle">{currentTab.subtitle}</p>
          </div>
        </div>

        {/* Snapshot Stats bên phải Header */}
        <div className="host-timeline-header-meta">
          <div className="host-sub-stat">
            <span className="host-sub-stat-lbl">Tổng trong kỳ:</span>
            <strong className="host-sub-stat-val" style={{ color: currentTab.color }}>
              {formatCurrency(totalVal)}
            </strong>
          </div>
          <span className="host-meta-dot">•</span>
          <div className="host-sub-stat">
            <span className="host-sub-stat-lbl">Lượt đơn:</span>
            <strong className="host-sub-stat-val">
              {totalBookings} đơn
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Stream Tabs (Segmented Control 3 Cột Chuẩn Fintech) */}
      <div className="host-stream-tabs-nav">
        <button
          type="button"
          className={`host-stream-tab ${activeTab === 'all' ? 'active tab-all' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <TbCoins className="tab-icon" />
          <span className="tab-text">Tổng GMV</span>
          <span className="tab-pill-val">{formatShortCurrency(totalGmvVal)}</span>
        </button>
        <button
          type="button"
          className={`host-stream-tab ${activeTab === 'net' ? 'active tab-net' : ''}`}
          onClick={() => setActiveTab('net')}
        >
          <TbBuildingBank className="tab-icon" />
          <span className="tab-text">Thực Nhận</span>
          <span className="tab-pill-val">{formatShortCurrency(totalNetVal)}</span>
        </button>
        <button
          type="button"
          className={`host-stream-tab ${activeTab === 'escrow' ? 'active tab-escrow' : ''}`}
          onClick={() => setActiveTab('escrow')}
        >
          <TbClock className="tab-icon" />
          <span className="tab-text">Quỹ Escrow</span>
          <span className="tab-pill-val">{formatShortCurrency(totalEscrowVal)}</span>
        </button>
      </div>

      {/* 4. Đồ Họa SVG Area Line Chart */}
      <div className="host-timeline-svg-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="host-timeline-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={currentTab.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentTab.color} stopOpacity="0.28" />
              <stop offset="65%" stopColor={currentTab.color} stopOpacity="0.06" />
              <stop offset="100%" stopColor={currentTab.color} stopOpacity="0.00" />
            </linearGradient>

            <filter id="hostLineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={currentTab.color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines ngang */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Bỏ nhãn 0 ở vạch đáy để không bao giờ đè lên mốc X đầu tiên */}
              {tick.ratio > 0 && (
                <text
                  x={padLeft - 6}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="inherit"
                  fontWeight="600"
                >
                  {formatShortCurrency(tick.val)}
                </text>
              )}
            </g>
          ))}

          {/* Area Fill */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#${currentTab.gradId})`}
              className="host-chart-area-path"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={currentTab.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#hostLineGlow)"
              className="host-chart-line-path"
            />
          )}

          {/* Vạch hover dọc */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + chartH}
              stroke={currentTab.color}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.8"
            />
          )}

          {/* Points & Interactive Hitboxes */}
          {points.map((pt, i) => {
            const isHov = hoveredIndex === i;
            return (
              <g
                key={i}
                className="host-chart-node-group"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hitbox tàng hình rộng rãi */}
                <rect
                  x={pt.x - 20}
                  y={padTop}
                  width="40"
                  height={chartH + padBottom}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                />

                {/* Outer ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHov ? 5 : 2.8}
                  fill="#ffffff"
                  stroke={currentTab.color}
                  strokeWidth={isHov ? 2.2 : 1.6}
                  style={{ transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />

                {/* X-axis Label - Sát ra ngoài hai bên và đáy */}
                <text
                  x={pt.x}
                  y={padTop + chartH + 16}
                  textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                  fontSize="11"
                  fontWeight={isHov ? '800' : '600'}
                  fill={isHov ? 'var(--host-text-main, #0f172a)' : '#64748b'}
                  style={{ transition: 'all 0.15s ease' }}
                >
                  {pt.data.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip nổi bên trên */}
        {activePoint && (() => {
          const xPct = svgWidth > 0 ? (activePoint.x / svgWidth) * 100 : 50;
          const yPct = svgHeight > 0 ? (activePoint.y / svgHeight) * 100 : 50;

          // Adaptive horizontal alignment: flip inward when approaching card borders
          let translateX = '-50%';
          if (xPct > 68) {
            translateX = '-96%'; // Anchor to right side of point, pointing leftward
          } else if (xPct < 32) {
            translateX = '-4%'; // Anchor to left side of point, pointing rightward
          }

          // Adaptive vertical alignment: if node is too close to top (<40%), show below node
          const showBelow = yPct < 40;
          const translateY = showBelow ? '14px' : 'calc(-100% - 14px)';

          return (
            <div
              className="host-chart-tooltip"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: `translate(${translateX}, ${translateY})`,
              }}
            >
              <div className="host-tooltip-header">
                <span className="host-tooltip-label">{activePoint.data.label}</span>
                {activePoint.data.subLabel && (
                  <span className="host-tooltip-sub">{activePoint.data.subLabel}</span>
                )}
              </div>

              <div className="host-tooltip-row primary">
                <span className="host-tooltip-key">{currentTab.title.split('(')[0]}:</span>
                <strong className="host-tooltip-val" style={{ color: currentTab.color }}>
                  {formatCurrency(activePoint.val)}
                </strong>
              </div>

              <div className="host-tooltip-details">
                <div className="host-tooltip-subrow">
                  <span>Doanh thu GMV:</span>
                  <span>{formatCurrency(activePoint.data.gmv)}</span>
                </div>
                <div className="host-tooltip-subrow">
                  <span>Thu nhập thực nhận:</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    {formatCurrency(activePoint.data.net_earnings)}
                  </span>
                </div>
                {activePoint.data.escrow > 0 && (
                  <div className="host-tooltip-subrow">
                    <span>Quỹ Escrow:</span>
                    <span style={{ color: '#d97706', fontWeight: 600 }}>
                      {formatCurrency(activePoint.data.escrow)}
                    </span>
                  </div>
                )}
                <div className="host-tooltip-subrow">
                  <span>Lượt khách đặt:</span>
                  <span style={{ fontWeight: 700 }}>{activePoint.data.bookings_count} đơn</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default HostCashflowTimelineChart;
