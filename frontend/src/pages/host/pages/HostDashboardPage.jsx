import React, { useState, useEffect } from 'react';
import {
  TbCoin,
  TbCalendarEvent,
  TbStarFilled,
  TbBuildingCastle,
  TbArrowRight,
  TbLogin,
  TbLogout,
  TbCheck,
  TbPlus,
  TbSparkles,
  TbInbox,
} from 'react-icons/tb';
import { apiService } from '@/services/api';

export const HostDashboardPage = ({
  listings = [],
  bookings = [],
  bankInfo = { bankName: 'Vietcombank (VCB)', accountNumber: '9988776655', accountHolder: 'MINH VŨ' },
  onNavigate,
  onOpenWizard,
  onApproveBooking,
  onCheckInBooking,
  onCheckOutBooking,
  currency = 'VND',
}) => {
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiService.getHostDashboardStats();
        if (res && res.success) {
          setStatsData(res);
        }
      } catch (e) {
        // Fallback to computed props
      }
    };
    loadStats();
  }, []);

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round((val || 0) / 25000).toLocaleString()}`;
    return `${Number(val || 0).toLocaleString('vi-VN')} ₫`;
  };

  // Helper chuyển đổi định dạng ngày sang DD/MM/YYYY chuẩn tiếng Việt
  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const validBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'completed'
  );
  const totalHostEarnings = validBookings.reduce(
    (sum, b) => sum + (b.hostEarnings || b.totalAmount || 0),
    0
  );
  const activeStayCount = bookings.filter((b) => b.status === 'checked_in').length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Tinh Gọn: Tiêu đề & Nút Tạo chỗ ở mới */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.25rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.3px',
              margin: 0,
            }}
          >
            Tổng Quan Hoạt Động
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '3px 0 0 0' }}>
            Hiệu suất kinh doanh và quản lý lưu trú thời gian thực của bạn
          </p>
        </div>

        <button
          type="button"
          className="host-btn-primary"
          onClick={onOpenWizard}
          style={{ padding: '0.55rem 1.15rem', fontSize: '0.84rem', gap: '6px' }}
        >
          <TbPlus style={{ fontSize: '1.1rem' }} /> Đăng Ký Chỗ Ở Mới
        </button>
      </div>

      {/* 2. Lưới 3 Thẻ Chỉ Số Cốt Lõi (Minimalist KPI Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.1rem',
        }}
      >
        {/* Thẻ 1: Doanh thu thực nhận */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Doanh thu thực nhận</div>
            <div className="host-stat-value" style={{ color: '#059669', whiteSpace: 'nowrap' }}>
              {formatPrice(totalHostEarnings)}
            </div>
            <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '3px', display: 'block', whiteSpace: 'nowrap' }}>
              {validBookings.length > 0 ? `Từ ${validBookings.length} lượt đặt phòng thành công` : 'Chưa phát sinh doanh thu'}
            </span>
          </div>
          <div className="host-stat-icon-wrap earnings">
            <TbCoin />
          </div>
        </div>

        {/* Thẻ 2: Lượt khách & Tình trạng lưu trú */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Đơn đặt & Lưu trú</div>
            <div className="host-stat-value" style={{ whiteSpace: 'nowrap' }}>
              {bookings.length} đơn
            </div>
            <span
              style={{
                fontSize: '0.76rem',
                color: activeStayCount > 0 ? '#0284c7' : pendingCount > 0 ? '#d97706' : '#64748b',
                fontWeight: activeStayCount > 0 || pendingCount > 0 ? 700 : 500,
                marginTop: '3px',
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              {activeStayCount > 0
                ? `● ${activeStayCount} phòng đang lưu trú`
                : pendingCount > 0
                ? `● ${pendingCount} đơn chờ duyệt`
                : bookings.length > 0
                ? 'Tất cả đã xác nhận'
                : 'Sẵn sàng đón khách mới'}
            </span>
          </div>
          <div className="host-stat-icon-wrap bookings">
            <TbCalendarEvent />
          </div>
        </div>

        {/* Thẻ 3: Chỗ ở & Đánh giá uy tín */}
        <div className="host-stat-card" style={{ margin: 0 }}>
          <div>
            <div className="host-stat-label">Chỗ ở & Đánh giá</div>
            <div className="host-stat-value" style={{ whiteSpace: 'nowrap' }}>
              {listings.length} chỗ {listings.length > 0 && <span style={{ color: '#d97706', fontSize: '1.25rem' }}>· 4.96 ★</span>}
            </div>
            <span style={{ fontSize: '0.76rem', color: '#d97706', fontWeight: 700, marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <TbSparkles /> Danh hiệu Superhost 5 sao
            </span>
          </div>
          <div className="host-stat-icon-wrap rating">
            <TbBuildingCastle />
          </div>
        </div>
      </div>

      {/* 3. Bảng Quản Lý Đơn Đặt Phòng Cốt Lõi (Anti-Wrapping Protected) */}
      <div className="host-panel-card" style={{ margin: 0 }}>
        <div className="host-panel-header">
          <div>
            <h3 className="host-panel-title" style={{ fontSize: '0.95rem' }}>
              <TbCalendarEvent style={{ color: 'var(--host-indigo)' }} /> Đơn Đặt Phòng Cần Xử Lý
            </h3>
          </div>

          {bookings.length > 0 && (
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--host-primary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => onNavigate('bookings')}
            >
              Xem toàn bộ ({bookings.length}) <TbArrowRight />
            </button>
          )}
        </div>

        <div className="host-table-wrap">
          {bookings.length === 0 ? (
            /* Luxury Empty State Khi Chưa Có Đơn */
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#fff1f2',
                  color: '#ff385c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  margin: '0 auto 1rem',
                }}
              >
                <TbInbox />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                Chưa có đơn đặt phòng nào
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
                Chỗ nghỉ của bạn đã mở bán và sẵn sàng đón tiếp khách. Các đơn đặt phòng mới cần xử lý sẽ xuất hiện tại đây.
              </p>
              <button
                type="button"
                className="host-btn-primary"
                onClick={onOpenWizard}
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
              >
                <TbPlus /> Đăng Ký Thêm Chỗ Ở
              </button>
            </div>
          ) : (
            <table className="host-saas-table" style={{ width: '100%', minWidth: '940px' }}>
              <thead>
                <tr>
                  <th style={{ width: '130px', whiteSpace: 'nowrap' }}>MÃ ĐẶT</th>
                  <th style={{ minWidth: '150px', whiteSpace: 'nowrap' }}>KHÁCH HÀNG</th>
                  <th style={{ minWidth: '220px', whiteSpace: 'nowrap' }}>CHỖ NGHỈ</th>
                  <th style={{ minWidth: '200px', whiteSpace: 'nowrap' }}>THỜI GIAN LƯU TRÚ</th>
                  <th style={{ minWidth: '130px', whiteSpace: 'nowrap' }}>THỰC NHẬN</th>
                  <th style={{ minWidth: '110px', whiteSpace: 'nowrap' }}>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right', minWidth: '130px', whiteSpace: 'nowrap' }}>THAO TÁC NHANH</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    {/* Mã đặt phòng: Luôn liền mạch 1 dòng */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong
                        style={{
                          color: 'var(--host-primary)',
                          fontSize: '0.88rem',
                          fontFamily: 'monospace',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {b.code || b.id}
                      </strong>
                    </td>

                    {/* Khách hàng */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--host-text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {b.guestName || 'Khách hàng TripNest'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap' }}>
                        {b.guestPhone || '0912 345 678'}
                      </div>
                    </td>

                    {/* Chỗ nghỉ */}
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#334155',
                          maxWidth: '260px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.85rem',
                        }}
                        title={b.roomTitle}
                      >
                        {b.roomTitle || 'Không gian nghỉ dưỡng'}
                      </div>
                    </td>

                    {/* Thời gian lưu trú: Luôn liền mạch 1 dòng */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDateVN(b.checkIn)} ➔ {formatDateVN(b.checkOut)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--host-text-muted)', whiteSpace: 'nowrap', marginTop: '1px' }}>
                        {b.nights || 1} đêm · {b.guests || 2} khách
                      </div>
                    </td>

                    {/* Thực nhận: Luôn liền mạch 1 dòng */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong
                        style={{
                          color: '#059669',
                          fontSize: '0.92rem',
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        +{formatPrice(b.hostEarnings || b.totalAmount || 2500000)}
                      </strong>
                    </td>

                    {/* Trạng thái */}
                    <td style={{ whiteSpace: 'nowrap' }}>
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
                            : 'neutral'
                        }`}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 7px',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          ...(b.status === 'checked_in'
                            ? { background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', fontWeight: 800 }
                            : b.status === 'completed'
                            ? { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 800 }
                            : {}),
                        }}
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

                    {/* Thao tác nhanh */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', whiteSpace: 'nowrap' }}>
                        {b.status === 'pending' && (
                          <button
                            type="button"
                            className="host-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.74rem', whiteSpace: 'nowrap' }}
                            onClick={() => onApproveBooking && onApproveBooking(b.id || b.code)}
                          >
                            <TbCheck /> Duyệt đơn
                          </button>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            className="host-btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.74rem',
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => onCheckInBooking && onCheckInBooking(b.id || b.code)}
                            title="Xác nhận khách đã tới nhận phòng"
                          >
                            <TbLogin /> Check-in
                          </button>
                        )}

                        {b.status === 'checked_in' && (
                          <button
                            type="button"
                            className="host-btn-primary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '0.74rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => onCheckOutBooking && onCheckOutBooking(b.id || b.code)}
                            title="Xác nhận khách trả phòng & tạo Payout"
                          >
                            <TbLogout /> Check-out
                          </button>
                        )}

                        {b.status === 'completed' && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.74rem',
                              color: '#059669',
                              fontWeight: 800,
                              padding: '3px 7px',
                              background: '#ecfdf5',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            ✓ Payout Đã Tạo
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
    </div>
  );
};

export default HostDashboardPage;
