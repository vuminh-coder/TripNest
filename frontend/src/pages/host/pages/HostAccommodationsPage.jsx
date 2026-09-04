import React, { useState } from 'react';
import './HostAccommodationsPage.css';
import {
  TbSearch,
  TbPlus,
  TbBuildingCastle,
  TbToggleLeft,
  TbToggleRight,
  TbEye,
  TbEdit,
  TbTrash,
  TbX,
} from 'react-icons/tb';

export const HostAccommodationsPage = ({
  listings = [],
  isLoading = false,
  onRefresh,
  onOpenWizard,
  onEditListing,
  onToggleStatus,
  onDeleteListing,
  onOpenRoomDetail,
  currency = 'VND',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const arrayListings = Array.isArray(listings) ? listings : [];

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const filteredListings = arrayListings.filter((item) => {
    const matchSearch =
      !searchTerm.trim() ||
      item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = typeFilter === 'all' || item.accommodationType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="host-panel-card">
      {/* Table SaaS Toolbar */}
      <div className="host-panel-header host-acc-header">
        <div>
          <h3 className="host-panel-title">
            <TbBuildingCastle style={{ color: 'var(--host-primary)' }} />
            Quản Lý Cơ Sở Lưu Trú ({filteredListings.length}/{arrayListings.length})
          </h3>
        </div>

        <div className="host-acc-controls">
          {/* Search Box */}
          <div className="host-acc-search-wrap">
            <TbSearch className="host-acc-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="host-acc-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="host-acc-search-clear"
              >
                <TbX />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="host-acc-select-type"
          >
            <option value="all">Tất cả loại hình</option>
            <option value="villa">Biệt thự (Villa)</option>
            <option value="resort">Khu nghỉ dưỡng</option>
            <option value="homestay">Homestay</option>
            <option value="apartment">Căn hộ</option>
          </select>

          {/* Create Listing CTA */}
          <button
            type="button"
            className="host-btn-primary"
            onClick={onOpenWizard}
          >
            <TbPlus /> Thêm Mới Cơ Sở Lưu Trú
          </button>
        </div>
      </div>

      {/* SaaS Data Table */}
      <div className="host-table-wrap">
        {isLoading ? (
          <div className="host-acc-loading-box">
            <div className="host-acc-loading-spinner" />
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Đang tải danh sách chỗ ở từ hệ thống...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="host-acc-empty-box">
            <div className="host-acc-empty-icon">
              <TbBuildingCastle />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--host-text-main)', margin: '0 0 6px 0' }}>
              Không tìm thấy cơ sở lưu trú nào
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--host-text-muted)', margin: '0 0 1.25rem 0' }}>
              {searchTerm || typeFilter !== 'all'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc loại hình.'
                : 'Bạn chưa đăng ký chỗ ở nào. Hãy bắt đầu ngay hôm nay!'}
            </p>
            <button
              type="button"
              className="host-btn-primary"
              onClick={onOpenWizard}
            >
              <TbPlus /> Thêm Mới Cơ Sở Lưu Trú
            </button>
          </div>
        ) : (
          <table className="host-saas-table">
            <thead>
              <tr>
                <th>Chỗ Ở & Vị Trí</th>
                <th>Loại Hình</th>
                <th>Giá Niêm Yết</th>
                <th>Sức Chứa</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="host-acc-cell-flex">
                      <img
                        src={item.thumbnail}
                        alt={item.nameVi}
                        className="host-acc-thumb"
                      />
                      <div>
                        <div
                          className="host-acc-name"
                          title={item.nameVi}
                        >
                          {item.nameVi}
                        </div>
                        <div className="host-acc-address">
                          {item.address || item.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="host-acc-type-badge">
                      {item.accommodationType}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--host-text-main)' }}>
                      {formatPrice(item.priceVND)}
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>
                      {' '}/ đêm
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: 'var(--host-text-main)' }}>
                      {item.guests} khách · {item.bedrooms} PN · {item.bathrooms} WC
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${item.status}`}>
                      {item.status === 'published'
                        ? 'ĐANG MỞ BÁN'
                        : item.status === 'paused'
                        ? 'TẠM ẨN'
                        : item.status === 'suspended'
                        ? 'ĐÌNH CHỈ'
                        : 'BẢO TRÌ'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="host-acc-actions">
                      <button
                        type="button"
                        className="host-btn-action default"
                        title="Xem chi tiết chỗ ở"
                        onClick={() => onOpenRoomDetail && onOpenRoomDetail(item)}
                      >
                        <TbEye />
                      </button>
                      <button
                        type="button"
                        className="host-btn-action default"
                        title="Chỉnh sửa thông tin chỗ ở"
                        onClick={() => onEditListing(item)}
                      >
                        <TbEdit />
                      </button>
                      <button
                        type="button"
                        className={`host-btn-action ${item.status === 'published' ? 'warning' : 'success'}`}
                        title={item.status === 'published' ? 'Tạm ẩn mở bán' : 'Kích hoạt mở bán'}
                        onClick={() => onToggleStatus(item.id)}
                      >
                        {item.status === 'published' ? <TbToggleRight /> : <TbToggleLeft />}
                      </button>
                      <button
                        type="button"
                        className="host-btn-action danger"
                        title="Xóa chỗ ở"
                        onClick={() => onDeleteListing(item.id)}
                      >
                        <TbTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HostAccommodationsPage;
