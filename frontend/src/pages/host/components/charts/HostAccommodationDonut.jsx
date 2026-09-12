import React, { useState } from 'react';
import './HostAccommodationDonut.css';
import {
  TbChartPie,
  TbCircleCheck,
  TbClock,
  TbSparkles,
  TbArrowBackUp,
  TbBuildingCastle,
} from 'react-icons/tb';

export const HostAccommodationDonut = ({
  accommodations = [],
  financialBreakdown = {},
  totalGmv = 0,
  currency = 'VND',
  onSelectAccommodation,
}) => {
  // 2 modes: 'stream' (Cơ cấu dòng tiền - chuẩn Admin) | 'properties' (Cơ cấu theo cơ sở lưu trú)
  const [mode, setMode] = useState('stream');
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num.toLocaleString('vi-VN')} ₫`;
  };

  // 1. Dòng tiền (Financial Streams) - Giống Admin 100%
  const payoutsVal = Number(financialBreakdown.netEarnings !== undefined ? financialBreakdown.netEarnings : (totalGmv * 0.88)) || 0;
  const escrowVal = Number(financialBreakdown.escrowPending !== undefined ? financialBreakdown.escrowPending : 0) || 0;
  const commVal = Number(financialBreakdown.platformFee !== undefined ? financialBreakdown.platformFee : (totalGmv * 0.12)) || 0;
  const refundVal = Number(financialBreakdown.totalRefunded !== undefined ? financialBreakdown.totalRefunded : 0) || 0;
  const totalStreamPool = payoutsVal + escrowVal + commVal + refundVal;
  const safeStreamTotal = totalStreamPool > 0 ? totalStreamPool : (totalGmv > 0 ? totalGmv : 1);

  const streamData = [
    {
      id: 'completed',
      label: 'Thu Nhập Thực Nhận',
      shortLabel: 'Thực Nhận',
      value: payoutsVal,
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.1)',
      icon: TbCircleCheck,
      desc: 'Sẵn sàng rút về tài khoản',
    },
    {
      id: 'escrow',
      label: 'Quỹ Escrow Tạm Giữ',
      shortLabel: 'Quỹ Escrow',
      value: escrowVal,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: TbClock,
      desc: 'Chờ khách trả phòng',
    },
    {
      id: 'commission',
      label: 'Phí Dịch Vụ Sàn (12%)',
      shortLabel: 'Phí Sàn 12%',
      value: commVal,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.1)',
      icon: TbSparkles,
      desc: 'Chi phí bảo chứng nền tảng',
    },
    ...(refundVal > 0
      ? [
          {
            id: 'refunds',
            label: 'Hoàn Tiền Hủy Đơn',
            shortLabel: 'Hoàn tiền',
            value: refundVal,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            icon: TbArrowBackUp,
            desc: 'Đơn hủy phòng hợp lệ',
          },
        ]
      : []),
  ];

  // 2. Cơ sở lưu trú (Accommodations) - Xếp hạng giảm dần theo doanh thu
  const palette = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
  const propertiesRaw = accommodations && accommodations.length > 0 ? accommodations : [
    { id: 1, name: 'Villa Nghỉ Dưỡng Skyview', city: 'Đà Lạt', gmv: 45000000, bookings_count: 8 },
    { id: 2, name: 'Homestay Phố Cổ Yên Bình', city: 'Hội An', gmv: 32000000, bookings_count: 12 },
    { id: 3, name: 'Bungalow Gió Biển Sunset', city: 'Phú Quốc', gmv: 23000000, bookings_count: 5 },
  ];

  // Sắp xếp chỗ nghỉ theo doanh thu từ cao xuống thấp để hiển thị dạng lướt tối ưu
  const sortedPropertiesRaw = [...propertiesRaw].sort((a, b) => {
    const valA = Number(a.gmv || a.total_gmv || a.revenue || 0);
    const valB = Number(b.gmv || b.total_gmv || b.revenue || 0);
    return valB - valA;
  });

  const totalPropGmv = sortedPropertiesRaw.reduce((sum, p) => sum + Number(p.gmv || p.total_gmv || p.revenue || 0), 0) || totalGmv || 1;

  const propertiesData = sortedPropertiesRaw.map((item, idx) => {
    const val = Number(item.gmv || item.total_gmv || item.revenue || 0);
    const col = item.color || palette[idx % palette.length];
    return {
      id: String(item.id || idx),
      label: item.name || `Cơ sở ${idx + 1}`,
      shortLabel: item.name ? (item.name.length > 14 ? item.name.substring(0, 14) + '...' : item.name) : `Cơ sở ${idx + 1}`,
      value: val,
      color: col,
      bgColor: `${col}18`,
      icon: TbBuildingCastle,
      desc: `${item.city || 'Việt Nam'}${item.bookings_count ? ` • ${item.bookings_count} đơn` : ''}`,
      raw: item,
    };
  });

  // Chọn bộ dữ liệu theo mode hiện tại
  const data = mode === 'stream' ? streamData : propertiesData;
  const safeTotal = mode === 'stream' ? safeStreamTotal : totalPropGmv;

  // SVG Donut metrics - Thêm height hợp lý cân xứng với biểu đồ dòng tiền
  const size = 154;
  const strokeWidth = 19;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const currentHoverItem = hoveredSegment ? data.find((d) => d.id === hoveredSegment) : null;
  const activeDisplayTotal = mode === 'stream' ? totalStreamPool : totalPropGmv;

  return (
    <div className="adm-donut-card host-donut-card-custom">
      {/* Header chuẩn Admin với Toggle Dòng Tiền / Chỗ Nghỉ */}
      <div className="adm-donut-header">
        <div className="adm-donut-title-group">
          <div className="adm-donut-icon">
            <TbChartPie />
          </div>
          <div>
            <h3 className="adm-donut-title">
              {mode === 'stream' ? 'Cơ Cấu Dòng Tiền' : 'Cơ Cấu Doanh Thu'}
            </h3>
            <p className="adm-donut-subtitle">
              {mode === 'stream' ? 'Phân bổ nguồn tiền của bạn' : 'Phân bổ theo chỗ nghỉ'}
            </p>
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="host-donut-mode-toggle">
          <button
            type="button"
            className={`host-donut-toggle-btn ${mode === 'stream' ? 'active' : ''}`}
            onClick={() => {
              setMode('stream');
              setHoveredSegment(null);
            }}
          >
            Dòng Tiền
          </button>
          <button
            type="button"
            className={`host-donut-toggle-btn ${mode === 'properties' ? 'active' : ''}`}
            onClick={() => {
              setMode('properties');
              setHoveredSegment(null);
            }}
          >
            Chỗ Nghỉ
          </button>
        </div>
      </div>

      <div className="adm-donut-body">
        {/* SVG Donut Chart */}
        <div className="adm-donut-visual">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="adm-donut-svg"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--host-border-subtle, #f1f5f9)"
              strokeWidth={strokeWidth}
            />

            {/* Arcs */}
            {data.map((item) => {
              const percent = safeTotal > 0 ? item.value / safeTotal : 0;
              const strokeDasharray = `${Math.max(percent * circumference, 0)} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              cumulativePercent += percent;

              const isHovered = hoveredSegment === item.id;

              return (
                <circle
                  key={item.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`adm-donut-arc ${isHovered ? 'hovered' : ''}`}
                  onMouseEnter={() => setHoveredSegment(item.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  style={{
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)',
                    transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
                  }}
                />
              );
            })}
          </svg>

          {/* Center Info Bubble */}
          <div className="adm-donut-center-info">
            <span className="adm-donut-center-lbl">
              {currentHoverItem ? currentHoverItem.shortLabel : (mode === 'stream' ? 'Tổng Dòng Tiền' : 'Tổng Doanh Thu')}
            </span>
            <span className="adm-donut-center-val">
              {currentHoverItem
                ? formatCurrency(currentHoverItem.value)
                : formatCurrency(activeDisplayTotal || totalGmv)}
            </span>
            <span className="adm-donut-center-sub">
              {currentHoverItem
                ? `${safeTotal > 0 ? ((currentHoverItem.value / safeTotal) * 100).toFixed(1) : 0}% tỷ trọng`
                : (mode === 'stream' ? `${data.length} nguồn luân chuyển` : `${data.length} chỗ nghỉ`)}
            </span>
          </div>
        </div>

        {/* Breakdown List Mini-Table dạng lướt (Scrollable) */}
        <div className="adm-donut-breakdown-list">
          {data.map((item) => {
            const percent = safeTotal > 0 ? ((item.value / safeTotal) * 100).toFixed(1) : '0.0';
            const isHovered = hoveredSegment === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className={`adm-donut-row ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredSegment(item.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => {
                  if (mode === 'properties' && item.raw && onSelectAccommodation) {
                    onSelectAccommodation(item.raw);
                  }
                }}
                style={{ cursor: mode === 'properties' && onSelectAccommodation ? 'pointer' : 'default' }}
              >
                <div className="adm-donut-row-left">
                  <div className="adm-donut-row-icon" style={{ color: item.color, background: item.bgColor }}>
                    <Icon />
                  </div>
                  <div className="adm-donut-row-text">
                    <div className="adm-donut-row-name">{item.label}</div>
                    <div className="adm-donut-row-desc">{item.desc}</div>
                  </div>
                </div>

                <div className="adm-donut-row-right">
                  <div className="adm-donut-row-val">{formatCurrency(item.value)}</div>
                  <div className="adm-donut-row-pct" style={{ color: item.color }}>
                    {percent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HostAccommodationDonut;
