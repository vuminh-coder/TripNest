import React, { useState } from 'react';
import {
  TbX,
  TbCoins,
  TbWallet,
  TbCalendarEvent,
  TbStar,
  TbBuildingCastle,
  TbMapPin,
  TbEdit,
  TbEye,
  TbDownload,
  TbPrinter,
  TbCheck,
  TbClock,
  TbCircleCheck,
  TbArrowUpRight,
  TbSparkles,
  TbTrophy,
  TbCrown,
  TbMedal,
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import './AccommodationPerformanceModal.css';

export const AccommodationPerformanceModal = ({
  accommodation,
  onClose,
  onEdit,
  onViewDetail,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'metrics'

  if (!accommodation) return null;

  const formatCurrency = (val) => {
    if (currency === 'USD') return `$${Math.round((val || 0) / 25000).toLocaleString()}`;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const name = accommodation.nameVi || accommodation.name || 'Cơ sở lưu trú';
  const city = accommodation.city || 'Đà Lạt';
  const address = accommodation.address || `${city}, Việt Nam`;
  const type = accommodation.accommodationType || accommodation.category || 'Nghỉ dưỡng';
  const thumb =
    accommodation.thumbnail ||
    accommodation.images?.[0] ||
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600';

  const gmv = Number(accommodation.total_gmv || accommodation.gmv || accommodation.revenue || 0);
  const comm = Number(accommodation.commission !== undefined ? accommodation.commission : Math.round(gmv * 0.12));
  const net = Number(accommodation.net_earnings !== undefined ? accommodation.net_earnings : (accommodation.net || Math.max(0, gmv - comm)));
  const escrow = Number(accommodation.escrow !== undefined ? accommodation.escrow : 0);
  const availablePayout = Number(accommodation.available_payout !== undefined ? accommodation.available_payout : Math.max(0, net - escrow));
  const adr = Number(accommodation.adr !== undefined && accommodation.adr > 0 ? accommodation.adr : (accommodation.priceVND || 0));
  const revpar = Number(accommodation.revpar !== undefined ? accommodation.revpar : 0);
  const bookingsCount = Number(accommodation.completed_bookings || accommodation.bookings_count || 0);
  const occupancyRate = accommodation.occupancy_rate !== undefined ? accommodation.occupancy_rate : 0;
  const rating = Number(accommodation.rating || 4.95);
  const reviewsCount = accommodation.reviews_count || 0;
  const rank = accommodation.rank || 1;

  // Bookings of this accommodation from database
  const propertyBookings = Array.isArray(accommodation.bookingsList) ? accommodation.bookingsList : [];

  const handlePrint = () => {
    toast.info('Đang chuẩn bị in', 'Đang tạo bản xem trước in phiếu báo cáo hiệu suất...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleExportSingle = () => {
    try {
      const headers = ['Mã Đơn', 'Khách Hàng', 'Nhận Phòng', 'Trả Phòng', 'Số Đêm', 'Tổng Giá', 'Thực Nhận 88%', 'Trạng Thái'];
      const rows = propertyBookings.map((b) => [
        b.code,
        `"${b.guestName}"`,
        b.checkIn,
        b.checkOut,
        b.nights,
        b.grossAmount,
        b.netPayout,
        b.status === 'completed' ? 'Hoàn tất' : b.status === 'confirmed' ? 'Đã duyệt' : 'Đang xử lý',
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `TripNest_HieuSuat_${name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Xuất file thành công', `Đã xuất dữ liệu hiệu suất của "${name}".`);
    } catch (e) {
      toast.error('Lỗi khi xuất file', e.message);
    }
  };

  return (
    <div className="host-stmt-backdrop" onClick={onClose}>
      <div className="host-stmt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="host-stmt-header">
          <div className="host-stmt-brand-wrap">
            <div className="host-stmt-thumb-box">
              <img src={thumb} alt={name} className="host-stmt-thumb" />
              {rank <= 3 && (
                <div className={`host-stmt-rank-crown rank-${rank}`}>
                  {rank === 1 ? <TbCrown /> : <TbMedal />}
                </div>
              )}
            </div>
            <div className="host-stmt-title-box">
              <div className="host-stmt-badge-row">
                <span className={`host-stmt-rank-pill rank-${rank}`}>
                  {rank === 1 && '👑 Quán Quân (#1 Doanh Số)'}
                  {rank === 2 && '🥈 Á Quân (#2 Doanh Số)'}
                  {rank === 3 && '🥉 Quý Quân (#3 Doanh Số)'}
                  {rank > 3 && `Hạng #${rank} Danh Mục`}
                </span>
                <span className="host-stmt-type-pill">{type}</span>
                <span className="host-stmt-status-pill">
                  {accommodation.status === 'published' ? 'Đang Mở Bán' : 'Tạm Dừng'}
                </span>
              </div>
              <h2 className="host-stmt-name">{name}</h2>
              <div className="host-stmt-loc">
                <TbMapPin className="text-muted" />
                <span>{address}</span>
              </div>
            </div>
          </div>

          <button type="button" className="host-stmt-close-btn" onClick={onClose} title="Đóng">
            <TbX />
          </button>
        </div>

        {/* 4 Quick Stat Metric Cards */}
        <div className="host-stmt-kpi-grid">
          <div className="host-stmt-kpi-card gmv">
            <div className="host-stmt-kpi-top">
              <span className="host-stmt-kpi-lbl">Tổng GMV Thu Hộ</span>
              <div className="host-stmt-kpi-icon gmv">
                <TbCoins />
              </div>
            </div>
            <div className="host-stmt-kpi-val text-coral">{formatCurrency(gmv)}</div>
            <div className="host-stmt-kpi-sub">Giá trị giao dịch toàn thời gian</div>
          </div>

          <div className="host-stmt-kpi-card net">
            <div className="host-stmt-kpi-top">
              <span className="host-stmt-kpi-lbl">Thực Nhận Host (88%)</span>
              <div className="host-stmt-kpi-icon net">
                <TbWallet />
              </div>
            </div>
            <div className="host-stmt-kpi-val text-emerald">{formatCurrency(net)}</div>
            <div className="host-stmt-kpi-sub">
              Khả dụng: <strong>{formatCurrency(availablePayout)}</strong>
            </div>
          </div>

          <div className="host-stmt-kpi-card occupancy">
            <div className="host-stmt-kpi-top">
              <span className="host-stmt-kpi-lbl">Tỷ Lệ Lấp Đầy</span>
              <div className="host-stmt-kpi-icon occupancy">
                <TbCalendarEvent />
              </div>
            </div>
            <div className="host-stmt-kpi-val text-indigo">{occupancyRate}%</div>
            <div className="host-stmt-kpi-sub">
              <strong>{bookingsCount}</strong> lượt đặt phòng hoàn tất
            </div>
          </div>

          <div className="host-stmt-kpi-card rating">
            <div className="host-stmt-kpi-top">
              <span className="host-stmt-kpi-lbl">Đánh Giá Từ Khách</span>
              <div className="host-stmt-kpi-icon rating">
                <TbStar />
              </div>
            </div>
            <div className="host-stmt-kpi-val text-amber">
              {rating.toFixed(1)} <TbStar style={{ fontSize: '1.25rem', verticalAlign: '-2px' }} />
            </div>
            <div className="host-stmt-kpi-sub">
              Dựa trên <strong>{reviewsCount}</strong> lượt đánh giá
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="host-stmt-tabs-wrap">
          <button
            type="button"
            className={`host-stmt-tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <TbCalendarEvent />
            <span>Lịch Sử Đặt Phòng ({propertyBookings.length})</span>
          </button>
          <button
            type="button"
            className={`host-stmt-tab ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <TbSparkles />
            <span>Cơ Cấu Dòng Tiền & Chỉ Số Vận Hành</span>
          </button>
        </div>

        {/* Tab Content 1: Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="host-stmt-table-wrap">
            {propertyBookings.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <TbCalendarEvent style={{ fontSize: '2.2rem', color: '#94a3b8', marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--host-text-main)' }}>
                  Chưa có đơn đặt phòng nào
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--host-text-muted)', margin: '4px 0 0 0' }}>
                  Cơ sở lưu trú này chưa phát sinh giao dịch đặt phòng nào trên hệ thống.
                </p>
              </div>
            ) : (
              <table className="host-stmt-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Khách Hàng</th>
                    <th>Thời Gian Lưu Trú</th>
                    <th>Tổng Giá Trị</th>
                    <th>Thực Nhận (88%)</th>
                    <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                {propertyBookings.map((b, idx) => (
                  <tr key={b.code || idx}>
                    <td>
                      <strong className="host-stmt-code">{b.code}</strong>
                    </td>
                    <td>
                      <div className="host-stmt-guest-name">{b.guestName}</div>
                      <div className="host-stmt-guest-sub">{b.guests || 2} khách</div>
                    </td>
                    <td>
                      <div className="host-stmt-stay-dates">
                        {b.checkIn} ➔ {b.checkOut}
                      </div>
                      <div className="host-stmt-stay-nights">{b.nights || 1} đêm</div>
                    </td>
                    <td>
                      <span className="host-stmt-gross">{formatCurrency(b.grossAmount)}</span>
                    </td>
                    <td>
                      <strong className="host-stmt-net text-emerald">
                        {formatCurrency(b.netPayout)}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`host-stmt-pill ${b.status}`}>
                        {b.status === 'completed'
                          ? 'HOÀN TẤT'
                          : b.status === 'confirmed'
                          ? 'ĐÃ DUYỆT'
                          : b.status === 'checked_in'
                          ? 'ĐANG Ở'
                          : (b.status ? b.status.toUpperCase() : 'ĐANG XỬ LÝ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}

        {/* Tab Content 2: Operational Deep Dive */}
        {activeTab === 'metrics' && (
          <div className="host-stmt-metrics-pane">
            <div className="host-stmt-metrics-row">
              <div className="host-stmt-metric-box">
                <span className="host-stmt-mb-lbl">Phí Nền Tảng (12%)</span>
                <span className="host-stmt-mb-val text-indigo">{formatCurrency(comm)}</span>
                <p className="host-stmt-mb-desc">Chi phí bảo chứng thanh toán & quảng bá sàn</p>
              </div>
              <div className="host-stmt-metric-box">
                <span className="host-stmt-mb-lbl">Quỹ Escrow Tạm Giữ</span>
                <span className="host-stmt-mb-val text-amber">{formatCurrency(escrow)}</span>
                <p className="host-stmt-mb-desc">Chờ khách check-out giải ngân vào số dư</p>
              </div>
              <div className="host-stmt-metric-box">
                <span className="host-stmt-mb-lbl">Giá Bình Quân Mỗi Đêm (ADR)</span>
                <span className="host-stmt-mb-val text-coral">
                  {formatCurrency(adr)}
                </span>
                <p className="host-stmt-mb-desc">Doanh thu phòng trên mỗi đêm đã bán</p>
              </div>
              <div className="host-stmt-metric-box">
                <span className="host-stmt-mb-lbl">Doanh Thu / Phòng Sẵn Có (RevPAR)</span>
                <span className="host-stmt-mb-val text-emerald">
                  {formatCurrency(revpar)}
                </span>
                <p className="host-stmt-mb-desc">Hiệu suất khai thác tổng công suất phòng</p>
              </div>
            </div>

            <div className="host-stmt-callout">
              <TbTrophy className="host-stmt-callout-icon" />
              <div>
                <h4 className="host-stmt-callout-title">Đánh Giá Hiệu Suất Tổng Thể</h4>
                <p className="host-stmt-callout-desc">
                  Cơ sở lưu trú <strong>{name}</strong> đang duy trì tỷ lệ lấp đầy ({occupancyRate}%) và mang lại <strong>{formatCurrency(net)}</strong> thực nhận cho danh mục của bạn trên TripNest. Hãy duy trì chất lượng dịch vụ và tốc độ phản hồi để giữ vững vị thế dẫn đầu!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="host-stmt-footer">
          <div className="host-stmt-footer-left">
            <button type="button" className="btn-host-sec" onClick={handleExportSingle}>
              <TbDownload />
              <span>Xuất Báo Cáo</span>
            </button>
            <button type="button" className="btn-host-sec" onClick={handlePrint}>
              <TbPrinter />
              <span>In Phiếu</span>
            </button>
          </div>

          <div className="host-stmt-footer-right">
            {onViewDetail && (
              <button
                type="button"
                className="btn-host-sec"
                onClick={() => {
                  onClose();
                  onViewDetail(accommodation);
                }}
              >
                <TbEye />
                <span>Xem Trang Chỗ Ở</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                className="btn-host-pri"
                onClick={() => {
                  onClose();
                  onEdit(accommodation);
                }}
              >
                <TbEdit />
                <span>Chỉnh Sửa Chỗ Nghỉ</span>
                <TbArrowUpRight />
              </button>
            )}

            <button type="button" className="btn-host-sec" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationPerformanceModal;
