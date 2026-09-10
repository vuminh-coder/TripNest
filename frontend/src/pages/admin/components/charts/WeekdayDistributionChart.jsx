import React, { useState } from 'react';
import { 
  TbCalendarStats, 
  TbSparkles, 
  TbTrendingUp, 
  TbFlame
} from 'react-icons/tb';
import './WeekdayDistributionChart.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatShortNumber = (val) => {
  const num = Number(val) || 0;
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Tỷ`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return `${num}`;
};

export const WeekdayDistributionChart = ({ data = [], loading = false }) => {
  const [activeDay, setActiveDay] = useState(null);
  const [viewMetric, setViewMetric] = useState('gmv'); // 'gmv' | 'bookings'

  // Default week days if data is empty
  const defaultDays = [
    { day: 'T2', name: 'Thứ Hai', gmv: 0, bookings: 0 },
    { day: 'T3', name: 'Thứ Ba', gmv: 0, bookings: 0 },
    { day: 'T4', name: 'Thứ Tư', gmv: 0, bookings: 0 },
    { day: 'T5', name: 'Thứ Năm', gmv: 0, bookings: 0 },
    { day: 'T6', name: 'Thứ Sáu', gmv: 0, bookings: 0 },
    { day: 'T7', name: 'Thứ Bảy', gmv: 0, bookings: 0 },
    { day: 'CN', name: 'Chủ Nhật', gmv: 0, bookings: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultDays;

  // Max value to scale columns
  const maxGmv = Math.max(...chartData.map(d => Number(d.gmv) || 0), 1);
  const maxBookings = Math.max(...chartData.map(d => Number(d.bookings) || 0), 1);
  const maxVal = viewMetric === 'gmv' ? maxGmv : maxBookings;

  const totalGmv = chartData.reduce((acc, d) => acc + (Number(d.gmv) || 0), 0);
  const totalBookings = chartData.reduce((acc, d) => acc + (Number(d.bookings) || 0), 0);

  // Peak Day
  const peakDay = chartData.reduce((prev, curr) => {
    const prevVal = viewMetric === 'gmv' ? (Number(prev.gmv) || 0) : (Number(prev.bookings) || 0);
    const currVal = viewMetric === 'gmv' ? (Number(curr.gmv) || 0) : (Number(curr.bookings) || 0);
    return currVal > prevVal ? curr : prev;
  }, chartData[0] || {});

  // Weekend Share (T6, T7, CN)
  const weekendGmv = chartData
    .filter(d => ['T6', 'T7', 'CN'].includes(d.day))
    .reduce((acc, d) => acc + (Number(d.gmv) || 0), 0);
  const weekendPct = totalGmv > 0 ? Math.round((weekendGmv / totalGmv) * 100) : 0;

  return (
    <div className="adm-weekday-card">
      <div className="adm-weekday-header">
        <div className="adm-weekday-title-group">
          <div className="adm-weekday-icon">
            <TbCalendarStats />
          </div>
          <div>
            <h3 className="adm-weekday-title">Phân Bổ Theo Thứ Trong Tuần</h3>
            <p className="adm-weekday-subtitle">Khảo sát ngày đặt phòng cao điểm trong tuần</p>
          </div>
        </div>

        <div className="adm-weekday-metric-toggle">
          <button 
            type="button"
            className={`adm-metric-pill ${viewMetric === 'gmv' ? 'active' : ''}`}
            onClick={() => setViewMetric('gmv')}
          >
            Doanh Thu GMV
          </button>
          <button 
            type="button"
            className={`adm-metric-pill ${viewMetric === 'bookings' ? 'active' : ''}`}
            onClick={() => setViewMetric('bookings')}
          >
            Số Đơn
          </button>
        </div>
      </div>

      <div className="adm-weekday-body">
        <div className="adm-weekday-bars">
          {chartData.map((item, index) => {
            const rawVal = viewMetric === 'gmv' ? (Number(item.gmv) || 0) : (Number(item.bookings) || 0);
            const heightPercent = maxVal > 0 ? Math.max((rawVal / maxVal) * 100, 6) : 6;
            const isPeak = peakDay?.day === item.day && rawVal > 0;
            const isWeekend = ['T6', 'T7', 'CN'].includes(item.day);
            const isHovered = activeDay?.day === item.day;

            return (
              <div 
                key={item.day || index} 
                className={`adm-weekday-col ${isPeak ? 'is-peak' : ''} ${isWeekend ? 'is-weekend' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setActiveDay(item)}
                onMouseLeave={() => setActiveDay(null)}
              >
                {isPeak && (
                  <div className="adm-peak-badge">
                    <TbFlame /> Peak
                  </div>
                )}

                <div className="adm-weekday-val-top">
                  {viewMetric === 'gmv' ? formatShortNumber(rawVal) : `${rawVal}`}
                </div>

                <div className="adm-weekday-track">
                  <div 
                    className="adm-weekday-fill" 
                    style={{ 
                      height: `${heightPercent}%`,
                      animationDelay: `${index * 0.06}s`
                    }}
                  >
                    <div className="adm-weekday-glow" />
                  </div>
                </div>

                <div className="adm-weekday-label-group">
                  <span className="adm-day-abbr">{item.day}</span>
                  <span className="adm-day-full">{item.name?.replace('Thứ ', 'T.') || item.day}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Tooltip */}
        {activeDay && (
          <div className="adm-weekday-tooltip">
            <div className="adm-weekday-tooltip-title">{activeDay.name || activeDay.day}</div>
            <div className="adm-weekday-tooltip-rows">
              <div className="adm-tt-row">
                <span className="tt-dot coral" />
                <span className="tt-lbl">Doanh thu GMV:</span>
                <span className="tt-val">{formatCurrency(activeDay.gmv)}</span>
              </div>
              <div className="tt-row">
                <span className="tt-dot sky" />
                <span className="tt-lbl">Số lượt đặt:</span>
                <span className="tt-val">{activeDay.bookings || 0} đơn</span>
              </div>
              <div className="tt-row">
                <span className="tt-dot amber" />
                <span className="tt-lbl">Tỷ trọng tuần:</span>
                <span className="tt-val">
                  {totalGmv > 0 ? (((Number(activeDay.gmv) || 0) / totalGmv) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insights */}
      <div className="adm-weekday-footer">
        <div className="adm-insight-badge weekend">
          <TbTrendingUp className="insight-icon" />
          <span>Cuối tuần chiếm <strong>{weekendPct}%</strong> tổng GMV</span>
        </div>
        <div className="adm-insight-badge peak">
          <TbSparkles className="insight-icon" />
          <span>Cao điểm nhất: <strong>{peakDay?.name || peakDay?.day || 'T7'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default WeekdayDistributionChart;
