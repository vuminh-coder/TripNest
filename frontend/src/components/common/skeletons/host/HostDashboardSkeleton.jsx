import React from 'react';
import { Skeleton } from '../Skeleton';
import '@/pages/host/pages/HostDashboardPage.css';

export const HostDashboardSkeleton = () => {
  return (
    <div className="host-dash-container" aria-busy="true" aria-label="Đang tải dữ liệu tổng quan">
      {/* 1. Header Toolbar Skeleton */}
      <div className="host-dash-header-toolbar">
        <div className="host-dash-header-left">
          <Skeleton width="230px" height="26px" borderRadius="6px" style={{ marginBottom: '4px' }} />
          <Skeleton width="360px" height="14px" borderRadius="4px" />
        </div>
        <div className="host-dash-toolbar-controls">
          <div className="host-dash-period-pills" style={{ display: 'flex', gap: '3px' }}>
            {['52px', '68px', '52px', '54px'].map((w, idx) => (
              <Skeleton key={idx} width={w} height="28px" borderRadius="6px" />
            ))}
          </div>
          <Skeleton width="135px" height="32px" borderRadius="8px" />
        </div>
      </div>

      {/* 2. Executive 4 KPI Glass Cards Grid */}
      <div className="host-dash-kpi-grid">
        {/* Card 1: Số dư ví khả dụng (Coral) */}
        <div className="stat-card-glass card-border-emerald">
          <div className="stat-card-content">
            <Skeleton width="105px" height="11px" borderRadius="3px" />
            <Skeleton width="135px" height="24px" borderRadius="5px" style={{ margin: '6px 0 4px' }} />
            <Skeleton width="115px" height="11px" borderRadius="3px" />
          </div>
          <Skeleton circle height="32px" width="32px" style={{ flexShrink: 0, marginLeft: '6px' }} />
        </div>

        {/* Card 2: Quỹ Escrow tạm giữ (Amber) */}
        <div className="stat-card-glass card-border-amber">
          <div className="stat-card-content">
            <Skeleton width="115px" height="11px" borderRadius="3px" />
            <Skeleton width="130px" height="24px" borderRadius="5px" style={{ margin: '6px 0 4px' }} />
            <Skeleton width="125px" height="11px" borderRadius="3px" />
          </div>
          <Skeleton circle height="32px" width="32px" style={{ flexShrink: 0, marginLeft: '6px' }} />
        </div>

        {/* Card 3: Tổng doanh thu GMV (Coral) */}
        <div className="stat-card-glass card-border-coral">
          <div className="stat-card-content">
            <Skeleton width="120px" height="11px" borderRadius="3px" />
            <Skeleton width="145px" height="24px" borderRadius="5px" style={{ margin: '6px 0 4px' }} />
            <Skeleton width="110px" height="11px" borderRadius="3px" />
          </div>
          <Skeleton circle height="32px" width="32px" style={{ flexShrink: 0, marginLeft: '6px' }} />
        </div>

        {/* Card 4: Đơn đặt & Lấp phòng (Indigo) */}
        <div className="stat-card-glass card-border-indigo">
          <div className="stat-card-content">
            <Skeleton width="125px" height="11px" borderRadius="3px" />
            <Skeleton width="65px" height="24px" borderRadius="5px" style={{ margin: '6px 0 4px' }} />
            <div style={{ width: '100%', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <Skeleton width="55px" height="9px" />
                <Skeleton width="25px" height="9px" />
              </div>
              <Skeleton width="100%" height="4px" borderRadius="2px" />
            </div>
          </div>
          <Skeleton circle height="32px" width="32px" style={{ flexShrink: 0, marginLeft: '6px' }} />
        </div>
      </div>

      {/* 3. Lưới 2 Khối Biểu Đồ Chủ Lực (Tỷ lệ 64% / 36%, Chiều cao chuẩn 420px) */}
      <div className="host-dash-charts-grid">
        {/* Khối Trái (64%): Timeline Chart */}
        <div className="host-dash-chart-col-main">
          <div
            className="host-card-base"
            style={{
              height: '420px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #edf2f7',
              padding: '0.85rem 1rem',
            }}
          >
            {/* Header Chart */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton width="32px" height="32px" borderRadius="8px" />
                <div>
                  <Skeleton width="130px" height="16px" borderRadius="4px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="190px" height="12px" borderRadius="3px" />
                </div>
              </div>
              <Skeleton width="150px" height="24px" borderRadius="12px" />
            </div>

            {/* Stream switch pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                background: '#f8fafc',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid #edf2f7',
                marginBottom: '12px',
              }}
            >
              {[1, 2, 3].map((_, i) => (
                <Skeleton key={i} width="100%" height="32px" borderRadius="6px" />
              ))}
            </div>

            {/* Canvas Area with horizontal gridlines */}
            <div className="sk-chart-mock-canvas" style={{ flex: 1, minHeight: 0 }}>
              <div className="sk-chart-gridline" />
              <div className="sk-chart-gridline" />
              <div className="sk-chart-gridline" />
              <div className="sk-chart-gridline" />
              <div className="sk-chart-curve-placeholder" />

              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                {['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'].map((_, i) => (
                  <Skeleton key={i} width="42px" height="10px" borderRadius="3px" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Khối Phải (36%): Donut Cashflow */}
        <div className="host-dash-chart-col-side">
          <div
            className="host-card-base"
            style={{
              height: '420px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #edf2f7',
              padding: '0.85rem 1rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton width="32px" height="32px" borderRadius="8px" />
                <div>
                  <Skeleton width="115px" height="16px" borderRadius="4px" style={{ marginBottom: '4px' }} />
                  <Skeleton width="135px" height="12px" borderRadius="3px" />
                </div>
              </div>
              <Skeleton width="110px" height="24px" borderRadius="12px" />
            </div>

            {/* Donut Ring with Center Hole */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
              <div className="sk-donut-ring-wrap">
                <Skeleton circle height="150px" width="150px" />
                <div className="sk-donut-center-hole">
                  <Skeleton width="55px" height="8px" borderRadius="2px" />
                  <Skeleton width="70px" height="13px" borderRadius="3px" />
                  <Skeleton width="50px" height="8px" borderRadius="2px" />
                </div>
              </div>
            </div>

            {/* 3 Cashflow breakdown rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              {[1, 2, 3].map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Skeleton circle height="12px" width="12px" />
                    <div>
                      <Skeleton width="110px" height="11px" borderRadius="3px" style={{ marginBottom: '3px' }} />
                      <Skeleton width="85px" height="9px" borderRadius="2px" />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Skeleton width="75px" height="12px" borderRadius="3px" style={{ marginBottom: '3px' }} />
                    <Skeleton width="32px" height="9px" borderRadius="2px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Bookings Table Skeleton */}
      <div className="host-panel-card">
        <div className="host-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Skeleton width="18px" height="18px" borderRadius="4px" />
            <Skeleton width="180px" height="18px" borderRadius="4px" />
          </div>
          <Skeleton width="90px" height="14px" borderRadius="4px" />
        </div>

        <div style={{ padding: '0 1.15rem' }}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.6fr 2.4fr 1.8fr 1.2fr 1fr 1fr',
                gap: '0.85rem',
                alignItems: 'center',
                padding: '0.8rem 0',
                borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              <Skeleton width="75px" height="16px" borderRadius="4px" />
              <div>
                <Skeleton width="115px" height="15px" borderRadius="3px" style={{ marginBottom: '3px' }} />
                <Skeleton width="60px" height="10px" borderRadius="2px" />
              </div>
              <div>
                <Skeleton width="160px" height="15px" borderRadius="3px" style={{ marginBottom: '3px' }} />
                <Skeleton width="90px" height="10px" borderRadius="2px" />
              </div>
              <div>
                <Skeleton width="130px" height="13px" borderRadius="3px" style={{ marginBottom: '3px' }} />
                <Skeleton width="45px" height="10px" borderRadius="2px" />
              </div>
              <Skeleton width="85px" height="15px" borderRadius="4px" />
              <Skeleton width="65px" height="22px" borderRadius="12px" />
              <Skeleton width="65px" height="26px" borderRadius="6px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardSkeleton;
