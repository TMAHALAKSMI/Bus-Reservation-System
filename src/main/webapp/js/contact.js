/* contact.js — sends the Contact-us form to /api/contact */
mountNav('contact');
loadSession();

document.getElementById('sendBtn').onclick = async () => {
  const name = val('cName'), email = val('cEmail'), subject = val('cSubject'), message = val('cMessage');
  if (!name || !email || !message) { toast('Name, email and message are required', 'err'); return; }

  const btn = document.getElementById('sendBtn');
  btn.disabled = true;
  const r = await api('contact', { method: 'POST', body: { name, email, subject, message } });
  btn.disabled = false;

  toast(r.message, r.success ? 'ok' : 'err');
  if (r.success) {
    ['cName', 'cEmail', 'cSubject', 'cMessage'].forEach(id => document.getElementById(id).value = '');
  }
};
