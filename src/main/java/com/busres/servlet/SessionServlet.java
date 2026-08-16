package com.busres.servlet;

import com.busres.model.User;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/session")
public class SessionServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession(false);
        User u = (s == null) ? null : (User) s.getAttribute("user");
        if (u == null) JsonUtil.write(resp, ApiResponse.fail("Not logged in"));
        else JsonUtil.write(resp, ApiResponse.ok(u));
    }
}
