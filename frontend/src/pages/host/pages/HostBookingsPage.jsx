import React, { useState } from 'react';
import './HostBookingsPage.css';
import {
  TbCalendarEvent,
  TbSearch,
  TbX,
  TbLogin,
  TbLogout,
  TbSparkles,
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
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch =
      !searchTerm.trim() ||
      (b.guestName && b.guestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.roomTitle && b.roomTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="host-panel-card">
      <div className="host-panel-header host-bk-header">
        <div>
          <h3 className="host-panel-title">
            <TbCalendarEvent style={{ color: 'var(--host-indigo)' }} />
            Quản Lý Đơn Đặt Phòng ({filteredBookings.length}/{bookings.length})
          </h3>
        </div>

        <div className="host-bk-controls">
          {/* Status Filter Tabs */}
          <div className="host-bk-tabs-wrap">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'confirmed', label: 'Đã xác nhận' },
              { id: 'checked_in', label: 'Đang lưu trú' },
              { id: 'completed', label: 'Đã hoàn tất' },
              { id: 'cancelled', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`host-bk-tab-btn ${statusFilter === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="host-bk-search-wrap">
            <TbSearch className="host-bk-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="host-bk-search-input"
            />
          </div>
        </div>
      </div>

      <div className="host-table-wrap">
        <table className="host-saas-table">
          <thead>
            <tr>
              <th>Mã Đặt</th>
              <th>Khách Hàng</th>
              <th>Chỗ Nghỉ</th>
              <th>Thời Gian Lưu Trú</th>
              <th>Số Khách</th>
              <th>Thực Nhận (Host)</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Quy Trình Check-in / Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  Không tìm thấy đơn đặt phòng nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ color: 'var(--host-primary)', fontSize: '0.85rem' }}>
                      {b.code || b.id}
                    </strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--host-text-main)' }}>
                      {b.guestName || 'Khách hàng TripNest'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>
                      {b.guestPhone || '0912345678'}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#334155',
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={b.roomTitle}
                    >
                      {b.roomTitle || 'Không gian nghỉ dưỡng'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {b.checkIn} ➔ {b.checkOut}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted)' }}>
                      {b.nights} đêm
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{b.guests || 2} khách</span>
                  </td>
                  <td>
                    <strong style={{ color: '#059669', fontSize: '0.92rem' }}>
                      {formatPrice(
                        b.hostEarnings ??
                        b.hostPayoutAmount ??
                        (b.grossAmount && b.commissionFee ? b.grossAmount - b.commissionFee : null) ??
                        (b.basePrice && b.cleaningFee ? b.basePrice + b.cleaningFee - (b.serviceFee || Math.round(b.basePrice * 0.12)) : null) ??
                        (b.totalPrice ? Math.round(b.totalPrice * 0.88) : null) ??
                        (b.totalAmount ? Math.round(b.totalAmount * 0.88) : 0)
                      )}
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap' }}>
                      {b.commissionFee || b.serviceFee
                        ? `Đã trừ 12% (-${formatPrice(b.commissionFee || b.serviceFee)})`
                        : 'Đã trừ 12% phí sàn'}
                    </div>
                    {b.hasVoucher && (
                      <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                        🎟️ {b.voucherCode || 'Voucher VIP'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`host-chip ${
                        b.status === 'confirmed'
                          ? 'success'
                          : b.status === 'checked_in'
                          ? 'info'
                          : b.status === 'completed'
                          ? 'completed'
                          : b.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }`}
                      style={
                        b.status === 'checked_in'
                          ? { background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 800 }
                          : b.status === 'completed'
                          ? { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 800 }
                          : {}
                      }
                    >
                      {b.status === 'confirmed'
                        ? 'Đã xác nhận'
                        : b.status === 'checked_in'
                        ? 'Đang lưu trú'
                        : b.status === 'completed'
                        ? 'Đã hoàn tất'
                        : b.status === 'pending'
                        ? 'Chờ duyệt'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td>
                    <div className="host-bk-actions-group">
                      {/* Check-in Trigger */}
                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          className="host-btn-primary host-bk-checkin-btn"
                          onClick={() => onCheckInBooking && onCheckInBooking(b.id || b.code)}
                          title="Xác nhận khách đã tới nhận phòng"
                        >
                          <TbLogin /> Check-in
                        </button>
                      )}

                      {/* Check-out Trigger */}
                      {b.status === 'checked_in' && (
                        <button
                          type="button"
                          className="host-btn-primary host-bk-checkout-btn"
                          onClick={() => onCheckOutBooking && onCheckOutBooking(b.id || b.code)}
                          title="Xác nhận khách đã trả phòng & tạo lệnh Payout"
                        >
                          <TbLogout /> Check-out
                        </button>
                      )}

                      {/* Completed State Badge */}
                      {b.status === 'completed' && (
                        <span className="host-bk-completed-badge">
                          <TbSparkles /> Payout Tạo Xong
                        </span>
                      )}

                      {/* Cancel Booking Action */}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          type="button"
                          className="host-action-btn delete"
                          onClick={() => onCancelBooking(b.id || b.code)}
                          title="Hủy đơn đặt"
                        >
                          <TbX />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostBookingsPage;
