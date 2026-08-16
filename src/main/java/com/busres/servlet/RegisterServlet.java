package com.busres.servlet;

import com.busres.dao.UserDao;
import com.busres.model.User;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/register")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final UserDao userDao = new UserDao();

    static class Req { String fullName; String email; String phone; String password; }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Req body = JsonUtil.readBody(req, Req.class);
            if (body == null || isBlank(body.fullName) || isBlank(body.email) || isBlank(body.password)) {
                JsonUtil.write(resp, ApiResponse.fail("Name, email and password are required."));
                return;
            }
            if (body.password.length() < 6) {
                JsonUtil.write(resp, ApiResponse.fail("Password must be at least 6 characters."));
                return;
            }
            if (userDao.emailExists(body.email)) {
                JsonUtil.write(resp, ApiResponse.fail("An account with this email already exists."));
                return;
            }
            User u = userDao.register(body.fullName.trim(), body.email.trim(), body.phone, body.password);
            req.getSession(true).setAttribute("user", u);
            JsonUtil.write(resp, ApiResponse.ok("Account created", u));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Registration failed: " + e.getMessage()));
        }
    }
    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
