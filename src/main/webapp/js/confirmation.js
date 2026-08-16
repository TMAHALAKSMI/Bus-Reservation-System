/* confirmation.js — show the ticket */
mountNav();
loadSession();

const b = JSON.parse(sessionStorage.getItem('lastBooking') || 'null');
const box = document.getElementById('ticketBox');

if (!b) {
  box.innerHTML = `<div class="empty"><div class="big">🎫</div>
    <h3>No booking to show</h3>
    <p class="muted">Your ticket details aren't available here. Check My Trips.</p>
    <a href="mybookings.html" class="btn btn-primary" style="margin-top:14px">My Trips</a></div>`;
} else {
  box.innerHTML = `
  <div class="ticket">
    <div class="ticket-head">
      <div class="check">✓</div>
      <h2 style="color:#fff">Booking confirmed!</h2>
      <p style="opacity:.9">Your seat is reserved. Have a great trip.</p>
    </div>
    <div class="ticket-body">
      <p class="muted" style="text-align:center">Booking reference (PNR)</p>
      <div class="pnr">${b.pnr}</div>

      <div class="ticket-grid">
        <div class="tk"><span>Operator</span><b>${b.operatorName}</b></div>
        <div class="tk"><span>Journey</span><b>${b.fromCity} → ${b.toCity}</b></div>
        <div class="tk"><span>Date</span><b>${prettyDate(b.travelDate)}</b></div>
        <div class="tk"><span>Departure</span><b>${time12(b.departureTime)}</b></div>
        <div class="tk"><span>Passenger</span><b>${b.passengerName}</b></div>
        <div class="tk"><span>Seats</span><b>${b.seatNumbers}</b></div>
      </div>

      <hr class="dashed">
      <div class="ticket-grid">
        <div class="tk"><span>Amount paid</span><b style="color:var(--red);font-size:1.2rem">${money(b.totalAmount)}</b></div>
        <div class="tk"><span>Status</span><b style="color:var(--green)">${b.status}</b></div>
      </div>

      <div style="display:flex;gap:10px;margin-top:22px">
        <button class="btn btn-outline btn-block" onclick="window.print()">Download / Print</button>
        <a class="btn btn-primary btn-block" href="track.html?busId=${b.busId}">Track this bus</a>
      </div>
      <a class="btn btn-block" href="index.html" style="margin-top:10px;color:var(--muted)">Book another trip</a>
    </div>
  </div>`;
}
