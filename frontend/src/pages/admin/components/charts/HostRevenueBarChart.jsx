import React, { useState } from 'react';
import './HostRevenueBarChart.css';
import { 
  TbBuildingCastle, 
  TbShieldCheck, 
  TbCoins, 
  TbSparkles, 
  TbCircleCheck,
  TbArrowUpRight,
  TbTrophy,
  TbCrown,
  TbMedal,
  TbFileDollar
} from 'react-icons/tb';

export const HostRevenueBarChart = ({ hosts = [], loading = false, onSelectHost, onViewAll }) => {
  const [hoveredHostId, setHoveredHostId] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} Tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} Tr`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return `${num}`;
  };

  // Standardize & Sort top 5 hosts by total_gmv
  const topHosts = [...hosts]
    .map(h => ({
      ...h,
      id: h.id || h.host_id,
      name: h.name || h.host_name || 'Chủ nhà TripNest',
      total_gmv: Number(h.total_gmv || h.gmv || h.total_revenue) || 0,
      net_earnings: Number(h.net_earnings || h.net_income || (Number(h.total_gmv || h.gmv || 0) * 0.88)) || 0,
      commission: Number(h.platform_fee || h.commission || (Number(h.total_gmv || h.gmv || 0) * 0.12)) || 0,
      properties_count: h.accommodations_count || h.properties_count || 1,
      completed_bookings: h.booking_count || h.completed_bookings || 0,
      avatar: h.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name || h.host_name || 'Host')}&background=ff385c&color=fff`,
    }))
    .sort((a, b) => b.total_gmv - a.total_gmv)
    .slice(0, 5);

  const maxGMV = Math.max(...topHosts.map((h) => h.total_gmv), 10000000) * 1.08;

  return (
    <div className="adm-host-bar-card">
      <div className="adm-host-bar-header">
        <div className="adm-host-bar-title-group">
          <div className="adm-host-bar-icon">
            <TbTrophy />
          </div>
          <div>
            <div className="adm-host-bar-title-row">
              <h3 className="adm-host-bar-title">Top 5 Chủ Nhà Doanh Thu Cao Nhất</h3>
              <span className="adm-host-counter-badge">Top 5 / {hosts.length || 17} Host</span>
            </div>
            <p className="adm-host-bar-subtitle">So sánh tổng GMV thu hộ và dòng tiền thực nhận của Host (88%)</p>
          </div>
        </div>

        <div className="adm-host-bar-header-right">
          {/* Legend */}
          <div className="adm-host-bar-legend-mini">
            <span className="adm-host-legend-tag gmv">
              <span className="adm-host-tag-dot gmv" /> GMV Thu Hộ
            </span>
            <span className="adm-host-legend-tag net">
              <span className="adm-host-tag-dot net" /> Thực Nhận (88%)
            </span>
            <span className="adm-host-legend-tag fee">
              <span className="adm-host-tag-dot fee" /> Phí Sàn 12%
            </span>
          </div>

          {onViewAll && (
            <button
              type="button"
              className="adm-host-view-all-btn"
              onClick={onViewAll}
              title="Xem bảng xếp hạng & thống kê đầy đủ tất cả chủ nhà"
            >
              <span>Xem Tất Cả ({hosts.length || 17})</span>
              <TbArrowUpRight className="adm-host-view-all-icon" />
            </button>
          )}
        </div>
      </div>

      {/* Host Bar List */}
      <div className="adm-host-bar-list">
        {topHosts.length === 0 ? (
          <div className="adm-host-bar-empty">
            Chưa có dữ liệu doanh thu của các chủ nhà trong kỳ này.
          </div>
        ) : (
          topHosts.map((host, index) => {
            const gmvWidth = Math.min(100, Math.max(6, (host.total_gmv / maxGMV) * 100));
            const netWidth = Math.min(100, Math.max(5, (host.net_earnings / maxGMV) * 100));
            const isHovered = hoveredHostId === host.id;

            return (
              <div
                key={host.id || index}
                className={`adm-host-bar-row ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredHostId(host.id)}
                onMouseLeave={() => setHoveredHostId(null)}
                onClick={() => onSelectHost && onSelectHost(host)}
                title="Bấm để mở bảng sao kê dòng tiền & lịch sử giải ngân chi tiết của Host này"
              >
                {/* Host Meta Column */}
                <div className="adm-host-bar-meta">
                  <div className={`adm-host-bar-rank rank-${index + 1}`}>
                    {index === 0 ? (
                      <TbCrown className="rank-crown-gold" title="Quán quân doanh thu" />
                    ) : index === 1 ? (
                      <TbMedal className="rank-medal-silver" title="Á quân doanh thu" />
                    ) : index === 2 ? (
                      <TbMedal className="rank-medal-bronze" title="Quý quân doanh thu" />
                    ) : (
                      `#${index + 1}`
                    )}
                  </div>
                  <img
                    src={host.avatar}
                    alt={host.name}
                    className="adm-host-bar-avatar"
                  />
                  <div className="adm-host-bar-info">
                    <div className="adm-host-bar-name">
                      <span>{host.name}</span>
                      {index < 2 && (
                        <span className="adm-host-super-badge">
                          <TbShieldCheck size={11} /> Top Host
                        </span>
                      )}
                    </div>
                    <div className="adm-host-bar-sub">
                      {host.properties_count} chỗ nghỉ • {host.completed_bookings} đơn
                    </div>
                  </div>
                </div>

                {/* Double Bar Track */}
                <div className="adm-host-bar-tracks">
                  {/* GMV Bar */}
                  <div className="adm-host-track-row">
                    <div className="adm-host-track-bg">
                      <div
                        className="adm-host-fill gmv"
                        style={{ width: `${gmvWidth}%` }}
                      />
                    </div>
                    <span className="adm-host-val font-bold text-coral">
                      {formatShortCurrency(host.total_gmv)}
                    </span>
                  </div>

                  {/* Net Earnings Bar */}
                  <div className="adm-host-track-row">
                    <div className="adm-host-track-bg">
                      <div
                        className="adm-host-fill net"
                        style={{ width: `${netWidth}%` }}
                      />
                    </div>
                    <span className="adm-host-val font-semibold text-sky">
                      {formatShortCurrency(host.net_earnings)}
                    </span>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="adm-host-bar-action">
                  <TbFileDollar size={13} />
                  <span className="adm-host-action-label">Sao kê</span>
                  <TbArrowUpRight className="arrow-icon" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View all footer banner */}
      {onViewAll && (
        <div
          className="adm-host-bar-footer"
          onClick={onViewAll}
          title="Bấm để chuyển sang trang Thống kê & Bảng xếp hạng toàn bộ Chủ nhà"
        >
          <div className="adm-host-bar-footer-left">
            <span className="adm-host-bar-footer-badge">
              <TbTrophy className="adm-host-footer-trophy" /> TỔNG THỂ
            </span>
            <span className="adm-host-bar-footer-text">
              Toàn hệ thống TripNest đang có <strong>{hosts.length || 17} đối tác Chủ nhà</strong> kinh doanh cho thuê.
            </span>
          </div>
          <span className="adm-host-bar-footer-link">
            Xem Bảng Xếp Hạng & Báo Cáo Doanh Thu Chi Tiết
            <TbArrowUpRight className="adm-host-footer-arrow" />
          </span>
        </div>
      )}
    </div>
  );
};

export default HostRevenueBarChart;
