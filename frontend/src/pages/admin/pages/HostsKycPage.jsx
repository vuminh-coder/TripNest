import React, { useState } from 'react';
import './HostsKycPage.css';
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
    <div className="adm-hosts-kyc-container">
      {/* Header */}
      <AdminPageHeader
        title="Thẩm Định KYC & Đối Tác Chủ Nhà"
        subtitle={`Quản lý và phê duyệt hồ sơ pháp lý ${hosts.length} chủ nhà`}
        badge={pendingCount > 0 ? `${pendingCount} hồ sơ chờ duyệt` : null}
      />

      {/* Filter Bar */}
      <div className="admin-card-box adm-kyc-filter-box">
        <div className="adm-kyc-filter-bar">
          <div className="adm-kyc-search-wrap">
            <TbSearch className="adm-kyc-search-icon" />
            <input
              type="text"
              placeholder="Tìm tên chủ nhà, SĐT, số CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-kyc-search-input"
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
                <td colSpan="8" className="adm-kyc-empty-state">
                  Không tìm thấy hồ sơ chủ nhà nào.
                </td>
              </tr>
            ) : (
              paginated.map((host) => (
                <tr key={host.id}>
                  {/* Host Name & Avatar */}
                  <td>
                    <div className="adm-kyc-host-cell">
                      <img
                        src={host.avatar}
                        alt={host.name}
                        className="adm-kyc-avatar"
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          className="adm-kyc-name"
                          title={host.name}
                        >
                          {host.name}
                        </div>
                        <div className="adm-kyc-display-name">
                          {host.display_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="td-nowrap">
                    <div className="adm-kyc-phone">{host.phone}</div>
                    <div className="adm-kyc-email">{host.email}</div>
                  </td>

                  {/* ID */}
                  <td className="td-nowrap">
                    <span className="adm-kyc-idcard">
                      {host.id_card_number}
                    </span>
                  </td>

                  {/* Bank */}
                  <td className="td-nowrap">
                    <div className="adm-kyc-bank-name">{host.bank_name}</div>
                    <div className="adm-kyc-bank-acc">STK: {host.account_number}</div>
                  </td>

                  {/* Rating */}
                  <td className="td-nowrap">
                    <div className="adm-kyc-rating-wrap">
                      <TbStar className="adm-kyc-star-icon" />
                      <span>{host.rating}</span>
                      <span className="adm-kyc-reviews-sub">({host.reviews_count})</span>
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
                      className={`adm-kyc-superhost-btn ${host.is_superhost ? 'active' : 'inactive'}`}
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
                        className="btn-admin-primary adm-kyc-inspect-btn"
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
