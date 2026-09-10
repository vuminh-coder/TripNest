import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Layout Components
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';

// Common Components
import { ListingCard } from '@/components/common/ListingCard/ListingCard';
import { AiChatBubble } from '@/components/common/AiChatBubble/AiChatBubble';

// Modal Components
import { AuthModal } from '@/components/modals/AuthModal/AuthModal';
import { FilterModal } from '@/components/modals/FilterModal/FilterModal';
import { WishlistModal } from '@/components/modals/WishlistModal/WishlistModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal/ChangePasswordModal';
import { HostModal } from '@/components/modals/HostModal/HostModal';
import { BecomeHostModal } from '@/components/modals/BecomeHostModal';

// Pages & Feature Modules
import { CategoryBar } from '@/pages/home/components/CategoryBar/CategoryBar';
import { SpotlightBanner } from '@/pages/home/components/SpotlightBanner/SpotlightBanner';
import { ExperienceSection } from '@/pages/home/components/ExperienceSection/ExperienceSection';
import { RoomDetailPage } from '@/pages/room-detail/RoomDetailPage/RoomDetailPage';
import { AccommodationDetailPage } from '@/pages/accommodation-detail/AccommodationDetailPage';
import { BookingCheckoutPage } from '@/pages/checkout/BookingCheckoutPage/BookingCheckoutPage';
import { MapDirectionsPage } from '@/pages/map/MapDirectionsPage/MapDirectionsPage';
import { MyTripsPage } from '@/pages/my-trips/MyTripsPage';
import HostLayout from '@/pages/host/HostLayout';
import AdminLayout from '@/pages/admin/AdminLayout';
import { ListingGridSkeleton, ExperienceSectionSkeleton } from '@/components/common/skeletons';

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

// Helper to check if URL is My Trips page
const isMyTripsUrl = () => {
  try {
    const path = window.location.pathname;
    return (
      path.toLowerCase().startsWith('/mytripspage') ||
      path.startsWith('/my-trips') ||
      path.startsWith('/trips') ||
      window.location.hash.toLowerCase().startsWith('#mytripspage') ||
      window.location.hash.startsWith('#my-trips') ||
      new URLSearchParams(window.location.search).get('view') === 'trips'
    );
  } catch {
    return false;
  }
};

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

// Helper to extract map accommodation ID from URL
const getMapAccommodationIdFromUrl = () => {
  const path = window.location.pathname;
  const matchAccomMap = path.match(/^\/accommodation(?:s)?\/([a-zA-Z0-9_-]+)\/map/);
  if (matchAccomMap) return matchAccomMap[1];
  const matchMap = path.match(/^\/map\/([a-zA-Z0-9_-]+)/);
  if (matchMap) return matchMap[1];
  const searchParam = new URLSearchParams(window.location.search).get('map');
  if (searchParam) return searchParam;
  const hashMatch = window.location.hash.match(/^#map-?([a-zA-Z0-9_-]+)/);
  if (hashMatch) return hashMatch[1];
  return null;
};

// Helper to extract accommodation ID from URL
const getAccommodationIdFromUrl = () => {
  const path = window.location.pathname;
  if (path.includes('/map')) return null;
  const match = path.match(/^\/accommodation(?:s)?\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const searchParam = new URLSearchParams(window.location.search).get('accommodation');
  if (searchParam) return searchParam;
  const hashMatch = window.location.hash.match(/^#accommodation-?([a-zA-Z0-9_-]+)/);
  if (hashMatch) return hashMatch[1];
  return null;
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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userInfo);

  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: Client view vs Admin Portal (URL routing: /admin with Role Guard)
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    const isAdmRoute =
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.startsWith('#admin') ||
      new URLSearchParams(window.location.search).get('view') === 'admin';
    if (!isAdmRoute) return false;
    try {
      const stored = JSON.parse(localStorage.getItem('tripnest_user') || '{}');
      return Boolean(stored?.role === 'admin');
    } catch {
      return false;
    }
  });

  const [isMyTripsOpen, setIsMyTripsOpen] = useState(isMyTripsUrl);

  const handleOpenMyTrips = () => {
    setIsMyTripsOpen(true);
    setIsAdminOpen(false);
    setIsHostOpen(false);
    setSelectedAccommodation(null);
    setSelectedRoom(null);
    setCheckoutData(null);
    setMapTargetAccommodation(null);
    window.history.pushState({}, '', '/MyTripsPage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromMyTrips = () => {
    setIsMyTripsOpen(false);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter & Search states (Initialized from URL & LocalStorage)
  const [activeCategory, setActiveCategory] = useState(() => {
    return new URLSearchParams(window.location.search).get('category') || 'all';
  });
  const [searchParams, setSearchParams] = useState(getInitialSearchParams);
  const [filters, setFilters] = useState({});
  const [showTotalBeforeTaxes, setShowTotalBeforeTaxes] = useState(() => {
    try {
      return localStorage.getItem('tripnest_show_taxes_total') === 'true';
    } catch {
      return false;
    }
  });
  const [currency, setCurrency] = useState('VND');

  const handleSetShowTotalBeforeTaxes = (val) => {
    setShowTotalBeforeTaxes(val);
    try {
      localStorage.setItem('tripnest_show_taxes_total', String(val));
    } catch (e) {}
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    const query = new URLSearchParams(window.location.search);
    if (catId && catId !== 'all') {
      query.set('category', catId);
    } else {
      query.delete('category');
    }
    const queryString = query.toString();
    window.history.pushState({}, '', queryString ? `/?${queryString}` : '/');
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count += 1;
    if (filters.placeType && filters.placeType !== 'all') count += 1;
    if (filters.bedrooms && filters.bedrooms !== 'any') count += 1;
    if (filters.bathrooms && filters.bathrooms !== 'any') count += 1;
    if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
    return count;
  }, [filters]);

  // Modals state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [mapTargetAccommodation, setMapTargetAccommodation] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' });
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isBecomeHostModalOpen, setIsBecomeHostModalOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(() => {
    const isHostRoute =
      window.location.pathname.startsWith('/host') ||
      window.location.pathname.startsWith('/become-a-host') ||
      window.location.hash.startsWith('#host') ||
      new URLSearchParams(window.location.search).get('view') === 'host';
    if (!isHostRoute) return false;
    try {
      const stored = JSON.parse(localStorage.getItem('tripnest_user') || '{}');
      if (stored?.role === 'admin') return false;
      const isHostUser = stored?.role === 'host' || localStorage.getItem('tripnest_is_host') === 'true';
      return Boolean(isHostUser);
    } catch {
      return false;
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

  // Reset legacy cached bookings/payouts to synchronize with 0-state database
  useEffect(() => {
    const DATA_SYNC_VERSION = 'tripnest_v4_pure_db_sync_2026';
    if (localStorage.getItem('tripnest_sync_ver') !== DATA_SYNC_VERSION) {
      localStorage.removeItem('tripnest_admin_data_v1');
      localStorage.removeItem('tripnest_host_listings');
      localStorage.removeItem('tripnest_host_bookings');
      localStorage.removeItem('tripnest_host_payout_history');
      localStorage.removeItem('tripnest_bookings');
      localStorage.setItem('tripnest_sync_ver', DATA_SYNC_VERSION);
    }
  }, []);

  // Sync URL changes (back/forward buttons & direct links) with Strict RBAC Route Guard
  useEffect(() => {
    const handleLocationChange = () => {
      const currentUser = user?.id ? user : (() => {
        try {
          return JSON.parse(localStorage.getItem('tripnest_user') || '{}');
        } catch {
          return {};
        }
      })();
      const token = localStorage.getItem('token') || currentUser?.token;

      // 1. Kiểm tra Route Admin (/admin)
      const isAdm =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin') ||
        new URLSearchParams(window.location.search).get('view') === 'admin';

      if (isAdm) {
        if (!token || !currentUser?.id) {
          setIsAdminOpen(false);
          window.history.replaceState({}, '', '/');
          toast.warning(
            'Yêu cầu xác thực Quản trị viên',
            'Vui lòng đăng nhập với tài khoản Quản trị viên (Admin) để truy cập cổng này.'
          );
          setAuthModal({ isOpen: true, tab: 'login' });
          return;
        }

        if (currentUser.role !== 'admin') {
          setIsAdminOpen(false);
          const redirectPath = currentUser.role === 'host' ? '/host' : '/';
          window.history.replaceState({}, '', redirectPath);
          if (currentUser.role === 'host') {
            setIsHostOpen(true);
          }
          toast.error(
            'Từ chối truy cập (403 Forbidden)',
            'Tài khoản của bạn không có quyền Quản trị viên (Admin). Bạn đã được chuyển hướng về trang tương ứng.'
          );
          return;
        }

        setIsAdminOpen(true);
        setIsHostOpen(false);
        setIsMyTripsOpen(false);
        return;
      } else {
        setIsAdminOpen(false);
      }

      // 2. Kiểm tra Route Host (/host)
      const isHost =
        window.location.pathname.startsWith('/host') ||
        window.location.pathname.startsWith('/become-a-host') ||
        window.location.hash.startsWith('#host') ||
        new URLSearchParams(window.location.search).get('view') === 'host';

      if (isHost) {
        if (currentUser?.role === 'admin') {
          setIsHostOpen(false);
          setIsAdminOpen(true);
          window.history.replaceState({}, '', '/admin');
          return;
        }

        if (!token || !currentUser?.id) {
          setIsHostOpen(false);
          window.history.replaceState({}, '', '/');
          toast.info(
            'Yêu cầu đăng nhập',
            'Vui lòng đăng nhập để truy cập Cổng Dành Cho Chủ Nhà.'
          );
          setAuthModal({ isOpen: true, tab: 'login' });
          return;
        }

        const isHostUser =
          currentUser.role === 'host' ||
          localStorage.getItem('tripnest_is_host') === 'true';

        if (!isHostUser) {
          setIsHostOpen(false);
          window.history.replaceState({}, '', '/');
          setIsBecomeHostModalOpen(true);
          return;
        }

        setIsHostOpen(true);
        setIsAdminOpen(false);
        setIsMyTripsOpen(false);
        return;
      } else {
        setIsHostOpen(false);
      }

      const isTrips = isMyTripsUrl();
      setIsMyTripsOpen(isTrips);

      const mapId = getMapAccommodationIdFromUrl();
      if (mapId) {
        const found = rooms.find((r) => String(r.id) === String(mapId));
        if (found) {
          setMapTargetAccommodation(found);
          setSelectedAccommodation(null);
          setSelectedRoom(null);
          setCheckoutData(null);
        }
        apiService.getAccommodationById(mapId).then((single) => {
          if (single && (single.id || single.title)) {
            setMapTargetAccommodation(single);
          }
        });
        return;
      }

      const bookRoomId = getBookingRoomIdFromUrl();
      if (bookRoomId) {
        apiService.getRoomById(bookRoomId).then((single) => {
          if (single && (single.id || single.title)) {
            handleStartCheckout(single, {});
          } else {
            const found = rooms.find((r) => String(r.id) === String(bookRoomId));
            if (found) handleStartCheckout(found, {});
          }
        }).catch(() => {
          const found = rooms.find((r) => String(r.id) === String(bookRoomId));
          if (found) handleStartCheckout(found, {});
        });
        return;
      }

      const urlRoomId = getRoomIdFromUrl();
      if (urlRoomId) {
        const found = rooms.find((r) => String(r.id) === String(urlRoomId));
        if (found) {
          setSelectedRoom(found);
          setSelectedAccommodation(null);
          setCheckoutData(null);
        } else {
          apiService.getRoomById(urlRoomId).then((single) => {
            if (single && (single.id || single.title)) {
              setSelectedRoom(single);
              setSelectedAccommodation(null);
              setCheckoutData(null);
            }
          });
        }
      } else {
        const urlAccomId = getAccommodationIdFromUrl();
        if (urlAccomId) {
          const found = rooms.find((r) => String(r.id) === String(urlAccomId));
          if (found) {
            setSelectedAccommodation(found);
            setSelectedRoom(null);
            setCheckoutData(null);
          } else {
            apiService.getAccommodationById(urlAccomId).then((single) => {
              if (single && (single.id || single.title)) {
                setSelectedAccommodation(single);
                setSelectedRoom(null);
                setCheckoutData(null);
              }
            });
          }
        } else if (!isAdm && !isHost && !isTrips) {
          if (window.location.pathname === '/' || window.location.pathname === '') {
            const catInUrl = new URLSearchParams(window.location.search).get('category') || 'all';
            setActiveCategory(catInUrl);
            const hasDetailOpen = selectedAccommodation || selectedRoom || checkoutData || mapTargetAccommodation;
            if (hasDetailOpen) {
              setSelectedAccommodation(null);
              setSelectedRoom(null);
              setCheckoutData(null);
              setMapTargetAccommodation(null);
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Kích hoạt kiểm tra ngay khi component mount để bắt trường hợp reload tại URL /admin
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [rooms, user]);

  const handleOpenAdmin = () => {
    const currentUser = user?.id ? user : (() => {
      try {
        return JSON.parse(localStorage.getItem('tripnest_user') || '{}');
      } catch {
        return {};
      }
    })();
    if (currentUser?.role !== 'admin') {
      toast.error(
        'Từ chối truy cập',
        'Tài khoản của bạn không có quyền Quản trị viên (Admin).'
      );
      return;
    }
    window.history.pushState({}, '', '/admin');
    setIsAdminOpen(true);
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminOpen(false);
  };

  // Map page navigation handlers
  const handleOpenMapPage = async (targetItem) => {
    const targetAccom = targetItem?.accommodation || targetItem;
    setMapTargetAccommodation(targetAccom);
    setSelectedAccommodation(null);
    setSelectedRoom(null);
    setCheckoutData(null);
    window.history.pushState({}, '', `/accommodation/${targetAccom.id}/map`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const detailed = await apiService.getAccommodationById(targetAccom.id);
      if (detailed && (detailed.id || detailed.title)) {
        setMapTargetAccommodation(detailed);
      }
    } catch (e) {}
  };

  const handleBackFromMapPage = () => {
    const prevAccom = mapTargetAccommodation;
    setMapTargetAccommodation(null);
    if (prevAccom && prevAccom.id) {
      handleSelectAccommodation(prevAccom);
    } else {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Level 2: Select accommodation and navigate to /accommodation/:id
  const handleSelectAccommodation = async (accom) => {
    setIsMyTripsOpen(false);
    setSelectedAccommodation(accom);
    setSelectedRoom(null);
    setMapTargetAccommodation(null);
    setCheckoutData(null);
    window.history.pushState({}, '', `/accommodation/${accom.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const detailed = await apiService.getAccommodationById(accom.id);
      if (detailed && (detailed.id || detailed.title)) {
        setSelectedAccommodation(detailed);
      }
    } catch (e) {}
  };

  // Level 3: Select child room and navigate to /room/:id
  const handleSelectRoom = async (roomOrId, bookingContext) => {
    setIsMyTripsOpen(false);
    const roomId = typeof roomOrId === 'object' && roomOrId !== null ? roomOrId.id : roomOrId;
    const roomObj = typeof roomOrId === 'object' && roomOrId !== null ? roomOrId : { id: roomId };

    // Synchronize searchParams with the active bookingContext (checkIn, checkOut, guests, nights)
    if (bookingContext) {
      setSearchParams((prev) => ({
        ...prev,
        ...bookingContext,
        checkIn: bookingContext.checkIn || bookingContext.checkInDate || prev.checkIn,
        checkInDate: bookingContext.checkIn || bookingContext.checkInDate || prev.checkInDate,
        checkOut: bookingContext.checkOut || bookingContext.checkOutDate || prev.checkOut,
        checkOutDate: bookingContext.checkOut || bookingContext.checkOutDate || prev.checkOutDate,
        guests: bookingContext.guests || prev.guests,
        nights: bookingContext.nights || prev.nights,
      }));
    }

    setSelectedRoom(roomObj);
    setSelectedAccommodation(null);
    setCheckoutData(null);
    window.history.pushState({}, '', `/room/${roomId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const detailed = await apiService.getRoomById(roomId);
      if (detailed && (detailed.id || detailed.title)) {
        setSelectedRoom(detailed);
      }
    } catch (e) {}
  };

  // Back from Accommodation Detail to Home
  const handleBackFromAccommodation = () => {
    setSelectedAccommodation(null);
    setSelectedRoom(null);
    setCheckoutData(null);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Checkout navigation with Instant Auth Guard & Recent Booking Feedback
  const [checkoutData, setCheckoutData] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [recentBooking, setRecentBooking] = useState(null);

  // Back from Room Detail to Parent Accommodation
  const handleBackToAccommodation = async (accomId, bookingContext = null) => {
    setSelectedRoom(null);
    setCheckoutData(null);
    const targetId = accomId || (selectedRoom?.accommodationId || selectedRoom?.accommodation?.id || 1);
    window.history.pushState({}, '', `/accommodation/${targetId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const qIn = searchParams.checkIn || searchParams.checkInDate;
      const qOut = searchParams.checkOut || searchParams.checkOutDate;
      const detailed = await apiService.getAccommodationById(targetId, qIn, qOut);
      if (detailed) {
        setSelectedAccommodation(detailed);
      }
    } catch (e) {}
  };

  // Back from room detail to home
  const handleBackFromRoomDetail = () => {
    if (selectedRoom?.accommodationId || selectedRoom?.accommodation?.id) {
      handleBackToAccommodation(selectedRoom.accommodationId || selectedRoom.accommodation?.id);
    } else {
      setSelectedRoom(null);
      setSelectedAccommodation(null);
      setCheckoutData(null);
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartCheckout = (roomToBook, bookingParams) => {
    const token = localStorage.getItem('token');
    const isLoggedIn = Boolean(token || (user && user.id));

    // Synchronize global searchParams with this bookingParams
    if (bookingParams) {
      setSearchParams((prev) => ({
        ...prev,
        ...bookingParams,
        checkIn: bookingParams.checkIn || bookingParams.checkInDate || prev.checkIn,
        checkInDate: bookingParams.checkIn || bookingParams.checkInDate || prev.checkInDate,
        checkOut: bookingParams.checkOut || bookingParams.checkOutDate || prev.checkOut,
        checkOutDate: bookingParams.checkOut || bookingParams.checkOutDate || prev.checkOutDate,
        guests: bookingParams.guests || prev.guests,
        nights: bookingParams.nights || prev.nights,
      }));
    }

    if (!isLoggedIn) {
      toast.info(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập hoặc đăng ký tài khoản để tiến hành đặt phòng nghỉ dưỡng.'
      );
      setPendingCheckout({ room: roomToBook, bookingParams });
      setAuthModal({ isOpen: true, tab: 'login' });
      return;
    }

    setCheckoutData({ room: roomToBook, bookingParams });
    window.history.pushState({}, '', `/book/${roomToBook.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromCheckout = (completedBooking = null) => {
    if (completedBooking) {
      setRecentBooking(completedBooking);
    }
    const prevRoom = checkoutData?.room;
    setCheckoutData(null);
    setPendingCheckout(null);
    const targetAccomId = prevRoom?.accommodationId || prevRoom?.accommodation?.id || selectedAccommodation?.id;
    if (targetAccomId) {
      handleBackToAccommodation(targetAccomId, completedBooking || recentBooking);
    } else if (selectedRoom) {
      window.history.pushState({}, '', `/room/${selectedRoom.id}`);
    } else if (selectedAccommodation) {
      window.history.pushState({}, '', `/accommodation/${selectedAccommodation.id}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reloadAccommodations = async () => {
    try {
      const rms = await apiService.getAccommodations();
      if (Array.isArray(rms)) {
        setRooms(rms);
      }
    } catch (e) {
      console.error('Error reloading accommodations in App:', e);
    }
  };

  // Load initial data & auto-fetch accommodation/room if on detail URL
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const initSearch = getInitialSearchParams();
      const accomParams = {};
      if (initSearch.checkInDate) accomParams.check_in = initSearch.checkInDate;
      if (initSearch.checkOutDate) accomParams.check_out = initSearch.checkOutDate;
      if (initSearch.destination) accomParams.destination = initSearch.destination;
      if (initSearch.guests > 1) accomParams.guests = initSearch.guests;

      const [cats, rms, exps] = await Promise.all([
        apiService.getCategories(),
        apiService.getAccommodations(accomParams),
        apiService.getExperiences(),
      ]);
      setCategories(cats);
      setRooms(rms);
      setExperiences(exps);
      setLoading(false);

      // Check if URL has map accommodationId
      const urlMapId = getMapAccommodationIdFromUrl();
      if (urlMapId) {
        try {
          const single = await apiService.getAccommodationById(urlMapId);
          if (single && (single.id || single.title)) {
            setMapTargetAccommodation(single);
          } else {
            const found = rms.find((r) => String(r.id) === String(urlMapId));
            if (found) setMapTargetAccommodation(found);
          }
        } catch (e) {
          const found = rms.find((r) => String(r.id) === String(urlMapId));
          if (found) setMapTargetAccommodation(found);
        }
        return;
      }

      // Check if URL has accommodationId
      const urlAccomId = getAccommodationIdFromUrl();
      if (urlAccomId) {
        try {
          const single = await apiService.getAccommodationById(urlAccomId);
          if (single && (single.id || single.title)) {
            setSelectedAccommodation(single);
          } else {
            const found = rms.find((r) => String(r.id) === String(urlAccomId));
            if (found) setSelectedAccommodation(found);
          }
        } catch (e) {
          const found = rms.find((r) => String(r.id) === String(urlAccomId));
          if (found) setSelectedAccommodation(found);
        }
        return;
      }

      // Check if URL has roomId
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
    const bookingCode = bookingData.id || bookingData.code || ('TN-' + Math.floor(100000 + Math.random() * 900000));
    const totalPrice = bookingData.totalPrice || bookingData.total_price || bookingData.totalAmount || 7500000;
    const hostEarnings = Math.round(totalPrice * 0.88);
    const guestName = bookingData.fullName || bookingData.guest_name || bookingData.customerName || bookingData.guestName || user?.full_name || 'Khách du lịch TripNest';
    const guestPhone = bookingData.phone || bookingData.guest_phone || bookingData.guestPhone || '0912 345 678';
    const guestEmail = bookingData.email || bookingData.guest_email || 'guest@tripnest.vn';
    const roomTitle = bookingData.roomTitle || bookingData.room?.title || bookingData.room?.name || 'Chỗ nghỉ cao cấp TripNest';
    const today = new Date();
    const dTomorrow = new Date(today);
    dTomorrow.setDate(today.getDate() + 1);
    const dAfterTomorrow = new Date(today);
    dAfterTomorrow.setDate(today.getDate() + 3);
    const defaultCheckIn = dTomorrow.toISOString().split('T')[0];
    const defaultCheckOut = dAfterTomorrow.toISOString().split('T')[0];

    const checkIn = bookingData.checkIn || bookingData.check_in_date || bookingData.checkInDate || defaultCheckIn;
    const checkOut = bookingData.checkOut || bookingData.check_out_date || bookingData.checkOutDate || defaultCheckOut;
    const calcNights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const nights = Number(bookingData.nights) || (isNaN(calcNights) ? 2 : calcNights);
    const guests = bookingData.guests || bookingData.guests_count || 2;

    const newBooking = {
      id: bookingCode,
      code: bookingCode,
      roomId: bookingData.roomId || bookingData.room_id || 1,
      roomTitle,
      guestName,
      guestPhone,
      guestEmail,
      checkIn,
      checkOut,
      nights,
      guests,
      totalPrice,
      hostEarnings,
      paymentMethod: bookingData.paymentMethod || bookingData.payment_method || 'Credit Card (Visa)',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);

    // 1. Đồng bộ tức thời vào danh sách đơn của Kênh Chủ Nhà (tripnest_host_bookings)
    try {
      const existingHostBookings = JSON.parse(localStorage.getItem('tripnest_host_bookings') || '[]');
      const hostEntry = {
        id: 'BK-' + Date.now().toString().slice(-4),
        code: bookingCode,
        guestName,
        guestPhone,
        guestEmail,
        roomTitle,
        checkIn,
        checkOut,
        nights,
        guests,
        totalAmount: totalPrice,
        hostEarnings,
        status: 'confirmed',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      const filteredHost = existingHostBookings.filter((b) => b.code !== bookingCode && b.id !== bookingCode);
      localStorage.setItem('tripnest_host_bookings', JSON.stringify([hostEntry, ...filteredHost]));
    } catch {
      // ignore
    }

    // 2. Đồng bộ tức thời vào danh sách đơn của Admin Portal (tripnest_admin_data_v1)
    try {
      const STORAGE_KEY = 'tripnest_admin_data_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      let adminData = raw ? JSON.parse(raw) : null;
      if (adminData) {
        const adminBookingEntry = {
          id: bookingCode,
          room_name: roomTitle,
          room_id: bookingData.roomId || bookingData.room_id || 1,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          host_name: 'Minh Vũ',
          check_in: checkIn.includes('/') ? checkIn.split('/').reverse().join('-') : checkIn,
          check_out: checkOut.includes('/') ? checkOut.split('/').reverse().join('-') : checkOut,
          nights,
          guests_count: guests,
          base_price: bookingData.base_price || hostEarnings,
          cleaning_fee: bookingData.cleaning_fee || 0,
          service_fee: bookingData.service_fee || Math.round(totalPrice * 0.12),
          total_price: totalPrice,
          host_earnings: hostEarnings,
          currency: 'VND',
          payment_method: bookingData.paymentMethod || 'Credit Card (Visa)',
          payment_status: 'paid',
          status: 'confirmed',
          special_requests: bookingData.guestNote || bookingData.special_requests || '',
          created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
        };
        const filteredAdmin = (adminData.bookings || []).filter((b) => b.id !== bookingCode);
        adminData.bookings = [adminBookingEntry, ...filteredAdmin];

        // Recalculate stats dynamically
        const totalRev = adminData.bookings
          .filter((b) => b.status !== 'cancelled')
          .reduce((sum, b) => sum + (b.total_price || 0), 0);
        const commission = Math.round(totalRev * 0.12);
        adminData.stats = {
          ...adminData.stats,
          totalRevenueVND: totalRev,
          commissionRevenueVND: commission,
          totalBookings: adminData.bookings.length,
          completedBookings: adminData.bookings.filter((b) => b.status === 'completed').length,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
      }
    } catch {
      // ignore
    }
  };

  // Cancel booking — update status instead of removing from list
  const handleCancelBooking = (bookingId, reason = '', refundData = null) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              cancellationReason: reason || 'Khách hàng yêu cầu hủy.',
              cancelledAt: new Date().toISOString(),
              refundAmount: refundData?.amount ?? b.refundAmount ?? 0,
              refundPercentage: refundData?.percentage ?? b.refundPercentage ?? 0,
              refundSummary: refundData ?? b.refundSummary,
              canCancel: false,
              canCheckIn: false,
              canCheckOut: false,
            }
          : b
      )
    );

    // Sync to Host Portal localStorage
    try {
      const hostBookings = JSON.parse(localStorage.getItem('tripnest_host_bookings') || '[]');
      const updated = hostBookings.map((b) =>
        (b.code === bookingId || b.id === bookingId)
          ? {
              ...b,
              status: 'cancelled',
              cancellationReason: reason || b.cancellationReason,
              refundAmount: refundData?.amount ?? b.refundAmount ?? 0,
              refundPercentage: refundData?.percentage ?? b.refundPercentage ?? 0,
            }
          : b
      );
      localStorage.setItem('tripnest_host_bookings', JSON.stringify(updated));

      const hostPayouts = JSON.parse(localStorage.getItem('tripnest_host_payout_history') || '[]');
      if (Array.isArray(hostPayouts)) {
        localStorage.setItem(
          'tripnest_host_payout_history',
          JSON.stringify(
            hostPayouts.map((p) =>
              p.bookingCode === bookingId || p.note?.includes(bookingId)
                ? { ...p, status: 'cancelled' }
                : p
            )
          )
        );
      }
    } catch {}

    // Sync to Admin Portal localStorage
    try {
      const STORAGE_KEY = 'tripnest_admin_data_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const adminData = JSON.parse(raw);
        if (adminData.bookings) {
          adminData.bookings = adminData.bookings.map((b) =>
            b.id === bookingId || b.code === bookingId
              ? {
                  ...b,
                  status: 'cancelled',
                  cancellation_reason: reason || b.cancellation_reason,
                  refund_amount: refundData?.amount ?? b.refund_amount ?? 0,
                  refund_percentage: refundData?.percentage ?? b.refund_percentage ?? 0,
                }
              : b
          );
          if (adminData.payouts && Array.isArray(adminData.payouts)) {
            adminData.payouts = adminData.payouts.map((p) =>
              p.booking_code === bookingId || p.bookingCode === bookingId || p.note?.includes(bookingId)
                ? { ...p, status: 'cancelled' }
                : p
            );
          }
          const totalRev = adminData.bookings
            .filter((b) => b.status !== 'cancelled' && b.status !== 'refunded')
            .reduce((sum, b) => sum + (b.total_price || 0), 0);
          const cancelledList = adminData.bookings.filter((b) => b.status === 'cancelled' || b.status === 'refunded');
          const totalRefunded = cancelledList.reduce((sum, b) => sum + (b.refund_amount || b.refundAmount || 0), 0);

          adminData.stats = {
            ...adminData.stats,
            totalRevenueVND: totalRev,
            commissionRevenueVND: Math.round(totalRev * 0.12),
            totalRefundedVND: totalRefunded,
            cancelledBookingsCount: cancelledList.length,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(adminData));
        }
      }
    } catch {}
  };

  // Check-in booking — update status in state
  const handleCheckIn = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'checked_in',
              checkedInAt: new Date().toISOString(),
              canCancel: false,
              canCheckIn: false,
              canCheckOut: true,
            }
          : b
      )
    );

    try {
      const hostBookings = JSON.parse(localStorage.getItem('tripnest_host_bookings') || '[]');
      localStorage.setItem('tripnest_host_bookings', JSON.stringify(
        hostBookings.map((b) =>
          (b.code === bookingId || b.id === bookingId) ? { ...b, status: 'checked_in' } : b
        )
      ));
    } catch {}
  };

  // Check-out booking — update status in state
  const handleCheckOut = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed',
              checkedOutAt: new Date().toISOString(),
              canCancel: false,
              canCheckIn: false,
              canCheckOut: false,
              canReview: true,
            }
          : b
      )
    );

    try {
      const hostBookings = JSON.parse(localStorage.getItem('tripnest_host_bookings') || '[]');
      localStorage.setItem('tripnest_host_bookings', JSON.stringify(
        hostBookings.map((b) =>
          (b.code === bookingId || b.id === bookingId) ? { ...b, status: 'completed' } : b
        )
      ));
    } catch {}
  };

  // Handle Search Execution from Header & synchronize URL
  const handleSearchExecute = async (params) => {
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

    // Fetch accommodations with real-time date availability & dynamic minPrice
    try {
      const searchAccomParams = {};
      if (params.checkInDate) searchAccomParams.check_in = params.checkInDate;
      if (params.checkOutDate) searchAccomParams.check_out = params.checkOutDate;
      if (params.destination) searchAccomParams.destination = params.destination;
      if (params.guests > 1) searchAccomParams.guests = params.guests;
      const updatedRms = await apiService.getAccommodations(searchAccomParams);
      if (Array.isArray(updatedRms)) {
        setRooms(updatedRms);
      }
    } catch (err) {
      console.error('Error fetching accommodations with search dates:', err);
    }

    // Smooth scroll to listing grid
    setTimeout(() => {
      const el = document.getElementById('rooms-listing-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Clear search parameters
  const handleClearSearch = async () => {
    setSearchParams({});
    window.history.pushState({}, '', '/');
    try {
      const allRms = await apiService.getAccommodations({});
      if (Array.isArray(allRms)) setRooms(allRms);
    } catch (e) {}
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
    return (
      <AdminLayout
        onExitAdmin={handleExitAdmin}
        onOpenBookings={handleOpenMyTrips}
        onSwitchToHost={() => {
          setIsAdminOpen(false);
          setIsHostOpen(true);
          window.history.pushState({}, '', '/host');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLogout={async () => {
          await apiService.logout();
          dispatch({ type: 'UPDATE', payload: {} });
          setIsAdminOpen(false);
          window.history.pushState({}, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Render Host Portal if host mode is active
  if (isHostOpen) {
    return (
      <HostLayout
        currency={currency}
        onSwitchToClient={() => {
          reloadAccommodations();
          setIsHostOpen(false);
          window.history.pushState({}, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAccommodationCreated={() => {
          reloadAccommodations();
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
        onOpenBookings={handleOpenMyTrips}
        onLogout={async () => {
          await apiService.logout();
          dispatch({ type: 'UPDATE', payload: {} });
          setIsHostOpen(false);
          window.history.pushState({}, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // Render Standalone Dedicated Map & Directions Page
  if (mapTargetAccommodation) {
    return (
      <MapDirectionsPage
        accommodation={mapTargetAccommodation}
        onBack={handleBackFromMapPage}
        onBookNow={() => {
          handleSelectAccommodation(mapTargetAccommodation);
          setMapTargetAccommodation(null);
        }}
        currency={currency}
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
        onOpenBookings={handleOpenMyTrips}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenBecomeHost={() => {
          if (!user || (!user.id && !user.email)) {
            setAuthModal({ isOpen: true, tab: 'login' });
            return;
          }
          setIsBecomeHostModalOpen(true);
        }}
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
            setIsBecomeHostModalOpen(true);
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
        {isMyTripsOpen ? (
          /* Dedicated Standalone My Trips Page */
          <MyTripsPage
            onBack={handleBackFromMyTrips}
            onSelectRoom={handleSelectRoom}
            onSelectAccommodation={handleSelectAccommodation}
            onCancelBooking={handleCancelBooking}
            currency={currency}
          />
        ) : checkoutData && checkoutData.room ? (
          /* Dedicated Standalone Checkout & Booking Page */
          <BookingCheckoutPage
            room={checkoutData.room}
            bookingParams={checkoutData.bookingParams}
            currency={currency}
            user={user}
            onRequireLogin={() => {
              toast.info('Yêu cầu đăng nhập', 'Vui lòng đăng nhập hoặc đăng ký tài khoản để hoàn tất đặt phòng.');
              setAuthModal({ isOpen: true, tab: 'login' });
            }}
            onBack={(completedBooking) => handleBackFromCheckout(completedBooking)}
            onBookingComplete={(order) => {
              handleBookRoom(order);
            }}
          />
        ) : selectedRoom ? (
          /* Dedicated Standalone Room Detail Page (Level 3 Child Room) */
          <RoomDetailPage
            room={selectedRoom}
            allRooms={rooms}
            experiences={experiences}
            searchParams={searchParams}
            onBack={handleBackFromRoomDetail}
            onBackToAccommodation={handleBackToAccommodation}
            onSelectRoom={handleSelectRoom}
            onOpenMapPage={handleOpenMapPage}
            currency={currency}
            isFavorite={wishlistIds.includes(selectedRoom.id)}
            onToggleFavorite={handleToggleFavorite}
            onBookRoom={handleBookRoom}
            onStartCheckout={handleStartCheckout}
            recentBooking={recentBooking}
            onClearRecentBooking={() => setRecentBooking(null)}
          />
        ) : selectedAccommodation ? (
          /* Dedicated Standalone Accommodation Detail Page (Level 2 Parent Accommodation) */
          <AccommodationDetailPage
            accommodation={selectedAccommodation}
            allAccommodations={rooms}
            searchParams={searchParams}
            onBack={handleBackFromAccommodation}
            onSelectAccommodation={handleSelectAccommodation}
            onOpenRoomDetail={(roomItem, bookingContext) => handleSelectRoom(roomItem, bookingContext)}
            onOpenMapPage={handleOpenMapPage}
            currency={currency}
            isFavorite={wishlistIds.includes(selectedAccommodation.id)}
            onToggleFavorite={handleToggleFavorite}
            onStartCheckout={({ room, bookingParams }) => handleStartCheckout(room, bookingParams)}
            recentBooking={recentBooking}
            onClearRecentBooking={() => setRecentBooking(null)}
          />
        ) : (
          /* Standard Home Explore & Listing View (Level 1 Accommodations List) */
          <>
            {/* Category Navigation Bar & Filters */}
            <CategoryBar
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              onOpenFilters={() => setIsFilterOpen(true)}
              activeFilterCount={activeFilterCount}
              showTotalBeforeTaxes={showTotalBeforeTaxes}
              setShowTotalBeforeTaxes={handleSetShowTotalBeforeTaxes}
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
                <ListingGridSkeleton count={8} />
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
                      onOpenDetail={(r) => handleSelectAccommodation(r)}
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
            {loading ? (
              <ExperienceSectionSkeleton />
            ) : experiences.length > 0 ? (
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
            ) : null}
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
        allRooms={rooms}
        searchParams={searchParams}
        activeCategory={activeCategory}
      />

      <AuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.tab}
        onClose={() => {
          setAuthModal({ isOpen: false, tab: 'login' });
        }}
        onAuthSuccess={(userData) => {
          if (userData?.role === 'admin') {
            window.history.pushState({}, '', '/admin');
            setIsAdminOpen(true);
            return;
          }
          if (pendingCheckout && pendingCheckout.room) {
            setCheckoutData(pendingCheckout);
            window.history.pushState({}, '', `/book/${pendingCheckout.room.id}`);
            setPendingCheckout(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
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

      <BecomeHostModal
        isOpen={isBecomeHostModalOpen}
        onClose={() => setIsBecomeHostModalOpen(false)}
        user={user}
        onSuccess={() => {
          setIsBecomeHostModalOpen(false);
        }}
      />

      {/* Floating AI Travel Assistant Chat Bubble */}
      <AiChatBubble />
    </div>
  );
}

export default App;
