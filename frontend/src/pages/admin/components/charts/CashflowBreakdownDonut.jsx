import React, { useState } from 'react';
import './CashflowBreakdownDonut.css';
import { TbCircleCheck, TbClock, TbSparkles, TbArrowBackUp, TbChartPie } from 'react-icons/tb';

export const CashflowBreakdownDonut = ({
  summary = {},
  completedPayouts = 0,
  escrowPending = 0,
  commissionRevenue = 0,
  totalRefunds = 0,
  loading = false,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Extract from summary if available, otherwise from direct props
  const payoutsVal = Number(summary.payouts_completed !== undefined ? summary.payouts_completed : completedPayouts) || 0;
  const escrowVal = Number(summary.escrow_pending !== undefined ? summary.escrow_pending : escrowPending) || 0;
  const commVal = Number(summary.platform_commission !== undefined ? summary.platform_commission : commissionRevenue) || 0;
  const refundVal = Number(summary.total_refunded !== undefined ? summary.total_refunded : totalRefunds) || 0;
  const gmvVal = Number(summary.total_gmv) || (payoutsVal + escrowVal + commVal + refundVal);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const totalPool = payoutsVal + escrowVal + commVal + refundVal;
  const safeTotal = totalPool > 0 ? totalPool : (gmvVal > 0 ? gmvVal : 1);

  const data = [
    {
      id: 'completed',
      label: 'Đã Giải Ngân Cho Host',
      shortLabel: 'Giải ngân Host',
      value: payoutsVal,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.1)',
      icon: TbCircleCheck,
      desc: 'Đã chuyển STK ngân hàng',
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
      label: 'Hoa Hồng Sàn (12%)',
      shortLabel: 'Hoa hồng 12%',
      value: commVal,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      icon: TbSparkles,
      desc: 'Doanh thu thuần giữ lại',
    },
    {
      id: 'refunds',
      label: 'Hoàn Tiền Hủy Đơn',
      shortLabel: 'Hoàn tiền hủy',
      value: refundVal,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      icon: TbArrowBackUp,
      desc: 'Đơn hủy phòng hợp lệ',
    },
  ];

  // SVG Donut metrics
  const size = 148;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="adm-donut-card">
      <div className="adm-donut-header">
        <div className="adm-donut-title-group">
          <div className="adm-donut-icon">
            <TbChartPie />
          </div>
          <div>
            <h3 className="adm-donut-title">Cơ Cấu Dòng Tiền</h3>
            <p className="adm-donut-subtitle">Phân bổ 4 nguồn tiền hệ thống</p>
          </div>
        </div>
        <span className="adm-donut-rate-tag">12% Phí Sàn</span>
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
              stroke="var(--adm-border-subtle, #f1f5f9)"
              strokeWidth={strokeWidth}
            />

            {/* Arcs */}
            {data.map((item) => {
              const percent = item.value / safeTotal;
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
            <span className="adm-donut-center-lbl">Tổng Dòng Tiền</span>
            <span className="adm-donut-center-val">
              {hoveredSegment
                ? formatCurrency(data.find((d) => d.id === hoveredSegment)?.value)
                : formatCurrency(totalPool || gmvVal)}
            </span>
            <span className="adm-donut-center-sub">
              {hoveredSegment
                ? data.find((d) => d.id === hoveredSegment)?.shortLabel
                : '100% GMV Luân chuyển'}
            </span>
          </div>
        </div>

        {/* Breakdown List Mini-Table */}
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

export default CashflowBreakdownDonut;
