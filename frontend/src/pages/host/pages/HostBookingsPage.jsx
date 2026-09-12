import React, { useState, useMemo } from 'react';
import './HostBookingsPage.css';
import {
  TbCalendarEvent,
  TbSearch,
  TbX,
  TbCheck,
  TbLogin,
  TbLogout,
  TbSparkles,
  TbInbox,
  TbFilter,
} from 'react-icons/tb';

export const HostBookingsPage = ({
  bookings = [],
  onApproveBooking,
  onCancelBooking,
  onCheckInBooking,
  onCheckOutBooking,
  currency = 'VND',
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val || 0).toLocaleString('vi-VN')} ₫`;
  };

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Status counts for tabs
  const counts = useMemo(() => {
    const c = { all: bookings.length, pending: 0, confirmed: 0, checked_in: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (b.status && c[b.status] !== undefined) {
        c[b.status] += 1;
      }
    });
    return c;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        (b.guestName && b.guestName.toLowerCase().includes(term)) ||
        (b.code && b.code.toLowerCase().includes(term)) ||
        (b.bookingCode && b.bookingCode.toLowerCase().includes(term)) ||
        (String(b.id).toLowerCase().includes(term)) ||
        (b.roomTitle && b.roomTitle.toLowerCase().includes(term)) ||
        (b.listingName && b.listingName.toLowerCase().includes(term)) ||
        (b.guestPhone && b.guestPhone.includes(term));
      return matchStatus && matchSearch;
    });
  }, [bookings, statusFilter, searchTerm]);

  return (
    <div className="host-panel-card host-bk-page-card">
      {/* 1. Header Toolbar: Dòng 1 Tiêu Đề & Thống Kê Tổng Quan */}
      <div className="host-bk-header-top">
        <div className="host-bk-title-group">
          <div className="host-bk-icon-badge">
            <TbCalendarEvent />
          </div>
          <div>
            <h3 className="host-panel-title">
              Quản Lý Đơn Đặt Phòng
            </h3>
            <p className="host-bk-subtitle">
              Theo dõi tiến độ nhận phòng, lưu trú và hoàn tất thanh toán của khách
            </p>
          </div>
        </div>

        {/* Snapshot Stats bên phải */}
        <div className="host-bk-header-meta">
          <div className="host-bk-meta-pill">
            <span className="meta-lbl">Tổng đơn:</span>
            <strong className="meta-val">{bookings.length}</strong>
          </div>
          {(counts.pending + counts.confirmed) > 0 && (
            <div className="host-bk-meta-pill urgent">
              <span className="meta-lbl">Cần đón khách:</span>
              <strong className="meta-val">{counts.pending + counts.confirmed}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. Sub-toolbar: Dòng 2 Bộ Lọc Trạng Thái & Ô Tìm Kiếm (Dàn đều 2 đầu) */}
      <div className="host-bk-filter-bar">
        {/* Status Filter Tabs bên trái */}
        <div className="host-bk-tabs-wrap">
          {[
            { id: 'all', label: 'Tất cả', count: counts.all },
            { id: 'pending', label: 'Chờ duyệt', count: counts.pending },
            { id: 'confirmed', label: 'Đã duyệt', count: counts.confirmed },
            { id: 'checked_in', label: 'Đang ở', count: counts.checked_in },
            { id: 'completed', label: 'Hoàn tất', count: counts.completed },
            { id: 'cancelled', label: 'Đã hủy', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`host-bk-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              <span className="host-bk-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search Box căn sát mép phải */}
        <div className="host-bk-search-wrap">
          <TbSearch className="host-bk-search-icon" />
          <input
            type="text"
            placeholder="Tìm tên khách, mã vé, phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="host-bk-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="host-bk-search-clear"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
            >
              <TbX />
            </button>
          )}
        </div>
      </div>

      {/* 2. Table Bảng Đơn Đặt Phòng (Chuẩn SaaS / Parity với Dashboard) */}
      <div className="host-table-wrap">
        {filteredBookings.length === 0 ? (
          /* Empty State Khi Không Có Đơn */
          <div className="host-dash-empty-state">
            <div className="host-dash-empty-icon-wrap">
              <TbInbox />
            </div>
            <h4 className="host-dash-empty-title">
              Không tìm thấy đơn đặt phòng nào phù hợp
            </h4>
            <p className="host-dash-empty-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để xem các đơn khác.'
                : 'Chưa có đơn đặt phòng nào trong hệ thống.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                type="button"
                className="host-bk-reset-filter-btn"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                <TbFilter /> Đặt Lại Bộ Lọc
              </button>
            )}
          </div>
        ) : (
          <table className="host-saas-table" style={{ width: '100%', minWidth: '960px' }}>
            <thead>
              <tr>
                <th style={{ width: '130px', whiteSpace: 'nowrap' }}>MÃ ĐẶT</th>
                <th style={{ minWidth: '160px', whiteSpace: 'nowrap' }}>KHÁCH HÀNG</th>
                <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>CHỖ NGHỈ</th>
                <th style={{ minWidth: '190px', whiteSpace: 'nowrap' }}>THỜI GIAN LƯU TRÚ</th>
                <th style={{ minWidth: '140px', whiteSpace: 'nowrap' }}>THỰC NHẬN</th>
                <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                <th style={{ textAlign: 'right', minWidth: '140px', whiteSpace: 'nowrap' }}>THAO TÁC NHANH</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id || b.code}>
                  {/* Mã đặt phòng */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong className="host-dash-code-tag">
                      {b.code || b.bookingCode || ('TN-' + b.id)}
                    </strong>
                  </td>

                  {/* Khách hàng */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--host-text-main, #0f172a)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {b.guestName || 'Khách hàng TripNest'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted, #64748b)', whiteSpace: 'nowrap' }}>
                      {b.guestPhone || b.guestEmail || '0912 345 678'}
                    </div>
                  </td>

                  {/* Chỗ nghỉ */}
                  <td>
                    <div
                      className="host-dash-room-title"
                      title={b.roomTitle || b.listingName || b.roomName || 'Căn hộ nghỉ dưỡng cao cấp'}
                    >
                      {b.roomTitle || b.listingName || b.roomName || 'Căn hộ nghỉ dưỡng cao cấp'}
                    </div>
                    <div className="host-dash-room-city">
                      {b.city || 'Đà Lạt'}
                    </div>
                  </td>

                  {/* Lịch trình lưu trú */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: 'var(--host-text-main, #0f172a)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {formatDateVN(b.checkIn || b.check_in)} ➔ {formatDateVN(b.checkOut || b.check_out)}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted, #64748b)', whiteSpace: 'nowrap' }}>
                      {b.guests || 2} khách · {b.nights || 1} đêm
                    </div>
                  </td>

                  {/* Thực nhận (Host) */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {b.status === 'cancelled' ? (
                      (b.refundPercentage ?? b.refund_percentage ?? 100) >= 100 ? (
                        <div>
                          <strong style={{ color: '#94a3b8', fontSize: '0.88rem', textDecoration: 'line-through' }}>
                            0 ₫
                          </strong>
                          <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>
                            Đã hủy (Hoàn khách 100%)
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="host-dash-net-payout">
                            {formatPrice(
                              Math.round(
                                (b.hostEarnings ?? b.hostPayoutAmount ?? ((b.totalPrice || b.totalAmount || 0) * 0.88)) *
                                  (1 - ((b.refundPercentage ?? b.refund_percentage ?? 0) / 100))
                              )
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>
                            Giữ lại {100 - (b.refundPercentage ?? b.refund_percentage ?? 0)}% sau hoàn
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <div className="host-dash-net-payout">
                          {formatPrice(
                            b.hostEarnings ??
                            b.hostPayoutAmount ??
                            (b.grossAmount && b.commissionFee ? b.grossAmount - b.commissionFee : null) ??
                            (b.basePrice && b.cleaningFee ? b.basePrice + b.cleaningFee - (b.serviceFee || Math.round(b.basePrice * 0.12)) : null) ??
                            (b.totalAmount ? Math.round(b.totalAmount * 0.88) : null) ??
                            (b.totalPrice ? Math.round(b.totalPrice * 0.88) : 0)
                          )}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--host-text-muted, #64748b)', whiteSpace: 'nowrap' }}>
                          (Đã trừ phí dịch vụ)
                        </div>
                        {b.hasVoucher && (
                          <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                            🎟️ Voucher {b.voucherCode ? `(${b.voucherCode})` : 'sàn'}
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  {/* Trạng thái đơn */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`status-pill ${b.status}`}>
                      {b.status === 'confirmed'
                        ? 'ĐÃ DUYỆT'
                        : b.status === 'checked_in'
                        ? 'ĐANG Ở'
                        : b.status === 'completed'
                        ? 'HOÀN TẤT'
                        : b.status === 'cancelled'
                        ? 'ĐÃ HỦY'
                        : 'CHỜ DUYỆT'}
                    </span>
                    {b.status === 'cancelled' && (b.cancellationReason || b.cancellation_reason) && (
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.68rem',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          maxWidth: '160px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '2px',
                        }}
                        title={b.cancellationReason || b.cancellation_reason}
                      >
                        Lý do: {b.cancellationReason || b.cancellation_reason}
                      </div>
                    )}
                  </td>

                  {/* Thao tác quy trình */}
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div className="host-bk-actions-group">
                      {b.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="host-btn-action success"
                            title="Phê duyệt nhận khách ngay"
                            onClick={() => onApproveBooking && onApproveBooking(b.id || b.code)}
                          >
                            <TbCheck /> <span>Duyệt</span>
                          </button>
                          <button
                            type="button"
                            className="host-btn-action danger"
                            title="Từ chối đơn đặt phòng"
                            onClick={() => onCancelBooking && onCancelBooking(b.id || b.code)}
                          >
                            <TbX /> <span>Từ chối</span>
                          </button>
                        </>
                      )}

                      {b.status === 'confirmed' && (
                        <>
                          <button
                            type="button"
                            className="host-btn-action info"
                            title="Xác nhận khách đã tới nhận phòng"
                            onClick={() => onCheckInBooking && onCheckInBooking(b.id || b.code)}
                          >
                            <TbLogin /> <span>Check-in</span>
                          </button>
                          <button
                            type="button"
                            className="host-btn-action danger"
                            title="Hủy đơn đặt phòng"
                            onClick={() => onCancelBooking && onCancelBooking(b.id || b.code)}
                          >
                            <TbX /> <span>Hủy</span>
                          </button>
                        </>
                      )}

                      {b.status === 'checked_in' && (
                        <button
                          type="button"
                          className="host-btn-action success"
                          title="Hoàn tất trả phòng & thanh toán"
                          onClick={() => onCheckOutBooking && onCheckOutBooking(b.id || b.code)}
                        >
                          <TbLogout /> <span>Check-out</span>
                        </button>
                      )}

                      {b.status === 'completed' && (
                        <span className="host-bk-completed-badge">
                          <TbSparkles /> <span>Payout Xong</span>
                        </span>
                      )}

                      {b.status === 'cancelled' && (
                        <span className="host-bk-archived-tag">
                          Đã lưu trữ
                        </span>
                      )}
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

export default HostBookingsPage;
