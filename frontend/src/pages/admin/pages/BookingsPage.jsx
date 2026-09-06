import React, { useState } from 'react';
import './BookingsPage.css';
import { TbSearch, TbEye, TbBan, TbCheck, TbCalendar } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';
import AdminConfirmDialog from '../common/AdminConfirmDialog';

export const BookingsPage = ({ bookings, onOpenDetailModal, onUpdateStatus }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Confirm cancel booking state
  const [cancelTarget, setCancelTarget] = useState(null);

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split(' ')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getStatusLabel = (st) => {
    switch (st) {
      case 'confirmed': return 'ĐÃ XÁC NHẬN';
      case 'checked_in': return 'ĐANG LƯU TRÚ';
      case 'completed': return 'HOÀN TẤT';
      case 'pending': return 'CHỜ DUYỆT';
      case 'cancelled': return 'ĐÃ HỦY';
      default: return (st || '').toUpperCase();
    }
  };

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchGuest = b.guest_name.toLowerCase().includes(q);
      const matchPhone = b.guest_phone && b.guest_phone.includes(q);
      const matchRoom = b.room_name.toLowerCase().includes(q);
      if (!matchId && !matchGuest && !matchPhone && !matchRoom) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="adm-bookings-container">
      {/* Header */}
      <AdminPageHeader
        title="Quản Lý Đơn Đặt Phòng (Bookings)"
        subtitle={`Sổ cái giao dịch ${bookings.length} đơn trên toàn hệ thống`}
      />

      {/* Filter Bar */}
      <div className="admin-card-box adm-book-filter-box">
        <div className="adm-book-filter-bar">
          <div className="adm-book-search-wrap">
            <TbSearch className="adm-book-search-icon" />
            <input
              type="text"
              placeholder="Tìm mã TN-XXXXXX, tên khách, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-book-search-input"
            />
          </div>

          <select
            className="admin-select-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="đơn"
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Chỗ Ở & Chủ Nhà</th>
              <th>Lịch Trình</th>
              <th>Tổng Tiền</th>
              <th>Thanh Toán</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="8" className="adm-book-empty-state">
                  Không tìm thấy đơn đặt phòng nào.
                </td>
              </tr>
            ) : (
              paginated.map((b) => (
                <tr key={b.id}>
                  {/* ID */}
                  <td className="td-nowrap">
                    <strong className="adm-book-id">#{b.id}</strong>
                  </td>

                  {/* Guest */}
                  <td className="td-nowrap">
                    <div className="adm-book-guest-name">{b.guest_name}</div>
                    <div className="adm-book-guest-contact">{b.guest_phone || b.guest_email}</div>
                  </td>

                  {/* Room & Host */}
                  <td>
                    <div
                      className="adm-book-room-title"
                      title={b.room_name}
                    >
                      {b.room_name}
                    </div>
                    <div className="adm-book-host-sub">
                      Host: {b.host_name}
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="td-nowrap">
                    <div className="adm-book-dates-cell">
                      <TbCalendar className="adm-book-calendar-icon" />
                      <span>{formatDateVN(b.check_in)} ➔ {formatDateVN(b.check_out)}</span>
                    </div>
                    <div className="adm-book-nights-sub">
                      {b.nights} đêm • {b.guests_count || b.guests || 2} khách
                    </div>
                  </td>

                  {/* Price */}
                  <td className="td-nowrap">
                    <strong className="adm-book-total-price">
                      {formatVND(b.total_price)}
                    </strong>
                  </td>

                  {/* Payment */}
                  <td className="td-nowrap">
                    <span className={`status-pill ${b.payment_status} adm-book-payment-pill`}>
                      {b.payment_method}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="td-nowrap">
                    <span className={`status-pill ${b.status}`} style={{ fontWeight: 700 }}>
                      {getStatusLabel(b.status)}
                    </span>
                    {b.status === 'cancelled' && (
                      <div style={{ marginTop: '4px', fontSize: '0.72rem' }}>
                        {(Number(b.refund_amount) > 0 || Number(b.refund_percentage) > 0) ? (
                          <div style={{ color: '#d97706', fontWeight: 700 }}>
                            Hoàn {b.refund_percentage || 100}% ({formatVND(b.refund_amount)})
                          </div>
                        ) : (
                          <div style={{ color: '#059669', fontWeight: 700 }}>
                            Không hoàn tiền (0%)
                          </div>
                        )}
                        {b.cancellation_reason && (
                          <div
                            style={{
                              color: '#64748b',
                              fontSize: '0.68rem',
                              fontStyle: 'italic',
                              maxWidth: '140px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: '2px',
                            }}
                            title={b.cancellation_reason}
                          >
                            Lý do: {b.cancellation_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="td-actions-group">
                      <button
                        className="btn-action-icon"
                        title="Xem chi tiết hóa đơn"
                        onClick={() => onOpenDetailModal(b)}
                      >
                        <TbEye />
                      </button>

                      {b.status === 'pending' && (
                        <button
                          className="btn-action-icon success"
                          title="Duyệt xác nhận đơn"
                          onClick={() => onUpdateStatus(b.id, 'confirmed')}
                        >
                          <TbCheck />
                        </button>
                      )}

                      {b.status !== 'cancelled' && (
                        <button
                          className="btn-action-icon danger"
                          title="Hủy đơn đặt phòng"
                          onClick={() => setCancelTarget(b)}
                        >
                          <TbBan />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableWrapper>

      {/* Confirm Cancel Dialog */}
      <AdminConfirmDialog
        isOpen={!!cancelTarget}
        title="Hủy Đơn Đặt Phòng"
        message={`Bạn có chắc chắn muốn hủy đơn #${cancelTarget?.id} của khách ${cancelTarget?.guest_name}? Tiền sẽ được chuyển sang trạng thái hoàn trả.`}
        confirmText="Xác Nhận Hủy"
        cancelText="Đóng"
        type="danger"
        onConfirm={() => {
          if (cancelTarget) {
            onUpdateStatus(cancelTarget.id, 'cancelled', 'Hủy bởi Quản trị viên');
            setCancelTarget(null);
          }
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default BookingsPage;
