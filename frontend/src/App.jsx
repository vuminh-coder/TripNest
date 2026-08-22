import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import SpotlightBanner from './components/SpotlightBanner';
import ListingCard from './components/ListingCard';
import ExperienceSection from './components/ExperienceSection';
import RoomDetailModal from './components/RoomDetailModal';
import FilterModal from './components/FilterModal';
import AuthModal from './components/AuthModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import MyBookingsModal from './components/MyBookingsModal';
import WishlistModal from './components/WishlistModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import HostModal from './components/HostModal';
import Footer from './components/Footer';
import AdminLayout from './components/admin/AdminLayout';

import { apiService } from './services/api';

function App() {
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: Client view vs Admin Portal (URL routing: /admin)
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#admin') ||
      new URLSearchParams(window.location.search).get('view') === 'admin'
    );
  });

  // Sync URL changes (back/forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin') ||
        new URLSearchParams(window.location.search).get('view') === 'admin';
      setIsAdminOpen(isAdm);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleOpenAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminOpen(true);
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminOpen(false);
  };

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams, setSearchParams] = useState({});
  const [filters, setFilters] = useState({});
  const [showTotalBeforeTaxes, setShowTotalBeforeTaxes] = useState(false);
  const [currency, setCurrency] = useState('VND');

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' });
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);

  // User & Wishlist & Bookings
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_user') || 'null');
    } catch {
      return null;
    }
  });

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tripnest_bookings') || '[]');
    } catch {
      return [];
    }
  });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [cats, rms, exps] = await Promise.all([
        apiService.getCategories(),
        apiService.getRooms(),
        apiService.getExperiences(),
      ]);
      setCategories(cats);
      setRooms(rms);
      setExperiences(exps);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('tripnest_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Save bookings to localStorage
  useEffect(() => {
    localStorage.setItem('tripnest_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Toggle favorite
  const handleToggleFavorite = (roomId) => {
    setWishlistIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  // Create booking
  const handleBookRoom = (bookingData) => {
    const newBooking = {
      id: 'TN-' + Math.floor(100000 + Math.random() * 900000),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  // Cancel booking
  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  // Filtered rooms logic
  const filteredRooms = rooms.filter((room) => {
    // Category filter
    if (activeCategory !== 'all' && room.category !== activeCategory) {
      return false;
    }
    // Search keyword
    if (searchParams.destination) {
      const q = searchParams.destination.toLowerCase();
      const matchCity = room.city.toLowerCase().includes(q);
      const matchLoc = room.location.toLowerCase().includes(q);
      const matchTitle = room.title.toLowerCase().includes(q);
      if (!matchCity && !matchLoc && !matchTitle) return false;
    }
    // Guests search
    if (searchParams.guests && room.specs.guests < searchParams.guests) {
      return false;
    }
    // Advanced Price Filter
    if (filters.minPrice && room.priceUSD < Number(filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && room.priceUSD > Number(filters.maxPrice)) {
      return false;
    }
    // Bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      const minBedrooms = parseInt(filters.bedrooms);
      if (room.specs.bedrooms < minBedrooms) return false;
    }
    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const roomAmenities = room.amenities.join(' ').toLowerCase();
      const hasAll = filters.amenities.every((a) =>
        roomAmenities.includes(a.toLowerCase())
      );
      if (!hasAll) return false;
    }
    return true;
  });

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(
    (k) => filters[k] && filters[k] !== 'all' && filters[k] !== 'any' && (!Array.isArray(filters[k]) || filters[k].length > 0)
  ).length;

  const wishlistRooms = rooms.filter((r) => wishlistIds.includes(r.id));

  // Render Admin Portal if admin mode is active
  if (isAdminOpen) {
    return <AdminLayout onExitAdmin={handleExitAdmin} />;
  }

  return (
    <div className="app-container">
      {/* Header with Search Engine & Auth Controls */}
      <Header
        onSearch={(params) => setSearchParams(params)}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAuth={(tab) => setAuthModal({ isOpen: true, tab })}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenHost={() => setIsHostOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        wishlistCount={wishlistIds.length}
        user={user}
        onLogout={() => {
          localStorage.removeItem('tripnest_user');
          setUser(null);
        }}
      />

      <main className="main-content">
        {/* Category Navigation Bar & Filters */}
        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(catId) => setActiveCategory(catId)}
          onOpenFilters={() => setIsFilterOpen(true)}
          activeFilterCount={activeFilterCount}
          showTotalBeforeTaxes={showTotalBeforeTaxes}
          setShowTotalBeforeTaxes={setShowTotalBeforeTaxes}
        />

        {/* New this week Spotlight collection banner */}
        {activeCategory === 'all' && (
          <SpotlightBanner
            onSelectCategory={(catId) => setActiveCategory(catId)}
          />
        )}

        {/* Main Listings Grid */}
        <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#717171' }}>
              Đang tải danh sách chỗ ở tuyệt vời...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f7f7f7', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Không tìm thấy chỗ ở phù hợp</h3>
              <p style={{ color: '#717171', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Hãy thử thay đổi hoặc xóa bớt bộ lọc tìm kiếm để xem thêm nhiều lựa chọn khác.
              </p>
              <button
                className="primary-gradient-btn"
                style={{ width: 'auto', padding: '0.65rem 1.5rem' }}
                onClick={() => {
                  setActiveCategory('all');
                  setSearchParams({});
                  setFilters({});
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {filteredRooms.map((room) => (
                <ListingCard
                  key={room.id}
                  room={room}
                  onOpenDetail={(r) => setSelectedRoom(r)}
                  isFavorite={wishlistIds.includes(room.id)}
                  onToggleFavorite={handleToggleFavorite}
                  currency={currency}
                  showTotalBeforeTaxes={showTotalBeforeTaxes}
                />
              ))}
            </div>
          )}
        </div>

        {/* Experiences Section */}
        {experiences.length > 0 && (
          <ExperienceSection
            experiences={experiences}
            currency={currency}
            onSelectExperience={(exp) => {
              alert(`Bạn đã chọn trải nghiệm: "${exp.caption}" tại ${exp.city}. Tính năng đặt tour chi tiết đang sẵn sàng!`);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer currency={currency} />

      {/* Modals */}
      {selectedRoom && (
        <RoomDetailModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          currency={currency}
          isFavorite={wishlistIds.includes(selectedRoom.id)}
          onToggleFavorite={handleToggleFavorite}
          onBookRoom={handleBookRoom}
        />
      )}

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={(f) => setFilters(f)}
        initialFilters={filters}
        currency={currency}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ isOpen: false, tab: 'login' })}
        onAuthSuccess={(u) => setUser(u)}
        onOpenForgotPassword={() => {
          setAuthModal({ isOpen: false, tab: 'login' });
          setIsForgotOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSwitchToLogin={() => {
          setIsForgotOpen(false);
          setAuthModal({ isOpen: true, tab: 'login' });
        }}
        onSwitchToRegister={() => {
          setIsForgotOpen(false);
          setAuthModal({ isOpen: true, tab: 'register' });
        }}
        onResetSuccess={(email, pass) => {
          console.log('Mật khẩu mới đã được cập nhật:', email, pass);
        }}
      />

      <MyBookingsModal
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        currency={currency}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistRooms={wishlistRooms}
        onSelectRoom={(r) => setSelectedRoom(r)}
        onRemoveFavorite={handleToggleFavorite}
        currency={currency}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <HostModal
        isOpen={isHostOpen}
        onClose={() => setIsHostOpen(false)}
        currency={currency}
      />
    </div>
  );
}

export default App;
