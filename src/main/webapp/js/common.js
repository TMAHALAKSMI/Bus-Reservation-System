/* =====================================================================
   common.js — shared helpers used by every page
   ===================================================================== */

/* ---------- API base (same origin, so relative works) ---------- */
const API = 'api';

async function api(path, { method = 'GET', body = null } = {}) {
  const opts = { method, headers: {}, credentials: 'same-origin' };
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  const res = await fetch(`${API}/${path}`, opts);
  return res.json();               // { success, message, data }
}

/* ---------- Formatting ---------- */
const money = n => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const time12 = t => {                                  // "21:00:00" -> "9:00 PM"
  if (!t) return '';
  const [h, m] = t.split(':'); let hh = +h; const ap = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12; return `${hh}:${m} ${ap}`;
};
const durText = min => `${Math.floor(min / 60)}h ${min % 60}m`;
const prettyDate = d => new Date(d).toLocaleDateString('en-IN',
  { weekday: 'short', day: 'numeric', month: 'short' });

/* ---------- Query-string helpers ---------- */
const qs = () => Object.fromEntries(new URLSearchParams(location.search));

/* ---------- Toast ---------- */
function toast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.className = 'toast ' + type; t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* =====================================================================
   Image loading with a small spinning circle
   Any <div class="img-wrap"><img data-src="..."><div class="spinner"></div></div>
   will show the circle until the image finishes loading, then fade it in.
   ===================================================================== */
function initLazyImages(root = document) {
  root.querySelectorAll('img[data-src]').forEach(img => {
    const real = img.getAttribute('data-src');
    const done = () => img.classList.add('loaded');           // hides spinner via CSS
    if (img.complete && img.naturalWidth) { img.src = real; done(); return; }
    img.onload = done;
    img.onerror = () => { img.src = 'img/bus1.svg'; done(); }; // graceful fallback
    img.src = real;
  });
}

/* =====================================================================
   i18n — simple client-side language switcher (English / Hindi / Tamil)
   Any element with data-i18n="key" gets its text replaced; elements with
   data-i18n-ph="key" get their placeholder translated. Falls back to the
   English string (or the key itself) when a translation is missing.
   ===================================================================== */
const I18N = {
  en: {
    'nav.home':'Home','nav.offers':'Offers','nav.trackBus':'Track Bus','nav.trackTicket':'Track Ticket',
    'nav.about':'About','nav.contact':'Contact','nav.reviews':'Reviews',
    'nav.myTrips':'My Trips','nav.login':'Login','nav.signup':'Sign up','nav.logout':'Logout',
    'hero.title':'Book bus tickets across India, the easy way.',
    'hero.sub':'2,000+ routes, live seat selection, instant offers and real-time bus tracking.',
    'search.from':'From','search.to':'To','search.date':'Date of journey','search.btn':'Search buses',
    'routes.eyebrow':'Popular right now','routes.heading':'Trending routes',
    'offers.eyebrow':'Save more','offers.heading':'Offers for you',
    'footer.text':'© 2026 BusYatra · A demo Bus Ticket Reservation System · Java + MySQL + Tomcat',
    'auth.login':'Login','auth.signup':'Sign up','auth.name':'Full name','auth.phone':'Phone',
    'auth.email':'Email','auth.password':'Password','auth.createAccount':'Create account',
    'about.eyebrow':'Who we are','about.heading':'About BusYatra',
    'about.intro':'BusYatra makes intercity bus travel simple — search routes, compare operators, pick your seat and track your bus live, all in one place.',
    'about.mission.title':'Our mission','about.mission.body':'To make every bus journey across India easy to plan, fair on price and stress-free to track — for every traveller, in every city we serve.',
    'about.stats.routes':'Routes covered','about.stats.operators':'Bus operators','about.stats.travellers':'Happy travellers','about.stats.cities':'Cities connected',
    'about.values.title':'What we stand for',
    'about.value1.title':'Transparent pricing','about.value1.body':'The fare you see is the fare you pay — no hidden fees at checkout.',
    'about.value2.title':'Real-time tracking','about.value2.body':'Know exactly where your bus is, from boarding to drop-off.',
    'about.value3.title':'Customer first','about.value3.body':'Round-the-clock support and easy cancellations whenever plans change.',
    'contact.eyebrow':'Get in touch','contact.heading':'Contact us',
    'contact.intro':"Questions, feedback or a booking issue? Send us a message and we'll get back to you shortly.",
    'contact.name':'Your name','contact.email':'Email address','contact.subject':'Subject','contact.message':'Message',
    'contact.send':'Send message','contact.info.title':'Reach us directly',
    'contact.info.phone':'Phone support','contact.info.emailLabel':'Email us','contact.info.hours':'Support hours','contact.info.hoursVal':'Every day, 6 AM – 11 PM IST',
    'reviews.eyebrow':'Real journeys','reviews.heading':'What our customers say',
    'reviews.intro':'Ratings and reviews from travellers who booked their trip on BusYatra.',
    'ticket.eyebrow':'Live status','ticket.heading':'Track my ticket',
    'ticket.intro':'Enter the PNR / ticket ID from your booking confirmation to view its status.',
    'ticket.placeholder':'PNR e.g. BR7F3K9QZP','ticket.btn':'Track',
  },
  hi: {
    'nav.home':'होम','nav.offers':'ऑफ़र','nav.trackBus':'बस ट्रैक करें','nav.trackTicket':'टिकट ट्रैक करें',
    'nav.about':'हमारे बारे में','nav.contact':'संपर्क करें','nav.reviews':'समीक्षाएं',
    'nav.myTrips':'मेरी यात्राएं','nav.login':'लॉगिन','nav.signup':'साइन अप','nav.logout':'लॉगआउट',
    'hero.title':'भारत भर में बस टिकट बुक करें, आसान तरीके से।',
    'hero.sub':'2,000+ रूट, लाइव सीट चयन, तुरंत ऑफ़र और रीयल-टाइम बस ट्रैकिंग।',
    'search.from':'कहाँ से','search.to':'कहाँ तक','search.date':'यात्रा की तारीख','search.btn':'बसें खोजें',
    'routes.eyebrow':'अभी लोकप्रिय','routes.heading':'ट्रेंडिंग रूट',
    'offers.eyebrow':'ज़्यादा बचाएं','offers.heading':'आपके लिए ऑफ़र',
    'footer.text':'© 2026 BusYatra · एक डेमो बस टिकट रिज़र्वेशन सिस्टम · Java + MySQL + Tomcat',
    'auth.login':'लॉगिन','auth.signup':'साइन अप','auth.name':'पूरा नाम','auth.phone':'फ़ोन नंबर',
    'auth.email':'ईमेल','auth.password':'पासवर्ड','auth.createAccount':'खाता बनाएं',
    'about.eyebrow':'हम कौन हैं','about.heading':'BusYatra के बारे में',
    'about.intro':'BusYatra शहरों के बीच बस यात्रा को आसान बनाता है — रूट खोजें, ऑपरेटरों की तुलना करें, अपनी सीट चुनें और अपनी बस को लाइव ट्रैक करें, यह सब एक ही जगह पर।',
    'about.mission.title':'हमारा लक्ष्य','about.mission.body':'भारत भर में हर बस यात्रा की योजना बनाना आसान, कीमत में उचित और ट्रैक करने में तनाव-मुक्त बनाना — हर यात्री के लिए, हर शहर में जहाँ हम सेवा देते हैं।',
    'about.stats.routes':'कवर किए गए रूट','about.stats.operators':'बस ऑपरेटर','about.stats.travellers':'खुश यात्री','about.stats.cities':'जुड़े शहर',
    'about.values.title':'हम किस लिए खड़े हैं',
    'about.value1.title':'पारदर्शी कीमत','about.value1.body':'आप जो किराया देखते हैं वही चुकाते हैं — चेकआउट पर कोई छिपा शुल्क नहीं।',
    'about.value2.title':'रीयल-टाइम ट्रैकिंग','about.value2.body':'जानें कि आपकी बस बोर्डिंग से लेकर ड्रॉप-ऑफ तक कहाँ है।',
    'about.value3.title':'ग्राहक पहले','about.value3.body':'योजना बदलने पर चौबीसों घंटे सहायता और आसान रद्दीकरण।',
    'contact.eyebrow':'संपर्क में रहें','contact.heading':'संपर्क करें',
    'contact.intro':'सवाल, प्रतिक्रिया या बुकिंग समस्या? हमें संदेश भेजें और हम जल्द ही आपसे संपर्क करेंगे।',
    'contact.name':'आपका नाम','contact.email':'ईमेल पता','contact.subject':'विषय','contact.message':'संदेश',
    'contact.send':'संदेश भेजें','contact.info.title':'सीधे हमसे संपर्क करें',
    'contact.info.phone':'फ़ोन सहायता','contact.info.emailLabel':'हमें ईमेल करें','contact.info.hours':'सहायता समय','contact.info.hoursVal':'हर दिन, सुबह 6 – रात 11 बजे IST',
    'reviews.eyebrow':'असली यात्राएं','reviews.heading':'हमारे ग्राहक क्या कहते हैं',
    'reviews.intro':'BusYatra पर यात्रा बुक करने वाले यात्रियों की रेटिंग और समीक्षाएं।',
    'ticket.eyebrow':'लाइव स्टेटस','ticket.heading':'मेरा टिकट ट्रैक करें',
    'ticket.intro':'अपनी बुकिंग की स्थिति देखने के लिए अपना PNR / टिकट आईडी दर्ज करें।',
    'ticket.placeholder':'PNR जैसे BR7F3K9QZP','ticket.btn':'ट्रैक करें',
  },
  ta: {
    'nav.home':'முகப்பு','nav.offers':'சலுகைகள்','nav.trackBus':'பேருந்து கண்காணி','nav.trackTicket':'டிக்கெட் கண்காணி',
    'nav.about':'எங்களை பற்றி','nav.contact':'தொடர்பு கொள்ள','nav.reviews':'மதிப்புரைகள்',
    'nav.myTrips':'எனது பயணங்கள்','nav.login':'உள்நுழை','nav.signup':'பதிவு செய்க','nav.logout':'வெளியேறு',
    'hero.title':'இந்தியா முழுவதும் பேருந்து டிக்கெட்டுகளை எளிதாக பதிவு செய்யுங்கள்.',
    'hero.sub':'2,000+ வழித்தடங்கள், நேரடி இருக்கை தேர்வு, உடனடி சலுகைகள் மற்றும் நேரடி பேருந்து கண்காணிப்பு.',
    'search.from':'இருந்து','search.to':'வரை','search.date':'பயண தேதி','search.btn':'பேருந்துகளை தேடு',
    'routes.eyebrow':'இப்போது பிரபலம்','routes.heading':'டிரெண்டிங் வழித்தடங்கள்',
    'offers.eyebrow':'மேலும் சேமிக்க','offers.heading':'உங்களுக்கான சலுகைகள்',
    'footer.text':'© 2026 BusYatra · ஒரு டெமோ பேருந்து டிக்கெட் முன்பதிவு அமைப்பு · Java + MySQL + Tomcat',
    'auth.login':'உள்நுழை','auth.signup':'பதிவு செய்க','auth.name':'முழு பெயர்','auth.phone':'தொலைபேசி எண்',
    'auth.email':'மின்னஞ்சல்','auth.password':'கடவுச்சொல்','auth.createAccount':'கணக்கை உருவாக்கு',
    'about.eyebrow':'நாங்கள் யார்','about.heading':'BusYatra பற்றி',
    'about.intro':'BusYatra நகரங்களுக்கு இடையேயான பேருந்து பயணத்தை எளிதாக்குகிறது — வழித்தடங்களைத் தேடுங்கள், ஆபரேட்டர்களை ஒப்பிடுங்கள், உங்கள் இருக்கையைத் தேர்ந்தெடுங்கள், உங்கள் பேருந்தை நேரடியாகக் கண்காணியுங்கள் — அனைத்தும் ஒரே இடத்தில்.',
    'about.mission.title':'எங்கள் நோக்கம்','about.mission.body':'இந்தியா முழுவதும் ஒவ்வொரு பேருந்து பயணத்தையும் திட்டமிட எளிதாகவும், விலையில் நியாயமாகவும், கண்காணிக்க கவலையின்றி இருக்கச் செய்வதே — நாங்கள் சேவை செய்யும் ஒவ்வொரு நகரத்திலும் உள்ள ஒவ்வொரு பயணிக்கும்.',
    'about.stats.routes':'உள்ளடக்கிய வழித்தடங்கள்','about.stats.operators':'பேருந்து ஆபரேட்டர்கள்','about.stats.travellers':'மகிழ்ச்சியான பயணிகள்','about.stats.cities':'இணைக்கப்பட்ட நகரங்கள்',
    'about.values.title':'நாங்கள் எதற்காக நிற்கிறோம்',
    'about.value1.title':'வெளிப்படையான விலை','about.value1.body':'நீங்கள் காணும் கட்டணமே நீங்கள் செலுத்தும் கட்டணம் — செக்அவுட்டில் மறைமுக கட்டணங்கள் இல்லை.',
    'about.value2.title':'நேரடி கண்காணிப்பு','about.value2.body':'ஏறுவதிலிருந்து இறங்கும் வரை உங்கள் பேருந்து எங்கே உள்ளது என்பதை அறியுங்கள்.',
    'about.value3.title':'வாடிக்கையாளர் முதலில்','about.value3.body':'திட்டங்கள் மாறும்போது 24 மணி நேர ஆதரவும் எளிதான ரத்துசெய்தலும்.',
    'contact.eyebrow':'தொடர்பில் இருங்கள்','contact.heading':'தொடர்பு கொள்ள',
    'contact.intro':'கேள்விகள், கருத்துகள் அல்லது முன்பதிவு சிக்கலா? எங்களுக்கு ஒரு செய்தி அனுப்புங்கள், விரைவில் பதிலளிப்போம்.',
    'contact.name':'உங்கள் பெயர்','contact.email':'மின்னஞ்சல் முகவரி','contact.subject':'பொருள்','contact.message':'செய்தி',
    'contact.send':'செய்தி அனுப்பு','contact.info.title':'நேரடியாக எங்களைத் தொடர்பு கொள்ளுங்கள்',
    'contact.info.phone':'தொலைபேசி ஆதரவு','contact.info.emailLabel':'எங்களுக்கு மின்னஞ்சல் அனுப்பவும்','contact.info.hours':'ஆதரவு நேரம்','contact.info.hoursVal':'தினமும், காலை 6 – இரவு 11 IST',
    'reviews.eyebrow':'உண்மையான பயணங்கள்','reviews.heading':'எங்கள் வாடிக்கையாளர்கள் என்ன சொல்கிறார்கள்',
    'reviews.intro':'BusYatra-வில் பயணத்தை முன்பதிவு செய்த பயணிகளின் மதிப்பீடுகள் மற்றும் மதிப்புரைகள்.',
    'ticket.eyebrow':'நேரடி நிலை','ticket.heading':'எனது டிக்கெட்டை கண்காணி',
    'ticket.intro':'உங்கள் முன்பதிவின் நிலையைப் பார்க்க PNR / டிக்கெட் ஐடியை உள்ளிடவும்.',
    'ticket.placeholder':'PNR எ.கா. BR7F3K9QZP','ticket.btn':'கண்காணி',
  },
};
const LANG_NAMES = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்' };
let LANG = localStorage.getItem('lang') || 'en';

function t(key) {
  return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
}

function translatePage(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
  document.documentElement.lang = LANG;
}

function setLang(lang) {
  if (!I18N[lang]) return;
  LANG = lang;
  localStorage.setItem('lang', lang);
  mountNav(NAV_ACTIVE);   // redraw nav (labels + selector) then re-translate the whole page
}

/* =====================================================================
   Auth: session state + login/register modal + navbar rendering
   ===================================================================== */
let CURRENT_USER = null;

async function loadSession() {
  try {
    const r = await api('session');
    CURRENT_USER = r && r.success ? r.data : null;
  } catch (e) {
    CURRENT_USER = null;          // backend unreachable → treat as logged out, still draw nav
  }
  renderNav();
  return CURRENT_USER;
}

function renderNav() {
  const box = document.getElementById('navUser');
  if (!box) return;
  if (CURRENT_USER) {
    const initial = (CURRENT_USER.fullName || '?').charAt(0).toUpperCase();
    box.innerHTML = `
      <div class="nav-user">
        <a href="mybookings.html">${t('nav.myTrips')}</a>
        <div class="nav-avatar" title="${CURRENT_USER.email}">${initial}</div>
        <button class="btn btn-ghost" id="logoutBtn">${t('nav.logout')}</button>
      </div>`;
    document.getElementById('logoutBtn').onclick = doLogout;
  } else {
    box.innerHTML = `
      <div class="nav-user">
        <button class="btn btn-ghost" id="loginNavBtn">${t('nav.login')}</button>
        <button class="btn btn-light" id="signupNavBtn">${t('nav.signup')}</button>
      </div>`;
    document.getElementById('loginNavBtn').onclick = () => openAuth('login');
    document.getElementById('signupNavBtn').onclick = () => openAuth('register');
  }
}

async function doLogout() {
  await api('logout', { method: 'POST' });
  CURRENT_USER = null;
  toast('Logged out', 'ok');
  renderNav();
  if (/mybookings/.test(location.pathname)) location.href = 'index.html';
}

/* Build the modal once and reuse it */
function ensureAuthModal() {
  if (document.getElementById('authModal')) return;
  const el = document.createElement('div');
  el.id = 'authModal';
  el.className = 'modal-back hidden';
  el.innerHTML = `
    <div class="modal">
      <div class="modal-head"><h3 id="authTitle">${t('auth.login')}</h3>
        <button class="modal-close" onclick="closeAuth()">&times;</button></div>
      <div class="modal-body">
        <div class="tabs">
          <button class="tab active" data-mode="login" onclick="switchAuth('login')">${t('auth.login')}</button>
          <button class="tab" data-mode="register" onclick="switchAuth('register')">${t('auth.signup')}</button>
        </div>
        <div id="regFields" class="hidden">
          <div class="form-row"><label>${t('auth.name')}</label><input id="auName" placeholder="Your name"></div>
          <div class="form-row"><label>${t('auth.phone')}</label><input id="auPhone" placeholder="10-digit mobile"></div>
        </div>
        <div class="form-row"><label>${t('auth.email')}</label><input id="auEmail" type="email" placeholder="you@email.com"></div>
        <div class="form-row"><label>${t('auth.password')}</label><input id="auPass" type="password" placeholder="••••••"></div>
        <button class="btn btn-primary btn-block" id="authSubmit">${t('auth.login')}</button>
        <p class="switch muted">Demo login: <b>demo@travel.in</b> / <b>demo1234</b></p>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) closeAuth(); });
}

let AUTH_MODE = 'login';
let AUTH_ON_SUCCESS = null;

function openAuth(mode = 'login', onSuccess = null) {
  ensureAuthModal();
  AUTH_ON_SUCCESS = onSuccess;
  switchAuth(mode);
  document.getElementById('authModal').classList.remove('hidden');
}
function closeAuth() { const m = document.getElementById('authModal'); if (m) m.classList.add('hidden'); }

function switchAuth(mode) {
  AUTH_MODE = mode;
  document.querySelectorAll('#authModal .tab').forEach(tab =>
    tab.classList.toggle('active', tab.dataset.mode === mode));
  document.getElementById('regFields').classList.toggle('hidden', mode !== 'register');
  document.getElementById('authTitle').textContent = mode === 'login' ? t('auth.login') : t('auth.createAccount');
  const btn = document.getElementById('authSubmit');
  btn.textContent = mode === 'login' ? t('auth.login') : t('auth.signup');
  btn.onclick = submitAuth;
}

async function submitAuth() {
  const email = val('auEmail'), pass = val('auPass');
  const btn = document.getElementById('authSubmit');
  if (!email || !pass) { toast('Email and password required', 'err'); return; }
  btn.disabled = true;
  let r;
  if (AUTH_MODE === 'login') {
    r = await api('login', { method: 'POST', body: { email, password: pass } });
  } else {
    r = await api('register', { method: 'POST',
      body: { fullName: val('auName'), phone: val('auPhone'), email, password: pass } });
  }
  btn.disabled = false;
  if (!r.success) { toast(r.message, 'err'); return; }
  CURRENT_USER = r.data;
  renderNav();
  closeAuth();
  toast(r.message, 'ok');
  if (AUTH_ON_SUCCESS) { const cb = AUTH_ON_SUCCESS; AUTH_ON_SUCCESS = null; cb(); }
}

const val = id => (document.getElementById(id)?.value || '').trim();

/* Require login before an action; opens modal if needed */
function requireLogin(afterLogin) {
  if (CURRENT_USER) { afterLogin(); return; }
  toast('Please log in to continue', 'err');
  openAuth('login', afterLogin);
}

/* Render the shared navbar into <div id="nav"></div> */
let NAV_ACTIVE = '';
function mountNav(active = NAV_ACTIVE) {
  NAV_ACTIVE = active;
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.className = 'nav';
  const on = key => active === key ? 'style="background:rgba(255,255,255,.18)"' : '';
  nav.innerHTML = `
    <div class="container nav-inner">
      <a class="brand" href="index.html"><span class="logo">🚌</span> BusYatra</a>
      <div class="nav-links">
        <a href="index.html" ${on('home')}>${t('nav.home')}</a>
        <a href="index.html#offers" ${on('offers')}>${t('nav.offers')}</a>
        <a href="track.html" ${on('track')}>${t('nav.trackBus')}</a>
        <a href="ticket.html" ${on('ticket')}>${t('nav.trackTicket')}</a>
        <a href="reviews.html" ${on('reviews')}>${t('nav.reviews')}</a>
        <a href="about.html" ${on('about')}>${t('nav.about')}</a>
        <a href="contact.html" ${on('contact')}>${t('nav.contact')}</a>
      </div>
      <select class="lang-select" id="langSelect" title="Language / भाषा / மொழி">
        ${Object.keys(LANG_NAMES).map(code =>
          `<option value="${code}" ${code===LANG?'selected':''}>${LANG_NAMES[code]}</option>`).join('')}
      </select>
      <div id="navUser"></div>
    </div>`;
  document.getElementById('langSelect').onchange = e => setLang(e.target.value);
  renderNav();      // draw Login/Sign up right away; loadSession() upgrades to the user chip if logged in
  translatePage();  // translate any static data-i18n content already in the page
}
