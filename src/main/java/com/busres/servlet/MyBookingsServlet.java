package com.busres.servlet;

import com.busres.dao.BookingDao;
import com.busres.model.Booking;
import com.busres.model.User;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/api/mybookings")
public class MyBookingsServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final BookingDao bookingDao = new BookingDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = currentUser(req);
        if (user == null) { JsonUtil.write(resp, ApiResponse.fail("Please log in.")); return; }
        try {
            JsonUtil.write(resp, ApiResponse.ok(bookingDao.findByUser(user.getId())));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Could not load bookings: " + e.getMessage()));
        }
    }

    /** POST /api/mybookings?action=cancel&id=123&reason=... */
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = currentUser(req);
        if (user == null) { JsonUtil.write(resp, ApiResponse.fail("Please log in.")); return; }
        String action = req.getParameter("action");
        String id = req.getParameter("id");
        String reason = req.getParameter("reason");
        if (!"cancel".equals(action) || id == null) {
            JsonUtil.write(resp, ApiResponse.fail("Unsupported action.")); return;
        }
        try {
            Booking cancelled = bookingDao.cancel(Integer.parseInt(id), user.getId(), reason);
            if (cancelled != null) {
                String msg = cancelled.getRefundAmount() != null && cancelled.getRefundAmount().signum() > 0
                    ? "Booking cancelled. Refund of " + cancelled.getRefundAmount() + " will be processed."
                    : "Booking cancelled. No refund applies this close to departure.";
                JsonUtil.write(resp, ApiResponse.ok(msg, cancelled));
            } else {
                JsonUtil.write(resp, ApiResponse.fail("Booking could not be cancelled (not found, not yours, or already cancelled)."));
            }
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Cancel failed: " + e.getMessage()));
        }
    }

    private User currentUser(HttpServletRequest req) {
        HttpSession s = req.getSession(false);
        return (s == null) ? null : (User) s.getAttribute("user");
    }
}
