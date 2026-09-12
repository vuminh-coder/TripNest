import React from 'react';
import './management.css';
import {
  TbTrophy,
  TbCrown,
  TbMedal,
  TbStar,
  TbArrowUpRight,
  TbFileDollar,
  TbBuildingCastle
} from 'react-icons/tb';

export const ManagementPodium = ({
  items = [],
  mode = 'accommodations', // 'accommodations' | 'hosts'
  title = 'Top 3 Cơ Sở Lưu Trú Dẫn Đầu Doanh Số',
  subtitle = 'Đóng góp cao nhất vào tổng doanh thu kinh doanh lưu trú của bạn',
  onItemClick,
  actionLabel = 'Xem Sao Kê Chi Tiết'
}) => {
  if (!items || items.length < 3) return null;

  const [top1, top2, top3] = items;

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const renderCard = (item, rank, badgeClass, medalClass) => {
    if (!item) return null;

    const isRank1 = rank === 1;
    const name = mode === 'accommodations' 
      ? (item.nameVi || item.name || 'Cơ sở lưu trú') 
      : (item.name || item.host_name || 'Chủ nhà');

    const meta = mode === 'accommodations'
      ? `${item.accommodationType || item.category || 'Chỗ nghỉ'} • ${item.city || 'Việt Nam'}`
      : `${item.accommodations_count || item.properties_count || 0} Chỗ nghỉ • ${item.completed_bookings || 0} Đơn`;

    const gmvVal = Number(item.total_gmv || item.gmv || item.revenue || item.totalRevenue || 0);
    const subVal = mode === 'accommodations'
      ? `${item.completed_bookings || item.bookingsCount || 0} lượt đặt • ${item.rating || 5.0} ★`
      : `Thực nhận: ${formatVND(item.net_earnings || item.net_income || (gmvVal * 0.88))}`;

    const mediaSrc = mode === 'accommodations'
      ? (item.thumbnail || item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600')
      : (item.avatar || item.host_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff`);

    return (
      <div
        key={rank}
        className={`mgmt-podium-card rank-${rank}`}
        onClick={() => onItemClick && onItemClick(item)}
        title="Bấm để xem sao kê và phân tích chi tiết"
      >
        {isRank1 && (
          <div className="mgmt-podium-crown">
            <TbCrown />
          </div>
        )}

        <div className={`mgmt-podium-rank-badge ${medalClass}`}>
          {isRank1 ? <TbCrown style={{ fontSize: '0.95rem' }} /> : <TbMedal style={{ fontSize: '0.95rem' }} />}
          <span>{rank === 1 ? 'Quán Quân (#1)' : rank === 2 ? 'Á Quân (#2)' : 'Quý Quân (#3)'}</span>
        </div>

        <div className="mgmt-podium-media-wrap">
          <img src={mediaSrc} alt={name} className="mgmt-podium-media-img" />
        </div>

        <h3 className="mgmt-podium-name" title={name}>
          {name}
        </h3>

        <div className="mgmt-podium-meta">{meta}</div>

        <div className="mgmt-podium-gmv">{formatVND(gmvVal)}</div>

        <div className="mgmt-podium-submetric">{subVal}</div>

        <button
          type="button"
          className="mgmt-podium-btn"
          onClick={(e) => {
            e.stopPropagation();
            onItemClick && onItemClick(item);
          }}
        >
          <TbFileDollar size={14} />
          <span>{actionLabel}</span>
          <TbArrowUpRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="mgmt-podium-section">
      <div className="mgmt-podium-header">
        <div className="mgmt-podium-title">
          <TbTrophy className="mgmt-podium-title-icon" />
          <span>{title}</span>
        </div>
        {subtitle && <span className="mgmt-podium-sub">{subtitle}</span>}
      </div>

      <div className="mgmt-podium-grid">
        {/* Rank 2 (Silver - Left) */}
        {renderCard(top2, 2, 'silver', 'silver')}

        {/* Rank 1 (Gold - Center) */}
        {renderCard(top1, 1, 'gold', 'gold')}

        {/* Rank 3 (Bronze - Right) */}
        {renderCard(top3, 3, 'bronze', 'bronze')}
      </div>
    </div>
  );
};

export default ManagementPodium;
