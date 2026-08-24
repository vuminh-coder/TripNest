import React, { useState } from 'react';
import {
  TbCalendarEvent,
  TbSearch,
  TbCheck,
  TbX,
  TbFilter,
} from 'react-icons/tb';

export const HostBookingsPage = ({
  bookings = [],
  onApproveBooking,
  onCancelBooking,
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
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="host-panel-card">
      <div className="host-panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="host-panel-title">
            <TbCalendarEvent style={{ color: 'var(--host-indigo)' }} />
            Quản Lý Đơn Đặt Phòng ({filteredBookings.length}/{bookings.length})
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 'var(--host-radius-md)' }}>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'confirmed', label: 'Đã xác nhận' },
              { id: 'cancelled', label: 'Đã hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  borderRadius: 'var(--host-radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === tab.id ? '#ffffff' : 'transparent',
                  color: statusFilter === tab.id ? 'var(--host-primary)' : 'var(--host-text-muted)',
                  boxShadow: statusFilter === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

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
              placeholder="Tìm theo tên, mã vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem 0.45rem 2rem',
                borderRadius: 'var(--host-radius-md)',
                border: '1px solid var(--host-border-strong)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '180px',
                background: '#ffffff',
              }}
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
              <th style={{ textAlign: 'right' }}>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong style={{ color: 'var(--host-primary)', fontSize: '0.85rem' }}>
                    {b.code}
                  </strong>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--host-text-main)' }}>
                    {b.guestName}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--host-text-muted)' }}>
                    {b.guestPhone}
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
                  >
                    {b.roomTitle}
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
                  <span style={{ fontSize: '0.85rem' }}>{b.guests} khách</span>
                </td>
                <td>
                  <strong style={{ color: '#059669', fontSize: '0.92rem' }}>
                    {formatPrice(b.hostEarnings)}
                  </strong>
                </td>
                <td>
                  <span
                    className={`host-chip ${
                      b.status === 'confirmed'
                        ? 'success'
                        : b.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }`}
                  >
                    {b.status === 'confirmed'
                      ? 'Đã xác nhận'
                      : b.status === 'pending'
                      ? 'Chờ duyệt'
                      : 'Đã hủy'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {b.status === 'pending' && (
                      <button
                        type="button"
                        className="host-btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.76rem', borderRadius: 'var(--host-radius-sm)' }}
                        onClick={() => onApproveBooking(b.id)}
                      >
                        <TbCheck /> Duyệt
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        className="host-action-btn delete"
                        onClick={() => onCancelBooking(b.id)}
                        title="Hủy đơn đặt"
                      >
                        <TbX />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HostBookingsPage;
