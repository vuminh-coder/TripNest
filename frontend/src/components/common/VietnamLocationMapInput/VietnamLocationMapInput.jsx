import React, { useState, useEffect, useRef, useMemo } from 'react';
import { VIETNAM_PROVINCES, removeVietnameseTones, searchProvincesLocal } from '../../../data/vietnamProvincesData';
import { apiService } from '../../../services/api';
import './VietnamLocationMapInput.css';

/**
 * Component VietnamLocationMapInput
 * Ô nhập và gợi ý chọn Tỉnh / Thành phố Việt Nam chuẩn UI/UX ProMax
 * Hỗ trợ tìm kiếm tiếng Việt không dấu (Fuzzy search), điều hướng bàn phím, kết nối API & offline-ready
 */
export const VietnamLocationMapInput = ({
  id = 'vietnam-location-input',
  label = 'Tỉnh/Thành phố',
  value = '',
  onChange = () => {},
  onSelect = () => {},
  onKeyDown: customKeyDown = null,
  placeholder = 'Chọn Tỉnh/Thành phố',
  disabled = false,
  error = '',
  helperText = '',
  required = false,
  showRegionBadge = false,
  showAccommodationsCount = false,
  showChevron = true,
  variant = 'default', // 'default' | 'header-search'
  className = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [provinces, setProvinces] = useState(VIETNAM_PROVINCES);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Đồng bộ searchTerm khi prop `value` thay đổi từ bên ngoài
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Tải danh sách tỉnh thành từ API backend (kèm fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const data = await apiService.getProvinces();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setProvinces(data);
        }
      } catch (err) {
        console.warn('Fallback to local Vietnam provinces data:', err);
      }
    };

    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc danh sách theo searchTerm (Fuzzy Search tiếng Việt không dấu)
  const filteredProvinces = useMemo(() => {
    if (!searchTerm) return provinces;
    return searchProvincesLocal(searchTerm, provinces);
  }, [searchTerm, provinces]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Tự động cuộn item được highlight vào tầm nhìn khi dùng phím mũi tên
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const activeItem = listRef.current.children[highlightedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Xử lý thay đổi input text
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val, null);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  // Xử lý khi chọn một Tỉnh / Thành phố
  const handleSelectProvince = (province) => {
    setSearchTerm(province.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(province.name, province);
    onSelect(province);
  };

  // Xử lý nút xóa nhanh (Clear)
  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    onChange('', null);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Xử lý bật/tắt khi click vào input
  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Xử lý phím tắt (Keyboard Navigation)
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredProvinces.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredProvinces.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredProvinces.length - 1
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredProvinces[highlightedIndex]) {
        e.preventDefault();
        handleSelectProvince(filteredProvinces[highlightedIndex]);
        return;
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
    }

    if (customKeyDown) {
      customKeyDown(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`vietnam-location-input-container variant-${variant} ${
        disabled ? 'disabled' : ''
      } ${error ? 'has-error' : ''} ${className}`}
    >
      {label && (
        <label htmlFor={id} className="vietnam-location-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div
        className={`vietnam-location-input-wrapper ${isOpen ? 'is-focused' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          className="vietnam-location-input"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-dropdown`}
        />

        <div className="vietnam-location-actions">
          {searchTerm && !disabled && (
            <button
              type="button"
              className="vietnam-location-clear-btn"
              onClick={handleClear}
              title="Xóa lựa chọn"
              aria-label="Xóa"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {showChevron && (
            <div
              className={`vietnam-location-chevron-icon ${isOpen ? 'open' : ''}`}
              aria-hidden="true"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {error && <p className="vietnam-location-error-text">{error}</p>}
      {!error && helperText && <p className="vietnam-location-helper-text">{helperText}</p>}

      {isOpen && (
        <div id={`${id}-dropdown`} className="vietnam-location-dropdown" role="listbox">
          {filteredProvinces.length > 0 ? (
            <ul ref={listRef} className="vietnam-location-list">
              {filteredProvinces.map((province, index) => {
                const isSelected = value === province.name || searchTerm === province.name;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={province.id || province.code || province.name}
                    role="option"
                    aria-selected={isSelected}
                    className={`vietnam-location-item ${isHighlighted ? 'highlighted' : ''} ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProvince(province);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="vietnam-location-item-content">
                      <span className="vietnam-location-item-name">{province.name}</span>
                      {showRegionBadge && province.region && (
                        <span className="vietnam-location-region-badge">{province.region}</span>
                      )}
                    </div>

                    {showAccommodationsCount && province.accommodations_count > 0 && (
                      <span className="vietnam-location-count-badge">
                        {province.accommodations_count} chỗ nghỉ
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="vietnam-location-empty">
              <span>Không tìm thấy tỉnh/thành phố phù hợp</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VietnamLocationMapInput;
