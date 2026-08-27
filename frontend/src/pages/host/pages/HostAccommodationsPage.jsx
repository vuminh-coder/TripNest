import React, { useState } from 'react';
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
  TbFilter,
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

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const filteredListings = listings.filter((item) => {
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
      <div className="host-panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="host-panel-title">
            <TbBuildingCastle style={{ color: 'var(--host-primary)' }} />
            Quản Lý Cơ Sở Lưu Trú ({filteredListings.length}/{listings.length})
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <TbSearch
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem 0.45rem 2rem',
                borderRadius: 'var(--host-radius-md)',
                border: '1px solid var(--host-border-strong)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '210px',
                background: '#ffffff',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                }}
              >
                <TbX />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--host-radius-md)',
              border: '1px solid var(--host-border-strong)',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#ffffff',
              color: 'var(--host-text-main)',
            }}
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
            <TbPlus /> Đăng Ký Chỗ Nghỉ
          </button>
        </div>
      </div>

      {/* SaaS Data Table */}
      <div className="host-table-wrap">
        {isLoading ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--host-text-muted)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--host-border-strong)',
                borderTopColor: 'var(--host-primary)',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Đang tải danh sách chỗ ở từ hệ thống...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                color: 'var(--host-text-muted)',
                margin: '0 auto 1rem',
              }}
            >
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
              <TbPlus /> Đăng Ký Chỗ Nghỉ Ngay
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.thumbnail}
                        alt={item.nameVi}
                        style={{
                          width: '64px',
                          height: '52px',
                          borderRadius: 'var(--host-radius-sm)',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: 'var(--host-text-main)',
                            maxWidth: '280px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.nameVi}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--host-text-muted)' }}>
                          {item.address || item.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        color: 'var(--host-text-muted)',
                        fontSize: '0.82rem',
                      }}
                    >
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
                    <span style={{ fontSize: '0.84rem' }}>
                      {item.maxGuests} khách · {item.bedrooms} phòng ngủ
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`host-chip ${item.status === 'published' ? 'success' : 'neutral'}`}
                      onClick={() => onToggleStatus(item.id)}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Bấm để bật/tắt mở bán"
                    >
                      {item.status === 'published' ? (
                        <>
                          <TbToggleRight style={{ fontSize: '1.15rem' }} /> Đang mở bán
                        </>
                      ) : (
                        <>
                          <TbToggleLeft style={{ fontSize: '1.15rem' }} /> Tạm dừng
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {onOpenRoomDetail && (
                        <button
                          type="button"
                          className="host-action-btn"
                          onClick={() => onOpenRoomDetail(item.roomId || item.id)}
                          title="Xem trang khách"
                        >
                          <TbEye />
                        </button>
                      )}
                      <button
                        type="button"
                        className="host-action-btn"
                        onClick={() => onEditListing(item)}
                        title="Chỉnh sửa thông tin"
                      >
                        <TbEdit />
                      </button>
                      <button
                        type="button"
                        className="host-action-btn delete"
                        onClick={() => onDeleteListing(item.id)}
                        title="Xóa chỗ ở"
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
