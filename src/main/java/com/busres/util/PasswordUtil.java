package com.busres.util;

import java.security.MessageDigest;
import java.security.SecureRandom;

/**
 * Salted SHA-256 password hashing. Format stored in DB:  "salt:hash".
 * NOTE: adequate for a college / demo project. For production use bcrypt/argon2.
 */
public class PasswordUtil {

    public static String hash(String plain) {
        try {
            byte[] salt = new byte[8];
            new SecureRandom().nextBytes(salt);
            String saltHex = toHex(salt);
            return saltHex + ":" + sha256(saltHex + plain);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static boolean verify(String plain, String stored) {
        if (stored == null || !stored.contains(":")) return false;
        String[] parts = stored.split(":", 2);
        String saltHex = parts[0];
        String expected = parts[1];
        try {
            return sha256(saltHex + plain).equalsIgnoreCase(expected);
        } catch (Exception e) {
            return false;
        }
    }

    private static String sha256(String s) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        return toHex(md.digest(s.getBytes("UTF-8")));
    }

    private static String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
