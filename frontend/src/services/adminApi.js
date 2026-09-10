// Admin API & State Service for TripNest Admin Portal
import { initialAdminData } from './adminMockData';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://tripnest-api.vercel.app/api'
    : 'http://127.0.0.1:8000/api');

const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
    token = user?.token;
  }
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const adminFetch = async (url, options = {}) => {
  let headers = { ...getAuthHeaders(), ...options.headers };
  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw err;
  }

  // Tự động làm mới hoặc xác thực lại nếu nhận mã 401 Unauthenticated trong môi trường cục bộ
  if (res.status === 401 && (API_BASE_URL.includes('127.0.0.1') || API_BASE_URL.includes('localhost'))) {
    try {
      const relogin = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'admin@tripnest.vn', password: '123456' }),
      });
      if (relogin.ok) {
        const authData = await relogin.json();
        if (authData.token) {
          localStorage.setItem('token', authData.token);
          if (authData.user) localStorage.setItem('tripnest_user', JSON.stringify(authData.user));
          headers.Authorization = `Bearer ${authData.token}`;
          res = await fetch(url, { ...options, headers });
        }
      }
    } catch {
      // Bỏ qua lỗi ngầm
    }
  }
  return res;
};

const STORAGE_KEY = 'tripnest_admin_data_v1';

const isAdminAuthorized = () => {
  try {
    const user = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
    const token = localStorage.getItem('token') || user?.token;
    if (token && user?.role === 'admin') return true;
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
};

const getStoredData = () => {
  // BẢO MẬT: Chặn rò rỉ dữ liệu mock admin nếu người dùng không phải Quản trị viên (Admin)
  if (!isAdminAuthorized()) {
    return {
      stats: {},
      accommodations: [],
      bookings: [],
      hosts: [],
      users: [],
      categories: [],
      amenities: [],
      reviews: [],
      payouts: [],
      experiences: [],
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAdminData));
      return initialAdminData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initialAdminData;
  }
};

const saveStoredData = (data) => {
  if (!isAdminAuthorized()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist admin data', e);
  }
};

export const adminService = {
  // Reset demo data
  resetDemoData() {
    saveStoredData(initialAdminData);
    return initialAdminData;
  },

  // ==========================================
  // 1. Dashboard & Thống kê
  // ==========================================
  async getDashboardStats() {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/financials/stats`);
      if (response.ok) {
        const statsData = await response.json();
        return {
          totalRevenueVND: statsData.totalRevenueVND || 0,
          commissionRevenueVND: statsData.commissionRevenueVND || 0,
          hostNetEarningsVND: statsData.hostNetEarningsVND || 0,
          escrowPendingVND: statsData.escrowPendingVND || 0,
          payoutsCompletedVND: statsData.payoutsCompletedVND || 0,
          pendingPayoutsCount: statsData.pendingPayoutsCount || 0,
          completedPayoutsCount: statsData.completedPayoutsCount || 0,
          cancelledPayoutsCount: statsData.cancelledPayoutsCount || 0,
          totalRefundedVND: statsData.totalRefundedVND || 0,
          cancelledBookingsCount: statsData.cancelledBookingsCount || 0,
          validBookingsCount: statsData.validBookingsCount || (statsData.totalBookings - statsData.cancelledBookingsCount) || 0,
          totalBookings: statsData.totalBookings || statsData.totalBookingsCount || 0,
          completedBookings: statsData.completedBookings || 0,
          pendingKycCount: statsData.pendingKycCount !== undefined ? statsData.pendingKycCount : 0,
          growthRatePercent: statsData.growthRatePercent || 14.8,
          occupancyRate: statsData.occupancyRate || 82,
        };
      }
    } catch (e) {
      console.warn('Failed to fetch admin stats from backend, fallback', e);
    }
    const data = getStoredData() || {};
    const bookings = data.bookings || [];
    const hosts = data.hosts || [];
    const stats = data.stats || {};

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b?.status === 'completed').length;
    const cancelledList = bookings.filter((b) => b?.status === 'cancelled' || b?.status === 'refunded');
    const validList = bookings.filter((b) => b?.status !== 'cancelled' && b?.status !== 'refunded');
    const totalRev = validList.reduce((sum, b) => sum + (b?.total_price || 0), 0);
    const totalRefunded = cancelledList.reduce((sum, b) => sum + (b?.refund_amount || b?.refundAmount || 0), 0);
    const commission = Math.round(totalRev * 0.12);
    const pendingKyc = hosts.filter((h) => h?.kyc_status === 'pending').length;

    return {
      ...stats,
      totalRevenueVND: totalRev > 0 ? totalRev : (stats.totalRevenueVND || 0),
      commissionRevenueVND: commission > 0 ? commission : (stats.commissionRevenueVND || 0),
      totalRefundedVND: totalRefunded > 0 ? totalRefunded : (stats.totalRefundedVND || 0),
      cancelledBookingsCount: cancelledList.length > 0 ? cancelledList.length : (stats.cancelledBookingsCount || 0),
      validBookingsCount: validList.length > 0 ? validList.length : (stats.validBookingsCount || 0),
      totalBookings: totalBookings > 0 ? totalBookings : (stats.totalBookings || 0),
      completedBookings: completedBookings > 0 ? completedBookings : (stats.completedBookings || 0),
      pendingKycCount: pendingKyc > 0 ? pendingKyc : (stats.pendingKycCount || 0),
    };
  },

  // ==========================================
  // 2. Cơ sở lưu trú (Accommodations)
  // ==========================================
  async getAccommodations() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/accommodations`);
      if (res.ok) {
        const json = await res.json();
        const accs = json.accommodations || json.data || [];
        if (Array.isArray(accs) && accs.length > 0) {
          return accs;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch admin accommodations from backend, fallback to local', e);
    }
    const data = getStoredData();
    return data.accommodations || [];
  },

  async getAccommodationAdmin() {
    return this.getAccommodations();
  },

  async updateAccommodationStatus(id, newStatus) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/accommodations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        return await this.getAccommodations();
      }
    } catch (e) {
      console.warn('Backend update accommodation status failed:', e);
    }

    const data = getStoredData();
    data.accommodations = data.accommodations.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    saveStoredData(data);
    return data.accommodations;
  },

  async toggleAccommodationFlag(id, flagName) {
    try {
      if (flagName === 'is_featured') {
        const res = await adminFetch(`${API_BASE_URL}/admin/accommodations/${id}/featured`, {
          method: 'PATCH',
        });
        if (res.ok) {
          return await this.getAccommodations();
        }
      }
    } catch (e) {
      console.warn('Backend toggle accommodation flag failed:', e);
    }

    const data = getStoredData();
    data.accommodations = data.accommodations.map((item) => {
      if (item.id === id) {
        return { ...item, [flagName]: !item[flagName] };
      }
      return item;
    });
    saveStoredData(data);
    return data.accommodations;
  },

  async saveAccommodation(accData) {
    try {
      if (accData.id) {
        const res = await adminFetch(`${API_BASE_URL}/admin/accommodations/${accData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accData),
        });
        if (res.ok) {
          return await this.getAccommodations();
        }
      }
    } catch (e) {
      console.warn('Backend save accommodation failed:', e);
    }

    const data = getStoredData();
    if (accData.id) {
      data.accommodations = data.accommodations.map((item) =>
        item.id === accData.id ? { ...item, ...accData } : item
      );
    } else {
      const newAcc = {
        ...accData,
        id: Date.now(),
        rating: 5.0,
        reviewsCount: 0,
        status: 'published',
        created_at: new Date().toISOString().split('T')[0],
      };
      data.accommodations.unshift(newAcc);
    }
    saveStoredData(data);
    return data.accommodations;
  },

  async deleteAccommodation(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/accommodations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await this.getAccommodations();
      }
    } catch (e) {
      console.warn('Backend delete accommodation failed:', e);
    }

    const data = getStoredData();
    data.accommodations = data.accommodations.filter((item) => item.id !== id);
    saveStoredData(data);
    return data.accommodations;
  },

  // ==========================================
  // 3. Đơn đặt phòng (Bookings)
  // ==========================================
  async getBookings() {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/bookings`);
      if (response.ok) {
        const result = await response.json();
        const list = result.data || result.bookings || (Array.isArray(result) ? result : []);
        if (Array.isArray(list)) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch bookings from backend', e);
    }
    const data = getStoredData();
    return data.bookings || [];
  },

  async updateBookingStatus(bookingId, newStatus, reason = '') {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (res.ok) {
        return await this.getBookings();
      }
    } catch (e) {
      console.warn('Sync booking status to backend failed:', e);
    }

    const data = getStoredData();
    data.bookings = (data.bookings || []).map((item) => {
      if (item.id === bookingId || item.code === bookingId) {
        return {
          ...item,
          status: newStatus,
          cancellation_reason: reason || item.cancellation_reason,
          cancelled_at: newStatus === 'cancelled' ? new Date().toISOString() : item.cancelled_at,
          payment_status: newStatus === 'cancelled' ? 'refunded' : item.payment_status,
        };
      }
      return item;
    });

    if (newStatus === 'cancelled') {
      if (data.payouts && Array.isArray(data.payouts)) {
        data.payouts = data.payouts.map((p) =>
          (p.booking_code === bookingId || p.bookingCode === bookingId || p.note?.includes(bookingId))
            ? { ...p, status: 'cancelled' }
            : p
        );
      }
      const validBookings = (data.bookings || []).filter((b) => b.status !== 'cancelled' && b.status !== 'refunded');
      const totalRev = validBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const cancelledList = (data.bookings || []).filter((b) => b.status === 'cancelled' || b.status === 'refunded');
      const totalRefunded = cancelledList.reduce((sum, b) => sum + (b.refund_amount || b.refundAmount || 0), 0);
      data.stats = {
        ...data.stats,
        totalRevenueVND: totalRev,
        commissionRevenueVND: Math.round(totalRev * 0.12),
        totalRefundedVND: totalRefunded,
        cancelledBookingsCount: cancelledList.length,
      };
    }

    saveStoredData(data);
    return await this.getBookings();
  },

  // ==========================================
  // 4. KYC & Đối tác Chủ nhà (Hosts)
  // ==========================================
  async getHosts() {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/hosts`);
      if (response.ok) {
        const result = await response.json();
        const list = result.data || result.hosts || (Array.isArray(result) ? result : []);
        if (Array.isArray(list)) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch hosts from backend', e);
    }
    const data = getStoredData();
    return data.hosts || [];
  },

  async updateKycStatus(hostId, status, rejectionReason = '') {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/hosts/${hostId}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          kyc_status: status,
          rejection_reason: rejectionReason,
        }),
      });
      if (res.ok) {
        return await this.getHosts();
      }
    } catch (e) {
      console.warn('Backend update KYC status failed:', e);
    }

    const data = getStoredData();
    data.hosts = data.hosts.map((h) => {
      if (h.id === hostId) {
        return {
          ...h,
          kyc_status: status,
          kyc_rejection_reason: rejectionReason,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
        };
      }
      return h;
    });
    saveStoredData(data);
    return data.hosts;
  },

  async toggleSuperhost(hostId) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/hosts/${hostId}/superhost`, {
        method: 'PATCH',
      });
      if (res.ok) {
        return await this.getHosts();
      }
    } catch (e) {
      console.warn('Backend toggle superhost failed:', e);
    }

    const data = getStoredData();
    data.hosts = data.hosts.map((h) => {
      if (h.id === hostId) {
        return { ...h, is_superhost: !h.is_superhost };
      }
      return h;
    });
    saveStoredData(data);
    return data.hosts;
  },

  // ==========================================
  // 5. Người dùng & Tài khoản (Users)
  // ==========================================
  async getUsers() {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/users`);
      if (response.ok) {
        const result = await response.json();
        const list = result.data || result.users || (Array.isArray(result) ? result : []);
        if (Array.isArray(list)) {
          const data = getStoredData();
          data.users = list;
          saveStoredData(data);
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch users from backend, fallback to local store', e);
    }
    const data = getStoredData();
    return data.users || [];
  },

  async saveUser(userData) {
    try {
      if (userData.id) {
        const formData = new FormData();
        formData.append('full_name', userData.name || userData.full_name || '');
        formData.append('email', userData.email || '');
        formData.append('phone_number', userData.phone || userData.phone_number || '');
        formData.append('role', userData.role || 'guest');
        formData.append('status', userData.status || 'active');

        const res = await adminFetch(`${API_BASE_URL}/admin/users/${userData.id}/update`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          return await this.getUsers();
        }
      } else {
        const formData = new FormData();
        formData.append('full_name', userData.name || userData.full_name || '');
        formData.append('email', userData.email || '');
        formData.append('password', userData.password || 'TripNest@2026');
        formData.append('phone_number', userData.phone || userData.phone_number || '');
        formData.append('role', userData.role || 'guest');
        formData.append('status', userData.status || 'active');

        const res = await adminFetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          return await this.getUsers();
        }
      }
    } catch (e) {
      console.warn('Backend save user failed:', e);
    }

    const data = getStoredData();
    if (userData.id) {
      data.users = data.users.map((u) =>
        u.id === userData.id ? { ...u, ...userData } : u
      );
    } else {
      data.users.unshift(userData);
    }
    saveStoredData(data);
    return data.users;
  },

  async deleteUser(userId) {
    const targetId = typeof userId === 'object' ? userId.id : userId;
    const email = typeof userId === 'object' ? userId.email : userId;

    const response = await adminFetch(`${API_BASE_URL}/admin/users/${targetId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Không thể xóa người dùng.');
    }

    const data = getStoredData();
    data.users = data.users.filter((u) => u.id !== targetId && u.email !== email);
    saveStoredData(data);
    return data.users;
  },

  async toggleUserStatus(user) {
    const userId = typeof user === 'object' ? user.id : user;
    const targetUser = typeof user === 'object' ? user : getStoredData().users.find((u) => u.id === userId);
    const newStatus = targetUser?.status === 'active' ? 'banned' : 'active';

    if (targetUser) {
      const formData = new FormData();
      formData.append('full_name', targetUser.name);
      formData.append('email', targetUser.email);
      formData.append('role', targetUser.role || 'guest');
      formData.append('status', newStatus);

      const response = await adminFetch(`${API_BASE_URL}/admin/users/${userId}/update`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Không thể cập nhật trạng thái người dùng.');
      }
    }

    const data = getStoredData();
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: newStatus };
      }
      return u;
    });
    saveStoredData(data);
    return data.users;
  },

  async updateUserRole(userId, newRole) {
    try {
      const users = await this.getUsers();
      const user = users.find((u) => u.id === userId);
      if (user) {
        const formData = new FormData();
        formData.append('full_name', user.name || user.full_name || '');
        formData.append('email', user.email || '');
        formData.append('phone_number', user.phone || user.phone_number || '');
        formData.append('role', newRole);
        formData.append('status', user.status || 'active');

        const res = await adminFetch(`${API_BASE_URL}/admin/users/${userId}/update`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          return await this.getUsers();
        }
      }
    } catch (e) {
      console.warn('Backend update user role failed:', e);
    }

    const data = getStoredData();
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    saveStoredData(data);
    return data.users;
  },

  async approveRoleUpgrade(userId, approved, rejectionReason = '') {
    try {
      const endpoint = approved
        ? `${API_BASE_URL}/admin/users/${userId}/approve-host`
        : `${API_BASE_URL}/admin/users/${userId}/reject-host`;
      const res = await adminFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (res.ok) {
        const [uList, hList] = await Promise.all([this.getUsers(), this.getHosts()]);
        return { users: uList, hosts: hList };
      }
    } catch (e) {
      console.warn('Backend approve role upgrade failed:', e);
    }

    const data = getStoredData();
    let targetUser = null;
    data.users = data.users.map((u) => {
      if (u.id === userId) {
        if (approved) {
          const reqRole = u.role_upgrade_request?.requested_role || 'host';
          targetUser = {
            ...u,
            role: reqRole,
            role_upgrade_request: {
              ...u.role_upgrade_request,
              status: 'approved',
              approved_at: new Date().toISOString(),
            },
          };
          return targetUser;
        } else {
          return {
            ...u,
            role_upgrade_request: {
              ...u.role_upgrade_request,
              status: 'rejected',
              rejection_reason: rejectionReason || 'Hồ sơ chưa đạt tiêu chuẩn',
              rejected_at: new Date().toISOString(),
            },
          };
        }
      }
      return u;
    });

    if (approved && targetUser && targetUser.role === 'host') {
      const hostExists = data.hosts.some((h) => h.id === targetUser.id || h.email === targetUser.email);
      if (!hostExists) {
        data.hosts.unshift({
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          phone: targetUser.phone || 'Chưa có SĐT',
          display_name: targetUser.name + ' Stay',
          avatar: targetUser.avatar,
          id_card_number: targetUser.id_card_number || '00109' + Date.now().toString().slice(-7),
          id_card_front: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          id_card_back: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
          kyc_status: 'verified',
          is_superhost: false,
          rating: 5.0,
          reviews_count: 0,
          bank_name: 'Vietcombank',
          account_number: '10' + Date.now().toString().slice(-8),
          account_holder: targetUser.name.toUpperCase(),
          properties_count: 1,
          joined_date: new Date().toISOString().split('T')[0],
        });
      }
    }

    saveStoredData(data);
    return { users: data.users, hosts: data.hosts };
  },

  // ==========================================
  // 6. Tài chính & Giải ngân (Payouts)
  // ==========================================
  async getPayouts() {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/payouts`);
      if (response.ok) {
        const result = await response.json();
        const list = Array.isArray(result) ? result : (result.data || result.payouts || []);
        if (Array.isArray(list)) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch payouts from backend', e);
    }
    const data = getStoredData();
    return data.payouts || [];
  },

  async completePayout(payoutId, transactionRef) {
    const ref = transactionRef || 'FT' + Date.now();
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionRef: ref }),
      });
      if (response.ok) {
        return await this.getPayouts();
      }
    } catch (e) {
      console.warn('Backend payout approval failed, updating local store:', e);
    }

    const data = getStoredData();
    let approvedPayout = null;
    data.payouts = data.payouts.map((p) => {
      if (p.id === payoutId) {
        approvedPayout = {
          ...p,
          status: 'completed',
          transaction_ref: ref,
          transferred_at: new Date().toISOString(),
        };
        return approvedPayout;
      }
      return p;
    });
    saveStoredData(data);

    // 1. Asynchronously update backend CSDL
    try {
      fetch(`${API_BASE_URL}/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactionRef: ref }),
      }).catch(() => { });
    } catch {
      // ignore
    }

    // 2. Đồng bộ sang Host Payout History (tripnest_host_payout_history)
    if (approvedPayout) {
      try {
        const hostHistory = JSON.parse(localStorage.getItem('tripnest_host_payout_history') || '[]');
        const hostItem = {
          id: approvedPayout.id,
          date: new Date().toLocaleDateString('vi-VN'),
          amount: approvedPayout.net_payout,
          note: `Chuyển khoản ${approvedPayout.bank_name || 'Ngân hàng'} (Đơn ${approvedPayout.booking_code || approvedPayout.id})`,
          status: 'completed',
          ref: approvedPayout.transaction_ref,
        };
        const filtered = hostHistory.filter((h) => h.id !== approvedPayout.id && h.note !== hostItem.note);
        localStorage.setItem('tripnest_host_payout_history', JSON.stringify([hostItem, ...filtered]));
      } catch (e) {
        console.warn('Sync to host payout history failed', e);
      }
    }

    return data.payouts;
  },

  // ==========================================
  // 7. Đánh giá Radar (Reviews)
  // ==========================================
  async getReviews(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      const url = `${API_BASE_URL}/admin/reviews${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await adminFetch(url);
      if (response.ok) {
        const result = await response.json();
        const list = result.reviews || result.data || (Array.isArray(result) ? result : []);
        if (Array.isArray(list)) {
          const data = getStoredData();
          data.reviews = list;
          saveStoredData(data);
          return list;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch reviews from backend, fallback to local store', e);
    }
    const data = getStoredData();
    return data.reviews || [];
  },

  async updateReviewStatus(reviewId, status) {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/reviews/${reviewId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('Update review status server error:', errData);
      }
    } catch (e) {
      console.warn('Failed to update review status on server:', e);
    }

    const data = getStoredData();
    data.reviews = (data.reviews || []).map((r) => {
      if (r.id === reviewId) {
        return { ...r, status };
      }
      return r;
    });
    saveStoredData(data);
    return data.reviews;
  },

  async deleteReview(reviewId) {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể xóa đánh giá.');
      }
    } catch (e) {
      console.warn('Failed to delete review on server:', e);
    }

    const data = getStoredData();
    data.reviews = (data.reviews || []).filter((r) => r.id !== reviewId);
    saveStoredData(data);
    return data.reviews;
  },

  async respondToReview(reviewId, hostResponse) {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_response: hostResponse }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Không thể gửi phản hồi.');
      }
    } catch (e) {
      console.warn('Failed to respond to review on server:', e);
    }

    const data = getStoredData();
    data.reviews = (data.reviews || []).map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          host_response: hostResponse,
          host_responded_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      }
      return r;
    });
    saveStoredData(data);
    return data.reviews;
  },

  // ==========================================
  // 8. Danh mục & Tiện nghi (Categories & Amenities)
  // ==========================================
  async getCategories() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/categories`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Backend get admin categories failed:', e);
    }
    const data = getStoredData();
    return data.categories || [];
  },

  async createCategory(category) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        return await this.getCategories();
      }
    } catch (e) {
      console.warn('Backend create category failed:', e);
    }

    const data = getStoredData();
    const newCat = {
      id: Date.now(),
      slug: category.slug || ('cat_' + Date.now()),
      label_vi: category.label_vi,
      label_en: category.label_en || category.label_vi,
      icon: category.icon || 'TbHome',
      description: category.description || '',
      display_order: Number(category.display_order || 0),
      is_active: true,
      accommodations_count: 0,
    };
    data.categories = [...(data.categories || []), newCat];
    saveStoredData(data);
    return data.categories;
  },

  async updateCategory(id, category) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        return await this.getCategories();
      }
    } catch (e) {
      console.warn('Backend update category failed:', e);
    }

    const data = getStoredData();
    data.categories = (data.categories || []).map((c) => {
      if (c.id === id || c.slug === id) {
        return { ...c, ...category };
      }
      return c;
    });
    saveStoredData(data);
    return data.categories;
  },

  async deleteCategory(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await this.getCategories();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể xóa danh mục.');
      }
    } catch (e) {
      console.warn('Backend delete category failed:', e);
      throw e;
    }
  },

  async toggleCategoryActive(slugOrId) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/categories/${slugOrId}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        return await this.getCategories();
      }
    } catch (e) {
      console.warn('Backend toggle category active failed:', e);
    }

    const data = getStoredData();
    data.categories = data.categories.map((c) => {
      if (c.slug === slugOrId || c.id === slugOrId) {
        return { ...c, is_active: !c.is_active };
      }
      return c;
    });
    saveStoredData(data);
    return data.categories;
  },

  async getAmenities() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/amenities`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json.amenities || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Backend get amenities failed:', e);
    }
    const data = getStoredData();
    return data.amenities || [];
  },

  async addAmenity(amenity) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/amenities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenity),
      });
      if (res.ok) {
        return await this.getAmenities();
      }
    } catch (e) {
      console.warn('Backend add amenity failed:', e);
    }

    const data = getStoredData();
    data.amenities.push(amenity);
    saveStoredData(data);
    return data.amenities;
  },

  async deleteAmenity(id) {
    try {
      await adminFetch(`${API_BASE_URL}/admin/amenities/${id}`, {
        method: 'DELETE',
      });
      return await this.getAmenities();
    } catch (e) {
      console.warn('Backend delete amenity failed:', e);
    }
    const data = getStoredData();
    data.amenities = data.amenities.filter((a) => a.id !== id && a.code !== id);
    saveStoredData(data);
    return data.amenities;
  },
  // ==========================================
  // 9. Tour Trải nghiệm (Experiences)
  // ==========================================
  async getExperiences() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/experiences`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Backend get experiences failed:', e);
    }
    const data = getStoredData();
    return data.experiences || [];
  },

  async createExperience(payload) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await this.getExperiences();
      }
    } catch (e) {
      console.warn('Backend create experience failed:', e);
    }

    const data = getStoredData();
    const newExp = {
      id: Date.now(),
      title: payload.title_vi || payload.title,
      title_vi: payload.title_vi || payload.title,
      city: payload.city,
      caption: payload.caption || 'Trải nghiệm du lịch khám phá',
      description: payload.description || '',
      price: Number(payload.price || payload.price_per_person || 500000),
      price_per_person: Number(payload.price || payload.price_per_person || 500000),
      priceVND: Number(payload.price || payload.price_per_person || 500000),
      duration_hours: Number(payload.duration_hours || 3),
      image: payload.image_url || payload.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      image_url: payload.image_url || payload.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      rating: 5.0,
      reviews_count: 0,
      is_active: true,
      status: 'active',
      host: payload.host || {
        id: 1,
        name: 'Chủ tour địa phương',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        is_superhost: true,
        kyc_status: 'verified',
      },
    };
    data.experiences = [newExp, ...(data.experiences || [])];
    saveStoredData(data);
    return data.experiences;
  },

  async updateExperience(id, payload) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/experiences/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await this.getExperiences();
      }
    } catch (e) {
      console.warn('Backend update experience failed:', e);
    }

    const data = getStoredData();
    data.experiences = (data.experiences || []).map((exp) => {
      if (exp.id === id) {
        return {
          ...exp,
          ...payload,
          title: payload.title_vi || payload.title || exp.title,
          title_vi: payload.title_vi || payload.title || exp.title_vi,
          price: payload.price !== undefined ? Number(payload.price) : exp.price,
          price_per_person: payload.price !== undefined ? Number(payload.price) : exp.price_per_person,
          priceVND: payload.price !== undefined ? Number(payload.price) : exp.priceVND,
          image: payload.image_url || payload.image || exp.image,
          image_url: payload.image_url || payload.image || exp.image_url,
        };
      }
      return exp;
    });
    saveStoredData(data);
    return data.experiences;
  },

  async toggleExperienceActive(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/experiences/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        return await this.getExperiences();
      }
    } catch (e) {
      console.warn('Backend toggle experience failed:', e);
    }

    const data = getStoredData();
    data.experiences = data.experiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, is_active: !exp.is_active, status: !exp.is_active ? 'active' : 'inactive' };
      }
      return exp;
    });
    saveStoredData(data);
    return data.experiences;
  },

  async deleteExperience(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/experiences/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await this.getExperiences();
      }
    } catch (e) {
      console.warn('Backend delete experience failed:', e);
    }

    const data = getStoredData();
    data.experiences = (data.experiences || []).filter((exp) => exp.id !== id);
    saveStoredData(data);
    return data.experiences;
  },

  // ==========================================
  // 10. Quản lý Mã giảm giá (Vouchers)
  // ==========================================
  async getVouchers() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/vouchers`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list)) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Backend get vouchers failed:', e);
    }
    return [];
  },

  async saveVoucher(voucherData) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async toggleVoucherActive(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/vouchers/${id}/toggle`, {
        method: 'PATCH',
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async deleteVoucher(id) {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/vouchers/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // ==========================================
  // 11. Quản lý Dòng Tiền & Phân Tích Doanh Thu
  // ==========================================
  async getCashflowTimeline(period = 'month', options = {}) {
    const queryParams = new URLSearchParams({
      period,
      year: options.year || new Date().getFullYear(),
      ...(options.quarter ? { quarter: options.quarter } : {}),
      ...(options.month ? { month: options.month } : {}),
    });

    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/financials/timeline?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.timeline || json.data) {
          return json.data || json;
        }
      }
    } catch (e) {
      console.warn('Backend get cashflow timeline failed, falling back to local calculation:', e);
    }

    // Fallback: Local calculation from stored bookings & payouts (with realistic baseline if empty)
    const data = getStoredData();
    const bookings = data.bookings || [];
    const validBookings = bookings.filter((b) => b?.status !== 'cancelled' && b?.status !== 'refunded');
    const cancelledBookings = bookings.filter((b) => b?.status === 'cancelled' || b?.status === 'refunded');

    const rawGmv = validBookings.reduce((sum, b) => sum + (Number(b?.total_price) || 0), 0);
    const totalGmv = rawGmv;
    const platformFee = Math.round(totalGmv * 0.12);
    const hostNet = totalGmv - platformFee;
    const rawCompletedPayouts = (data.payouts || [])
      .filter((p) => p?.status === 'completed' || p?.status === 'paid')
      .reduce((sum, p) => sum + (Number(p?.amount) || Number(p?.net_payout) || 0), 0);
    const completedPayouts = rawCompletedPayouts;
    const escrowPending = Math.max(hostNet - completedPayouts, 0);
    const rawRefunded = cancelledBookings.reduce(
      (sum, b) => sum + (Number(b?.refund_amount) || Number(b?.total_price) || 0),
      0
    );
    const totalRefunded = rawRefunded;
    const totalBookingsCount = bookings.length;

    // Build timeline points with realistic business fluctuations
    let timelinePoints = [];
    if (period === 'week') {
      const days = [
        { label: 'Thứ 2', subLabel: '08/09', factor: 0.08 },
        { label: 'Thứ 3', subLabel: '09/09', factor: 0.11 },
        { label: 'Thứ 4', subLabel: '10/09', factor: 0.13 },
        { label: 'Thứ 5', subLabel: '11/09', factor: 0.16 },
        { label: 'Thứ 6', subLabel: '12/09', factor: 0.22 },
        { label: 'Thứ 7', subLabel: '13/09', factor: 0.28 },
        { label: 'Chủ Nhật', subLabel: '14/09', factor: 0.18 },
      ];
      timelinePoints = days.map((d, i) => {
        const gmv = Math.round(totalGmv * d.factor);
        const commission = Math.round(gmv * 0.12);
        const net = gmv - commission;
        return {
          label: d.label,
          subLabel: d.subLabel,
          date: d.subLabel,
          gmv,
          commission,
          host_net: net,
          escrow: Math.round(net * 0.35),
          payout: Math.round(net * 0.65),
          refund: Math.round(totalRefunded * d.factor),
          booking_count: Math.max(Math.round(totalBookingsCount * d.factor), 1),
        };
      });
    } else if (period === 'year') {
      const seasonalFactors = [0.07, 0.09, 0.06, 0.08, 0.12, 0.14, 0.15, 0.11, 0.06, 0.05, 0.04, 0.07];
      timelinePoints = Array.from({ length: 12 }, (_, i) => {
        const factor = seasonalFactors[i];
        const gmv = Math.round(totalGmv * factor);
        const commission = Math.round(gmv * 0.12);
        const net = gmv - commission;
        return {
          label: `Tháng ${i + 1}`,
          subLabel: `T${i + 1}/2026`,
          month: i + 1,
          gmv,
          commission,
          host_net: net,
          escrow: Math.round(net * 0.25),
          payout: Math.round(net * 0.75),
          refund: Math.round(totalRefunded * (factor * 0.8)),
          booking_count: Math.max(Math.round(totalBookingsCount * factor), 1),
        };
      });
    } else if (period === 'quarter') {
      const quarterFactors = [0.06, 0.08, 0.07, 0.09, 0.11, 0.14, 0.12, 0.10, 0.07, 0.06, 0.05, 0.05];
      timelinePoints = Array.from({ length: 12 }, (_, i) => {
        const factor = quarterFactors[i];
        const gmv = Math.round(totalGmv * factor);
        const commission = Math.round(gmv * 0.12);
        const net = gmv - commission;
        return {
          label: `Tuần ${i + 1}`,
          subLabel: `W${i + 1}`,
          week: i + 1,
          gmv,
          commission,
          host_net: net,
          escrow: Math.round(net * 0.3),
          payout: Math.round(net * 0.7),
          refund: Math.round((totalRefunded / 12) * 0.6),
          booking_count: Math.max(Math.round(totalBookingsCount * factor), 1),
        };
      });
    } else {
      // Month (4 tuần với dao động tự nhiên của chu kỳ du lịch)
      const weekSpecs = [
        { label: 'Tuần 1', subLabel: '01/09 - 07/09', factor: 0.20 },
        { label: 'Tuần 2', subLabel: '08/09 - 14/09', factor: 0.30 },
        { label: 'Tuần 3', subLabel: '15/09 - 21/09', factor: 0.32 },
        { label: 'Tuần 4', subLabel: '22/09 - 30/09', factor: 0.18 },
      ];
      timelinePoints = weekSpecs.map((w, i) => {
        const gmv = Math.round(totalGmv * w.factor);
        const commission = Math.round(gmv * 0.12);
        const net = gmv - commission;
        return {
          label: w.label,
          subLabel: w.subLabel,
          date: w.subLabel,
          gmv,
          commission,
          host_net: net,
          escrow: Math.round(net * (0.2 + (i % 2) * 0.15)),
          payout: Math.round(net * (0.8 - (i % 2) * 0.15)),
          refund: Math.round(totalRefunded * w.factor),
          booking_count: Math.max(Math.round(totalBookingsCount * w.factor), 1),
        };
      });
    }

    const weekdayDistribution = [
      { day: 'T2', name: 'Thứ Hai', gmv: Math.round(totalGmv * 0.09), bookings: Math.round(totalBookingsCount * 0.08) },
      { day: 'T3', name: 'Thứ Ba', gmv: Math.round(totalGmv * 0.11), bookings: Math.round(totalBookingsCount * 0.1) },
      { day: 'T4', name: 'Thứ Tư', gmv: Math.round(totalGmv * 0.12), bookings: Math.round(totalBookingsCount * 0.12) },
      { day: 'T5', name: 'Thứ Năm', gmv: Math.round(totalGmv * 0.15), bookings: Math.round(totalBookingsCount * 0.15) },
      { day: 'T6', name: 'Thứ Sáu', gmv: Math.round(totalGmv * 0.22), bookings: Math.round(totalBookingsCount * 0.23) },
      { day: 'T7', name: 'Thứ Bảy', gmv: Math.round(totalGmv * 0.26), bookings: Math.round(totalBookingsCount * 0.27) },
      { day: 'CN', name: 'Chủ Nhật', gmv: Math.round(totalGmv * 0.17), bookings: Math.round(totalBookingsCount * 0.16) },
    ];

    return {
      period,
      summary: {
        total_gmv: totalGmv,
        platform_commission: platformFee,
        commission_rate: 12,
        host_net_earnings: hostNet,
        escrow_pending: escrowPending,
        payouts_completed: completedPayouts,
        total_refunded: totalRefunded,
        total_bookings: totalBookingsCount,
        growth_rate: 18.5,
      },
      timeline: timelinePoints,
      weekday_distribution: weekdayDistribution,
    };
  },

  async getHostRevenues() {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/financials/hosts-revenue`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || (Array.isArray(json) ? json : []);
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch (e) {
      console.warn('Backend get host revenues failed, fallback to local:', e);
    }

    const data = getStoredData();
    const hosts = data.hosts || [];
    const bookings = data.bookings || [];
    const payouts = data.payouts || [];

    return hosts.map((h, idx) => {
      const hostBookings = bookings.filter((b) => b?.host_id === h.id || b?.host_name === h.name);
      const totalGmv = hostBookings.length > 0 
        ? hostBookings.reduce((sum, b) => sum + (Number(b?.total_price) || 0), 0)
        : (h.total_revenue || 0);
      const commission = Math.round(totalGmv * 0.12);
      const hostNet = totalGmv - commission;
      const hostPayouts = payouts.filter((p) => p?.host_id === h.id || p?.host_name === h.name);
      const paidOut = hostPayouts.length > 0
        ? hostPayouts.reduce((sum, p) => sum + (Number(p?.amount) || 0), 0)
        : 0;
      const escrow = Math.max(hostNet - paidOut, 0);

      return {
        id: h.id,
        name: h.name || h.full_name || `Host #${h.id}`,
        email: h.email || `host${h.id}@tripnest.vn`,
        phone: h.phone || '0912 345 678',
        avatar: h.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name || 'Host')}&background=8b5cf6&color=fff`,
        total_gmv: totalGmv,
        platform_fee: commission,
        net_earnings: hostNet,
        paid_out: paidOut,
        in_escrow: escrow,
        booking_count: hostBookings.length,
        accommodations_count: h.accommodations_count || 0,
        bank_name: h.payout_profile?.bank_name || 'Vietcombank (VCB)',
        account_number: h.payout_profile?.account_number || `9876543${h.id || 210}`,
        account_holder: h.payout_profile?.account_holder || h.name || 'HOST TRIPNEST',
      };
    }).sort((a, b) => b.total_gmv - a.total_gmv);
  },
};
