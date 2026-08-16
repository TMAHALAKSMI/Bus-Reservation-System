package com.busres.servlet;

import com.busres.dao.BusDao;
import com.busres.model.Bus;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/buses/search")
public class BusSearchServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final BusDao busDao = new BusDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String from = req.getParameter("from");
        String to   = req.getParameter("to");
        String date = req.getParameter("date");
        if (from == null || to == null || date == null) {
            JsonUtil.write(resp, ApiResponse.fail("from, to and date are required."));
            return;
        }
        try {
            List<Bus> buses = busDao.search(from.trim(), to.trim(), date.trim());
            JsonUtil.write(resp, ApiResponse.ok(buses.size() + " buses found", buses));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Search failed: " + e.getMessage()));
        }
    }
}
