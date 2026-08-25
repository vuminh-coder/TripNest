import React from 'react';
import {
  TbSearch,
  TbArrowLeft,
  TbPlus,
  TbChevronRight,
  TbWorld,
} from 'react-icons/tb';

export const HostHeader = ({
  activeTab,
  onNavigate,
  onExitHost,
  onOpenWizard,
  searchTerm,
  setSearchTerm,
  currency = 'VND',
}) => {
  const getTabLabel = (tab) => {
    switch (tab) {
      case 'dashboard':
        return 'Bảng Điều Khiển';
      case 'accommodations':
        return 'Cơ Sở Lưu Trú';
      case 'new_listing':
        return 'Đăng Ký Chỗ Nghỉ';
      case 'bookings':
        return 'Đơn Đặt Phòng';
      case 'reviews':
        return 'Đánh Giá & Phản Hồi';
      case 'financials':
        return 'Ví & Payout Ngân Hàng';
      default:
        return 'Bảng Điều Khiển';
    }
  };

  return (
    <header className="host-header">
      {/* Left: Empty */}
      <div className="host-header-left" />

      {/* Right: Actions & Controls */}
      <div className="host-header-right">
        {/* Search Box */}
        <div className="host-search-box">
          <TbSearch style={{ color: '#94a3b8', fontSize: '1rem', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Action: Create Listing Page */}
        <button
          type="button"
          className="host-btn-primary"
          onClick={() => onNavigate('new_listing')}
        >
          <TbPlus /> Đăng Ký Chỗ Nghỉ
        </button>

        {/* Action: Return to Guest Client Mode */}
        <button
          type="button"
          className="host-btn-client"
          onClick={onExitHost}
          title="Chuyển về giao diện du khách"
        >
          <TbArrowLeft /> Về chế độ khách
        </button>
      </div>
    </header>
  );
};

export default HostHeader;
