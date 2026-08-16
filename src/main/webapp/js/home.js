/* home.js — landing page behaviour */
mountNav('home');
loadSession();

const ROUTES = [
  { from: 'Hyderabad', to: 'Bengaluru', date: '2026-08-12', tag: '3 buses · from ₹899',
    photo: 'https://images.unsplash.com/photo-1600100397608-f70cb54cb0a1?w=600&q=80&auto=format&fit=crop' },
  { from: 'Delhi',     to: 'Kanpur',    date: '2026-08-13', tag: '2 buses · from ₹749',
    photo: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80&auto=format&fit=crop' },
  { from: 'Bengaluru', to: 'Chennai',   date: '2026-08-14', tag: '2 buses · from ₹699',
    photo: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80&auto=format&fit=crop' },
  { from: 'Mumbai',    to: 'Pune',      date: '2026-08-12', tag: '4 buses · from ₹399',
    photo: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80&auto=format&fit=crop' },
  { from: 'Chennai',   to: 'Madurai',   date: '2026-08-13', tag: '3 buses · from ₹549',
    photo: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80&auto=format&fit=crop' },
  { from: 'Delhi',     to: 'Jaipur',    date: '2026-08-14', tag: '3 buses · from ₹599',
    photo: 'https://images.unsplash.com/photo-1524492449090-16d1607d8bfd?w=600&q=80&auto=format&fit=crop' },
  { from: 'Kolkata',   to: 'Bhubaneswar', date: '2026-08-12', tag: '2 buses · from ₹649',
    photo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&q=80&auto=format&fit=crop' },
  { from: 'Ahmedabad', to: 'Udaipur',   date: '2026-08-13', tag: '2 buses · from ₹499',
    photo: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80&auto=format&fit=crop' },
];

/* Search */
document.getElementById('searchBtn').onclick = () => {
  const from = val('from'), to = val('to'), date = val('date');
  if (!from || !to || !date) { toast('Please fill from, to and date', 'err'); return; }
  if (from.toLowerCase() === to.toLowerCase()) { toast('From and To cannot be same', 'err'); return; }
  location.href = `results.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`;
};

/* Trending routes as quick-search photo cards */
document.getElementById('routes').innerHTML = ROUTES.map(r => `
  <a class="route-card" href="results.html?from=${r.from}&to=${r.to}&date=${r.date}">
    <div class="route-photo">
      <img data-src="${r.photo}" alt="${r.from} to ${r.to}">
      <div class="spinner"></div>
    </div>
    <div class="route-body">
      <div class="route-cities">${r.from} <span>→</span> ${r.to}</div>
      <p class="muted" style="margin-top:6px">${prettyDate(r.date)} · ${r.tag}</p>
    </div>
  </a>`).join('');
initLazyImages(document.getElementById('routes'));

/* Promo banner (static local image, already in the DOM) */
initLazyImages(document.querySelector('.promo-banner'));

/* Offers */
(async () => {
  const box = document.getElementById('offerList');
  let r;
  try {
    r = await api('offers');
  } catch (e) {
    box.innerHTML = '<p class="muted">Couldn\'t load offers. Make sure the database is set up and the Tomcat server is running (check the Console tab for errors).</p>';
    return;
  }
  if (!r.success || !r.data.length) { box.innerHTML = '<p class="muted">No active offers right now.</p>'; return; }
  box.innerHTML = r.data.map(o => `
    <div class="offer-card">
      <div class="offer-top">
        <div class="offer-badge">${o.discountPercent}% OFF</div>
        <b>${o.title}</b>
      </div>
      <div class="offer-body">
        <p class="muted">${o.description}</p>
        <span class="offer-code" title="Click to copy" onclick="copyCode('${o.code}')">${o.code} ⧉</span>
        <small class="muted">Valid till ${prettyDate(o.validTill)}</small>
      </div>
    </div>`).join('');
})();

function copyCode(code) {
  navigator.clipboard?.writeText(code);
  toast(`Copied ${code}`, 'ok');
}
