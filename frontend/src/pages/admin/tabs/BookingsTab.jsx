import { TbSearch, TbEye, TbBan, TbCheck, TbCalendar } from 'react-icons/tb';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';

export const BookingsTab = ({ bookings, onOpenDetailModal, onUpdateStatus }) => {
  const confirm = useConfirm();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchCode, setSearchCode] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const formatVND = (val) => `${(val || 0).toLocaleString()} ₫`;

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchCode.trim()) {
      const q = searchCode.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchGuest = b.guest_name.toLowerCase().includes(q);
      const matchPhone = b.guest_phone && b.guest_phone.includes(q);
      const matchRoom = b.room_name.toLowerCase().includes(q);
      if (!matchId && !matchGuest && !matchPhone && !matchRoom) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header-row">
        <div className="page-title-group">
          <h1>Đơn Đặt Phòng</h1>
          <p>{bookings.length} giao dịch trên hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card-box" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="admin-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.45rem 0.85rem', flex: 1, minWidth: '220px' }}>
            <TbSearch style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm mã TN-XXXXXX, tên khách, SĐT..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem' }}
            />
          </div>

          <select
            className="admin-select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-card-box">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Chỗ Ở</th>
                <th>Lịch Trình</th>
                <th>Tổng Tiền</th>
                <th>Thanh Toán</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Không tìm thấy đơn đặt phòng nào.
                  </td>
                </tr>
              ) : (
                filtered.slice((page - 1) * pageSize, page * pageSize).map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>#{b.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.guest_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{b.guest_phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>
                        {b.room_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#0ea5e9' }}>Host: {b.host_name}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TbCalendar style={{ color: '#64748b' }} />
                        <span>{b.check_in} ➔ {b.check_out}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.nights} đêm • {b.guests_count} khách</div>
                    </td>
                    <td>
                      <strong style={{ color: '#ff385c', fontSize: '0.9rem' }}>
                        {formatVND(b.total_price)}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill ${b.payment_status}`} style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                        {b.payment_method}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-action-icon"
                          title="Chi tiết hóa đơn"
                          onClick={() => onOpenDetailModal(b)}
                        >
                          <TbEye />
                        </button>
                        {b.status === 'pending' && (
                          <button
                            className="btn-action-icon success"
                            title="Duyệt đơn"
                            onClick={() => onUpdateStatus(b.id, 'confirmed')}
                          >
                            <TbCheck />
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            className="btn-action-icon danger"
                            title="Hủy đơn"
                            onClick={async () => {
                              const isConfirmed = await confirm({
                                title: 'Hủy đơn đặt phòng?',
                                message: `Bạn có chắc chắn muốn hủy đơn đặt phòng mã ${b.id}?`,
                                type: 'danger',
                                confirmText: 'Xác nhận hủy',
                                cancelText: 'Đóng',
                              });
                              if (isConfirmed) {
                                onUpdateStatus(b.id, 'cancelled', 'Hủy bởi Admin');
                                toast.info('Hủy đơn đặt phòng', `Đã hủy đơn ${b.id}.`);
                              }
                            }}
                          >
                            <TbBan />
                          </button>
                        )}
                      </div>
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
          label="đơn"
        />
      </div>
    </div>
  );
};
export default BookingsTab;
