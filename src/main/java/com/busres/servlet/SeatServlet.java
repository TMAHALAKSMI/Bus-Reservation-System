package com.busres.servlet;

import com.busres.dao.BusDao;
import com.busres.model.Bus;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/seats")
public class SeatServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final BusDao busDao = new BusDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String busIdStr = req.getParameter("busId");
        if (busIdStr == null) { JsonUtil.write(resp, ApiResponse.fail("busId is required.")); return; }
        try {
            int busId = Integer.parseInt(busIdStr);
            Bus bus = busDao.findById(busId);
            if (bus == null) { JsonUtil.write(resp, ApiResponse.fail("Bus not found.")); return; }
            Map<String,Object> data = new HashMap<>();
            data.put("bus", bus);
            data.put("bookedSeats", busDao.bookedSeats(busId));
            JsonUtil.write(resp, ApiResponse.ok(data));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Could not load seats: " + e.getMessage()));
        }
    }
}
