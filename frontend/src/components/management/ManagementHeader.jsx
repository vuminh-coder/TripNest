import React from 'react';
import './management.css';

export const ManagementHeader = ({
  title,
  subtitle,
  icon: Icon,
  period,
  onPeriodChange,
  periods = [
    { key: 'week', label: '7 Ngày' },
    { key: 'month', label: 'Tháng Này' },
    { key: 'quarter', label: 'Quý' },
    { key: 'year', label: 'Cả Năm' }
  ],
  selectedQuarter,
  onQuarterChange,
  selectedYear,
  onYearChange,
  years = [2026, 2025],
  actions = null,
  children
}) => {
  return (
    <div className="mgmt-header-toolbar">
      <div className="mgmt-header-left">
        <h1 className="mgmt-header-title">
          {Icon && <Icon style={{ flexShrink: 0 }} />}
          <span>{title}</span>
        </h1>
        {subtitle && <p className="mgmt-header-subtitle">{subtitle}</p>}
      </div>

      <div className="mgmt-header-controls">
        {/* Period Pills if onPeriodChange is provided */}
        {onPeriodChange && (
          <div className="mgmt-period-pills">
            {periods.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`mgmt-period-pill ${period === p.key ? 'active' : ''}`}
                onClick={() => onPeriodChange(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Quarter select if period === 'quarter' */}
        {period === 'quarter' && onQuarterChange && (
          <select
            className="mgmt-sub-select"
            value={selectedQuarter || 3}
            onChange={(e) => onQuarterChange(Number(e.target.value))}
            aria-label="Chọn Quý"
          >
            <option value={1}>Quý 1 (T1-T3)</option>
            <option value={2}>Quý 2 (T4-T6)</option>
            <option value={3}>Quý 3 (T7-T9)</option>
            <option value={4}>Quý 4 (T10-T12)</option>
          </select>
        )}

        {/* Year select if period === 'year' */}
        {period === 'year' && onYearChange && (
          <select
            className="mgmt-sub-select"
            value={selectedYear || 2026}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label="Chọn Năm"
          >
            {years.map((y) => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>
        )}

        {/* Custom Actions */}
        {actions}
        {children}
      </div>
    </div>
  );
};

export default ManagementHeader;
