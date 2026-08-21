import React, { useState } from 'react';
import Pagination from '../Pagination';
import {
  TbStar,
  TbBuildingBank,
  TbEye,
  TbSearch,
  TbShieldCheck,
} from 'react-icons/tb';

export const HostsKycTab = ({ hosts, onOpenKycModal, onToggleSuperhost }) => {
  const [kycFilter, setKycFilter] = useState('all');
  const [searchHost, setSearchHost] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = hosts.filter((h) => {
    if (kycFilter !== 'all' && h.kyc_status !== kycFilter) return false;
    if (searchHost.trim()) {
      const q = searchHost.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q) || h.display_name.toLowerCase().includes(q);
      const matchPhone = h.phone.includes(q);
      const matchCard = h.id_card_number.includes(q);
      if (!matchName && !matchPhone && !matchCard) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>Phê Duyệt KYC & Chủ Nhà</h1>
          <p>Thẩm định {hosts.length} hồ sơ đối tác</p>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.45rem 0.85rem', flex: 1, minWidth: '220px' }}>
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tên chủ nhà, SĐT, số CCCD..."
              value={searchHost}
              onChange={(e) => setSearchHost(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem' }}
            />
          </div>

          <select
            className="admin-select-filter"
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="pending">Chờ thẩm định</option>
            <option value="verified">Đã xác minh</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card-box">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Chủ Nhà</th>
                <th>Liên Hệ</th>
                <th>Số CCCD</th>
                <th>Tài Khoản Payouts</th>
                <th>Đánh Giá</th>
                <th>Trạng Thái KYC</th>
                <th>Superhost</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Không có chủ nhà nào.
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * pageSize, page * pageSize).map((host) => (
                  <tr key={host.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={host.avatar}
                          alt={host.name}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{host.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{host.display_name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{host.phone}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{host.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0ea5e9', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                        {host.id_card_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.84rem' }}>{host.bank_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>STK: {host.account_number}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '0.84rem' }}>
                        <TbStar style={{ color: '#f59e0b' }} />
                        <span>{host.rating}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({host.reviews_count})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${host.kyc_status}`}>
                        {host.kyc_status === 'verified'
                          ? 'ĐÃ XÁC MINH'
                          : host.kyc_status === 'pending'
                          ? 'CHỜ DUYỆT'
                          : 'TỪ CHỐI'}
                      </span>
                    </td>
                    <td>
                      <button
                        style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          border: host.is_superhost ? '1px solid #fde68a' : '1px solid #edf2f7',
                          background: host.is_superhost ? '#fffbeb' : '#f8fafc',
                          color: host.is_superhost ? '#d97706' : '#64748b',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        onClick={() => onToggleSuperhost(host.id)}
                        title="Bật/tắt Superhost"
                      >
                        <TbStar />
                        <span>{host.is_superhost ? 'Superhost' : 'Thường'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-admin-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => onOpenKycModal(host)}
                      >
                        <TbEye />
                        <span>Soi Hồ Sơ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / pageSize)}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          label="chủ nhà"
        />
      </div>
    </div>
  );
};
export default HostsKycTab;
