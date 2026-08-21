import React, { useState } from 'react';
import { TbStar, TbEye, TbSearch, TbShieldCheck } from 'react-icons/tb';
import AdminPageHeader from '../common/AdminPageHeader';
import AdminTableWrapper from '../common/AdminTableWrapper';

export const HostsKycPage = ({ hosts, onOpenKycModal, onToggleSuperhost }) => {
  const [kycFilter, setKycFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const pendingCount = hosts.filter((h) => h.kyc_status === 'pending').length;

  const filtered = hosts.filter((h) => {
    if (kycFilter !== 'all' && h.kyc_status !== kycFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q) || h.display_name.toLowerCase().includes(q);
      const matchPhone = h.phone && h.phone.includes(q);
      const matchCard = h.id_card_number && h.id_card_number.includes(q);
      if (!matchName && !matchPhone && !matchCard) return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Header */}
      <AdminPageHeader
        title="Thẩm Định KYC & Đối Tác Chủ Nhà"
        subtitle={`Quản lý và phê duyệt hồ sơ pháp lý ${hosts.length} chủ nhà`}
        badge={pendingCount > 0 ? `${pendingCount} hồ sơ chờ duyệt` : null}
      />

      {/* Filter Bar */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
              placeholder="Tìm tên chủ nhà, SĐT, số CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', outline: 'none' }}
            />
          </div>

          <select
            className="admin-select-filter"
            value={kycFilter}
            onChange={(e) => { setKycFilter(e.target.value); setPage(1); }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="pending">Chờ thẩm định</option>
            <option value="verified">Đã xác minh</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTableWrapper
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        label="chủ nhà"
      >
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                  Không tìm thấy hồ sơ chủ nhà nào.
                </td>
              </tr>
            ) : (
              paginated.map((host) => (
                <tr key={host.id}>
                  {/* Host Name & Avatar */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={host.avatar}
                        alt={host.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '0.88rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px',
                          }}
                          title={host.name}
                        >
                          {host.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {host.display_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="td-nowrap">
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{host.phone}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{host.email}</div>
                  </td>

                  {/* ID */}
                  <td className="td-nowrap">
                    <span style={{ fontWeight: 700, color: '#0ea5e9', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                      {host.id_card_number}
                    </span>
                  </td>

                  {/* Bank */}
                  <td className="td-nowrap">
                    <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.84rem' }}>{host.bank_name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>STK: {host.account_number}</div>
                  </td>

                  {/* Rating */}
                  <td className="td-nowrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '0.84rem' }}>
                      <TbStar style={{ color: '#f59e0b' }} />
                      <span>{host.rating}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({host.reviews_count})</span>
                    </div>
                  </td>

                  {/* KYC Status */}
                  <td className="td-nowrap">
                    <span className={`status-pill ${host.kyc_status}`}>
                      {host.kyc_status === 'verified'
                        ? 'ĐÃ XÁC MINH'
                        : host.kyc_status === 'pending'
                        ? 'CHỜ DUYỆT'
                        : 'TỪ CHỐI'}
                    </span>
                  </td>

                  {/* Superhost */}
                  <td className="td-nowrap">
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      onClick={() => onToggleSuperhost(host.id)}
                      title="Bật/tắt huy hiệu Superhost"
                    >
                      <TbStar />
                      <span>{host.is_superhost ? 'Superhost' : 'Thường'}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div className="td-actions-group">
                      <button
                        className="btn-admin-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => onOpenKycModal(host)}
                      >
                        <TbEye />
                        <span>Soi Hồ Sơ</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminTableWrapper>
    </div>
  );
};

export default HostsKycPage;
