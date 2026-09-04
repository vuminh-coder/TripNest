// Admin API & State Service for TripNest Admin Portal
import { initialAdminData } from './adminMockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

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

const STORAGE_KEY = 'tripnest_admin_data_v1';

const isAdminAuthorized = () => {
  try {
    const user = JSON.parse(localStorage.getItem('tripnest_user') || 'null');
    const token = localStorage.getItem('token') || user?.token;
    return Boolean(token && user?.role === 'admin');
  } catch {
    return false;
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
      const response = await fetch(`${API_BASE_URL}/admin/financials/stats`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const statsData = await response.json();
        return {
          totalRevenueVND: statsData.totalRevenueVND || 0,
          commissionRevenueVND: statsData.commissionRevenueVND || 0,
          escrowPendingVND: statsData.escrowPendingVND || 0,
          payoutsCompletedVND: statsData.payoutsCompletedVND || 0,
          pendingPayoutsCount: statsData.pendingPayoutsCount || 0,
          totalBookings: statsData.totalBookings || 0,
          completedBookings: statsData.completedBookings || 0,
          pendingKycCount: 0,
          growthRatePercent: 12.5,
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
    const totalRev = bookings
      .filter((b) => b?.status !== 'cancelled')
      .reduce((sum, b) => sum + (b?.total_price || 0), 0);
    const commission = Math.round(totalRev * 0.12);
    const pendingKyc = hosts.filter((h) => h?.kyc_status === 'pending').length;

    return {
      ...stats,
      totalRevenueVND: totalRev > 0 ? totalRev : (stats.totalRevenueVND || 0),
      commissionRevenueVND: commission > 0 ? commission : (stats.commissionRevenueVND || 0),
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
      const res = await fetch(`${API_BASE_URL}/admin/accommodations`, {
        headers: getAuthHeaders(),
      });
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
      const res = await fetch(`${API_BASE_URL}/admin/accommodations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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
        const res = await fetch(`${API_BASE_URL}/admin/accommodations/${id}/featured`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
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
        const res = await fetch(`${API_BASE_URL}/admin/accommodations/${accData.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE_URL}/admin/accommodations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
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
      if (newStatus === 'cancelled') {
        await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ reason }),
        });
      } else if (newStatus === 'checked_in') {
        await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-in`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      } else if (newStatus === 'completed') {
        await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-out`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
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
          payment_status: newStatus === 'cancelled' ? 'refunded' : item.payment_status,
        };
      }
      return item;
    });
    saveStoredData(data);
    return await this.getBookings();
  },

  // ==========================================
  // 4. KYC & Đối tác Chủ nhà (Hosts)
  // ==========================================
  async getHosts() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/hosts`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
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
      const res = await fetch(`${API_BASE_URL}/admin/hosts/${hostId}/kyc`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
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
      const res = await fetch(`${API_BASE_URL}/admin/hosts/${hostId}/superhost`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const data = getStoredData();
          data.users = result.data;
          saveStoredData(data);
          return result.data;
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

        const res = await fetch(`${API_BASE_URL}/admin/users/${userData.id}/update`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeaders().Authorization || '',
            Accept: 'application/json',
          },
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

        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          method: 'POST',
          headers: {
            Authorization: getAuthHeaders().Authorization || '',
            Accept: 'application/json',
          },
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

    const response = await fetch(`${API_BASE_URL}/admin/users/${targetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/update`, {
        method: 'POST',
        headers: {
          Authorization: getAuthHeaders().Authorization || '',
          Accept: 'application/json',
        },
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
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      const response = await fetch(`${API_BASE_URL}/admin/payouts`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          return result;
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
      const response = await fetch(`${API_BASE_URL}/admin/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
    return await this.getPayouts();
  },

  // ==========================================
  // 7. Đánh giá Radar (Reviews)
  // ==========================================
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend get admin reviews failed:', e);
    }
    const data = getStoredData();
    return data.reviews || [];
  },

  async updateReviewStatus(reviewId, status) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        return await this.getReviews();
      }
    } catch (e) {
      console.warn('Backend update review status failed:', e);
    }

    const data = getStoredData();
    data.reviews = data.reviews.map((r) => {
      if (r.id === reviewId) {
        return { ...r, status };
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
      const res = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend get admin categories failed:', e);
    }
    const data = getStoredData();
    return data.categories || [];
  },

  async toggleCategoryActive(slugOrId) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${slugOrId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE_URL}/admin/amenities`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
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
      const res = await fetch(`${API_BASE_URL}/admin/amenities`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      await fetch(`${API_BASE_URL}/admin/amenities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE_URL}/admin/experiences`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend get experiences failed:', e);
    }
    const data = getStoredData();
    return data.experiences || [];
  },

  async toggleExperienceActive(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/experiences/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
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

  // ==========================================
  // 10. Quản lý Mã giảm giá (Vouchers)
  // ==========================================
  async getVouchers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vouchers`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend get vouchers failed:', e);
    }
    return [];
  },

  async saveVoucher(voucherData) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vouchers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(voucherData),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async toggleVoucherActive(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vouchers/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async deleteVoucher(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/vouchers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: e.message };
    }
  },
};
