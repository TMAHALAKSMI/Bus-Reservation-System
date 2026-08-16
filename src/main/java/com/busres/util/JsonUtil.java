package com.busres.util;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/** Helpers to read a JSON request body and write a JSON response. */
public class JsonUtil {
    private static final Gson GSON = new Gson();

    public static <T> T readBody(HttpServletRequest req, Class<T> type) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = req.getReader()) {
            String line;
            while ((line = r.readLine()) != null) sb.append(line);
        }
        if (sb.length() == 0) return null;
        return GSON.fromJson(sb.toString(), type);
    }

    public static void write(HttpServletResponse resp, ApiResponse payload) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        try (PrintWriter out = resp.getWriter()) {
            out.print(GSON.toJson(payload));
        }
    }
}
