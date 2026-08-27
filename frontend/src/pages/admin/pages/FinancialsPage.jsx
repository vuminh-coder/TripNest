import React, { useState } from 'react';
import {
  TbCoins,
  TbCheck,
  TbClock,
  TbSparkles,
  TbSearch,
  TbBuildingBank,
  TbReceipt,
  TbCircleCheck,
  TbAlertTriangle,
  TbShieldCheck,
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
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Tài Chính & Đối Soát Giải Ngân"
        subtitle="Quản lý dòng tiền GMV, phân bổ hoa hồng sàn 12% và kiểm duyệt lệnh chi trả Payout cho Host"
      />

      {/* 4 Financial Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Card 1: Tổng GMV Thu Hộ */}
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Tổng GMV Thu Hộ</span>
            <div className="stat-value">{formatVND(stats.totalRevenueVND)}</div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
              Từ {stats.totalBookings || payouts.length} đơn đặt phòng
            </div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>

        {/* Card 2: Hoa Hồng Nền Tảng (12%) */}
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Hoa Hồng Nền Tảng (12%)</span>
            <div className="stat-value" style={{ color: '#059669' }}>
              {formatVND(stats.commissionRevenueVND)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              Doanh thu thực thu của sàn
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbSparkles />
          </div>
        </div>

        {/* Card 3: Quỹ Escrow Tạm Giữ Chờ Duyệt */}
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Quỹ Tạm Giữ Chờ Chi (Escrow)</span>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {formatVND(dynamicEscrowVND)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>
              {pendingPayouts.length} lệnh chờ giải ngân
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbClock />
          </div>
        </div>

        {/* Card 4: Đã Giải Ngân Cho Host */}
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Đã Giải Ngân Cho Host</span>
            <div className="stat-value" style={{ color: '#2563eb' }}>
              {formatVND(dynamicCompletedVND)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
              {completedPayouts.length} lệnh đã quyết toán
            </div>
          </div>
          <div className="stat-icon-wrap blue" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <TbCircleCheck />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="admin-card-box"
        style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}
      >
        <div
          className="admin-filter-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
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
              minWidth: '240px',
            }}
          >
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo chủ nhà, mã đơn, mã lệnh, số tài khoản..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '0.84rem',
                outline: 'none',
              }}
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
        <table className="admin-table" style={{ minWidth: '940px' }}>
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Mã Lệnh</th>
              <th>Chủ Nhà Thụ Hưởng</th>
              <th style={{ width: '110px' }}>Mã Đơn</th>
              <th>Doanh Thu (Gross)</th>
              <th>Hoa Hồng Sàn (12%)</th>
              <th>Thực Chuyển (Net)</th>
              <th>Tài Khoản Ngân Hàng</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right', width: '130px' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: 'center',
                    padding: '3.5rem 1rem',
                    color: '#94a3b8',
                  }}
                >
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
                    style={{
                      background: isPending ? '#fffdf7' : 'transparent',
                    }}
                  >
                    {/* Payout ID */}
                    <td className="td-nowrap">
                      <strong style={{ color: '#0f172a', fontSize: '0.86rem', fontFamily: 'monospace' }}>
                        #{p.id}
                      </strong>
                    </td>

                    {/* Host Name & Avatar */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0,
                          }}
                        >
                          {(p.host_name || 'H').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>
                            {p.host_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <TbShieldCheck /> KYC Verified
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Booking Code */}
                    <td className="td-nowrap">
                      <span
                        style={{
                          fontWeight: 700,
                          color: '#0ea5e9',
                          fontFamily: 'monospace',
                          fontSize: '0.84rem',
                          background: '#f0f9ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {p.booking_code || 'TN-DIRECT'}
                      </span>
                    </td>

                    {/* Gross Room Amount */}
                    <td className="td-nowrap">
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {formatVND(gross)}
                      </span>
                    </td>

                    {/* Commission (12%) */}
                    <td className="td-nowrap">
                      <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.84rem' }}>
                        - {formatVND(commission)}
                      </span>
                    </td>

                    {/* Net Payout */}
                    <td className="td-nowrap">
                      <strong style={{ color: '#059669', fontSize: '0.94rem', fontWeight: 800 }}>
                        {formatVND(net)}
                      </strong>
                    </td>

                    {/* Beneficiary Bank Account */}
                    <td className="td-nowrap">
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>
                        {p.bank_name || 'Vietcombank'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>
                        STK: {p.account_number || '9988776655'}
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
                        <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '2px', fontWeight: 700, fontFamily: 'monospace' }}>
                          Ref: {p.transaction_ref}
                        </div>
                      )}
                      {p.failure_reason && p.status === 'failed' && (
                        <div style={{ fontSize: '0.68rem', color: '#dc2626', marginTop: '2px' }}>
                          Lý do: {p.failure_reason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="td-actions-group">
                        {isPending ? (
                          <button
                            type="button"
                            className="btn-admin-primary"
                            style={{
                              padding: '0.42rem 0.85rem',
                              fontSize: '0.78rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.28)',
                            }}
                            onClick={() => onOpenPayoutModal(p)}
                          >
                            <TbCheck />
                            <span>Duyệt Chuyển</span>
                          </button>
                        ) : p.status === 'failed' ? (
                          <button
                            type="button"
                            className="btn-admin-primary"
                            style={{
                              padding: '0.42rem 0.85rem',
                              fontSize: '0.78rem',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            }}
                            onClick={() => onOpenPayoutModal(p)}
                          >
                            <span>Thử Lại</span>
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.76rem',
                              color: '#059669',
                              fontWeight: 800,
                              background: '#ecfdf5',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #a7f3d0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            ✓ Hoàn Tất
                          </span>
                        )}
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
