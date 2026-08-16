package com.busres.servlet;

import com.busres.dao.TrackingDao;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Map;

@WebServlet("/api/tracking")
public class TrackingServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final TrackingDao trackingDao = new TrackingDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String busIdStr = req.getParameter("busId");
        if (busIdStr == null) { JsonUtil.write(resp, ApiResponse.fail("busId is required.")); return; }
        try {
            Map<String,Object> t = trackingDao.findByBusId(Integer.parseInt(busIdStr));
            if (t == null) { JsonUtil.write(resp, ApiResponse.fail("No live tracking available for this trip yet.")); return; }
            JsonUtil.write(resp, ApiResponse.ok(t));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Tracking error: " + e.getMessage()));
        }
    }
}
