package com.busres.dao;

import com.busres.model.Bus;
import com.busres.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BusDao {

    /** Search trips and compute available seats (total - already booked). */
    public List<Bus> search(String from, String to, String date) throws SQLException {
        String sql =
            "SELECT b.*, " +
            "  (b.total_seats - IFNULL((" +
            "     SELECT SUM( (LENGTH(bk.seat_numbers) - LENGTH(REPLACE(bk.seat_numbers, ',', '')) + 1) )" +
            "     FROM bookings bk WHERE bk.bus_id = b.id AND bk.status='CONFIRMED'" +
            "  ),0)) AS available_seats " +
            "FROM buses b " +
            "WHERE b.from_city = ? AND b.to_city = ? AND b.travel_date = ? " +
            "ORDER BY b.departure_time";
        List<Bus> list = new ArrayList<>();
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, from);
            ps.setString(2, to);
            ps.setString(3, date);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(map(rs));
            }
        }
        return list;
    }

    public Bus findById(int id) throws SQLException {
        String sql =
            "SELECT b.*, " +
            "  (b.total_seats - IFNULL((" +
            "     SELECT SUM( (LENGTH(bk.seat_numbers) - LENGTH(REPLACE(bk.seat_numbers, ',', '')) + 1) )" +
            "     FROM bookings bk WHERE bk.bus_id = b.id AND bk.status='CONFIRMED'" +
            "  ),0)) AS available_seats " +
            "FROM buses b WHERE b.id = ?";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    /** All seat labels already booked (CONFIRMED) for a bus. */
    public List<String> bookedSeats(int busId) throws SQLException {
        String sql = "SELECT seat_numbers FROM bookings WHERE bus_id = ? AND status='CONFIRMED'";
        List<String> seats = new ArrayList<>();
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, busId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    String csv = rs.getString("seat_numbers");
                    if (csv != null && !csv.isEmpty())
                        for (String s : csv.split(",")) seats.add(s.trim());
                }
            }
        }
        return seats;
    }

    private Bus map(ResultSet rs) throws SQLException {
        Bus b = new Bus();
        b.setId(rs.getInt("id"));
        b.setOperatorName(rs.getString("operator_name"));
        b.setBusType(rs.getString("bus_type"));
        b.setFromCity(rs.getString("from_city"));
        b.setToCity(rs.getString("to_city"));
        b.setTravelDate(rs.getString("travel_date"));
        b.setDepartureTime(rs.getString("departure_time"));
        b.setArrivalTime(rs.getString("arrival_time"));
        b.setDurationMin(rs.getInt("duration_min"));
        b.setTotalSeats(rs.getInt("total_seats"));
        b.setAvailableSeats(rs.getInt("available_seats"));
        b.setFare(rs.getBigDecimal("fare"));
        b.setRating(rs.getDouble("rating"));
        b.setAmenities(rs.getString("amenities"));
        b.setImageUrl(rs.getString("image_url"));
        b.setBoardingPoint(rs.getString("boarding_point"));
        b.setDroppingPoint(rs.getString("dropping_point"));
        return b;
    }
}
