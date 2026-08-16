package com.busres.servlet;

import com.busres.dao.ContactDao;
import com.busres.model.ContactMessage;
import com.busres.util.ApiResponse;
import com.busres.util.JsonUtil;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.regex.Pattern;

/** POST /api/contact — stores a message from the "Contact us" page. */
@WebServlet("/api/contact")
public class ContactServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private final ContactDao contactDao = new ContactDao();
    private static final Pattern EMAIL_RE = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    static class Req { String name; String email; String subject; String message; }

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Req body = JsonUtil.readBody(req, Req.class);
            if (body == null || isBlank(body.name) || isBlank(body.email) || isBlank(body.message)) {
                JsonUtil.write(resp, ApiResponse.fail("Name, email and message are required.")); return;
            }
            if (!EMAIL_RE.matcher(body.email.trim()).matches()) {
                JsonUtil.write(resp, ApiResponse.fail("Enter a valid email address.")); return;
            }
            ContactMessage m = new ContactMessage();
            m.setName(body.name.trim());
            m.setEmail(body.email.trim());
            m.setSubject(isBlank(body.subject) ? "General enquiry" : body.subject.trim());
            m.setMessage(body.message.trim());
            contactDao.create(m);
            JsonUtil.write(resp, ApiResponse.ok("Thanks! Your message has been sent — our team will get back to you soon.", null));
        } catch (Exception e) {
            JsonUtil.write(resp, ApiResponse.fail("Could not send message: " + e.getMessage()));
        }
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
