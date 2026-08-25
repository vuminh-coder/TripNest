import React, { useState } from 'react';
import { TbCoins, TbCheck, TbClock, TbSparkles } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';

export const FinancialsPage = ({ payouts, stats, onOpenPayoutModal }) => {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const formatVND = (val) => `${(val || 0).toLocaleString()} ₫`;
  const paginated = payouts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Tài Chính & Đối Soát Giải Ngân"
        subtitle="Quản lý dòng tiền GMV, hoa hồng sàn 11% và lệnh chi trả Payout cho Host"
      />

      {/* Financial Summary Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Tổng GMV Thu Hộ</span>
            <div className="stat-value">{formatVND(stats.totalRevenueVND)}</div>
          </div>
          <div className="stat-icon-wrap pink">
            <TbCoins />
          </div>
        </div>

        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Hoa Hồng Nền Tảng (11%)</span>
            <div className="stat-value" style={{ color: '#059669' }}>
              {formatVND(stats.commissionRevenueVND)}
            </div>
          </div>
          <div className="stat-icon-wrap green">
            <TbSparkles />
          </div>
        </div>

        <div className="stat-card-glass">
          <div>
            <span className="stat-label">Lệnh Chờ Giải Ngân</span>
            <div className="stat-value" style={{ color: '#d97706' }}>
              {payouts.filter((p) => p.status === 'pending').length} lệnh
            </div>
          </div>
          <div className="stat-icon-wrap amber">
            <TbClock />
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={payouts.length}
        onPageChange={setPage}
        label="lệnh"
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã Lệnh</th>
              <th>Chủ Nhà</th>
              <th>Mã Booking</th>
              <th>Doanh Thu</th>
              <th>Hoa Hồng Sàn</th>
              <th>Thực Chuyển</th>
              <th>Tài Khoản Thụ Hưởng</th>
              <th>Trạng Thái</th>
              <th style={{ textAlign: 'right' }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => (
              <tr key={p.id}>
                <td className="td-nowrap">
                  <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>#{p.id}</strong>
                </td>
                <td className="td-nowrap">
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.host_name}</div>
                </td>
                <td className="td-nowrap">
                  <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{p.booking_code}</span>
                </td>
                <td className="td-nowrap">
                  <span>{formatVND(p.gross_amount)}</span>
                </td>
                <td className="td-nowrap">
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>- {formatVND(p.commission_fee)}</span>
                </td>
                <td className="td-nowrap">
                  <strong style={{ color: '#059669', fontSize: '0.92rem' }}>{formatVND(p.net_payout)}</strong>
                </td>
                <td className="td-nowrap">
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{p.bank_name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>STK: {p.account_number}</div>
                </td>
                <td className="td-nowrap">
                  <span className={`status-pill ${p.status}`}>
                    {p.status === 'completed' ? 'ĐÃ CHUYỂN' : 'CHỜ DUYỆT'}
                  </span>
                  {p.transaction_ref && (
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      Ref: {p.transaction_ref}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="td-actions-group">
                    {p.status === 'pending' ? (
                      <button
                        className="btn-admin-primary"
                        style={{ padding: '0.38rem 0.8rem', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                        onClick={() => onOpenPayoutModal(p)}
                      >
                        <TbCheck />
                        <span>Duyệt Chuyển</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700 }}>
                        ✓ Hoàn Tất
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableWrapper>
    </div>
  );
};

export default FinancialsPage;
