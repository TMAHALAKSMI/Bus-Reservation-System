package com.busres.dao;

import com.busres.model.User;
import com.busres.util.DBConnection;
import com.busres.util.PasswordUtil;

import java.sql.*;

public class UserDao {

    public boolean emailExists(String email) throws SQLException {
        String sql = "SELECT 1 FROM users WHERE email = ?";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) { return rs.next(); }
        }
    }

    public User register(String name, String email, String phone, String plainPassword) throws SQLException {
        String sql = "INSERT INTO users (full_name, email, phone, password_hash) VALUES (?,?,?,?)";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, phone);
            ps.setString(4, PasswordUtil.hash(plainPassword));
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                keys.next();
                User u = new User();
                u.setId(keys.getInt(1));
                u.setFullName(name);
                u.setEmail(email);
                u.setPhone(phone);
                return u;
            }
        }
    }

    /** Returns the user on correct password, otherwise null. */
    public User authenticate(String email, String plainPassword) throws SQLException {
        String sql = "SELECT id, full_name, email, phone, password_hash FROM users WHERE email = ?";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return null;
                if (!PasswordUtil.verify(plainPassword, rs.getString("password_hash"))) return null;
                User u = new User();
                u.setId(rs.getInt("id"));
                u.setFullName(rs.getString("full_name"));
                u.setEmail(rs.getString("email"));
                u.setPhone(rs.getString("phone"));
                return u;
            }
        }
    }
}
