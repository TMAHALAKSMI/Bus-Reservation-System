package com.busres.dao;

import com.busres.model.Offer;
import com.busres.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class OfferDao {

    public List<Offer> findActive() throws SQLException {
        String sql = "SELECT * FROM offers WHERE active = TRUE AND valid_till >= CURDATE() ORDER BY discount_percent DESC";
        List<Offer> list = new ArrayList<>();
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) list.add(map(rs));
        }
        return list;
    }

    public Offer findByCode(String code) throws SQLException {
        String sql = "SELECT * FROM offers WHERE code = ? AND active = TRUE AND valid_till >= CURDATE()";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, code);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    private Offer map(ResultSet rs) throws SQLException {
        Offer o = new Offer();
        o.setId(rs.getInt("id"));
        o.setCode(rs.getString("code"));
        o.setTitle(rs.getString("title"));
        o.setDescription(rs.getString("description"));
        o.setDiscountPercent(rs.getInt("discount_percent"));
        o.setMaxDiscount(rs.getBigDecimal("max_discount"));
        o.setValidTill(rs.getString("valid_till"));
        return o;
    }
}
