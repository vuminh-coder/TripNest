import { roomsData, experiencesData } from '../data/roomsData';
import { categories } from '../data/categoriesData';

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
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  // ==========================================
  // 1. Xác thực & Tài khoản người dùng (Auth)
  // ==========================================
  async login(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Đăng nhập không thành công.');
      error.response = data;
      throw error;
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('tripnest_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Đăng ký không thành công.');
      error.response = data;
      throw error;
    }
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('tripnest_user', JSON.stringify(data.user));
    }
    return data;
  },

  async me() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Phiên đăng nhập không hợp lệ.');
    }
    return data;
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tripnest_user');
    }
  },

  async updatePassword(payload) {
    const res = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Không thể đổi mật khẩu.');
      error.response = data;
      throw error;
    }
    return data;
  },

  // ==========================================
  // 2. Tra cứu Danh mục & Cơ sở lưu trú
  // ==========================================
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return categories;
    }
  },

  async getAccommodations(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/accommodations?${query}`);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      return roomsData;
    } catch (e) {
      return this.getRooms(params);
    }
  },

  async getAccommodationById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/accommodations/${id}`);
      if (!res.ok) throw new Error('Accommodation detail error');
      return await res.json();
    } catch (e) {
      return roomsData.find((r) => String(r.id) === String(id) || String(r.accommodationId) === String(id)) || null;
    }
  },

  async getRooms(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/accommodations?${query}`);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      return roomsData;
    } catch (e) {
      let filtered = [...roomsData];
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((r) => r.category === params.category);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.title?.toLowerCase().includes(s) ||
            r.city?.toLowerCase().includes(s) ||
            r.location?.toLowerCase().includes(s)
        );
      }
      if (params.minPrice) {
        filtered = filtered.filter((r) => (r.priceVND || r.priceUSD * 25450) >= Number(params.minPrice));
      }
      if (params.maxPrice) {
        filtered = filtered.filter((r) => (r.priceVND || r.priceUSD * 25450) <= Number(params.maxPrice));
      }
      if (params.guests) {
        filtered = filtered.filter((r) => (r.specs?.guests || r.maxGuests || 2) >= Number(params.guests));
      }
      return filtered;
    }
  },

  async getRoomDetail(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`);
      if (!res.ok) throw new Error('Room detail error');
      return await res.json();
    } catch (e) {
      return roomsData.find((r) => String(r.id) === String(id)) || null;
    }
  },

  async getRoomById(id) {
    return this.getRoomDetail(id);
  },

  async getExperiences() {
    try {
      const res = await fetch(`${API_BASE_URL}/experiences`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return experiencesData;
    }
  },

  // ==========================================
  // 3. Đặt phòng, Chuyến đi & Thanh toán
  // ==========================================
  async createBooking(bookingPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingPayload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi đặt phòng');
      }
      return await res.json();
    } catch (e) {
      // Local storage fallback for seamless offline testing
      const savedBookings = JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
      const newBooking = {
        id: 'TN-' + Math.floor(100000 + Math.random() * 900000),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...bookingPayload,
      };
      savedBookings.unshift(newBooking);
      localStorage.setItem('tripnest_bookings', JSON.stringify(savedBookings));
      return { success: true, booking: newBooking, message: e.message || 'Đặt phòng thành công!' };
    }
  },

  async getMyBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/my-bookings`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
    }
  },

  async cancelBooking(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async checkIn(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async checkOut(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-out`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async getWishlist() {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return JSON.parse(localStorage.getItem('tripnest_wishlist') || '[]');
    }
  },

  async toggleWishlist(roomId) {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roomId }),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  // ==========================================
  // 4. Host Portal & Quản lý Chỗ nghỉ (Partner)
  // ==========================================
  async registerHost(hostData) {
    try {
      const res = await fetch(`${API_BASE_URL}/host/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(hostData),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Đăng ký chủ nhà thành công!' };
    }
  },

  async getHostDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/host/dashboard-stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Host dashboard stats error');
      return await res.json();
    } catch (e) {
      return {
        totalRevenueVND: 148500000,
        totalBookings: 24,
        occupancyRate: 85,
        averageRating: 4.96,
        accommodationsCount: 6,
      };
    }
  },

  async getHostAccommodations() {
    try {
      const res = await fetch(`${API_BASE_URL}/host/accommodations`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Host accommodations error');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async createHostAccommodation(payload) {
    const res = await fetch(`${API_BASE_URL}/host/accommodations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Không thể tạo chỗ nghỉ.');
      err.response = data;
      throw err;
    }
    return data;
  },

  async toggleAccommodationStatus(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/host/accommodations/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async deleteAccommodation(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/host/accommodations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true };
    }
  },

  async getHostBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/host/bookings`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Host bookings error');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async getHostPayouts() {
    try {
      const res = await fetch(`${API_BASE_URL}/host/payouts`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Host payouts error');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async updatePayoutAccount(payload) {
    const res = await fetch(`${API_BASE_URL}/host/payout-account`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async checkInBooking(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-in`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Đã check-in thành công.' };
    }
  },

  async checkOutBooking(bookingId) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/check-out`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Đã check-out và tạo lệnh giải ngân thành công.' };
    }
  },

  // ==========================================
  // 5. Quản trị Tài chính & Giải Ngân (Admin)
  // ==========================================
  async getAdminFinancialStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/financials/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Admin stats error');
      return await res.json();
    } catch (e) {
      return {
        totalRevenueVND: 186500000,
        commissionRevenueVND: 22380000,
        escrowPendingVND: 42500000,
        payoutsCompletedVND: 121620000,
        pendingPayoutsCount: 4,
      };
    }
  },

  async getAdminPayouts() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/payouts`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Admin payouts error');
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  async approveAdminPayout(payoutId, payload = {}) {
    const res = await fetch(`${API_BASE_URL}/admin/payouts/${payoutId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },
};

