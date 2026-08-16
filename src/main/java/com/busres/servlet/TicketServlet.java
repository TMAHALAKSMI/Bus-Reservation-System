package com.busres.servlet;

import com.busres.dao.BookingDao;
import com.busres.model.Booking;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/**
 * Public "Track my ticket" lookup — no login needed, a passenger only needs
 * the PNR that was shown on their confirmation page / sent to them.
 * GET /api/ticket?pnr=BRXXXXXXXX
 */
@WebServlet("/api/ticket")
public class TicketServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final BookingDao bookingDao = new BookingDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pnr = req.getParameter("pnr");
        if (pnr == null || pnr.trim().isEmpty()) {
            JsonUtil.write(resp, ApiResponse.fail("Enter a PNR / ticket ID.")); return;
        }
        try {
            Booking b = bookingDao.findByPnr(pnr.trim());
            if (b == null) { JsonUtil.write(resp, ApiResponse.fail("No ticket found for that PNR. Please check and try again.")); return; }
            JsonUtil.write(resp, ApiResponse.ok(b));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Lookup failed: " + e.getMessage()));
        }
    }
}
