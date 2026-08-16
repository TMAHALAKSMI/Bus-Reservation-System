package com.busres.servlet;

import com.busres.dao.UserDao;
import com.busres.model.User;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final UserDao userDao = new UserDao();

    static class Req { String email; String password; }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Req body = JsonUtil.readBody(req, Req.class);
            if (body == null || body.email == null || body.password == null) {
                JsonUtil.write(resp, ApiResponse.fail("Email and password are required."));
                return;
            }
            User u = userDao.authenticate(body.email.trim(), body.password);
            if (u == null) {
                JsonUtil.write(resp, ApiResponse.fail("Invalid email or password."));
                return;
            }
            req.getSession(true).setAttribute("user", u);
            JsonUtil.write(resp, ApiResponse.ok("Welcome back, " + u.getFullName(), u));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Login failed: " + e.getMessage()));
        }
    }
}
