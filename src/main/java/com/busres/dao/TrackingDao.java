package com.busres.dao;

import com.busres.util.DBConnection;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class TrackingDao {

    /** Returns a live-status map for a bus, or null if there is no tracking row. */
    public Map<String,Object> findByBusId(int busId) throws SQLException {
        String sql =
            "SELECT t.current_location, t.status, t.progress_percent, t.updated_at, " +
            "       b.operator_name, b.from_city, b.to_city, b.departure_time, b.arrival_time " +
            "FROM tracking t JOIN buses b ON b.id = t.bus_id WHERE t.bus_id = ? " +
            "ORDER BY t.updated_at DESC LIMIT 1";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, busId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                Map<String,Object> m = new HashMap<>();
                m.put("busId", busId);
                m.put("operatorName", rs.getString("operator_name"));
                m.put("fromCity", rs.getString("from_city"));
                m.put("toCity", rs.getString("to_city"));
                m.put("departureTime", rs.getString("departure_time"));
                m.put("arrivalTime", rs.getString("arrival_time"));
                m.put("currentLocation", rs.getString("current_location"));
                m.put("status", rs.getString("status"));
                m.put("progressPercent", rs.getInt("progress_percent"));
                m.put("updatedAt", rs.getString("updated_at"));
                return m;
            }
        }
    }
}
