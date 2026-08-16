package com.busres.servlet;

import com.busres.dao.BookingDao;
import com.busres.dao.BusDao;
import com.busres.dao.OfferDao;
import com.busres.model.Booking;
import com.busres.model.Bus;
import com.busres.model.Offer;
import com.busres.model.User;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@WebServlet("/api/booking")
public class BookingServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final BusDao busDao = new BusDao();
    private final OfferDao offerDao = new OfferDao();
    private final BookingDao bookingDao = new BookingDao();

    static class Req {
        int busId; String seatNumbers;
        String passengerName; int passengerAge; String passengerGender;
        String offerCode;
    }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession(false);
        User user = (s == null) ? null : (User) s.getAttribute("user");
        if (user == null) { JsonUtil.write(resp, ApiResponse.fail("Please log in to book a ticket.")); return; }

        try {
            Req body = JsonUtil.readBody(req, Req.class);
            if (body == null || body.seatNumbers == null || body.seatNumbers.trim().isEmpty()) {
                JsonUtil.write(resp, ApiResponse.fail("Select at least one seat.")); return;
            }
            if (body.passengerName == null || body.passengerName.trim().isEmpty()) {
                JsonUtil.write(resp, ApiResponse.fail("Passenger name is required.")); return;
            }

            Bus bus = busDao.findById(body.busId);
            if (bus == null) { JsonUtil.write(resp, ApiResponse.fail("Bus not found.")); return; }

            // Price is computed on the server from DB fare -> tamper-proof.
            int seatCount = body.seatNumbers.split(",").length;
            BigDecimal gross = bus.getFare().multiply(BigDecimal.valueOf(seatCount));
            BigDecimal discount = BigDecimal.ZERO;
            String appliedCode = null;

            if (body.offerCode != null && !body.offerCode.trim().isEmpty()) {
                Offer o = offerDao.findByCode(body.offerCode.trim().toUpperCase());
                if (o != null) {
                    discount = gross.multiply(BigDecimal.valueOf(o.getDiscountPercent()))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (discount.compareTo(o.getMaxDiscount()) > 0) discount = o.getMaxDiscount();
                    appliedCode = o.getCode();
                }
            }
            BigDecimal payable = gross.subtract(discount);

            Booking b = new Booking();
            b.setUserId(user.getId());
            b.setBusId(body.busId);
            b.setSeatNumbers(body.seatNumbers.trim());
            b.setPassengerName(body.passengerName.trim());
            b.setPassengerAge(body.passengerAge);
            b.setPassengerGender(body.passengerGender);
            b.setTotalAmount(payable);
            b.setOfferCode(appliedCode);

            Booking saved = bookingDao.create(b);   // transactional seat re-check inside
            // enrich for the confirmation page
            saved.setOperatorName(bus.getOperatorName());
            saved.setFromCity(bus.getFromCity());
            saved.setToCity(bus.getToCity());
            saved.setTravelDate(bus.getTravelDate());
            saved.setDepartureTime(bus.getDepartureTime());
            JsonUtil.write(resp, ApiResponse.ok("Booking confirmed", saved));

        } catch (IllegalStateException dup) {
            JsonUtil.write(resp, ApiResponse.fail(dup.getMessage()));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Booking failed: " + e.getMessage()));
        }
    }
}
