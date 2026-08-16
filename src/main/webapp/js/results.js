/* results.js — render searched buses */
mountNav();
loadSession();

const { from, to, date } = qs();

document.getElementById('routeTitle').textContent = `${from} → ${to}`;
document.getElementById('routeSub').textContent = prettyDate(date);

const amenityIcon = { WiFi: '📶', Charging: '🔌', Water: '💧', Blanket: '🛏️' };

(async () => {
  const box = document.getElementById('results');
  const r = await api(`buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);

  if (!r.success) { box.innerHTML = emptyState('Something went wrong', r.message); return; }
  if (!r.data.length) {
    box.innerHTML = emptyState('No buses found', `We couldn't find buses for ${from} → ${to} on ${prettyDate(date)}. Try another date.`);
    return;
  }

  box.innerHTML = `<p class="muted" style="margin-bottom:14px">${r.data.length} buses available</p>
    <div class="bus-list">${r.data.map(card).join('')}</div>`;

  // Kick off the image spinners → images fade in when loaded
  initLazyImages(box);

  box.querySelectorAll('[data-book]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-book');
      location.href = `seats.html?busId=${id}`;
    };
  });
})();

function card(b) {
  const low = b.availableSeats <= 5;
  const amen = (b.amenities || '').split(',').filter(Boolean)
    .map(a => `<span class="chip">${amenityIcon[a] || ''} ${a}</span>`).join('');
  return `
  <div class="bus-card">
    <div class="img-wrap">
      <img data-src="${b.imageUrl || 'img/bus1.svg'}" alt="${b.operatorName}">
      <div class="spinner"></div>
    </div>

    <div class="bus-mid">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="bus-op">${b.operatorName}</span>
        <span class="rating">★ ${b.rating}</span>
      </div>
      <span class="bus-type">${b.busType}</span>
      <div class="bus-times">
        <span class="time">${time12(b.departureTime)}</span>
        <span class="dur">${durText(b.durationMin)}</span>
        <span class="time">${time12(b.arrivalTime)}</span>
      </div>
      <div class="amenities">${amen}</div>
    </div>

    <div class="bus-right">
      <div class="fare">${money(b.fare)} <small>/ seat</small></div>
      <div class="seats-left ${low ? 'low' : ''}">${b.availableSeats} seats left</div>
      <button class="btn btn-primary" data-book="${b.id}">Select seats</button>
    </div>
  </div>`;
}

function emptyState(title, msg) {
  return `<div class="empty"><div class="big">🚌</div><h3>${title}</h3><p class="muted">${msg}</p>
          <a href="index.html" class="btn btn-primary" style="margin-top:16px">Back to search</a></div>`;
}
