import React from 'react';
import { TbCheck, TbX, TbMapPin, TbId, TbHome, TbCalendar } from 'react-icons/tb';

export const UserUpgradeCard = ({ user, onApprove, onReject }) => {
  const req = user.role_upgrade_request || {};

  return (
    <div className="admin-card-box" style={{ padding: '1.25rem', marginBottom: 0 }}>
      {/* Top row: applicant profile + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={user.avatar}
            alt={user.name}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--adm-border)' }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--adm-text-main)' }}>{user.name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--adm-text-muted)' }}>{user.email} • {user.phone || 'Chưa có SĐT'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.74rem', fontWeight: 800, padding: '3px 8px', borderRadius: '999px' }}>
            ĐƠN XIN LÀM HOST
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.request_date}</span>
        </div>
      </div>

      {/* Details Box */}
      <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #edf2f7', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <TbId style={{ color: '#0ea5e9', fontSize: '1rem' }} />
            <span>CCCD: <strong style={{ fontFamily: 'monospace' }}>{user.id_card_number || 'Chưa cập nhật'}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <TbMapPin style={{ color: '#ff385c', fontSize: '1rem' }} />
            <span>Địa chỉ: <strong>{user.address || 'Chưa cập nhật'}</strong></span>
          </div>

          {req.property_type && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
              <TbHome style={{ color: '#10b981', fontSize: '1rem' }} />
              <span>Loại hình BĐS: <strong>{req.property_type}</strong></span>
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45, borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
          <strong>Lý do & Đề xuất kinh doanh:</strong> "{req.reason || 'Tôi muốn tham gia kinh doanh phòng nghỉ trên hệ thống TripNest.'}"
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onReject(user)}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            border: '1px solid #fee2e2',
            background: '#fee2e2',
            color: '#dc2626',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <TbX /> Từ Chối
        </button>

        <button
          type="button"
          onClick={() => onApprove(user)}
          className="btn-admin-primary"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          }}
        >
          <TbCheck /> Phê Duyệt Làm Host
        </button>
      </div>
    </div>
  );
};

export default UserUpgradeCard;
