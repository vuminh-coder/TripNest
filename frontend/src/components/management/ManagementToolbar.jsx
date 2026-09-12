import React from 'react';
import './management.css';
import {
  TbSearch,
  TbX,
  TbArrowsSort,
  TbChevronDown,
  TbLayoutGrid,
  TbList
} from 'react-icons/tb';

export const ManagementToolbar = ({
  // Tabs
  tabs = [],
  activeTab,
  onTabChange,

  // Search
  search = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',

  // Sort
  sortBy,
  onSortChange,
  sortOptions = [],

  // View mode switcher (Table / Grid)
  viewMode = null, // 'table' | 'grid'
  onViewModeChange = null,

  // Actions
  actions = null,
  children
}) => {
  return (
    <div className="mgmt-toolbar-card">
      {/* Top Row: Tabs (Left) & Actions (Right) */}
      <div className="mgmt-toolbar-row-top">
        {tabs.length > 0 && (
          <div className="mgmt-filter-tabs">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`mgmt-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => onTabChange && onTabChange(tab.key)}
                >
                  {TabIcon && <TabIcon style={{ fontSize: '0.95rem' }} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="mgmt-tab-badge">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="mgmt-toolbar-actions-group">
          {actions}
          {viewMode && onViewModeChange && (
            <div className="mgmt-view-switcher">
              <button
                type="button"
                className={`mgmt-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => onViewModeChange('table')}
                title="Chế độ xem bảng"
              >
                <TbList />
              </button>
              <button
                type="button"
                className={`mgmt-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title="Chế độ xem lưới thẻ"
              >
                <TbLayoutGrid />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Search & Sort */}
      {(onSearchChange || sortOptions.length > 0) && (
        <div className="mgmt-toolbar-row-bottom">
          {onSearchChange && (
            <div className="mgmt-search-wrap">
              <TbSearch className="mgmt-search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="mgmt-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="mgmt-search-clear"
                  onClick={() => onSearchChange('')}
                  title="Xóa tìm kiếm"
                >
                  <TbX size={14} />
                </button>
              )}
            </div>
          )}

          {sortOptions.length > 0 && onSortChange && (
            <div className="mgmt-sort-wrapper">
              <TbArrowsSort className="mgmt-sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="mgmt-sort-select"
                aria-label="Sắp xếp danh sách"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <TbChevronDown className="mgmt-sort-chevron" />
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
};

export default ManagementToolbar;
