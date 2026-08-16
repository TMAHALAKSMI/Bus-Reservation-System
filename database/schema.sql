-- =====================================================================
--  Bus Ticket Reservation System - MySQL schema + seed data
--  Run this whole file once in MySQL Workbench (File > Open SQL Script,
--  then click the lightning bolt to execute).
-- =====================================================================

DROP DATABASE IF EXISTS bus_reservation;
CREATE DATABASE bus_reservation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_reservation;

-- ---------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(120)  NOT NULL,
    email         VARCHAR(120)  NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(200)  NOT NULL,   -- salt:hash (see PasswordUtil.java)
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Buses / trips (one row = one scheduled trip on a date)
-- ---------------------------------------------------------------------
CREATE TABLE buses (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    operator_name  VARCHAR(120)  NOT NULL,
    bus_type       VARCHAR(80)   NOT NULL,   -- e.g. "AC Sleeper (2+1)"
    from_city      VARCHAR(80)   NOT NULL,
    to_city        VARCHAR(80)   NOT NULL,
    travel_date    DATE          NOT NULL,
    departure_time TIME          NOT NULL,
    arrival_time   TIME          NOT NULL,
    duration_min   INT           NOT NULL,   -- journey length in minutes
    total_seats    INT           NOT NULL,
    fare           DECIMAL(10,2) NOT NULL,
    rating         DECIMAL(2,1)  DEFAULT 4.0,
    amenities      VARCHAR(255)  DEFAULT '', -- comma separated: WiFi,Charging,Water
    image_url      VARCHAR(255)  DEFAULT '',
    boarding_point VARCHAR(120)  DEFAULT '',
    dropping_point VARCHAR(120)  DEFAULT '',
    INDEX idx_search (from_city, to_city, travel_date)
);

-- ---------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------
CREATE TABLE bookings (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    bus_id         INT           NOT NULL,
    seat_numbers   VARCHAR(255)  NOT NULL,   -- comma separated: A1,A2
    passenger_name VARCHAR(120)  NOT NULL,
    passenger_age  INT,
    passenger_gender VARCHAR(10),
    total_amount   DECIMAL(10,2) NOT NULL,
    offer_code     VARCHAR(40)   DEFAULT NULL,
    status         VARCHAR(20)   DEFAULT 'CONFIRMED',  -- CONFIRMED / CANCELLED
    pnr            VARCHAR(20)   NOT NULL UNIQUE,
    booked_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    cancelled_at   TIMESTAMP     NULL DEFAULT NULL,
    cancel_reason  VARCHAR(255)  DEFAULT NULL,
    refund_amount  DECIMAL(10,2) DEFAULT NULL,
    CONSTRAINT fk_book_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_book_bus  FOREIGN KEY (bus_id)  REFERENCES buses(id)
);

-- ---------------------------------------------------------------------
-- Offers
-- ---------------------------------------------------------------------
CREATE TABLE offers (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(40)   NOT NULL UNIQUE,
    title            VARCHAR(120)  NOT NULL,
    description      VARCHAR(255)  NOT NULL,
    discount_percent INT           NOT NULL,
    max_discount     DECIMAL(10,2) NOT NULL,
    valid_till       DATE          NOT NULL,
    active           BOOLEAN       DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Route tracking (live-ish status of a running trip)
-- ---------------------------------------------------------------------
CREATE TABLE tracking (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    bus_id           INT           NOT NULL,
    current_location VARCHAR(120)  NOT NULL,
    status           VARCHAR(40)   NOT NULL,   -- ON_TIME / DELAYED / DEPARTED / ARRIVED
    progress_percent INT           DEFAULT 0,  -- 0..100 along the route
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_track_bus FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- ---------------------------------------------------------------------
-- Contact-us messages
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120)  NOT NULL,
    email      VARCHAR(120)  NOT NULL,
    subject    VARCHAR(150)  DEFAULT 'General enquiry',
    message    VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
--  SEED DATA
-- =====================================================================

-- Demo user  (email: demo@travel.in  /  password: demo1234)
-- The hash below was generated by PasswordUtil (salt:sha256). You can also
-- just register a fresh account from the UI.
INSERT INTO users (full_name, email, phone, password_hash) VALUES
('Demo Traveller', 'demo@travel.in', '9000000000',
 '1a2b3c4d5e6f7a8b:1e01910e421b0931f985adfb58aa3552addb29ee4e6da6506163b497c89235a2');

-- Buses for Hyderabad -> Bengaluru on 2026-08-12
INSERT INTO buses
(operator_name, bus_type, from_city, to_city, travel_date, departure_time, arrival_time,
 duration_min, total_seats, fare, rating, amenities, image_url, boarding_point, dropping_point) VALUES
('Orange Travels','AC Sleeper (2+1)','Hyderabad','Bengaluru','2026-08-12','21:00:00','06:30:00',
 570,30,1299.00,4.5,'WiFi,Charging,Water,Blanket','img/bus1.jpg','Miyapur','Madiwala'),
('VRL Travels','Non-AC Seater/Sleeper (2+2)','Hyderabad','Bengaluru','2026-08-12','22:15:00','07:45:00',
 570,36,899.00,4.1,'Charging,Water','img/bus2.svg','Ameerpet','Majestic'),
('SRS Travels','AC Seater (2+2)','Hyderabad','Bengaluru','2026-08-12','20:30:00','05:15:00',
 525,40,999.00,4.3,'WiFi,Charging,Water','img/bus-3.jpg','LB Nagar','Electronic City');

-- Buses for Delhi -> Kanpur on 2026-08-13
INSERT INTO buses
(operator_name, bus_type, from_city, to_city, travel_date, departure_time, arrival_time,
 duration_min, total_seats, fare, rating, amenities, image_url, boarding_point, dropping_point) VALUES
('UPSRTC','AC Seater (2+2)','Delhi','Kanpur','2026-08-13','07:00:00','13:00:00',
 360,40,749.00,4.0,'Charging,Water','img/bus1.jpg','Anand Vihar','Jhakarkati'),
('Zingbus','AC Sleeper (2+1)','Delhi','Kanpur','2026-08-13','23:00:00','05:30:00',
 390,30,1099.00,4.4,'WiFi,Charging,Water,Blanket','img/bus2.svg','Kashmere Gate','Rawatpur');

-- Buses for Bengaluru -> Chennai on 2026-08-14
INSERT INTO buses
(operator_name, bus_type, from_city, to_city, travel_date, departure_time, arrival_time,
 duration_min, total_seats, fare, rating, amenities, image_url, boarding_point, dropping_point) VALUES
('KPN Travels','AC Sleeper (2+1)','Bengaluru','Chennai','2026-08-14','22:30:00','04:30:00',
 360,30,850.00,4.2,'WiFi,Charging,Water','img/bus-3.jpg','Madiwala','Koyambedu'),
('Parveen Travels','AC Seater (2+2)','Bengaluru','Chennai','2026-08-14','23:00:00','05:00:00',
 360,40,699.00,4.0,'Charging,Water','img/bus1.jpg','Silk Board','CMBT');

INSERT INTO offers (code, title, description, discount_percent, max_discount, valid_till) VALUES
('FIRST100','First Trip','Flat 20% off (up to Rs.100) on your first booking',20,100.00,'2026-12-31'),
('BUS150' ,'Bus Bonanza','15% off up to Rs.150 on all AC buses',15,150.00,'2026-12-31'),
('WEEKEND10','Weekend Saver','10% off up to Rs.75 on weekend trips',10,75.00,'2026-12-31');

INSERT INTO tracking (bus_id, current_location, status, progress_percent) VALUES
(1,'Kurnool','ON_TIME',45),
(2,'Anantapur','DELAYED',60),
(4,'Aligarh','ON_TIME',35);
