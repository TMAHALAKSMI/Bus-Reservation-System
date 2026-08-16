/* mybookings.js — list + cancel */
mountNav();

(async () => {
  await loadSession();
  const list = document.getElementById('list');
  if (!CURRENT_USER) {
    list.innerHTML = `<div class="empty"><div class="big">🔒</div>
      <h3>Please log in</h3><p class="muted">Log in to see your booked trips.</p>
      <button class="btn btn-primary" style="margin-top:14px"
        onclick="openAuth('login', ()=>location.reload())">Login</button></div>`;
    return;
  }
  await refresh();
})();

async function refresh() {
  const list = document.getElementById('list');
  const r = await api('mybookings');
  if (!r.success) { list.innerHTML = `<div class="empty"><h3>${r.message}</h3></div>`; return; }
  if (!r.data.length) {
    list.innerHTML = `<div class="empty"><div class="big">🚌</div>
      <h3>No trips yet</h3><p class="muted">Book your first bus and it'll appear here.</p>
      <a href="index.html" class="btn btn-primary" style="margin-top:14px">Search buses</a></div>`;
    return;
  }
  list.innerHTML = `<div class="bus-list">${r.data.map(row).join('')}</div>`;
  list.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.onclick = (e) => { e.stopPropagation(); closeAllMenus(); cancel(btn.getAttribute('data-cancel')); };
  });
  list.querySelectorAll('[data-menu-toggle]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      const wasOpen = menu.classList.contains('open');
      closeAllMenus();
      if (!wasOpen) menu.classList.add('open');
    };
  });
  document.addEventListener('click', closeAllMenus);
}

function closeAllMenus() {
  document.querySelectorAll('.menu-list.open').forEach(m => m.classList.remove('open'));
}

function row(b) {
  const cancelled = b.status === 'CANCELLED';
  return `
  <div class="bus-card" style="grid-template-columns:1fr auto;opacity:${cancelled ? .6 : 1}">
    <div class="bus-mid">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="bus-op">${b.fromCity} → ${b.toCity}</span>
        <span class="chip">PNR ${b.pnr}</span>
        <span class="rating" style="background:${cancelled ? '#9ca3af' : 'var(--green)'}">${b.status}</span>
      </div>
      <span class="bus-type">${b.operatorName} · ${prettyDate(b.travelDate)} · Dep ${time12(b.departureTime)}</span>
      <div class="amenities">
        <span class="chip">Seats: ${b.seatNumbers}</span>
        <span class="chip">${b.passengerName}</span>
        ${b.offerCode ? `<span class="chip">🎟 ${b.offerCode}</span>` : ''}
      </div>
      ${cancelled ? `<span class="muted" style="font-size:.82rem;margin-top:2px">
        Cancelled ${b.cancelledAt ? prettyDate(b.cancelledAt) : ''}${b.cancelReason ? ' · ' + b.cancelReason : ''}
        ${b.refundAmount != null ? ' · Refund: ' + money(b.refundAmount) : ''}</span>` : ''}
    </div>
    <div class="bus-right">
      <div class="fare">${money(b.totalAmount)}</div>
      <a class="btn btn-primary" href="track.html?busId=${b.busId}">Track</a>
      ${cancelled ? '' : `
      <div class="menu-wrap">
        <button class="btn btn-outline" data-menu-toggle>Manage ⌄</button>
        <div class="menu-list">
          <button class="menu-item danger" data-cancel="${b.id}">✕ Cancel booking</button>
        </div>
      </div>`}
    </div>
  </div>`;
}

async function cancel(id) {
  if (!confirm('Cancel this booking? Seats will be released. Refund (if any) depends on how close it is to departure.')) return;
  const reason = prompt('Optional: tell us why you\'re cancelling') || '';
  const r = await api(`mybookings?action=cancel&id=${id}&reason=${encodeURIComponent(reason)}`, { method: 'POST' });
  toast(r.message, r.success ? 'ok' : 'err');
  if (r.success) refresh();
}
