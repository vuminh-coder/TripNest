import React from 'react';
import { Skeleton } from '../Skeleton';

export const AdminDashboardSkeleton = () => {
  return (
    <div className="adm-dashboard-container">
      {/* 1. Header Toolbar Skeleton */}
      <div className="adm-dash-header-toolbar">
        <div className="adm-dash-header-left">
          <Skeleton width="340px" height="22px" borderRadius="6px" />
          <Skeleton width="280px" height="13px" borderRadius="4px" style={{ marginTop: '6px' }} />
        </div>
        <div className="adm-dash-toolbar-controls">
          <div className="adm-dash-period-pills">
            {['60px', '72px', '52px', '58px'].map((w, i) => (
              <Skeleton key={i} width={w} height="30px" borderRadius="8px" />
            ))}
          </div>
          <Skeleton width="110px" height="32px" borderRadius="8px" />
        </div>
      </div>

      {/* 2. Executive 5 KPI Glass Cards */}
      <div className="adm-dash-kpi-grid">
        {[
          { color: '#ff385c', label: '55%' },
          { color: '#10b981', label: '50%' },
          { color: '#0ea5e9', label: '60%' },
          { color: '#f59e0b', label: '48%' },
          { color: '#6366f1', label: '42%' },
        ].map((cfg, i) => (
          <div
            key={i}
            className="stat-card-glass"
            style={{ borderTop: `3px solid ${cfg.color}` }}
          >
            <div className="stat-card-content">
              <Skeleton width="75%" height="11px" borderRadius="3px" />
              <Skeleton
                width={cfg.label}
                height="22px"
                borderRadius="5px"
                style={{ marginTop: '6px' }}
              />
              <Skeleton
                width="60%"
                height="10px"
                borderRadius="3px"
                style={{ marginTop: '6px' }}
              />
            </div>
            <Skeleton
              circle
              height="32px"
              style={{ flexShrink: 0, marginLeft: '6px' }}
            />
          </div>
        ))}
      </div>

      {/* 3. Primary Charts Row: Timeline (64%) + Donut (36%) */}
      <div className="adm-dash-charts-row">
        {/* Timeline Chart Skeleton */}
        <div className="adm-dash-col-timeline">
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
            }}
          >
            {/* Stream Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                background: '#f8fafc',
                padding: '2.5px',
                borderRadius: '8px',
                border: '1px solid #edf2f7',
                marginBottom: '8px',
              }}
            >
              {[1, 2, 3, 4].map((_, i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height="32px"
                  borderRadius="6px"
                />
              ))}
            </div>

            {/* Legend + Snapshot Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                marginTop: '8px',
              }}
            >
              <Skeleton width="180px" height="24px" borderRadius="6px" />
              <Skeleton width="160px" height="28px" borderRadius="6px" />
            </div>

            {/* Chart Area */}
            <Skeleton
              width="100%"
              height="200px"
              borderRadius="6px"
            />
          </div>
        </div>

        {/* Donut Chart Skeleton */}
        <div className="adm-dash-col-donut">
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Skeleton width="65%" height="16px" borderRadius="5px" />
            <Skeleton
              width="45%"
              height="11px"
              borderRadius="3px"
              style={{ marginTop: '4px' }}
            />
            {/* Donut Ring Placeholder */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '12px 0',
              }}
            >
              <Skeleton circle height="140px" />
            </div>
            {/* Legend Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Skeleton circle height="10px" />
                    <Skeleton width="80px" height="11px" borderRadius="3px" />
                  </div>
                  <Skeleton width="55px" height="13px" borderRadius="4px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Realtime Operations Section: KYC + Recent Bookings */}
      <div className="adm-dash-2col-grid">
        {/* KYC Panel Skeleton */}
        <div className="adm-ops-card">
          <div className="adm-ops-header">
            <div className="adm-ops-title-group">
              <Skeleton
                circle
                height="30px"
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <Skeleton width="200px" height="15px" borderRadius="4px" />
                <Skeleton
                  width="160px"
                  height="10px"
                  borderRadius="3px"
                  style={{ marginTop: '4px' }}
                />
              </div>
            </div>
            <Skeleton width="80px" height="28px" borderRadius="6px" />
          </div>
          <div className="adm-ops-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    border: '1px solid #edf2f7',
                    borderRadius: '8px',
                  }}
                >
                  <Skeleton circle height="36px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="120px" height="13px" borderRadius="4px" />
                    <Skeleton
                      width="80px"
                      height="10px"
                      borderRadius="3px"
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  <Skeleton width="70px" height="26px" borderRadius="6px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Bookings Skeleton */}
        <div className="adm-ops-card">
          <div className="adm-ops-header">
            <div className="adm-ops-title-group">
              <Skeleton
                circle
                height="30px"
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <Skeleton width="190px" height="15px" borderRadius="4px" />
                <Skeleton
                  width="150px"
                  height="10px"
                  borderRadius="3px"
                  style={{ marginTop: '4px' }}
                />
              </div>
            </div>
            <Skeleton width="80px" height="28px" borderRadius="6px" />
          </div>
          <div className="adm-ops-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Skeleton width="30px" height="13px" borderRadius="3px" />
                      <Skeleton width="62px" height="17px" pill />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Skeleton width="90px" height="11px" borderRadius="3px" />
                      <Skeleton width="60px" height="11px" borderRadius="3px" />
                    </div>
                  </div>
                  <Skeleton width="85px" height="16px" borderRadius="4px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Host Revenue Bar Chart Skeleton */}
      <div className="adm-dash-host-section">
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #edf2f7',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Skeleton circle height="30px" />
              <div>
                <Skeleton width="230px" height="15px" borderRadius="4px" />
                <Skeleton
                  width="180px"
                  height="10px"
                  borderRadius="3px"
                  style={{ marginTop: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map((_, i) => (
                <Skeleton key={i} width="75px" height="20px" borderRadius="4px" />
              ))}
            </div>
          </div>

          {/* Host Bar Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[100, 88, 72, 60, 48].map((pct, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px',
                  border: '1px solid #edf2f7',
                  borderRadius: '8px',
                  background: '#f8fafc',
                }}
              >
                {/* Rank + Avatar + Name */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '175px',
                    flexShrink: 0,
                  }}
                >
                  <Skeleton width="22px" height="22px" borderRadius="5px" />
                  <Skeleton circle height="30px" />
                  <div>
                    <Skeleton width="85px" height="12px" borderRadius="3px" />
                    <Skeleton
                      width="60px"
                      height="9px"
                      borderRadius="3px"
                      style={{ marginTop: '3px' }}
                    />
                  </div>
                </div>

                {/* Double Bar Tracks */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        height: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <Skeleton
                        width={`${pct}%`}
                        height="8px"
                        borderRadius="4px"
                        style={{ background: 'rgba(255, 56, 92, 0.18)' }}
                      />
                    </div>
                    <Skeleton width="48px" height="12px" borderRadius="3px" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        flex: 1,
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        height: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <Skeleton
                        width={`${Math.round(pct * 0.88)}%`}
                        height="6px"
                        borderRadius="4px"
                        style={{ background: 'rgba(14, 165, 233, 0.15)' }}
                      />
                    </div>
                    <Skeleton width="42px" height="10px" borderRadius="3px" />
                  </div>
                </div>

                {/* Commission Badge */}
                <Skeleton
                  width="55px"
                  height="20px"
                  borderRadius="4px"
                  style={{ flexShrink: 0 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
