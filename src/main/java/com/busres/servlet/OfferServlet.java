package com.busres.servlet;

import com.busres.dao.OfferDao;
import com.busres.model.Offer;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/offers")
public class OfferServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final OfferDao offerDao = new OfferDao();

    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String code = req.getParameter("code");
        String amountStr = req.getParameter("amount");
        try {
            // Validation mode: /api/offers?code=BUS150&amount=1299
            if (code != null && amountStr != null) {
                Offer o = offerDao.findByCode(code.trim().toUpperCase());
                if (o == null) { JsonUtil.write(resp, ApiResponse.fail("Invalid or expired offer code.")); return; }
                BigDecimal amount = new BigDecimal(amountStr);
                BigDecimal discount = amount.multiply(BigDecimal.valueOf(o.getDiscountPercent()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (discount.compareTo(o.getMaxDiscount()) > 0) discount = o.getMaxDiscount();
                Map<String,Object> data = new HashMap<>();
                data.put("code", o.getCode());
                data.put("discount", discount);
                data.put("payable", amount.subtract(discount));
                JsonUtil.write(resp, ApiResponse.ok("Offer applied", data));
                return;
            }
            // List mode
            JsonUtil.write(resp, ApiResponse.ok(offerDao.findActive()));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Offer error: " + e.getMessage()));
        }
    }
}
