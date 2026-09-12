import React from 'react';
import { Skeleton } from '../Skeleton';
import '@/pages/host/pages/HostRankingsPage.css';

export const HostRankingsSkeleton = () => {
  return (
    <div className="adm-hosts-revenue-container host-rank-admin-mirror" aria-busy="true" aria-label="Đang tải bảng xếp hạng cơ sở lưu trú">
      {/* 1. Header Toolbar (AdminPageHeader Mirror) */}
      <div className="admin-page-header" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-header-main">
          <div>
            <Skeleton width="190px" height="20px" borderRadius="12px" style={{ marginBottom: '8px' }} />
            <Skeleton width="420px" height="30px" borderRadius="6px" style={{ marginBottom: '6px' }} />
            <Skeleton width="540px" height="14px" borderRadius="4px" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton width="125px" height="36px" borderRadius="8px" />
            <Skeleton width="135px" height="36px" borderRadius="8px" />
          </div>
        </div>
      </div>

      {/* 2. Top 3 Podium Winners Grid Skeleton */}
      <div className="adm-hr-podium-section">
        <div className="adm-hr-section-header">
          <div className="adm-hr-section-title">
            <Skeleton width="22px" height="22px" borderRadius="4px" />
            <Skeleton width="340px" height="20px" borderRadius="4px" />
          </div>
          <Skeleton width="280px" height="13px" borderRadius="3px" />
        </div>

        <div className="adm-hr-podium-grid">
          {/* Rank 2 - Silver (Á Quân) */}
          <div className="adm-hr-podium-card rank-2">
            <div className="adm-hr-podium-rank rank-2" style={{ justifyContent: 'center' }}>
              <Skeleton width="90px" height="18px" borderRadius="10px" />
            </div>
            <div className="adm-hr-podium-avatar-container">
              <div className="adm-hr-podium-avatar-wrap">
                <Skeleton circle height="64px" width="64px" />
              </div>
            </div>
            <div style={{ margin: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="160px" height="18px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Skeleton width="180px" height="12px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <Skeleton width="130px" height="22px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Skeleton width="115px" height="13px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="120px" height="34px" borderRadius="8px" />
            </div>
          </div>

          {/* Rank 1 - Gold (Quán Quân) */}
          <div className="adm-hr-podium-card rank-1">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
              <Skeleton circle height="32px" width="32px" />
            </div>
            <div className="adm-hr-podium-rank rank-1" style={{ justifyContent: 'center' }}>
              <Skeleton width="110px" height="20px" borderRadius="10px" />
            </div>
            <div className="adm-hr-podium-avatar-container main">
              <div className="adm-hr-podium-avatar-wrap main">
                <Skeleton circle height="80px" width="80px" />
              </div>
            </div>
            <div style={{ margin: '10px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="200px" height="22px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Skeleton width="210px" height="13px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
              <Skeleton width="160px" height="26px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <Skeleton width="130px" height="14px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="180px" height="38px" borderRadius="8px" />
            </div>
          </div>

          {/* Rank 3 - Bronze (Quý Quân) */}
          <div className="adm-hr-podium-card rank-3">
            <div className="adm-hr-podium-rank rank-3" style={{ justifyContent: 'center' }}>
              <Skeleton width="90px" height="18px" borderRadius="10px" />
            </div>
            <div className="adm-hr-podium-avatar-container">
              <div className="adm-hr-podium-avatar-wrap">
                <Skeleton circle height="64px" width="64px" />
              </div>
            </div>
            <div style={{ margin: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="160px" height="18px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <Skeleton width="180px" height="12px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <Skeleton width="130px" height="22px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <Skeleton width="115px" height="13px" borderRadius="3px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="120px" height="34px" borderRadius="8px" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Filter Card Skeleton */}
      <div className="adm-hr-toolbar-card">
        <div className="adm-hr-toolbar-top">
          {/* Category Tabs */}
          <div className="adm-hr-filter-tabs" style={{ display: 'flex', gap: '4px' }}>
            {['80px', '115px', '110px', '105px'].map((w, idx) => (
              <Skeleton key={idx} width={w} height="32px" borderRadius="8px" />
            ))}
          </div>

          {/* Period Selector Pills & Actions */}
          <div className="adm-hr-actions-group">
            <div className="host-rank-period-pills" style={{ display: 'flex', gap: '3px' }}>
              {['55px', '74px', '58px', '70px'].map((w, idx) => (
                <Skeleton key={idx} width={w} height="28px" borderRadius="6px" />
              ))}
            </div>
            <Skeleton width="88px" height="32px" borderRadius="8px" />
            <Skeleton width="94px" height="32px" borderRadius="8px" />
          </div>
        </div>

        {/* Bottom Row: Search Box & Sort Dropdown */}
        <div className="adm-hr-toolbar-bottom" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="100%" height="38px" borderRadius="8px" />
          </div>
          <div style={{ width: '220px' }}>
            <Skeleton width="100%" height="38px" borderRadius="8px" />
          </div>
        </div>
      </div>

      {/* 4. SaaS Table Skeleton */}
      <div className="adm-hr-table-card">
        <div className="adm-hr-table-responsive">
          <table className="adm-hr-table">
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Hạng</th>
                <th style={{ minWidth: '300px' }}>Cơ Sở Lưu Trú</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Thành Phố</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Đơn Hoàn Tất</th>
                <th style={{ minWidth: '150px' }}>GMV Thu Hộ (100%)</th>
                <th style={{ minWidth: '130px' }}>Thực Nhận (88%)</th>
                <th style={{ minWidth: '110px' }}>Phí Sàn (12%)</th>
                <th style={{ minWidth: '130px', textAlign: 'right' }}>Giá Bình Quân (ADR)</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                <tr key={i} className="adm-hr-table-row">
                  {/* Rank Badge */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <Skeleton circle height="28px" width="28px" />
                      <Skeleton width="34px" height="8px" borderRadius="2px" />
                    </div>
                  </td>

                  {/* Accommodation Cell */}
                  <td>
                    <div className="adm-hr-host-cell">
                      <div className="adm-hr-host-avatar-container">
                        <div className="adm-hr-host-avatar-wrap">
                          <Skeleton width="48px" height="48px" borderRadius="8px" />
                        </div>
                      </div>
                      <div className="adm-hr-host-info" style={{ flex: 1 }}>
                        <Skeleton width="75%" height="15px" borderRadius="3px" style={{ marginBottom: '4px' }} />
                        <Skeleton width="50%" height="11px" borderRadius="2px" style={{ marginBottom: '4px' }} />
                        <Skeleton width="60px" height="16px" borderRadius="4px" />
                      </div>
                    </div>
                  </td>

                  {/* City */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="60px" height="22px" borderRadius="12px" />
                    </div>
                  </td>

                  {/* Completed Bookings */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="50px" height="22px" borderRadius="12px" />
                    </div>
                  </td>

                  {/* GMV + Progress Bar */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Skeleton width="110px" height="16px" borderRadius="3px" />
                      <Skeleton width="80%" height="4px" borderRadius="2px" />
                    </div>
                  </td>

                  {/* Net Earnings */}
                  <td>
                    <Skeleton width="100px" height="16px" borderRadius="3px" />
                  </td>

                  {/* Commission */}
                  <td>
                    <Skeleton width="85px" height="15px" borderRadius="3px" />
                  </td>

                  {/* ADR + RevPAR */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <Skeleton width="90px" height="16px" borderRadius="3px" />
                      <Skeleton width="65px" height="10px" borderRadius="2px" />
                    </div>
                  </td>

                  {/* Action button */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Skeleton width="72px" height="28px" borderRadius="6px" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostRankingsSkeleton;
