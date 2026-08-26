import React, { useState, useEffect } from 'react';

// Layout Components
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';

// Common Components
import { ListingCard } from '@/components/common/ListingCard/ListingCard';

// Modal Components
import { AuthModal } from '@/components/modals/AuthModal/AuthModal';
import { FilterModal } from '@/components/modals/FilterModal/FilterModal';
import { MyBookingsModal } from '@/components/modals/MyBookingsModal/MyBookingsModal';
import { WishlistModal } from '@/components/modals/WishlistModal/WishlistModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal/ChangePasswordModal';
import { HostModal } from '@/components/modals/HostModal/HostModal';

// Pages & Feature Modules
import { CategoryBar } from '@/pages/home/components/CategoryBar/CategoryBar';
import { SpotlightBanner } from '@/pages/home/components/SpotlightBanner/SpotlightBanner';
import { ExperienceSection } from '@/pages/home/components/ExperienceSection/ExperienceSection';
import { RoomDetailPage } from '@/pages/room-detail/RoomDetailPage/RoomDetailPage';
import { BookingCheckoutPage } from '@/pages/checkout/BookingCheckoutPage/BookingCheckoutPage';
import HostLayout from '@/pages/host/HostLayout';
import AdminLayout from '@/pages/admin/AdminLayout';

// Services & Utilities
import { apiService } from '@/services/api';
import { removeVietnameseTones } from '@/utils/textUtils';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/context/ToastContext';
import {
  TbSearch,
  TbMapPin,
  TbCalendar,
  TbUsers,
  TbX,
  TbCompass,
  TbSparkles,
} from 'react-icons/tb';

// Helper to extract initial search params from URL
const getInitialSearchParams = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const dest = urlParams.get('destination') || urlParams.get('q') || '';
    const g = parseInt(urlParams.get('guests')) || 1;
    const cin = urlParams.get('checkIn') || urlParams.get('checkInDate') || '';
    const cout = urlParams.get('checkOut') || urlParams.get('checkOutDate') || '';
    if (dest || g > 1 || cin || cout) {
      return { destination: dest, guests: g, checkInDate: cin, checkOutDate: cout };
    }
  } catch (e) {}
  return {};
};

// Helper to extract room ID from URL
const getRoomIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/^\/room(?:s)?\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const searchParam = new URLSearchParams(window.location.search).get('room');
  if (searchParam) return searchParam;
  const hashMatch = window.location.hash.match(/^#room-?([a-zA-Z0-9_-]+)/);
  if (hashMatch) return hashMatch[1];
  return null;
};

const getBookingRoomIdFromUrl = () => {
  const match = window.location.pathname.match(/^\/book\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const searchParam = new URLSearchParams(window.location.search).get('book');
  if (searchParam) return searchParam;
  const hashMatch = window.location.hash.match(/^#book-?([a-zA-Z0-9_-]+)/);
  if (hashMatch) return hashMatch[1];
  return null;
};

function App() {
  const toast = useToast();
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

  // Filter & Search states (Initialized from URL if present)
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchParams, setSearchParams] = useState(getInitialSearchParams);
  const [filters, setFilters] = useState({});
  const [showTotalBeforeTaxes, setShowTotalBeforeTaxes] = useState(false);
  const [currency, setCurrency] = useState('VND');

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' });
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(() => {
    const isHostRoute =
      window.location.pathname.startsWith('/host') ||
      window.location.pathname.startsWith('/become-a-host') ||
      window.location.hash.startsWith('#host') ||
      new URLSearchParams(window.location.search).get('view') === 'host';
    return isHostRoute;
  });

  // User & Wishlist & Bookings
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userInfo);

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

  // Sync URL changes (back/forward buttons & direct links)
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin') ||
        new URLSearchParams(window.location.search).get('view') === 'admin';
      setIsAdminOpen(isAdm);

      const isHost =
        window.location.pathname.startsWith('/host') ||
        window.location.pathname.startsWith('/become-a-host') ||
        window.location.hash.startsWith('#host') ||
        new URLSearchParams(window.location.search).get('view') === 'host';

      if (isHost && user?.role === 'admin') {
        setIsHostOpen(false);
        setIsAdminOpen(true);
        window.history.replaceState({}, '', '/admin');
        return;
      }

      setIsHostOpen(isHost);

      const bId = getBookingRoomIdFromUrl();
      if (bId) {
        const found = rooms.find((r) => String(r.id) === String(bId));
        if (found) {
          setCheckoutData({ room: found, bookingParams: {} });
          setSelectedRoom(found);
        } else {
          apiService.getRoomById(bId).then((single) => {
            if (single && (single.id || single.title)) {
              setCheckoutData({ room: single, bookingParams: {} });
              setSelectedRoom(single);
            }
          });
        }
      } else {
        const rId = getRoomIdFromUrl();
        if (rId) {
          const found = rooms.find((r) => String(r.id) === String(rId));
          if (found) {
            setSelectedRoom(found);
            setCheckoutData(null);
          }
          apiService.getRoomById(rId).then((single) => {
            if (single && (single.id || single.title)) {
              setSelectedRoom(single);
              setCheckoutData(null);
            }
          });
        } else if (!isAdm && !isHost) {
          setSelectedRoom(null);
          setCheckoutData(null);
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [rooms]);

  const handleOpenAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminOpen(true);
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminOpen(false);
  };

  // Select room and navigate to /room/:id (with backend detail hydration)
  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setCheckoutData(null);
    window.history.pushState({}, '', `/room/${room.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const detailed = await apiService.getRoomById(room.id);
      if (detailed && (detailed.id || detailed.title)) {
        setSelectedRoom(detailed);
      }
    } catch (e) {}
  };

  // Back to home listing
  const handleBackFromRoomDetail = () => {
    setSelectedRoom(null);
    setCheckoutData(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout navigation
  const [checkoutData, setCheckoutData] = useState(null);

  const handleStartCheckout = (roomToBook, bookingParams) => {
    setCheckoutData({ room: roomToBook, bookingParams });
    window.history.pushState({}, '', `/book/${roomToBook.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCheckout = () => {
    setCheckoutData(null);
    if (selectedRoom) {
      window.history.pushState({}, '', `/room/${selectedRoom.id}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load initial data & auto-fetch room detail if on /room/:id
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

      // Check if URL has roomId to open directly from backend
      const urlRoomId = getRoomIdFromUrl();
      if (urlRoomId) {
        try {
          const single = await apiService.getRoomById(urlRoomId);
          if (single && (single.id || single.title)) {
            setSelectedRoom(single);
          } else {
            const found = rms.find((r) => String(r.id) === String(urlRoomId));
            if (found) setSelectedRoom(found);
          }
        } catch (e) {
          const found = rms.find((r) => String(r.id) === String(urlRoomId));
          if (found) setSelectedRoom(found);
        }
      }
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
    const bookingCode = 'TN-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      id: bookingCode,
      code: bookingCode,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);

    // Đồng bộ tức thời vào danh sách đơn của Kênh Chủ Nhà
    try {
      const existingHostBookings = JSON.parse(localStorage.getItem('tripnest_host_bookings') || '[]');
      const hostEntry = {
        id: 'BK-' + Date.now().toString().slice(-4),
        code: bookingCode,
        guestName: bookingData.customerName || bookingData.guestName || user?.full_name || 'Khách du lịch TripNest',
        guestPhone: bookingData.phone || bookingData.guestPhone || '0912 345 678',
        roomTitle: bookingData.roomTitle || bookingData.room?.title || bookingData.room?.name || 'Chỗ nghỉ cao cấp TripNest',
        checkIn: bookingData.checkInDate || bookingData.checkIn || '25/08/2026',
        checkOut: bookingData.checkOutDate || bookingData.checkOut || '28/08/2026',
        nights: bookingData.nights || 3,
        guests: bookingData.guests || 2,
        totalAmount: bookingData.totalAmount || 7500000,
        hostEarnings: Math.round((bookingData.totalAmount || 7500000) * 0.88),
        status: 'confirmed',
      };
      localStorage.setItem('tripnest_host_bookings', JSON.stringify([hostEntry, ...existingHostBookings]));
    } catch {
      // ignore
    }
  };

  // Cancel booking
  const handleCancelBooking = (bookingId) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  // Handle Search Execution from Header & synchronize URL
  const handleSearchExecute = (params) => {
    setSearchParams(params);
    if (selectedRoom) {
      setSelectedRoom(null);
      setCheckoutData(null);
    }

    // Synchronize parameters with URL query string
    const query = new URLSearchParams();
    if (params.destination && params.destination.trim()) {
      query.set('destination', params.destination.trim());
    }
    if (params.guests && Number(params.guests) > 1) {
      query.set('guests', params.guests);
    }
    if (params.checkInDate) query.set('checkIn', params.checkInDate);
    if (params.checkOutDate) query.set('checkOut', params.checkOutDate);

    const queryString = query.toString();
    window.history.pushState({}, '', queryString ? `/?${queryString}` : '/');

    // Smooth scroll to listing grid
    setTimeout(() => {
      const el = document.getElementById('rooms-listing-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Clear search parameters
  const handleClearSearch = () => {
    setSearchParams({});
    window.history.pushState({}, '', '/');
  };

  // Filtered rooms logic with robust Vietnamese fuzzy matching
  const filteredRooms = rooms.filter((room) => {
    // Category filter
    if (activeCategory !== 'all' && room.category !== activeCategory) {
      return false;
    }

    // Search destination keyword (Fuzzy accent-insensitive Vietnamese matching)
    if (searchParams.destination && searchParams.destination.trim()) {
      const q = removeVietnameseTones(searchParams.destination);
      const city = removeVietnameseTones(room.city);
      const loc = removeVietnameseTones(room.location);
      const title = removeVietnameseTones(room.title);
      const country = removeVietnameseTones(room.country);
      const category = removeVietnameseTones(room.category);

      const isMatch =
        city.includes(q) ||
        loc.includes(q) ||
        title.includes(q) ||
        country.includes(q) ||
        category.includes(q) ||
        q.includes(city);

      if (!isMatch) return false;
    }

    // Guests search filter
    if (searchParams.guests && Number(searchParams.guests) > 1) {
      if (room.specs?.guests && room.specs.guests < Number(searchParams.guests)) {
        return false;
      }
    }

    // Advanced Price Filter (Currency-Aware)
    if (filters.minPrice || filters.maxPrice) {
      const roomPrice =
        currency === 'VND'
          ? (room.priceVND || room.priceUSD * 25000)
          : currency === 'EUR'
          ? (room.priceEUR || room.priceUSD * 0.92)
          : room.priceUSD;

      if (filters.minPrice && roomPrice < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && roomPrice > Number(filters.maxPrice)) {
        return false;
      }
    }

    // Place Type filter
    if (filters.placeType && filters.placeType !== 'all') {
      const roomType = (room.type || '').toLowerCase();
      const title = (room.title || '').toLowerCase();
      const category = (room.category || '').toLowerCase();

      if (filters.placeType === 'entire') {
        const isEntire =
          roomType === 'entire' ||
          title.includes('villa') ||
          title.includes('nhà') ||
          title.includes('biệt thự') ||
          category.includes('villa') ||
          category.includes('mansion');
        if (!isEntire) return false;
      } else if (filters.placeType === 'room') {
        const isRoom =
          roomType === 'room' ||
          title.includes('phòng') ||
          title.includes('căn hộ') ||
          title.includes('studio') ||
          category.includes('room');
        if (!isRoom) return false;
      }
    }

    // Bedrooms filter
    if (filters.bedrooms && filters.bedrooms !== 'any') {
      const minBedrooms = parseInt(filters.bedrooms);
      if (room.specs?.bedrooms && room.specs.bedrooms < minBedrooms) return false;
    }

    // Bathrooms filter
    if (filters.bathrooms && filters.bathrooms !== 'any') {
      const minBathrooms = parseInt(filters.bathrooms);
      if (room.specs?.bathrooms && room.specs.bathrooms < minBathrooms) return false;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const roomAmenities = (room.amenities || []).join(' ').toLowerCase();
      const hasAll = filters.amenities.every((a) =>
        roomAmenities.includes(a.toLowerCase())
      );
      if (!hasAll) return false;
    }

    return true;
  });

  // Calculate active filter count
  const activeFilterCount = Object.keys(filters).filter(
    (k) =>
      filters[k] &&
      filters[k] !== 'all' &&
      filters[k] !== 'any' &&
      (!Array.isArray(filters[k]) || filters[k].length > 0)
  ).length;

  const wishlistRooms = rooms.filter((r) => wishlistIds.includes(r.id));

  // Determine if there is any active search filter applied
  const hasActiveSearch = Boolean(
    (searchParams.destination && searchParams.destination.trim()) ||
    (searchParams.guests && Number(searchParams.guests) > 1) ||
    searchParams.checkInDate ||
    searchParams.checkOutDate
  );

  // Render Admin Portal if admin mode is active
  if (isAdminOpen) {
    return <AdminLayout onExitAdmin={handleExitAdmin} />;
  }

  // Render Host Portal if host mode is active
  if (isHostOpen) {
    return (
      <HostLayout
        currency={currency}
        onSwitchToClient={() => {
          setIsHostOpen(false);
          window.history.pushState({}, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRoomDetail={(roomId) => {
          const found = rooms.find((r) => String(r.id) === String(roomId));
          if (found) {
            setIsHostOpen(false);
            setSelectedRoom(found);
            window.history.pushState({}, '', `/room/${roomId}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Header with Search Engine & Auth Controls */}
      <Header
        onSearch={handleSearchExecute}
        searchParams={searchParams}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAuth={(tab) => setAuthModal({ isOpen: true, tab })}
        onOpenBookings={() => setIsBookingsOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenHost={() => {
          if (user?.role === 'admin') {
            toast.info(
              'Tài khoản Quản trị viên (Admin)',
              'Tài khoản Admin không thuộc vai trò Chủ nhà. Đang chuyển hướng bạn đến Cổng Quản Trị Admin.'
            );
            handleOpenAdmin();
            return;
          }

          const isHostUser =
            user?.role === 'host' ||
            (user?.role !== 'admin' && localStorage.getItem('tripnest_is_host') === 'true');

          if (!user || (!user.id && !user.email)) {
            setAuthModal({ isOpen: true, tab: 'login' });
            return;
          }

          if (!isHostUser) {
            setIsHostModalOpen(true);
            return;
          }

          setIsHostOpen(true);
          window.history.pushState({}, '', '/host');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={handleOpenAdmin}
        wishlistCount={wishlistIds.length}
        onLogout={async () => {
          await apiService.logout();
          dispatch({ type: 'UPDATE', payload: {} });
        }}
      />

      <main className="main-content">
        {checkoutData && checkoutData.room ? (
          /* Dedicated Standalone Checkout & Booking Page */
          <BookingCheckoutPage
            room={checkoutData.room}
            bookingParams={checkoutData.bookingParams}
            currency={currency}
            onBack={handleBackFromCheckout}
            onBookingComplete={(order) => {
              handleBookRoom(order);
            }}
          />
        ) : selectedRoom ? (
          /* Dedicated Standalone Room Detail Page */
          <RoomDetailPage
            room={selectedRoom}
            allRooms={rooms}
            experiences={experiences}
            searchParams={searchParams}
            onBack={handleBackFromRoomDetail}
            onSelectRoom={handleSelectRoom}
            currency={currency}
            isFavorite={wishlistIds.includes(selectedRoom.id)}
            onToggleFavorite={handleToggleFavorite}
            onBookRoom={handleBookRoom}
            onStartCheckout={handleStartCheckout}
          />
        ) : (
          /* Standard Home Explore & Listing View */
          <>
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

            {/* Active Search Results Feedback Banner */}
            {hasActiveSearch && (
              <div className="search-feedback-bar">
                <div className="search-feedback-left">
                  <span className="search-feedback-badge-main">
                    <TbSearch /> Đang tìm kiếm
                  </span>
                  <div className="search-feedback-pills">
                    {searchParams.destination && (
                      <div className="search-param-pill">
                        <TbMapPin />
                        <span>{searchParams.destination}</span>
                      </div>
                    )}
                    {(searchParams.checkInDate || searchParams.checkOutDate) && (
                      <div className="search-param-pill">
                        <TbCalendar />
                        <span>
                          {searchParams.checkInDate || '...'} - {searchParams.checkOutDate || '...'}
                        </span>
                      </div>
                    )}
                    {searchParams.guests && Number(searchParams.guests) > 1 && (
                      <div className="search-param-pill">
                        <TbUsers />
                        <span>{searchParams.guests} khách</span>
                      </div>
                    )}
                    <span className="search-feedback-count">
                      • Tìm thấy <strong>{filteredRooms.length}</strong> chỗ ở phù hợp
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="search-clear-all-btn"
                  onClick={handleClearSearch}
                  title="Xóa tìm kiếm hiện tại"
                >
                  <TbX />
                  <span>Xóa tìm kiếm</span>
                </button>
              </div>
            )}

            {/* New this week Spotlight collection banner (only on clean explore) */}
            {activeCategory === 'all' && !hasActiveSearch && (
              <SpotlightBanner
                onSelectCategory={(catId) => setActiveCategory(catId)}
              />
            )}

            {/* Main Listings Grid */}
            <div id="rooms-listing-section" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#717171' }}>
                  Đang tải danh sách chỗ ở tuyệt vời...
                </div>
              ) : filteredRooms.length === 0 ? (
                /* Smart Luxury Empty State with One-Click Popular Destination Chips */
                <div className="search-empty-state-luxury">
                  <div className="search-empty-icon-badge">
                    <TbCompass />
                  </div>
                  <h3 className="search-empty-title">Không tìm thấy chỗ ở phù hợp</h3>
                  <p className="search-empty-desc">
                    Không có chỗ ở nào khớp với tiêu chí tìm kiếm của bạn. Hãy thử thay đổi bộ lọc hoặc khám phá ngay các điểm đến hấp dẫn dưới đây:
                  </p>
                  <div className="popular-dest-chips-container">
                    <div className="popular-dest-chips-title">Gợi ý điểm đến thịnh hành</div>
                    <div className="popular-dest-chips-row">
                      {['Đà Lạt', 'Phú Quốc', 'Hội An', 'Nha Trang', 'Vũng Tàu', 'Hạ Long', 'Sa Pa', 'Đà Nẵng', 'Hà Nội', 'Quy Nhơn'].map((dest) => (
                        <button
                          key={dest}
                          type="button"
                          className="dest-chip-btn"
                          onClick={() => handleSearchExecute({ ...searchParams, destination: dest })}
                        >
                          <TbMapPin />
                          <span>{dest}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <button
                      className="primary-gradient-btn"
                      style={{ width: 'auto', padding: '0.65rem 1.75rem', display: 'inline-flex' }}
                      onClick={() => {
                        setActiveCategory('all');
                        setSearchParams({});
                        setFilters({});
                        window.history.pushState({}, '', '/');
                      }}
                    >
                      Xóa tất cả bộ lọc & tìm kiếm
                    </button>
                  </div>
                </div>
              ) : (
                <div className="listings-grid">
                  {filteredRooms.map((room) => (
                    <ListingCard
                      key={room.id}
                      room={room}
                      searchParams={searchParams}
                      onOpenDetail={(r) => handleSelectRoom(r)}
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
                  toast.info(
                    'Trải nghiệm du lịch',
                    `Bạn đã chọn trải nghiệm: "${exp.caption}" tại ${exp.city}. Tính năng đặt tour chi tiết đang sẵn sàng!`
                  );
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer currency={currency} />

      {/* Auxiliary Modals */}
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
        onAuthSuccess={(userData) => {
          if (userData?.role === 'admin') {
            window.history.pushState({}, '', '/admin');
            setIsAdminOpen(true);
          }
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
        onSelectRoom={(r) => {
          handleSelectRoom(r);
          setIsWishlistOpen(false);
        }}
        onRemoveFavorite={handleToggleFavorite}
        currency={currency}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <HostModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onStartHosting={() => {
          setIsHostOpen(true);
          window.history.pushState({}, '', '/host');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currency={currency}
      />
    </div>
  );
}

export default App;
