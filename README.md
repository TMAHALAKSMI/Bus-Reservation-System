# BusYatra — Online Bus Ticket Reservation System

A full-stack bus booking application inspired by RedBus / AbhiBus / MakeMyTrip / Goibibo.

**Stack:** Java Servlets (backend) · MySQL (database) · Apache Tomcat (server) · plain HTML / CSS / JS (frontend, kept in separate files).

## Features

- **Login / Register / Logout** — session-based auth, salted password hashing.
- **Bus search** — by From, To and date; shows operator, timings, duration, rating, amenities, live seat availability.
- **Seat selection** — interactive 2+2 seat map with available / selected / booked / ladies states.
- **Ticket booking** — passenger details, price computed **on the server** (tamper-proof), PNR generation, printable ticket.
- **Offers** — promo codes with % discount capped at a max amount, applied live to the fare.
- **Route tracking** — animated progress bar with current location, status and auto-refresh.
- **My Trips** — view and cancel bookings (cancelling releases the seats).
- **Image loading circles** — every bus image shows a small spinning circle until it finishes loading, then fades in.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| JDK | 11 or newer | `java -version` |
| MySQL | 8.x | with MySQL Workbench |
| Apache Tomcat | **10.1.x** | uses the Jakarta `jakarta.servlet.*` API |
| Maven | 3.6+ | optional but recommended for building the WAR |

> **Tomcat version matters:** this project targets **Tomcat 10.1** (Jakarta EE 10 /
> Servlet 6.0), so it uses `jakarta.servlet.*`. If you must run it on the older
> **Tomcat 9**, change the dependency in `pom.xml` back to
> `javax.servlet:javax.servlet-api:4.0.1` and replace every `import jakarta.servlet`
> with `import javax.servlet` in the Java files. Deploying Jakarta code on Tomcat 9
> (or javax code on Tomcat 10) makes the servlets fail to register — every `/api/...`
> call then returns a 404 and the pages look "stuck loading".

---

## Setup (4 steps)

### 1. Create the database
Open **MySQL Workbench** → File → Open SQL Script → select `database/schema.sql` → click the ⚡ (Execute) button.
This creates the `bus_reservation` database with all tables and sample data (buses, offers, tracking, and a demo user).

### 2. Point the app at your MySQL
Edit `src/main/java/com/busres/util/DBConnection.java` and set your credentials:
```java
private static final String USER = "root";
private static final String PASSWORD = "your_mysql_password";
```

### 3. Build the WAR
```bash
mvn clean package
```
This produces `target/bus-reservation-system.war`.

*(No Maven? See “Building without Maven” below.)*

### 4. Deploy on Tomcat
- Copy `target/bus-reservation-system.war` into `TOMCAT_HOME/webapps/`
- Start Tomcat: `TOMCAT_HOME/bin/startup.sh` (or `startup.bat` on Windows)
- Open **http://localhost:8080/bus-reservation-system/**

### Demo login
```
Email:    demo@travel.in
Password: demo1234
```
Or click **Sign up** to create a fresh account.

### Try these searches (sample data is loaded for them)
| From | To | Date |
|------|-----|------|
| Hyderabad | Bengaluru | 2026-08-12 |
| Delhi | Kanpur | 2026-08-13 |
| Bengaluru | Chennai | 2026-08-14 |

For **Track Bus**, use bus ID `1`, `2`, or `4`.

---

## Building without Maven

Put `mysql-connector-j-8.0.33.jar`, `gson-2.10.1.jar`, and Tomcat’s `servlet-api.jar`
on the classpath, then:
```bash
# compile
javac -cp "libs/*:TOMCAT_HOME/lib/servlet-api.jar" -d build/WEB-INF/classes \
      $(find src/main/java -name "*.java")
# copy web resources + jars
cp -r src/main/webapp/* build/
mkdir -p build/WEB-INF/lib && cp libs/mysql-connector-j-8.0.33.jar libs/gson-2.10.1.jar build/WEB-INF/lib/
# package
cd build && jar -cvf ../bus-reservation-system.war . && cd ..
```
Then deploy the WAR as in step 4. (The `mysql` and `gson` jars **must** end up in `WEB-INF/lib`.)

---

## API reference (all under `/api`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/register` | Create account `{fullName,email,phone,password}` |
| POST | `/api/login` | Log in `{email,password}` |
| POST | `/api/logout` | Log out |
| GET  | `/api/session` | Current logged-in user |
| GET  | `/api/buses/search?from=&to=&date=` | Search trips |
| GET  | `/api/seats?busId=` | Bus details + booked seats |
| GET  | `/api/offers` | List active offers |
| GET  | `/api/offers?code=&amount=` | Validate a code and compute discount |
| POST | `/api/booking` | Book seats (login required) |
| GET  | `/api/mybookings` | Current user's bookings |
| POST | `/api/mybookings?action=cancel&id=` | Cancel a booking |
| GET  | `/api/tracking?busId=` | Live route status |

All responses use the envelope: `{ "success": true|false, "message": "...", "data": ... }`.

---

## Project structure
```
bus-reservation-system/
├── pom.xml
├── database/schema.sql
└── src/main/
    ├── java/com/busres/
    │   ├── model/     User, Bus, Booking, Offer
    │   ├── util/      DBConnection, PasswordUtil, ApiResponse, JsonUtil
    │   ├── dao/       UserDao, BusDao, BookingDao, OfferDao, TrackingDao
    │   └── servlet/   Register/Login/Logout/Session, BusSearch, Seat,
    │                  Offer, Booking, MyBookings, Tracking
    └── webapp/
        ├── index.html · results.html · seats.html
        ├── confirmation.html · track.html · mybookings.html
        ├── css/style.css
        ├── js/  common.js · home.js · results.js · seats.js ·
        │        confirmation.js · track.js · mybookings.js
        ├── img/  bus1–3.svg, road.svg
        └── WEB-INF/web.xml
```

## How the “loading circle” works
Bus images are written as:
```html
<div class="img-wrap"><img data-src="img/bus1.svg"><div class="spinner"></div></div>
```
`initLazyImages()` (in `common.js`) sets the real `src`, and on the image’s `load`
event adds a `.loaded` class. CSS keeps a spinning circle visible and fades the
image in only once it has fully loaded, with a fallback image on error.

## Security notes (for a production system)
- Passwords use salted SHA-256 here for simplicity — use **bcrypt/argon2** in production.
- Add HTTPS, CSRF protection, and input validation/rate-limiting before any real deployment.
- Move DB credentials out of source into environment variables or a JNDI resource.
