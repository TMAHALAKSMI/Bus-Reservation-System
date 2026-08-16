/* ticket.js — public "track my ticket" lookup by PNR */
mountNav('ticket');
loadSession();

const box = document.getElementById('ticketResult');
document.getElementById('ticketBtn').onclick = lookup;
document.getElementById('pnrInput').addEventListener('keydown', e => { if (e.key === 'Enter') lookup(); });

/* Support ?pnr= in the URL (e.g. linked from an email) */
const { pnr: prefill } = qs();
if (prefill) { document.getElementById('pnrInput').value = prefill; lookup(); }

async function lookup() {
  const pnr = (document.getElementById('pnrInput').value || '').trim();
  if (!pnr) { toast('Enter a PNR to track', 'err'); return; }

  box.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
  const r = await api(`ticket?pnr=${encodeURIComponent(pnr)}`);

  if (!r.success) {
    box.innerHTML = `<div class="empty"><div class="big">🎫</div><h3>${r.message}</h3></div>`;
    return;
  }
  const b = r.data;
  const cancelled = b.status === 'CANCELLED';
  box.innerHTML = `
  <div class="ticket" style="margin-top:24px">
    <div class="ticket-head" style="background:${cancelled ? '#9ca3af' : 'var(--green)'}">
      <div class="check">${cancelled ? '✕' : '✓'}</div>
      <h2 style="color:#fff">${cancelled ? 'Booking cancelled' : 'Booking confirmed'}</h2>
      <p style="opacity:.9">${b.fromCity} → ${b.toCity}</p>
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
        <div class="tk"><span>Status</span><b style="color:${cancelled ? '#6b7280' : 'var(--green)'}">${b.status}</b></div>
        ${cancelled && b.refundAmount != null ? `<div class="tk"><span>Refund amount</span><b>${money(b.refundAmount)}</b></div>` : ''}
        ${cancelled && b.cancelReason ? `<div class="tk"><span>Reason</span><b>${b.cancelReason}</b></div>` : ''}
      </div>

      ${!cancelled ? `<a class="btn btn-primary btn-block" style="margin-top:22px" href="track.html?busId=${b.busId}">Track this bus</a>` : ''}
    </div>
  </div>`;
}
