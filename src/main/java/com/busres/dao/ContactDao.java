package com.busres.dao;

import com.busres.model.ContactMessage;
import com.busres.util.DBConnection;

import java.sql.*;

public class ContactDao {

    public ContactMessage create(ContactMessage m) throws SQLException {
        String sql = "INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)";
        try (Connection c = DBConnection.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, m.getName());
            ps.setString(2, m.getEmail());
            ps.setString(3, m.getSubject());
            ps.setString(4, m.getMessage());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) m.setId(keys.getInt(1));
            }
            return m;
        }
    }
}
