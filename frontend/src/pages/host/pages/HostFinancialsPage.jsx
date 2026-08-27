import React, { useState } from 'react';
import {
  TbWallet,
  TbBuildingBank,
  TbShieldCheck,
  TbCoin,
  TbArrowRight,
  TbCheck,
  TbHistory,
} from 'react-icons/tb';
import { apiService } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export const HostFinancialsPage = ({
  bankInfo,
  setBankInfo,
  payoutHistory = [],
  availableBalance = 14500000,
  onRequestPayout,
  isRequestingPayout = false,
  currency = 'VND',
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [tempBank, setTempBank] = useState({ ...bankInfo });
  const [isSaving, setIsSaving] = useState(false);

  const formatPrice = (val) => {
    if (currency === 'USD') return `$${Math.round(val / 25000).toLocaleString()}`;
    return `${Number(val).toLocaleString('vi-VN')} ₫`;
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiService.updateHostPayoutAccount({
        bankName: tempBank.bankName,
        accountNumber: tempBank.accountNumber,
        accountHolderName: tempBank.accountHolder,
      });
      setBankInfo(tempBank);
      setIsEditing(false);
      toast.success('Thành công', res?.message || 'Đã lưu thông tin tài khoản ngân hàng nhận tiền.');
    } catch (err) {
      toast.error('Lỗi', err.message || 'Không thể cập nhật tài khoản ngân hàng.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
      {/* Left Column: Bank Account & Payout Controls */}
      <div className="host-panel-card" style={{ margin: 0 }}>
        <div className="host-panel-header">
          <h3 className="host-panel-title">
            <TbBuildingBank style={{ color: 'var(--host-emerald)' }} /> Tài Khoản Nhận Tiền (Payout)
          </h3>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--host-indigo)',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          {!isEditing ? (
            <div
              style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--host-radius-lg)',
                border: '1px solid var(--host-border-strong)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--host-text-muted)', fontSize: '0.85rem' }}>Ngân hàng:</span>
                <strong style={{ color: 'var(--host-text-main)' }}>{bankInfo.bankName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--host-text-muted)', fontSize: '0.85rem' }}>Số tài khoản:</span>
                <strong style={{ color: 'var(--host-text-main)', letterSpacing: '1px' }}>
                  {bankInfo.accountNumber}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--host-text-muted)', fontSize: '0.85rem' }}>Chủ tài khoản:</span>
                <strong style={{ color: 'var(--host-text-main)' }}>{bankInfo.accountHolder}</strong>
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: '#059669',
                  background: 'var(--host-emerald-soft)',
                  padding: '8px 12px',
                  borderRadius: 'var(--host-radius-md)',
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                <TbShieldCheck style={{ fontSize: '1.25rem', flexShrink: 0 }} />
                <span>Đã xác thực KYC & sẵn sàng nhận tiền tự động</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBank} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  value={tempBank.bankName}
                  onChange={(e) => setTempBank({ ...tempBank, bankName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--host-radius-sm)',
                    border: '1px solid var(--host-border-strong)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={tempBank.accountNumber}
                  onChange={(e) => setTempBank({ ...tempBank, accountNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--host-radius-sm)',
                    border: '1px solid var(--host-border-strong)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
                  Tên chủ thẻ (In hoa)
                </label>
                <input
                  type="text"
                  value={tempBank.accountHolder}
                  onChange={(e) => setTempBank({ ...tempBank, accountHolder: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--host-radius-sm)',
                    border: '1px solid var(--host-border-strong)',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                className="host-btn-primary"
                style={{ marginTop: '6px', justifyContent: 'center' }}
              >
                Lưu Thông Tin Tài Khoản
              </button>
            </form>
          )}

          {/* Instant Payout Action */}
          <div
            style={{
              marginTop: '1.5rem',
              borderTop: '1px solid var(--host-border-subtle)',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--host-text-muted)', display: 'block' }}>
                Số dư khả dụng
              </span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--host-emerald)', fontWeight: 900, whiteSpace: 'nowrap', display: 'block' }}>
                {formatPrice(availableBalance)}
              </strong>
            </div>

            <button
              type="button"
              className="host-btn-primary"
              style={{ background: 'var(--host-emerald)', whiteSpace: 'nowrap' }}
              disabled={isRequestingPayout}
              onClick={onRequestPayout}
            >
              {isRequestingPayout ? 'Đang chuyển tiền...' : 'Rút tiền ngay ➔'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Payout Transaction History */}
      <div className="host-panel-card" style={{ margin: 0 }}>
        <div className="host-panel-header">
          <h3 className="host-panel-title">
            <TbHistory style={{ color: 'var(--host-amber)' }} /> Lịch Sử Chi Trả Gần Đây
          </h3>
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {payoutHistory.map((po) => (
            <div
              key={po.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--host-radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--host-border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--host-text-main)' }}>
                  {po.note}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--host-text-muted)' }}>
                  Ngày {po.date} · #{po.id}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', marginLeft: '12px' }}>
                <strong style={{ color: '#059669', fontSize: '0.94rem', whiteSpace: 'nowrap', display: 'block' }}>
                  +{formatPrice(po.amount)}
                </strong>
                <span className="host-chip success" style={{ marginTop: '2px', display: 'inline-block' }}>
                  Thành công
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostFinancialsPage;
