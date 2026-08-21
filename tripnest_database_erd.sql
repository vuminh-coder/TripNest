-- ==============================================================================
-- SQL SCHEMA DDL FOR DRAW.IO (app.diagrams.net)
-- Hướng dẫn: Mở Draw.io -> Menu "Arrange" -> "Insert" -> "Advanced" -> "SQL" -> Dán toàn bộ mã này vào!
-- ==============================================================================

CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(191) UNIQUE NOT NULL,
    google_id VARCHAR(191) UNIQUE NOT NULL,
    google_avatar VARCHAR(500),
    role ENUM('guest', 'host', 'admin') DEFAULT 'guest',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    date_of_birth DATE,
    id_card_number VARCHAR(30),
    nationality VARCHAR(50) DEFAULT 'Việt Nam',
    address VARCHAR(255),
    bio TEXT,
    emergency_contact VARCHAR(150),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE hosts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    host_display_name VARCHAR(100) NOT NULL,
    host_avatar_url VARCHAR(500),
    host_introduction TEXT,
    languages_spoken JSON,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(191),
    emergency_phone VARCHAR(20),
    business_type ENUM('individual', 'household', 'company') DEFAULT 'individual',
    business_name VARCHAR(150),
    tax_id VARCHAR(50),
    id_card_number VARCHAR(30) NOT NULL,
    id_card_front_url VARCHAR(500) NOT NULL,
    id_card_back_url VARCHAR(500) NOT NULL,
    portrait_photo_url VARCHAR(500),
    business_license_url VARCHAR(500),
    kyc_status ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'pending',
    kyc_rejection_reason TEXT,
    verified_at TIMESTAMP,
    verified_by BIGINT,
    is_superhost BOOLEAN DEFAULT FALSE,
    host_rating DECIMAL(3,2) DEFAULT 5.00,
    host_reviews_count INT DEFAULT 0,
    response_rate_percent TINYINT DEFAULT 100,
    response_time_text VARCHAR(50) DEFAULT 'trong vòng 1 giờ',
    terms_accepted_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE TABLE host_payout_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    host_id BIGINT NOT NULL,
    account_type ENUM('bank_transfer', 'momo', 'vnpay', 'paypal', 'stripe') DEFAULT 'bank_transfer',
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20),
    bank_branch VARCHAR(150),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20),
    currency VARCHAR(10) DEFAULT 'VND',
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_document_url VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(50) UNIQUE NOT NULL,
    label_vi VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE amenities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    target_type ENUM('both', 'accommodation', 'room') DEFAULT 'both',
    category ENUM('basic', 'standout', 'safety', 'luxury') DEFAULT 'basic',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE accommodations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    host_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    accommodation_type ENUM('hotel', 'resort', 'villa', 'homestay', 'apartment', 'cabin', 'yacht') DEFAULT 'hotel',
    star_rating TINYINT DEFAULT 0,
    description LONGTEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Việt Nam',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    distance_description VARCHAR(255),
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    house_rules TEXT,
    cancellation_policy TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'paused', 'archived') DEFAULT 'published',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    accommodation_id BIGINT NOT NULL,
    room_name_vi VARCHAR(255) NOT NULL,
    room_name_en VARCHAR(255),
    room_type_code VARCHAR(50) DEFAULT 'entire_villa',
    space_type ENUM('entire_place', 'private_room', 'shared_room') DEFAULT 'entire_place',
    description LONGTEXT NOT NULL,
    room_size_m2 DECIMAL(6,2),
    price_usd_per_night DECIMAL(10,2) NOT NULL,
    price_vnd_per_night DECIMAL(14,2) NOT NULL,
    cleaning_fee_usd DECIMAL(8,2) DEFAULT 30.00,
    cleaning_fee_vnd DECIMAL(12,2) DEFAULT 500000.00,
    service_fee_percent DECIMAL(4,2) DEFAULT 12.00,
    max_guests TINYINT DEFAULT 2,
    bedrooms_count TINYINT DEFAULT 1,
    beds_count TINYINT DEFAULT 1,
    bathrooms_count DECIMAL(3,1) DEFAULT 1.0,
    total_inventory INT DEFAULT 1,
    rating DECIMAL(3,2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    is_guest_favorite BOOLEAN DEFAULT FALSE,
    status ENUM('available', 'maintenance', 'hidden') DEFAULT 'available',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
);

CREATE TABLE accommodation_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    accommodation_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
);

CREATE TABLE room_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE accommodation_amenity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    accommodation_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    UNIQUE (accommodation_id, amenity_id),
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE TABLE room_amenity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    UNIQUE (room_id, amenity_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights_count INT NOT NULL,
    guests_count INT NOT NULL,
    base_price DECIMAL(14,2) NOT NULL,
    cleaning_fee DECIMAL(14,2) NOT NULL,
    service_fee DECIMAL(14,2) NOT NULL,
    discount_amount DECIMAL(14,2) DEFAULT 0.00,
    total_price DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'refunded') DEFAULT 'confirmed',
    cancellation_reason VARCHAR(255),
    cancelled_at TIMESTAMP,
    special_requests TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT UNIQUE NOT NULL,
    room_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating_overall DECIMAL(3,2) NOT NULL,
    rating_cleanliness DECIMAL(3,2) NOT NULL,
    rating_accuracy DECIMAL(3,2) NOT NULL,
    rating_communication DECIMAL(3,2) NOT NULL,
    rating_location DECIMAL(3,2) NOT NULL,
    rating_checkin DECIMAL(3,2) NOT NULL,
    rating_value DECIMAL(3,2) NOT NULL,
    comment TEXT NOT NULL,
    host_response TEXT,
    host_responded_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE wishlists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, room_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE experiences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    host_id BIGINT,
    title_vi VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    caption VARCHAR(255) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Việt Nam',
    price_usd_per_person DECIMAL(10,2) NOT NULL,
    price_vnd_per_person DECIMAL(14,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 5.00,
    reviews_count INT DEFAULT 0,
    image_url VARCHAR(500) NOT NULL,
    duration_hours DECIMAL(3,1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    payment_method ENUM('credit_card', 'vnpay', 'momo', 'bank_transfer', 'cash') NOT NULL,
    amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status ENUM('pending', 'successful', 'failed', 'refunded') DEFAULT 'successful',
    payment_gateway_response JSON,
    paid_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE payout_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payout_code VARCHAR(30) UNIQUE NOT NULL,
    host_id BIGINT NOT NULL,
    booking_id BIGINT,
    payout_account_id BIGINT NOT NULL,
    gross_amount DECIMAL(14,2) NOT NULL,
    platform_commission_fee DECIMAL(14,2) NOT NULL,
    net_payout_amount DECIMAL(14,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'completed',
    transaction_reference VARCHAR(100),
    transferred_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE RESTRICT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (payout_account_id) REFERENCES host_payout_accounts(id) ON DELETE RESTRICT
);
