package com.busres.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Central JDBC connection factory.
 * Change the three constants below to match your MySQL Workbench setup.
 */
public class DBConnection {

    // ---- EDIT THESE TO MATCH YOUR MYSQL ----
    private static final String URL =
        "jdbc:mysql://localhost:3306/bus_reservation?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String USER = "root";
    private static final String PASSWORD = "root";   // <-- your MySQL root password
    // ----------------------------------------

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found on classpath", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
