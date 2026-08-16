/* seats.js — seat map, live price, offer, booking */
mountNav();
loadSession();

const { busId } = qs();
let BUS = null;
let BOOKED = [];
let SELECTED = [];
let DISCOUNT = 0;
let APPLIED_CODE = null;

(async () => {
  const r = await api(`seats?busId=${busId}`);
  const page = document.getElementById('page');
  if (!r.success) { page.innerHTML = `<div class="empty"><h3>${r.message}</h3></div>`; return; }

  BUS = r.data.bus;
  BOOKED = r.data.bookedSeats || [];

  document.getElementById('opName').textContent = `${BUS.operatorName} · ${BUS.busType}`;
  document.getElementById('tripSub').textContent =
    `${BUS.fromCity} → ${BUS.toCity} · ${prettyDate(BUS.travelDate)} · Dep ${time12(BUS.departureTime)}`;
  document.getElementById('backBtn').href =
    `results.html?from=${BUS.fromCity}&to=${BUS.toCity}&date=${BUS.travelDate}`;

  page.innerHTML = layout();
  buildSeats();
  wireForm();
  refreshSummary();
})();

/* ---- page markup ---- */
function layout() {
  return `
  <div class="seat-layout">
    <div class="deck">
      <div class="deck-title">Lower deck <span class="wheel">🎡 driver</span></div>
      <div class="seat-grid" id="seatGrid"></div>
      <div class="legend">
        <span><i class="dot"></i> Available</span>
        <span><i class="dot sel"></i> Selected</span>
        <span><i class="dot bk"></i> Booked</span>
        <span><i class="dot" style="border-color:#e879a6"></i> Ladies</span>
      </div>
    </div>

    <div class="summary">
      <h3>Fare summary</h3>
      <div class="summary-row"><span>Fare / seat</span><b>${money(BUS.fare)}</b></div>
      <div class="summary-row"><span>Selected seats</span><b id="sumSeats">—</b></div>
      <div class="summary-row"><span>Subtotal</span><b id="sumSub">₹0</b></div>
      <div class="summary-row" id="sumDiscRow" style="display:none;color:var(--green)">
        <span>Discount (<span id="sumCode"></span>)</span><b id="sumDisc">-₹0</b></div>
      <div class="summary-row total"><span>Payable</span><b id="sumTotal">₹0</b></div>

      <hr class="dashed">
      <div class="offer-apply">
        <input id="offerInput" placeholder="Offer code e.g. BUS150">
        <button class="btn btn-amber" id="applyOffer">Apply</button>
      </div>
      <small class="muted" id="offerMsg"></small>

      <hr class="dashed">
      <h3 style="font-size:1.05rem">Passenger details</h3>
      <div class="form-row"><label>Full name</label><input id="pName" placeholder="Passenger name"></div>
      <div style="display:flex;gap:10px">
        <div class="form-row" style="flex:1"><label>Age</label><input id="pAge" type="number" min="1" max="120" placeholder="Age"></div>
        <div class="form-row" style="flex:1"><label>Gender</label>
          <select id="pGender"><option>Male</option><option>Female</option><option>Other</option></select></div>
      </div>

      <button class="btn btn-primary btn-block" id="bookBtn" style="margin-top:8px">Proceed to book</button>
    </div>
  </div>`;
}

/* ---- seat grid (2 + aisle + 2) ---- */
function buildSeats() {
  const grid = document.getElementById('seatGrid');
  const total = BUS.totalSeats;
  let html = '';
  for (let i = 1; i <= total; i++) {
    const col = ((i - 1) % 4);           // 0,1 | 2,3  -> two on each side
    if (col === 2) html += '<div></div>'; // aisle gap
    const label = 'S' + i;
    const booked = BOOKED.includes(label);
    // mark every 7th seat as ladies for demo colour only
    const ladies = (i % 7 === 0) && !booked;
    html += `<button class="seat ${booked ? 'booked' : ''} ${ladies ? 'female' : ''}"
                 data-seat="${label}" ${booked ? 'disabled' : ''}>${i}</button>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.seat:not(.booked)').forEach(s => {
    s.onclick = () => {
      const label = s.dataset.seat;
      if (SELECTED.includes(label)) {
        SELECTED = SELECTED.filter(x => x !== label);
        s.classList.remove('selected');
      } else {
        if (SELECTED.length >= 6) { toast('You can select up to 6 seats', 'err'); return; }
        SELECTED.push(label);
        s.classList.add('selected');
      }
      // seat change invalidates any applied offer amount → recompute
      if (APPLIED_CODE) applyOffer(true);
      else refreshSummary();
    };
  });
}

/* ---- price summary ---- */
function subtotal() { return Number(BUS.fare) * SELECTED.length; }

function refreshSummary() {
  const sub = subtotal();
  document.getElementById('sumSeats').textContent = SELECTED.length ? SELECTED.join(', ') : '—';
  document.getElementById('sumSub').textContent = money(sub);
  const discRow = document.getElementById('sumDiscRow');
  if (DISCOUNT > 0) {
    discRow.style.display = 'flex';
    document.getElementById('sumDisc').textContent = '-' + money(DISCOUNT);
    document.getElementById('sumCode').textContent = APPLIED_CODE;
  } else discRow.style.display = 'none';
  document.getElementById('sumTotal').textContent = money(Math.max(0, sub - DISCOUNT));
}

/* ---- offer ---- */
function wireForm() {
  document.getElementById('applyOffer').onclick = () => applyOffer(false);
  document.getElementById('bookBtn').onclick = book;
}

async function applyOffer(silent) {
  const code = document.getElementById('offerInput').value.trim().toUpperCase();
  const msg = document.getElementById('offerMsg');
  if (!code) { toast('Enter an offer code', 'err'); return; }
  if (!SELECTED.length) { toast('Select seats first', 'err'); return; }
  const r = await api(`offers?code=${code}&amount=${subtotal()}`);
  if (!r.success) { DISCOUNT = 0; APPLIED_CODE = null; msg.textContent = ''; refreshSummary();
    if (!silent) toast(r.message, 'err'); return; }
  DISCOUNT = Number(r.data.discount);
  APPLIED_CODE = r.data.code;
  msg.style.color = 'var(--green)';
  msg.textContent = `✓ ${APPLIED_CODE} applied — you save ${money(DISCOUNT)}`;
  refreshSummary();
  if (!silent) toast('Offer applied', 'ok');
}

/* ---- booking ---- */
function book() {
  if (!SELECTED.length) { toast('Please select at least one seat', 'err'); return; }
  const name = document.getElementById('pName').value.trim();
  if (!name) { toast('Enter passenger name', 'err'); return; }

  requireLogin(async () => {
    const btn = document.getElementById('bookBtn');
    btn.disabled = true; btn.textContent = 'Booking…';
    const r = await api('booking', { method: 'POST', body: {
      busId: Number(busId),
      seatNumbers: SELECTED.join(','),
      passengerName: name,
      passengerAge: Number(document.getElementById('pAge').value) || 0,
      passengerGender: document.getElementById('pGender').value,
      offerCode: APPLIED_CODE
    }});
    if (!r.success) {
      btn.disabled = false; btn.textContent = 'Proceed to book';
      toast(r.message, 'err');
      // a seat may have been taken meanwhile → refresh map
      if (/seat/i.test(r.message)) location.reload();
      return;
    }
    sessionStorage.setItem('lastBooking', JSON.stringify(r.data));
    location.href = `confirmation.html?pnr=${r.data.pnr}`;
  });
}
