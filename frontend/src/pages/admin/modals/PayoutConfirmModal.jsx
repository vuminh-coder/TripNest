import React, { useState } from 'react';
import {
  TbX,
  TbBuildingBank,
  TbCoins,
  TbCheck,
  TbReceipt,
} from 'react-icons/tb';

export const PayoutConfirmModal = ({ payout, onClose, onConfirm }) => {
  const [transactionRef, setTransactionRef] = useState(
    'FT' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + Math.floor(1000 + Math.random() * 9000)
  );

  if (!payout) return null;

  const formatVND = (val) => `${(val || 0).toLocaleString('vi-VN')} ₫`;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div
        className="modal-container"
        style={{ width: '560px', maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <TbCoins />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Xác Nhận Lệnh Giải Ngân Payout
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Mã lệnh: {payout.id}</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ position: 'static' }}>
            <TbX />
          </button>
        </div>

        <div style={{ padding: '1.5rem 0' }}>
          <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Chủ nhà thụ hưởng:</span>
              <strong style={{ color: '#0f172a' }}>{payout.host_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Ngân hàng thụ hưởng:</span>
              <strong style={{ color: '#0284c7' }}>{payout.bank_name} - {payout.account_number}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Tên tài khoản:</span>
              <strong style={{ color: '#0f172a' }}>{payout.account_holder}</strong>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '0.75rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Doanh thu phòng (Gross):</span>
              <span>{formatVND(payout.gross_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b' }}>Khấu trừ hoa hồng sàn (12%):</span>
              <span style={{ color: '#b91c1c' }}>- {formatVND(payout.commission_fee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#16a34a', paddingTop: '4px' }}>
              <span>Thực chuyển cho Host:</span>
              <span>{formatVND(payout.net_payout)}</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Mã giao dịch ngân hàng (Banking Ref Code) *
            </label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#0f172a' }}
              placeholder="VD: FT260822998811"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <button
            type="button"
            style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b' }}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            className="btn-admin-primary"
            style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
            onClick={() => {
              onConfirm(payout.id, transactionRef);
              onClose();
            }}
          >
            <TbCheck />
            <span>Xác Nhận Đã Chuyển Tiền</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default PayoutConfirmModal;
