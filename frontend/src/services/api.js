import { roomsData, experiencesData } from '../data/roomsData';
import { categories } from '../data/categoriesData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
  // 1. Đăng nhập thông thường bằng Email + Mật khẩu
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
    return data;
  },

  // 2. Đăng ký tài khoản người dùng mới
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
    return data;
  },

  // 3. Đăng nhập bằng Google Email (JWT OAuth)
  async googleLogin(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Xác thực Google không thành công.');
      }
      return data;
    } catch (e) {
      throw new Error(e.message || 'Không thể kết nối máy chủ đăng nhập.');
    }
  },

  // 4. Lấy thông tin người dùng hiện tại
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

  // 5. Đăng xuất
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

  // 6. Đổi mật khẩu tài khoản
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

  // 7. Lấy danh mục
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return categories;
    }
  },

  // 8. Lấy danh sách phòng với bộ lọc đa tiêu chí
  async getRooms(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/rooms?${query}`);
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
            r.title.toLowerCase().includes(s) ||
            r.city.toLowerCase().includes(s) ||
            r.location.toLowerCase().includes(s)
        );
      }
      if (params.minPrice) {
        filtered = filtered.filter((r) => r.priceUSD >= Number(params.minPrice));
      }
      if (params.maxPrice) {
        filtered = filtered.filter((r) => r.priceUSD <= Number(params.maxPrice));
      }
      if (params.guests) {
        filtered = filtered.filter((r) => r.specs.guests >= Number(params.guests));
      }
      return filtered;
    }
  },

  // 9. Lấy chi tiết phòng
  async getRoomDetail(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${id}`);
      if (!res.ok) throw new Error('Room detail error');
      return await res.json();
    } catch (e) {
      return roomsData.find((r) => r.id === Number(id)) || null;
    }
  },

  // 10. Lấy danh sách trải nghiệm
  async getExperiences() {
    try {
      const res = await fetch(`${API_BASE_URL}/experiences`);
      if (!res.ok) throw new Error('Network response not ok');
      return await res.json();
    } catch (e) {
      return experiencesData;
    }
  },

  // 11. Tạo đơn đặt phòng mới
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
      // Local fallback
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

  // 12. Lấy danh sách phòng đã đặt của user
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

  // 13. Hủy đơn đặt phòng
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

  // 14. Lấy danh sách Wishlist
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

  // 15. Bật/tắt yêu thích
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

  // 16. Đăng ký trở thành Chủ nhà (Host)
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
};
