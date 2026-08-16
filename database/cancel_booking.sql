-- =====================================================================
--  Cancel-booking feature — SQL
--  Run this once against an EXISTING bus_reservation database to add
--  cancellation support (schema.sql already includes these columns if
--  you're setting the database up fresh).
-- =====================================================================
USE bus_reservation;

-- ---------------------------------------------------------------------
-- 1. Extra columns to track a cancellation.
--    Written with information_schema checks so it works on ANY MySQL/
--    MariaDB version (plain "ADD COLUMN IF NOT EXISTS" needs MySQL
--    8.0.29+, which is why it may have silently failed before).
-- ---------------------------------------------------------------------
SET @db := DATABASE();

SET @sql := (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = @db AND table_name = 'bookings' AND column_name = 'cancelled_at') = 0,
    'ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMP NULL DEFAULT NULL',
    'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = @db AND table_name = 'bookings' AND column_name = 'cancel_reason') = 0,
    'ALTER TABLE bookings ADD COLUMN cancel_reason VARCHAR(255) DEFAULT NULL',
    'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = @db AND table_name = 'bookings' AND column_name = 'refund_amount') = 0,
    'ALTER TABLE bookings ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT NULL',
    'SELECT 1'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Sanity check: should now list all three columns
SELECT column_name FROM information_schema.columns
WHERE table_schema = @db AND table_name = 'bookings'
  AND column_name IN ('cancelled_at','cancel_reason','refund_amount');

-- ---------------------------------------------------------------------
-- 2. Plain cancel query — this is exactly what BookingDao.cancel() runs.
--    Only the booking's own user can cancel it, and only while it is
--    still CONFIRMED (so you can never "double cancel").
-- ---------------------------------------------------------------------
UPDATE bookings
SET    status = 'CANCELLED',
       cancelled_at = NOW()
WHERE  id = ?            -- booking id
  AND  user_id = ?       -- logged-in user id (ownership check)
  AND  status = 'CONFIRMED';

-- ---------------------------------------------------------------------
-- 3. Cancel WITH a reason + refund amount recorded (used by the richer
--    /api/mybookings?action=cancel endpoint below).
-- ---------------------------------------------------------------------
UPDATE bookings
SET    status = 'CANCELLED',
       cancelled_at = NOW(),
       cancel_reason = ?,       -- e.g. "Change of plans"
       refund_amount = ?        -- computed in Java (see refund rule below)
WHERE  id = ?
  AND  user_id = ?
  AND  status = 'CONFIRMED';

-- ---------------------------------------------------------------------
-- 4. Stored procedure version — does the ownership + status check AND
--    the time-based refund-percentage rule entirely in SQL, atomically.
--    Refund rule: >24h before departure = 90% refund, 3-24h = 50%,
--    <3h or already departed = 0% refund.
-- ---------------------------------------------------------------------
DROP PROCEDURE IF EXISTS cancel_booking;

DELIMITER $$
CREATE PROCEDURE cancel_booking(
    IN  p_booking_id INT,
    IN  p_user_id    INT,
    IN  p_reason      VARCHAR(255),
    OUT p_result       VARCHAR(255),
    OUT p_refund       DECIMAL(10,2)
)
BEGIN
    DECLARE v_status       VARCHAR(20);
    DECLARE v_total        DECIMAL(10,2);
    DECLARE v_travel_date  DATE;
    DECLARE v_dep_time     TIME;
    DECLARE v_hours_left   DECIMAL(10,2);

    -- lock the row so two simultaneous cancel clicks can't both succeed
    SELECT bk.status, bk.total_amount, b.travel_date, b.departure_time
      INTO v_status, v_total, v_travel_date, v_dep_time
      FROM bookings bk
      JOIN buses b ON b.id = bk.bus_id
     WHERE bk.id = p_booking_id AND bk.user_id = p_user_id
     FOR UPDATE;

    IF v_status IS NULL THEN
        SET p_result = 'NOT_FOUND';
        SET p_refund = 0;
    ELSEIF v_status = 'CANCELLED' THEN
        SET p_result = 'ALREADY_CANCELLED';
        SET p_refund = 0;
    ELSE
        SET v_hours_left = TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(v_travel_date, v_dep_time)) / 60.0;

        IF v_hours_left >= 24 THEN
            SET p_refund = v_total * 0.90;
        ELSEIF v_hours_left >= 3 THEN
            SET p_refund = v_total * 0.50;
        ELSE
            SET p_refund = 0.00;
        END IF;

        UPDATE bookings
           SET status = 'CANCELLED',
               cancelled_at = NOW(),
               cancel_reason = p_reason,
               refund_amount = p_refund
         WHERE id = p_booking_id AND user_id = p_user_id;

        SET p_result = 'CANCELLED';
    END IF;
END$$
DELIMITER ;

-- Example call:
-- CALL cancel_booking(12, 4, 'Change of plans', @result, @refund);
-- SELECT @result, @refund;

-- ---------------------------------------------------------------------
-- 5. Handy lookups
-- ---------------------------------------------------------------------
-- All cancelled bookings for a user
SELECT bk.pnr, b.from_city, b.to_city, b.travel_date, bk.cancelled_at,
       bk.cancel_reason, bk.total_amount, bk.refund_amount
FROM   bookings bk
JOIN   buses b ON b.id = bk.bus_id
WHERE  bk.user_id = ? AND bk.status = 'CANCELLED'
ORDER  BY bk.cancelled_at DESC;

-- Cancellation rate per route (reporting)
SELECT b.from_city, b.to_city,
       COUNT(*) AS total_bookings,
       SUM(bk.status = 'CANCELLED') AS cancelled,
       ROUND(100 * SUM(bk.status = 'CANCELLED') / COUNT(*), 1) AS cancel_pct
FROM   bookings bk
JOIN   buses b ON b.id = bk.bus_id
GROUP  BY b.from_city, b.to_city;
