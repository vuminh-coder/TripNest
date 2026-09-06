import React, { useState } from 'react';
import './FinancialsPage.css';
import {
  TbCoins,
  TbClock,
  TbSparkles,
  TbSearch,
  TbReceipt,
  TbCircleCheck,
  TbShieldCheck,
  TbArrowBackUp,
} from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';

export const FinancialsPage = ({ payouts = [], stats = {}, onOpenPayoutModal }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  // Calculated Escrow & Completed sums dynamically
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const completedPayouts = payouts.filter((p) => p.status === 'completed');

  const dynamicEscrowVND = pendingPayouts.reduce(
    (sum, p) => sum + (Number(p.net_payout) || Number(p.amount) || 0),
    0
  );

  const dynamicCompletedVND = completedPayouts.reduce(
    (sum, p) => sum + (Number(p.net_payout) || Number(p.amount) || 0),
    0
  );

  const filtered = payouts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchHost = p.host_name && p.host_name.toLowerCase().includes(q);
      const matchBooking = p.booking_code && p.booking_code.toLowerCase().includes(q);
      const matchId = String(p.id || '').toLowerCase().includes(q);
      const matchAcc = String(p.account_number || '').includes(q);
      const matchBank = p.bank_name && p.bank_name.toLowerCase().includes(q);
      if (!matchHost && !matchBooking && !matchId && !matchAcc && !matchBank) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="adm-financials-container">
      {/* Header */}
      <AdminPageHeader
        title="Tài Chính & Đối Soát Giải Ngân"
        subtitle="Quản lý dòng tiền GMV, phân bổ hoa hồng sàn 12% và kiểm duyệt lệnh chi trả Payout cho Host"
      />

      {/* 5 Financial Summary KPI Cards */}
      <div className="adm-fin-kpi-grid">
        {/* Card 1: Tổng GMV Thu Hộ */}
        <div className="stat-card-glass adm-fin-kpi-card">
          <div className="adm-fin-kpi-info">
            <span className="stat-label">Tổng GMV Thu Hộ</span>
            <div className="stat-value">{formatVND(stats.totalRevenueVND)}</div>
            <div className="adm-fin-kpi-sub">
              Từ {stats.validBookingsCount || (stats.totalBookings ? stats.totalBookings - (stats.cancelledBookingsCount || 0) : 18)} đơn hợp lệ
            </div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>

        {/* Card 2: Hoa Hồng Nền Tảng */}
        <div className="stat-card-glass adm-fin-kpi-card">
          <div className="adm-fin-kpi-info">
            <span className="stat-label">Hoa Hồng Nền Tảng</span>
            <div className="stat-value adm-fin-stat-green">
              {formatVND(stats.commissionRevenueVND)}
            </div>
            <div className="adm-fin-stat-green-sub adm-fin-kpi-sub">
              Doanh thu thực sàn
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbSparkles />
          </div>
        </div>

        {/* Card 3: Quỹ Tạm Giữ Chờ Chi */}
        <div className="stat-card-glass adm-fin-kpi-card">
          <div className="adm-fin-kpi-info">
            <span className="stat-label">Quỹ Tạm Giữ Chờ Chi</span>
            <div className="stat-value adm-fin-stat-amber">
              {formatVND(dynamicEscrowVND)}
            </div>
            <div className="adm-fin-stat-amber-sub adm-fin-kpi-sub">
              {stats.pendingPayoutsCount ?? pendingPayouts.length} lệnh chờ giải ngân
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbClock />
          </div>
        </div>

        {/* Card 4: Đã Giải Ngân Host */}
        <div className="stat-card-glass adm-fin-kpi-card">
          <div className="adm-fin-kpi-info">
            <span className="stat-label">Đã Giải Ngân Host</span>
            <div className="stat-value adm-fin-stat-blue">
              {formatVND(dynamicCompletedVND)}
            </div>
            <div className="adm-fin-stat-blue-sub adm-fin-kpi-sub">
              {stats.completedPayoutsCount ?? completedPayouts.length} lệnh đã quyết toán
            </div>
          </div>
          <div className="stat-icon-wrap blue adm-fin-icon-blue">
            <TbCircleCheck />
          </div>
        </div>

        {/* Card 5: Tổng Hoàn Tiền */}
        <div className="stat-card-glass adm-fin-kpi-card">
          <div className="adm-fin-kpi-info">
            <span className="stat-label">Tổng Hoàn Tiền</span>
            <div className="stat-value adm-fin-stat-red">
              {formatVND(stats.totalRefundedVND || 0)}
            </div>
            <div className="adm-fin-stat-red-sub adm-fin-kpi-sub">
              {stats.cancelledBookingsCount || 0} đơn hủy phòng
            </div>
          </div>
          <div className="stat-icon-wrap red adm-fin-icon-red">
            <TbArrowBackUp />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card-box adm-fin-filter-box">
        <div className="adm-fin-filter-bar">
          {/* Search Box */}
          <div className="adm-fin-search-wrap">
            <TbSearch className="adm-fin-search-icon" />
            <input
              type="text"
              placeholder="Tìm theo chủ nhà, mã đơn, mã lệnh, số tài khoản..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="adm-fin-search-input"
            />
          </div>

          {/* Status Filter */}
          <select
            className="admin-select-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả Trạng thái ({payouts.length})</option>
            <option value="pending">⏳ Chờ duyệt chuyển ({pendingPayouts.length})</option>
            <option value="completed">✅ Đã giải ngân ({completedPayouts.length})</option>
            <option value="cancelled">🚫 Đã hủy hoàn tiền ({payouts.filter((p) => p.status === 'cancelled').length})</option>
            <option value="failed">❌ Thất bại</option>
          </select>
        </div>
      </div>

      {/* Payouts Table */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="lệnh"
      >
        <table className="admin-table adm-fin-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Mã Lệnh</th>
              <th>Chủ Nhà Thụ Hưởng</th>
              <th style={{ width: '110px' }}>Mã Đơn</th>
              <th>Doanh Thu Thu Hộ</th>
              <th>Hoa Hồng Sàn</th>
              <th>Thực Chuyển Host</th>
              <th>Tài Khoản Ngân Hàng</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right', width: '130px' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="9" className="adm-fin-empty-state">
                  Không tìm thấy lệnh giải ngân nào phù hợp.
                </td>
              </tr>
            ) : (
              paginated.map((p) => {
                const isPending = p.status === 'pending';
                const isCompleted = p.status === 'completed';
                const gross = p.gross_amount || p.amount || 0;
                const commission = p.commission_fee || Math.round(gross * 0.12);
                const net = p.net_payout || (gross - commission);

                return (
                  <tr
                    key={p.id}
                    className={isPending ? 'adm-fin-row-pending' : ''}
                  >
                    {/* Payout ID */}
                    <td className="td-nowrap">
                      <strong className="adm-fin-payout-id">
                        #{p.id}
                      </strong>
                    </td>

                    {/* Host Name & Avatar */}
                    <td>
                      <div className="adm-fin-host-cell">
                        <div className="adm-fin-host-avatar-badge">
                          {(p.host_name || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="adm-fin-host-name">
                            {p.host_name}
                          </div>
                          <div className="adm-fin-kyc-badge">
                            <TbShieldCheck /> KYC Verified
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Booking Code */}
                    <td className="td-nowrap">
                      <span className="adm-fin-booking-code">
                        {p.booking_code || 'TN-DIRECT'}
                      </span>
                      {p.voucher_discount > 0 && (
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                          🎟️ {p.voucher_code || 'Voucher'} (-{formatVND(p.voucher_discount)})
                        </div>
                      )}
                    </td>

                    {/* Gross Room Amount */}
                    <td className="td-nowrap">
                      <span className="adm-fin-gross-val">
                        {formatVND(gross)}
                      </span>
                    </td>

                    {/* Commission (12%) */}
                    <td className="td-nowrap">
                      <span className="adm-fin-comm-val">
                        - {formatVND(commission)}
                      </span>
                    </td>

                    {/* Net Payout */}
                    <td className="td-nowrap">
                      <strong
                        className="adm-fin-net-val"
                        style={p.status === 'cancelled' ? { color: '#94a3b8', textDecoration: 'line-through' } : {}}
                      >
                        {formatVND(net)}
                      </strong>
                    </td>

                    {/* Beneficiary Bank Account */}
                    <td className="td-nowrap">
                      <div className="adm-fin-bank-name">
                        {p.bank_name || 'Vietcombank'}
                      </div>
                      <div className="adm-fin-bank-acc-wrap">
                        <span className="adm-fin-stk-tag">STK:</span>
                        <span className="adm-fin-stk-num">
                          {p.account_number || '0071001234567'}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="td-nowrap">
                      <span className={`status-pill ${p.status}`}>
                        {isCompleted
                          ? 'ĐÃ CHUYỂN'
                          : p.status === 'failed'
                          ? 'THẤT BẠI'
                          : p.status === 'cancelled'
                          ? 'ĐÃ HỦY'
                          : 'CHỜ DUYỆT'}
                      </span>
                      {p.transaction_ref && (
                        <div className="adm-fin-tx-ref">
                          Ref: {p.transaction_ref}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="adm-fin-actions-cell">
                        {isPending && (
                          <button
                            type="button"
                            className="adm-fin-approve-btn"
                            title="Duyệt & Giải ngân chuyển tiền cho Host"
                            onClick={() => onOpenPayoutModal && onOpenPayoutModal(p)}
                          >
                            <TbCircleCheck size={15} />
                            <span>Duyệt chi</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="adm-fin-receipt-btn"
                          title="Xem chi tiết hóa đơn quyết toán"
                          onClick={() => onOpenPayoutModal && onOpenPayoutModal(p)}
                        >
                          <TbReceipt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableWrapper>
    </div>
  );
};

export default FinancialsPage;
