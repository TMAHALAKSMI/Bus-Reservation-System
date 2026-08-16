package com.busres.dao;

import com.busres.model.Booking;
import com.busres.util.DBConnection;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

public class BookingDao {

    /**
     * Creates a booking inside a transaction and re-checks seat availability so two
     * users cannot grab the same seat. Throws IllegalStateException if a seat is taken.
     */
    public Booking create(Booking b) throws SQLException {
        String checkSql = "SELECT seat_numbers FROM bookings WHERE bus_id = ? AND status='CONFIRMED' FOR UPDATE";
        String insertSql =
            "INSERT INTO bookings (user_id, bus_id, seat_numbers, passenger_name, passenger_age, " +
            "passenger_gender, total_amount, offer_code, status, pnr) VALUES (?,?,?,?,?,?,?,?, 'CONFIRMED', ?)";

        try (Connection c = DBConnection.getConnection()) {
            c.setAutoCommit(false);
            try {
                // 1. Lock existing bookings for this bus and collect taken seats.
                List<String> taken = new ArrayList<>();
                try (PreparedStatement ps = c.prepareStatement(checkSql)) {
                    ps.setInt(1, b.getBusId());
                    try (ResultSet rs = ps.executeQuery()) {
                        while (rs.next()) {
                            String csv = rs.getString(1);
                            if (csv != null)
                                for (String s : csv.split(",")) taken.add(s.trim());
                        }
                    }
                }
                // 2. Verify requested seats are still free.
                for (String s : b.getSeatNumbers().split(",")) {
                    if (taken.contains(s.trim())) {
                        c.rollback();
                        throw new IllegalStateException("Seat " + s.trim() + " was just booked. Please choose another.");
                    }
                }
                // 3. Insert.
                String pnr = generatePnr();
                try (PreparedStatement ps = c.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setInt(1, b.getUserId());
                    ps.setInt(2, b.getBusId());
                    ps.setString(3, b.getSeatNumbers());
                    ps.setString(4, b.getPassengerName());
                    ps.setInt(5, b.getPassengerAge());
                    ps.setString(6, b.getPassengerGender());
                    ps.setBigDecimal(7, b.getTotalAmount());
                    ps.setString(8, b.getOfferCode());
                    ps.setString(9, pnr);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        b.setId(keys.getInt(1));
                    }
                }
                c.commit();
                b.setPnr(pnr);
                b.setStatus("CONFIRMED");
                return b;
            } catch (SQLException | IllegalStateException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    public List<Booking> findByUser(int userId) throws SQLException {
        String sql =
            "SELECT bk.*, b.operator_name, b.from_city, b.to_city, b.travel_date, b.departure_time " +
            "FROM bookings bk JOIN buses b ON b.id = bk.bus_id " +
            "WHERE bk.user_id = ? ORDER BY bk.booked_at DESC";
        List<Booking> list = new ArrayList<>();
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(map(rs));
            }
        }
        return list;
    }

    /** Public lookup used by the "Track my ticket" page — no login required, matched by PNR only. */
    public Booking findByPnr(String pnr) throws SQLException {
        String sql =
            "SELECT bk.*, b.operator_name, b.from_city, b.to_city, b.travel_date, b.departure_time " +
            "FROM bookings bk JOIN buses b ON b.id = bk.bus_id " +
            "WHERE bk.pnr = ?";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, pnr.trim().toUpperCase(Locale.ROOT));
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    /**
     * Cancels a booking and computes a time-based refund:
     * 24h+ before departure -> 90% refund, 3-24h -> 50%, under 3h -> 0%.
     * Ownership (user_id) and status ('CONFIRMED') are re-checked in the
     * WHERE clause so a booking can never be cancelled twice or by
     * someone else.
     */
    public Booking cancel(int bookingId, int userId, String reason) throws SQLException {
        String lookupSql =
            "SELECT bk.status, bk.total_amount, b.travel_date, b.departure_time " +
            "FROM bookings bk JOIN buses b ON b.id = bk.bus_id " +
            "WHERE bk.id = ? AND bk.user_id = ? FOR UPDATE";
        String updateSql =
            "UPDATE bookings SET status='CANCELLED', cancelled_at=NOW(), " +
            "cancel_reason=?, refund_amount=? WHERE id = ? AND user_id = ? AND status='CONFIRMED'";

        try (Connection c = DBConnection.getConnection()) {
            c.setAutoCommit(false);
            try {
                String status; BigDecimal total; Timestamp travelDate; Time depTime;
                try (PreparedStatement ps = c.prepareStatement(lookupSql)) {
                    ps.setInt(1, bookingId);
                    ps.setInt(2, userId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) { c.rollback(); return null; }        // not found / not yours
                        status = rs.getString(1);
                        total = rs.getBigDecimal(2);
                        travelDate = rs.getTimestamp(3);
                        depTime = rs.getTime(4);
                    }
                }
                if (!"CONFIRMED".equals(status)) { c.rollback(); return null; } // already cancelled

                long minutesLeft = java.time.Duration.between(
                        java.time.LocalDateTime.now(),
                        java.time.LocalDateTime.of(travelDate.toLocalDateTime().toLocalDate(), depTime.toLocalTime())
                ).toMinutes();
                double hoursLeft = minutesLeft / 60.0;

                BigDecimal refund;
                if (hoursLeft >= 24) refund = total.multiply(BigDecimal.valueOf(0.90));
                else if (hoursLeft >= 3) refund = total.multiply(BigDecimal.valueOf(0.50));
                else refund = BigDecimal.ZERO;
                refund = refund.setScale(2, RoundingMode.HALF_UP);

                try (PreparedStatement ps = c.prepareStatement(updateSql)) {
                    ps.setString(1, reason == null ? null : reason.trim());
                    ps.setBigDecimal(2, refund);
                    ps.setInt(3, bookingId);
                    ps.setInt(4, userId);
                    int rows = ps.executeUpdate();
                    if (rows == 0) { c.rollback(); return null; }
                }
                c.commit();

                Booking b = new Booking();
                b.setId(bookingId);
                b.setStatus("CANCELLED");
                b.setRefundAmount(refund);
                b.setCancelReason(reason);
                return b;
            } catch (SQLException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    private String generatePnr() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("BR");
        Random r = new Random();
        for (int i = 0; i < 8; i++) sb.append(chars.charAt(r.nextInt(chars.length())));
        return sb.toString().toUpperCase(Locale.ROOT);
    }

    private Booking map(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setId(rs.getInt("id"));
        b.setUserId(rs.getInt("user_id"));
        b.setBusId(rs.getInt("bus_id"));
        b.setSeatNumbers(rs.getString("seat_numbers"));
        b.setPassengerName(rs.getString("passenger_name"));
        b.setPassengerAge(rs.getInt("passenger_age"));
        b.setPassengerGender(rs.getString("passenger_gender"));
        b.setTotalAmount(rs.getBigDecimal("total_amount"));
        b.setOfferCode(rs.getString("offer_code"));
        b.setStatus(rs.getString("status"));
        b.setPnr(rs.getString("pnr"));
        b.setBookedAt(rs.getString("booked_at"));
        b.setCancelledAt(rs.getString("cancelled_at"));
        b.setCancelReason(rs.getString("cancel_reason"));
        b.setRefundAmount(rs.getBigDecimal("refund_amount"));
        b.setOperatorName(rs.getString("operator_name"));
        b.setFromCity(rs.getString("from_city"));
        b.setToCity(rs.getString("to_city"));
        b.setTravelDate(rs.getString("travel_date"));
        b.setDepartureTime(rs.getString("departure_time"));
        return b;
    }
}
