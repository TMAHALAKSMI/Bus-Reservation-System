/* track.js — live-ish bus tracking */
mountNav('track');
loadSession();

let timer = null;

document.getElementById('trackBtn').onclick = () => track(document.getElementById('trackId').value.trim());

// deep link: track.html?busId=1
const q = qs();
if (q.busId) { document.getElementById('trackId').value = q.busId; track(q.busId); }

async function track(id) {
  if (!id) { toast('Enter a bus ID', 'err'); return; }
  const box = document.getElementById('trackResult');
  box.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';
  const r = await api(`tracking?busId=${id}`);
  if (!r.success) { box.innerHTML = `<div class="empty"><div class="big">📍</div><h3>${r.message}</h3></div>`;
    clearInterval(timer); return; }
  render(r.data);
  // auto refresh every 15s
  clearInterval(timer);
  timer = setInterval(async () => {
    const rr = await api(`tracking?busId=${id}`);
    if (rr.success) render(rr.data);
  }, 15000);
}

function render(t) {
  const onTime = t.status === 'ON_TIME';
  const pill = onTime
    ? `<span class="status-pill on">● On time</span>`
    : `<span class="status-pill delay">● ${t.status.replace('_', ' ')}</span>`;
  document.getElementById('trackResult').innerHTML = `
  <div class="track-card">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div>
        <h3>${t.operatorName}</h3>
        <p class="muted">${t.fromCity} → ${t.toCity} · Dep ${time12(t.departureTime)} · Arr ${time12(t.arrivalTime)}</p>
      </div>
      ${pill}
    </div>

    <div class="track-bar">
      <div class="track-fill" style="width:${t.progressPercent}%"></div>
      <div class="track-bus" style="left:${t.progressPercent}%">🚌</div>
    </div>
    <div class="track-ends"><span>${t.fromCity}</span><span>${t.toCity}</span></div>

    <hr class="dashed">
    <div class="ticket-grid">
      <div class="tk"><span>Currently near</span><b>${t.currentLocation}</b></div>
      <div class="tk"><span>Journey completed</span><b>${t.progressPercent}%</b></div>
      <div class="tk"><span>Last updated</span><b>${t.updatedAt || 'just now'}</b></div>
    </div>
    <p class="muted" style="margin-top:14px;font-size:.82rem">Status refreshes automatically every 15 seconds.</p>
  </div>`;
}
