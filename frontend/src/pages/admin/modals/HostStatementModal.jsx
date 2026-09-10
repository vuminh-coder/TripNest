import React, { useState } from 'react';
import { 
  TbX, 
  TbBuildingBank, 
  TbCoins, 
  TbReceipt2, 
  TbCalendar, 
  TbUser, 
  TbMail, 
  TbPhone, 
  TbCheck, 
  TbClock, 
  TbPrinter, 
  TbDownload, 
  TbBuildingSkyscraper, 
  TbShieldCheck,
  TbArrowDownRight,
  TbArrowUpRight,
  TbWallet,
  TbFileText
} from 'react-icons/tb';
import { useToast } from '@/context/ToastContext';
import './HostStatementModal.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const HostStatementModal = ({ host, onClose }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'payouts'

  if (!host) return null;

  const hostName = host.name || host.host_name || 'Chủ nhà TripNest';
  const hostEmail = host.email || 'host@tripnest.vn';
  const hostPhone = host.phone || '0987 654 321';
  const avatar = host.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=ff385c&color=fff`;

  // Bank Info
  const bankName = host.bank_name || host.payout_profile?.bank_name || 'Vietcombank (VCB)';
  const accountNumber = host.account_number || host.payout_profile?.account_number || '9876543210';
  const accountHolder = (host.account_holder || host.payout_profile?.account_holder || hostName).toUpperCase();

  // Financial Figures
  const totalGmv = host.total_gmv || host.gmv || 0;
  const platformFee = host.platform_fee || host.commission || Math.round(totalGmv * 0.12);
  const netEarnings = host.net_earnings || host.net_income || (totalGmv - platformFee);
  const paidOut = host.paid_out || host.payouts_completed || 0;
  const inEscrow = host.in_escrow || host.escrow_balance || Math.max(netEarnings - paidOut, 0);

  // Sample or Provided Bookings
  const bookings = host.bookings || [
    {
      id: 'BK-98214',
      property_title: 'The Modern Minimalist Loft',
      guest_name: 'Trần Bảo Anh',
      check_in: '2026-09-02',
      check_out: '2026-09-05',
      gross_amount: 4500000,
      commission_fee: 540000,
      net_payout: 3960000,
      status: 'completed',
      payout_status: 'paid'
    },
    {
      id: 'BK-98190',
      property_title: 'The Modern Minimalist Loft',
      guest_name: 'Nguyễn Hải Đăng',
      check_in: '2026-09-08',
      check_out: '2026-09-12',
      gross_amount: 6000000,
      commission_fee: 720000,
      net_payout: 5280000,
      status: 'confirmed',
      payout_status: 'escrow'
    },
    {
      id: 'BK-98055',
      property_title: 'Rustic Sunset Villa Dalat',
      guest_name: 'Lê Hoàng Nam',
      check_in: '2026-08-20',
      check_out: '2026-08-23',
      gross_amount: 8200000,
      commission_fee: 984000,
      net_payout: 7216000,
      status: 'completed',
      payout_status: 'paid'
    }
  ];

  // Sample or Provided Payouts
  const payouts = host.payouts || [
    {
      id: 'PO-7701',
      date: '2026-09-06',
      amount: 3960000,
      bank: `${bankName} - ${accountNumber}`,
      ref_code: 'FT2609068192',
      status: 'completed'
    },
    {
      id: 'PO-7645',
      date: '2026-08-24',
      amount: 7216000,
      bank: `${bankName} - ${accountNumber}`,
      ref_code: 'FT2608249912',
      status: 'completed'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    toast.success('Đang trích xuất sao kê', `Bảng sao kê của Host ${hostName} đã được tải về.`);
  };

  return (
    <div className="adm-statement-backdrop" onClick={onClose}>
      <div className="adm-statement-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Light Luxury Header */}
        <div className="adm-statement-header">
          <div className="adm-statement-host-info">
            <img src={avatar} alt={hostName} className="adm-host-modal-avatar" />
            <div className="adm-host-text-details">
              <div className="adm-host-title-line">
                <h2 className="adm-host-modal-name">{hostName}</h2>
                <span className="adm-badge-verified">
                  <TbShieldCheck /> Đối tác xác thực
                </span>
              </div>
              <div className="adm-host-meta-row">
                <span><TbMail /> {hostEmail}</span>
                <span><TbPhone /> {hostPhone}</span>
                <span><TbBuildingSkyscraper /> {host.accommodations_count || 1} chỗ nghỉ</span>
              </div>
            </div>
          </div>

          <div className="adm-header-actions">
            <button className="adm-btn-modal-action" title="In sao kê" onClick={handlePrint}>
              <TbPrinter /> In
            </button>
            <button className="adm-btn-modal-action" title="Tải xuống CSV" onClick={handleExportCSV}>
              <TbDownload /> Xuất CSV
            </button>
            <button className="adm-btn-modal-close" onClick={onClose} aria-label="Close">
              <TbX />
            </button>
          </div>
        </div>

        {/* Bank & Payment Card Bar */}
        <div className="adm-statement-bank-bar">
          <div className="adm-bank-item">
            <TbBuildingBank className="adm-bank-icon" />
            <div>
              <div className="adm-bank-lbl">Ngân hàng thụ hưởng</div>
              <div className="adm-bank-name">{bankName}</div>
            </div>
          </div>
          <div className="adm-bank-item">
            <div>
              <div className="adm-bank-lbl">Số tài khoản</div>
              <div className="adm-bank-num mono">{accountNumber}</div>
            </div>
          </div>
          <div className="adm-bank-item">
            <div>
              <div className="adm-bank-lbl">Chủ tài khoản</div>
              <div className="adm-bank-holder">{accountHolder}</div>
            </div>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="adm-statement-kpi-grid">
          <div className="adm-st-kpi gmv">
            <div className="st-kpi-icon"><TbCoins /></div>
            <div className="st-kpi-info">
              <span className="st-kpi-lbl">Tổng GMV Thu Hộ</span>
              <span className="st-kpi-val text-coral">{formatCurrency(totalGmv)}</span>
            </div>
          </div>

          <div className="adm-st-kpi commission">
            <div className="st-kpi-icon"><TbArrowDownRight /></div>
            <div className="st-kpi-info">
              <span className="st-kpi-lbl">Phí Sàn 12% Đã Thu</span>
              <span className="st-kpi-val text-emerald">{formatCurrency(platformFee)}</span>
            </div>
          </div>

          <div className="adm-st-kpi net">
            <div className="st-kpi-icon"><TbWallet /></div>
            <div className="st-kpi-info">
              <span className="st-kpi-lbl">Thực Nhận (88%)</span>
              <span className="st-kpi-val text-sky">{formatCurrency(netEarnings)}</span>
            </div>
          </div>

          <div className="adm-st-kpi paid">
            <div className="st-kpi-icon"><TbArrowUpRight /></div>
            <div className="st-kpi-info">
              <span className="st-kpi-lbl">Đã Giải Ngân</span>
              <span className="st-kpi-val text-dark">{formatCurrency(paidOut)}</span>
            </div>
          </div>

          <div className="adm-st-kpi escrow">
            <div className="st-kpi-icon"><TbClock /></div>
            <div className="st-kpi-info">
              <span className="st-kpi-lbl">Quỹ Escrow Giữ</span>
              <span className="st-kpi-val text-amber">{formatCurrency(inEscrow)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="adm-statement-tabs">
          <button 
            type="button"
            className={`adm-st-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <TbReceipt2 /> Sổ Cái Đơn Đặt Phòng ({bookings.length})
          </button>
          <button 
            type="button"
            className={`adm-st-tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            <TbCoins /> Lịch Sử Giải Ngân / Payouts ({payouts.length})
          </button>
        </div>

        {/* Tab Content: Bookings */}
        {activeTab === 'bookings' && (
          <div className="adm-statement-table-wrap">
            <table className="adm-st-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Chỗ Nghỉ & Khách</th>
                  <th>Thời Gian Lưu Trú</th>
                  <th className="text-right">Tổng Khách Trả</th>
                  <th className="text-right">Phí Sàn (12%)</th>
                  <th className="text-right">Host Thực Nhận</th>
                  <th className="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, idx) => (
                  <tr key={b.id || idx}>
                    <td className="adm-mono-code">#{b.id}</td>
                    <td>
                      <div className="adm-tbl-title">{b.property_title || 'Chỗ nghỉ TripNest'}</div>
                      <div className="adm-tbl-guest">Khách: {b.guest_name || 'Khách đặt'}</div>
                    </td>
                    <td>
                      <div className="adm-tbl-stay">
                        {formatDate(b.check_in)} <span className="arrow">→</span> {formatDate(b.check_out)}
                      </div>
                    </td>
                    <td className="text-right font-bold text-dark">{formatCurrency(b.gross_amount)}</td>
                    <td className="text-right text-emerald">-{formatCurrency(b.commission_fee || (b.gross_amount * 0.12))}</td>
                    <td className="text-right font-bold text-sky">
                      {formatCurrency(b.net_payout || (b.gross_amount * 0.88))}
                    </td>
                    <td className="text-center">
                      {b.payout_status === 'paid' ? (
                        <span className="adm-payout-tag paid"><TbCheck /> Đã quyết toán</span>
                      ) : (
                        <span className="adm-payout-tag escrow"><TbClock /> Escrow giữ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Payouts */}
        {activeTab === 'payouts' && (
          <div className="adm-statement-table-wrap">
            <table className="adm-st-table">
              <thead>
                <tr>
                  <th>Mã Lệnh</th>
                  <th>Ngày Chuyển</th>
                  <th>Tài Khoản Nhận</th>
                  <th>Mã Đối Soát (FT)</th>
                  <th className="text-right">Số Tiền Giải Ngân</th>
                  <th className="text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td className="adm-mono-code">#{p.id}</td>
                    <td>{formatDate(p.date || p.created_at)}</td>
                    <td>{p.bank || `${bankName} (${accountNumber})`}</td>
                    <td className="adm-mono-code text-coral">{p.ref_code || p.transaction_ref || 'FT2609000000'}</td>
                    <td className="text-right font-bold text-sky">{formatCurrency(p.amount || p.net_payout)}</td>
                    <td className="text-center">
                      <span className="adm-payout-tag paid"><TbCheck /> Thành công</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="adm-statement-footer">
          <div className="adm-statement-note">
            <TbFileText /> Báo cáo sao kê tự động trích xuất từ Hệ thống Quản Trị Tài Chính TripNest.
          </div>
          <button className="adm-btn-close-st" onClick={onClose}>
            Đóng Sao Kê
          </button>
        </div>

      </div>
    </div>
  );
};

export default HostStatementModal;
