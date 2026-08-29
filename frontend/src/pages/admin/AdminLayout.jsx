import React, { useState, useEffect } from 'react';
import './admin.css';
import { adminService } from '../../services/adminApi';
import { useToast } from '@/context/ToastContext';

import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

// 10 Distinct Pages
import DashboardPage from './pages/DashboardPage';
import AccommodationsPage from './pages/AccommodationsPage';
import BookingsPage from './pages/BookingsPage';
import HostsKycPage from './pages/HostsKycPage';
import UsersPage from './pages/UsersPage';
import RoleUpgradeRequestsPage from './pages/RoleUpgradeRequestsPage';
import FinancialsPage from './pages/FinancialsPage';
import ReviewsPage from './pages/ReviewsPage';
import CategoriesPage from './pages/CategoriesPage';
import ExperiencesPage from './pages/ExperiencesPage';

// Modals
import KycDetailModal from './modals/KycDetailModal';
import BookingDetailModal from './modals/BookingDetailModal';
import AccommodationEditModal from './modals/AccommodationEditModal';
import PayoutConfirmModal from './modals/PayoutConfirmModal';
import UserEditModal from './modals/UserEditModal';
import UserDetailModal from './modals/UserDetailModal';

export const AdminLayout = ({ onExitAdmin }) => {
  const toast = useToast();

  // Determine initial page from URL path
  const getInitialTabFromUrl = () => {
    const path = window.location.pathname.replace('/admin', '').replace('/', '');
    const validTabs = [
      'dashboard',
      'accommodations',
      'bookings',
      'hosts_kyc',
      'users',
      'role_requests',
      'financials',
      'reviews',
      'categories',
      'experiences',
    ];
    return validTabs.includes(path) ? path : 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTabFromUrl);
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDeleteError, setUserDeleteError] = useState('');

  // State Store
  const [stats, setStats] = useState({});
  const [accommodations, setAccommodations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [experiences, setExperiences] = useState([]);

  // Modals state
  const [selectedKycHost, setSelectedKycHost] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editAccommodation, setEditAccommodation] = useState(null);
  const [isEditAccOpen, setIsEditAccOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);

  // Sync URL with Tab
  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({}, '', `/admin/${tabId === 'dashboard' ? '' : tabId}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTabFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load all admin data
  const loadData = async () => {
    setLoading(true);
    try {
      const [
        st,
        accs,
        bks,
        hsts,
        usrs,
        cats,
        amns,
        revs,
        pyts,
        exps,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAccommodationAdmin(),
        adminService.getBookings(),
        adminService.getHosts(),
        adminService.getUsers(),
        adminService.getCategories(),
        adminService.getAmenities(),
        adminService.getReviews(),
        adminService.getPayouts(),
        adminService.getExperiences(),
      ]);

      setStats(st);
      setAccommodations(accs);
      setBookings(bks);
      setHosts(hsts);
      setUsers(usrs);
      setCategories(cats);
      setAmenities(amns);
      setReviews(revs);
      setPayouts(pyts);
      setExperiences(exps);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu admin:', error);
      toast.error('Không thể tải dữ liệu quản trị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetData = async () => {
    adminService.resetDemoData();
    await loadData();
  };

  // Accommodations Actions
  const handleUpdateAccStatus = async (id, status) => {
    const updated = await adminService.updateAccommodationStatus(id, status);
    setAccommodations(updated);
  };

  const handleToggleAccFlag = async (id, flagName) => {
    const updated = await adminService.toggleAccommodationFlag(id, flagName);
    setAccommodations(updated);
  };

  const handleSaveAccommodation = async (formData) => {
    const updated = await adminService.saveAccommodation(formData);
    setAccommodations(updated);
  };

  const handleDeleteAccommodation = async (id) => {
    const updated = await adminService.deleteAccommodation(id);
    setAccommodations(updated);
  };

  // Bookings Actions
  const handleUpdateBookingStatus = async (bookingId, status, reason = '') => {
    const updated = await adminService.updateBookingStatus(bookingId, status, reason);
    setBookings(updated);
    const st = await adminService.getDashboardStats();
    setStats(st);
  };

  // KYC Actions
  const handleApproveKyc = async (hostId) => {
    const updated = await adminService.updateKycStatus(hostId, 'verified');
    setHosts(updated);
    const st = await adminService.getDashboardStats();
    setStats(st);
  };

  const handleRejectKyc = async (hostId, reason) => {
    const updated = await adminService.updateKycStatus(hostId, 'rejected', reason);
    setHosts(updated);
    const st = await adminService.getDashboardStats();
    setStats(st);
  };

  const handleToggleSuperhost = async (hostId) => {
    const updated = await adminService.toggleSuperhost(hostId);
    setHosts(updated);
  };

  // Users Actions
  const handleToggleUserStatus = async (userId) => {
    const updated = await adminService.toggleUserStatus(userId);
    setUsers(updated);
  };

  const handleSaveUser = async (userData) => {
    const updated = await adminService.saveUser(userData);
    setUsers(updated);
    setIsEditUserOpen(false);
    setEditUser(null);
  };

  const handleDeleteUser = async (userId) => {
    setUserDeleteError('');
    try {
      const updated = await adminService.deleteUser(userId);
      setUsers(updated);
      toast.success(
        'Đã xóa người dùng thành công!',
        'Dữ liệu tài khoản đã được xóa an toàn khỏi hệ thống.'
      );
    } catch (error) {
      const errMsg = error.message || 'Có lỗi xảy ra khi xóa người dùng trên máy chủ.';
      setUserDeleteError(errMsg);
      toast.error('Không thể xóa tài khoản', errMsg);
    }
  };

  const handleApproveUpgrade = async (userId, approved, rejectionReason = '') => {
    const { users: updatedUsers, hosts: updatedHosts } = await adminService.approveRoleUpgrade(
      userId,
      approved,
      rejectionReason
    );
    setUsers(updatedUsers);
    if (updatedHosts) setHosts(updatedHosts);
    const st = await adminService.getDashboardStats();
    setStats(st);
  };

  // Payout Actions
  const handleCompletePayout = async (payoutId, ref) => {
    const updated = await adminService.completePayout(payoutId, ref);
    setPayouts(updated);
  };

  // Reviews Actions
  const handleUpdateReviewStatus = async (reviewId, status) => {
    try {
      const updated = await adminService.updateReviewStatus(reviewId, status);
      setReviews(updated);
      toast.success(
        status === 'approved' ? 'Đã duyệt hiển thị đánh giá' : status === 'hidden' ? 'Đã ẩn đánh giá khỏi hệ thống' : 'Đã gắn cờ đánh giá',
        'Trạng thái kiểm duyệt đã được lưu vào cơ sở dữ liệu.'
      );
    } catch (e) {
      toast.error('Lỗi khi cập nhật trạng thái đánh giá', e.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const updated = await adminService.deleteReview(reviewId);
      setReviews(updated);
      toast.success('Đã xóa đánh giá thành công khỏi cơ sở dữ liệu.');
    } catch (e) {
      toast.error('Lỗi khi xóa đánh giá: ' + e.message);
    }
  };

  const handleRespondReview = async (reviewId, hostResponse) => {
    try {
      const updated = await adminService.respondToReview(reviewId, hostResponse);
      setReviews(updated);
      toast.success('Đã lưu phản hồi thành công vào cơ sở dữ liệu!');
    } catch (e) {
      toast.error('Lỗi khi lưu phản hồi: ' + e.message);
    }
  };

  // Categories & Amenities Actions
  const handleToggleCategory = async (slug) => {
    const updated = await adminService.toggleCategoryActive(slug);
    setCategories(updated);
  };

  const handleAddAmenity = async (amenity) => {
    const updated = await adminService.addAmenity(amenity);
    setAmenities(updated);
  };

  // Experiences Actions
  const handleToggleExpActive = async (id) => {
    const updated = await adminService.toggleExperienceActive(id);
    setExperiences(updated);
  };

  const pendingRoleUpgradeCount = users.filter(
    (u) => u.role_upgrade_request && u.role_upgrade_request.status === 'pending'
  ).length;

  return (
    <div className="admin-portal-wrapper">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        pendingKycCount={stats.pendingKycCount || 0}
        pendingRoleUpgradeCount={pendingRoleUpgradeCount}
      />

      {/* Main Container */}
      <div className="admin-main-container">
        <AdminHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onExitAdmin={onExitAdmin}
          onResetData={handleResetData}
          pendingKycCount={stats.pendingKycCount || 0}
        />

        {/* Distinct Page View */}
        <main className="admin-content-view">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b', fontWeight: 600 }}>
              Đang tải dữ liệu Trung Tâm Quản Trị TripNest...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardPage
                  stats={stats}
                  bookings={bookings}
                  hosts={hosts}
                  onNavigate={handleNavigate}
                  onOpenKycModal={(h) => setSelectedKycHost(h)}
                />
              )}

              {activeTab === 'accommodations' && (
                <AccommodationsPage
                  accommodations={accommodations}
                  onUpdateStatus={handleUpdateAccStatus}
                  onToggleFlag={handleToggleAccFlag}
                  onOpenEditModal={(acc) => {
                    setEditAccommodation(acc);
                    setIsEditAccOpen(true);
                  }}
                  onDelete={handleDeleteAccommodation}
                />
              )}

              {activeTab === 'bookings' && (
                <BookingsPage
                  bookings={bookings}
                  onOpenDetailModal={(b) => setSelectedBooking(b)}
                  onUpdateStatus={handleUpdateBookingStatus}
                />
              )}

              {activeTab === 'hosts_kyc' && (
                <HostsKycPage
                  hosts={hosts}
                  onOpenKycModal={(h) => setSelectedKycHost(h)}
                  onToggleSuperhost={handleToggleSuperhost}
                />
              )}

              {activeTab === 'users' && (
                <UsersPage
                  users={users}
                  deleteError={userDeleteError}
                  onToggleStatus={handleToggleUserStatus}
                  onOpenDetailModal={(u) => setSelectedDetailUser(u)}
                  onOpenEditModal={(u) => {
                    setEditUser(u);
                    setIsEditUserOpen(true);
                  }}
                  onDeleteUser={handleDeleteUser}
                  onApproveUpgrade={handleApproveUpgrade}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'role_requests' && (
                <RoleUpgradeRequestsPage
                  users={users}
                  onApproveUpgrade={handleApproveUpgrade}
                  onNavigate={handleNavigate}
                />
              )}

              {activeTab === 'categories' && (
                <CategoriesPage
                  categories={categories}
                  amenities={amenities}
                  onToggleCategory={handleToggleCategory}
                  onAddAmenity={handleAddAmenity}
                />
              )}

              {activeTab === 'reviews' && (
                <ReviewsPage
                  reviews={reviews}
                  onUpdateReviewStatus={handleUpdateReviewStatus}
                  onDeleteReview={handleDeleteReview}
                  onRespondReview={handleRespondReview}
                />
              )}

              {activeTab === 'financials' && (
                <FinancialsPage
                  payouts={payouts}
                  stats={stats}
                  onOpenPayoutModal={(p) => setSelectedPayout(p)}
                />
              )}

              {activeTab === 'experiences' && (
                <ExperiencesPage
                  experiences={experiences}
                  onToggleActive={handleToggleExpActive}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Admin Modals */}
      {selectedKycHost && (
        <KycDetailModal
          host={selectedKycHost}
          onClose={() => setSelectedKycHost(null)}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc}
        />
      )}

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateBookingStatus}
        />
      )}

      {isEditAccOpen && (
        <AccommodationEditModal
          accommodation={editAccommodation}
          onClose={() => {
            setIsEditAccOpen(false);
            setEditAccommodation(null);
          }}
          onSave={handleSaveAccommodation}
        />
      )}

      {selectedDetailUser && (
        <UserDetailModal
          user={selectedDetailUser}
          onClose={() => setSelectedDetailUser(null)}
          onEdit={(u) => {
            setSelectedDetailUser(null);
            setEditUser(u);
            setIsEditUserOpen(true);
          }}
          onToggleStatus={handleToggleUserStatus}
          onApproveUpgrade={handleApproveUpgrade}
        />
      )}

      {isEditUserOpen && (
        <UserEditModal
          user={editUser}
          onClose={() => {
            setIsEditUserOpen(false);
            setEditUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {selectedPayout && (
        <PayoutConfirmModal
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
          onConfirm={handleCompletePayout}
        />
      )}
    </div>
  );
};

export default AdminLayout;