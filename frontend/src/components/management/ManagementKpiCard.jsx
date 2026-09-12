import React from 'react';
import './management.css';
import { TbTrendingUp, TbTrendingDown } from 'react-icons/tb';

export const ManagementKpiGrid = ({ children, columns = null }) => {
  const style = columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined;
  return (
    <div className="mgmt-kpi-grid" style={style}>
      {children}
    </div>
  );
};

export const ManagementKpiCard = ({
  label,
  value,
  variant = 'coral', // 'coral' | 'indigo' | 'emerald' | 'amber' | 'sky'
  trend = null,      // e.g. "+14.8% tăng trưởng"
  trendDirection = 'up', // 'up' | 'down'
  sub = null,        // text or react node
  icon: Icon,
  onClick = null,
}) => {
  return (
    <div 
      className={`mgmt-kpi-card border-${variant} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="mgmt-kpi-content">
        <span className="mgmt-kpi-label">{label}</span>
        <div className={`mgmt-kpi-value text-${variant}`}>
          {value}
        </div>
        {(trend || sub) && (
          <div className="mgmt-kpi-sub">
            {trend && (
              <span className={`mgmt-kpi-trend ${trendDirection}`}>
                {trendDirection === 'up' ? <TbTrendingUp style={{ marginRight: 2 }} /> : <TbTrendingDown style={{ marginRight: 2 }} />}
                {trend}
              </span>
            )}
            {trend && sub && <span>·</span>}
            {sub && <span>{sub}</span>}
          </div>
        )}
      </div>

      {Icon && (
        <div className={`mgmt-kpi-icon-wrap ${variant === 'coral' ? 'pink' : variant}`}>
          <Icon />
        </div>
      )}
    </div>
  );
};

export default ManagementKpiCard;
