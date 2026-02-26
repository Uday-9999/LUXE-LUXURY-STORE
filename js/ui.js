function observeReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ===================== TOAST =====================
function showToast(html) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = html;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.style.opacity = '0', 3000);
  setTimeout(() => toast.remove(), 3500);
}

// ===================== NEWSLETTER =====================
function subscribe() {
  const val = document.getElementById('emailInput').value;
  if (!val || !val.includes('@')) { showToast('Please enter a valid email!'); return; }
  showToast('<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Subscribed successfully! Welcome to LUXE.');
  document.getElementById('emailInput').value = '';
}