import React, { useState } from 'react';
import {
  TbPlus,
  TbEdit,
  TbTrash,
  TbStar,
  TbFlame,
  TbSearch,
  TbMapPin,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';
import AdminConfirmDialog from '../common/AdminConfirmDialog';

export const AccommodationsPage = ({
  accommodations,
  onUpdateStatus,
  onToggleFlag,
  onOpenEditModal,
  onDelete,
}) => {
  console.log("Data nhận đc: ",accommodations);
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Confirm delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  const filtered = accommodations.filter((acc) => {
    if (cityFilter !== 'all' && acc.city !== cityFilter) return false;
    if (statusFilter !== 'all' && acc.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = acc.name_vi.toLowerCase().includes(q) || (acc.name_en && acc.name_en.toLowerCase().includes(q));
      const matchCity = acc.city.toLowerCase().includes(q);
      const matchHost = acc.host_name.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchHost) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Cơ Sở Lưu Trú & Hạng Phòng"
        subtitle={`Quản lý ${accommodations.length} cơ sở trên toàn hệ thống`}
        actionButton={
          <button className="btn-admin-primary" onClick={() => onOpenEditModal(null)}>
            <TbPlus style={{ fontSize: '1.1rem' }} />
            <span>Thêm Chỗ Ở</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #edf2f7',
              borderRadius: '8px',
              padding: '0.42rem 0.85rem',
              flex: 1,
              minWidth: '220px',
            }}
          >
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên chỗ ở, địa điểm, chủ nhà..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>

          <select
            className="admin-select-filter"
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả Địa điểm</option>
            <option value="Đà Lạt">Đà Lạt</option>
            <option value="Phú Quốc">Phú Quốc</option>
            <option value="Hạ Long">Hạ Long</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Sapa">Sapa</option>
          </select>

          <select
            className="admin-select-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="published">Đang hiển thị</option>
            <option value="paused">Tạm ẩn</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>
      </div>

      {/* Table with Anti-Wrap Rules */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="chỗ ở"
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Chỗ Ở & Hạng Phòng</th>
              <th>Chủ Nhà</th>
              <th>Địa Điểm</th>
              <th>Giá / Đêm</th>
              <th>Đánh Giá</th>
              <th>Trạng Thái</th>
              <th>Huy Hiệu</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                  Không tìm thấy chỗ ở nào phù hợp.
                </td>
              </tr>
            ) : (
              paginated.map((acc) => (
                <tr key={acc.id}>
                  {/* Name & Image */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={acc.image}
                        alt={acc.name_vi}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            color: '#0f172a',
                            maxWidth: '240px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={acc.name_vi}
                        >
                          {acc.name_vi}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px', whiteSpace: 'nowrap' }}>
                          {acc.type?.toUpperCase()} • {acc.category_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Host */}
                  <td className="td-nowrap">
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>{acc.host_name}</div>
                  </td>

                  {/* City */}
                  <td className="td-nowrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, fontSize: '0.84rem' }}>
                      <TbMapPin style={{ color: '#ff385c' }} />
                      <span>{acc.city}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="td-nowrap">
                    <strong style={{ color: '#0f172a' }}>{formatVND(acc.priceVND)}</strong>
                  </td>

                  {/* Rating */}
                  <td className="td-nowrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '0.84rem' }}>
                      <TbStar style={{ color: '#f59e0b' }} />
                      <span>{acc.rating}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({acc.reviewsCount})</span>
                    </div>
                  </td>

                  {/* Status select */}
                  <td className="td-nowrap">
                    <select
                      value={acc.status}
                      onChange={(e) => onUpdateStatus(acc.id, e.target.value)}
                      style={{
                        padding: '3px 6px',
                        borderRadius: '6px',
                        border: '1px solid #edf2f7',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: acc.status === 'published' ? '#ecfdf5' : acc.status === 'paused' ? '#f1f5f9' : '#fee2e2',
                        color: acc.status === 'published' ? '#059669' : acc.status === 'paused' ? '#475569' : '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="published">Hiển thị</option>
                      <option value="paused">Tạm ẩn</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </td>

                  {/* Flags (Star / Fire) */}
                  <td className="td-nowrap">
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn-action-icon"
                        style={{ width: '28px', height: '28px', color: acc.is_featured ? '#f59e0b' : '#cbd5e1', background: acc.is_featured ? '#fffbeb' : 'white' }}
                        title="Nổi bật ⭐"
                        onClick={() => onToggleFlag(acc.id, 'is_featured')}
                      >
                        <TbStar />
                      </button>
                      <button
                        className="btn-action-icon"
                        style={{ width: '28px', height: '28px', color: acc.is_guest_favorite ? '#ff385c' : '#cbd5e1', background: acc.is_guest_favorite ? '#fff1f2' : 'white' }}
                        title="Yêu thích 🔥"
                        onClick={() => onToggleFlag(acc.id, 'is_guest_favorite')}
                      >
                        <TbFlame />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="td-actions-group">
                      <button
                        className="btn-action-icon"
                        title="Chỉnh sửa chỗ ở"
                        onClick={() => onOpenEditModal(acc)}
                      >
                        <TbEdit />
                      </button>
                      <button
                        className="btn-action-icon danger"
                        title="Xóa chỗ ở"
                        onClick={() => setDeleteTarget(acc)}
                      >
                        <TbTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableWrapper>

      {/* Confirm Delete Dialog */}
      <AdminConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa Cơ Sở Lưu Trú"
        message={`Bạn có chắc chắn muốn xóa "${deleteTarget?.name_vi}"? Hành động này sẽ xóa toàn bộ phòng và dữ liệu liên quan.`}
        confirmText="Xác Nhận Xóa"
        cancelText="Hủy Bỏ"
        type="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AccommodationsPage;
