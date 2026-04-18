// ═══════════════════════════════════════════
//  API Configuration
// ═══════════════════════════════════════════
const API_BASE = 'http://localhost:3000/api';

// ═══════════════════════════════════════════
//  Auth Helper Functions
// ═══════════════════════════════════════════
function saveAuth(token, user) {
  localStorage.setItem('luxe-token', token);
  localStorage.setItem('luxe-user', JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem('luxe-token');
}

function getUser() {
  return JSON.parse(localStorage.getItem('luxe-user') || 'null');
}

function clearAuth() {
  localStorage.removeItem('luxe-token');
  localStorage.removeItem('luxe-user');
}

// Check auth state on page load
(async function initAuth() {
  const token = getToken();
  if (!token) return;
  
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('luxe-user', JSON.stringify(data.user));
    } else {
      // Token expired or invalid
      clearAuth();
    }
  } catch (err) {
    // Server not reachable, keep local data
    console.log('Auth check: server not reachable');
  }
})();

// ═══════════════════════════════════════════
//  LOGIN MODAL
// ═══════════════════════════════════════════
function openLoginModal() {
  document.getElementById('loginOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLoginModal() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.body.style.overflow = '';
  // reset after close
  setTimeout(() => {
    document.getElementById('lmForm').reset();
    document.getElementById('lmSuccess').classList.remove('show');
    document.getElementById('lmFormContent').classList.remove('hide');
    document.getElementById('lmBarWrap').style.display = 'none';
    document.getElementById('lmReqs').classList.remove('show');
    ['lmIdent','lmPassword'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.classList.remove('valid','invalid');
    });
    ['lmIdentMsg','lmPwMsg'].forEach(id => {
      const el = document.getElementById(id);
      if(el) { el.textContent=''; el.className='lm-msg'; }
    });
    // Clear any error messages
    const errEl = document.getElementById('lmErrorMsg');
    if(errEl) errEl.remove();
    lmSwitchMode('email');
  }, 500);
}

// Close on overlay click
document.getElementById('loginOverlay').addEventListener('click', function(e){
  if(e.target === this) closeLoginModal();
});

// ── Mode switch ──
let lmMode = 'email';
function lmSwitchMode(m) {
  lmMode = m;
  document.getElementById('lmToggleEmail').classList.toggle('active', m==='email');
  document.getElementById('lmTogglePhone').classList.toggle('active', m==='phone');
  const wrap = document.getElementById('lmIdentWrap');
  const input = document.getElementById('lmIdent');
  const label = document.getElementById('lmIdentLabel');
  const icon  = document.getElementById('lmIdentIcon');

  wrap.classList.toggle('phone-mode', m==='phone');
  if(m==='email') {
    input.type='email'; input.placeholder='you@example.com'; input.autocomplete='email';
    label.textContent='Email Address';
    icon.innerHTML=`<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`;
    input.classList.remove('phone-pad');
  } else {
    input.type='tel'; input.placeholder='98765 43210'; input.autocomplete='tel';
    label.textContent='Phone Number';
    input.classList.add('phone-pad');
  }
  input.value=''; lmClearMsg('lmIdentMsg'); input.classList.remove('valid','invalid');
}

// ── Identifier validation ──
function lmValidateIdent() {
  const input = document.getElementById('lmIdent');
  const val = input.value.trim();
  const msg = document.getElementById('lmIdentMsg');
  if(!val){ lmClearMsg('lmIdentMsg'); input.classList.remove('valid','invalid'); return false; }
  let ok;
  if(lmMode==='email'){
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    lmSetField(input, msg, ok, ok?'Valid email ✓':'Enter a valid email address');
  } else {
    const d = val.replace(/\D/g,'');
    ok = d.length>=10 && d.length<=13;
    lmSetField(input, msg, ok, ok?'Valid number ✓':'Enter a valid 10-digit number');
  }
  return ok;
}

// ── Password validation ──
const LM_COMMON = ['password','123456','qwerty','abc123','letmein','welcome','monkey','dragon','luxe1234'];
const lmRules = {
  upper:   v => /[A-Z]/.test(v),
  lower:   v => /[a-z]/.test(v),
  digit:   v => /[0-9]/.test(v),
  special: v => /[!@#$%^&*()\-_=+\[\]{};:'",.<>?\/\\|`~]/.test(v),
  length:  v => v.length >= 8,
  safe:    v => !LM_COMMON.includes(v.toLowerCase()),
};

function lmValidatePw() {
  const input = document.getElementById('lmPassword');
  const val = input.value;
  const barWrap = document.getElementById('lmBarWrap');
  const fill = document.getElementById('lmBarFill');
  const lbl  = document.getElementById('lmBarLabel');
  const reqs = document.getElementById('lmReqs');
  const msg  = document.getElementById('lmPwMsg');

  if(!val){
    barWrap.style.display='none';
    reqs.classList.remove('show');
    lmClearMsg('lmPwMsg');
    input.classList.remove('valid','invalid');
    return false;
  }

  barWrap.style.display='block';
  reqs.classList.add('show');

  let met=0;
  Object.entries(lmRules).forEach(([key,fn])=>{
    const pass = fn(val);
    if(pass) met++;
    const row = document.getElementById(`lmR-${key}`);
    const dot = document.getElementById(`lmC-${key}`);
    if(pass){ row.classList.add('met'); dot.textContent='✓'; }
    else    { row.classList.remove('met'); dot.textContent=''; }
  });

  const levels = [
    {w:'15%', bg:'#e05555', txt:'Weak'},
    {w:'30%', bg:'#e08355', txt:'Weak'},
    {w:'50%', bg:'#e0b855', txt:'Fair'},
    {w:'70%', bg:'#c8a96e', txt:'Good'},
    {w:'88%', bg:'#a0c070', txt:'Strong'},
    {w:'100%',bg:'#5ab870', txt:'Very Strong ✓'},
  ];
  const lvl = levels[Math.min(met, 5)];
  fill.style.width = lvl.w; fill.style.background = lvl.bg;
  lbl.style.color  = lvl.bg; lbl.textContent = lvl.txt;

  const allCore = lmRules.upper(val) && lmRules.lower(val) && lmRules.digit(val) && lmRules.special(val) && lmRules.length(val);
  if(allCore){
    lmSetField(input, msg, true, 'Password meets all requirements ✓');
    return true;
  } else {
    input.classList.add('invalid'); input.classList.remove('valid');
    lmClearMsg('lmPwMsg');
    return false;
  }
}

// ── Eye toggle ──
function lmToggleEye() {
  const pw = document.getElementById('lmPassword');
  const icon = document.getElementById('lmEyeIcon');
  const show = pw.type==='text';
  pw.type = show ? 'password' : 'text';
  icon.innerHTML = show
    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
    : `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

// ── Helpers ──
function lmSetField(input, msgEl, ok, text) {
  input.classList.toggle('valid',  ok);
  input.classList.toggle('invalid', !ok);
  msgEl.textContent = text;
  msgEl.className = `lm-msg show ${ok?'ok':'err'}`;
}
function lmClearMsg(id) {
  const el=document.getElementById(id);
  el.textContent=''; el.className='lm-msg';
}

function showAuthError(formContentId, message) {
  // Remove existing error
  const existing = document.getElementById('lmErrorMsg');
  if(existing) existing.remove();
  
  const errorDiv = document.createElement('div');
  errorDiv.id = 'lmErrorMsg';
  errorDiv.style.cssText = 'background: rgba(224,85,85,0.12); border: 1px solid rgba(224,85,85,0.3); color: #e05555; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 12px; text-align: center; animation: lmShake .4s ease;';
  errorDiv.textContent = message;
  
  const formContent = document.getElementById(formContentId);
  formContent.insertBefore(errorDiv, formContent.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => { if(errorDiv.parentNode) errorDiv.remove(); }, 5000);
}

// ── Submit (LOGIN) ──
async function lmSubmit(e) {
  e.preventDefault();
  const idOk = lmValidateIdent();
  const pwOk = lmValidatePw();

  if(!idOk || !pwOk) {
    const inner = document.getElementById('lmFormContent');
    inner.style.animation = 'lmShake .4s ease';
    setTimeout(()=>inner.style.animation='', 400);
    return;
  }

  const btn = document.getElementById('lmSubmitBtn');
  btn.classList.add('loading'); btn.disabled = true;

  const identifier = document.getElementById('lmIdent').value.trim();
  const password = document.getElementById('lmPassword').value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (!res.ok) {
      btn.classList.remove('loading'); btn.disabled = false;
      showAuthError('lmFormContent', data.error || 'Login failed. Please try again.');
      return;
    }

    // Success — save auth data
    saveAuth(data.token, data.user);

    btn.classList.remove('loading');
    document.getElementById('lmFormContent').classList.add('hide');
    document.getElementById('lmSuccess').classList.add('show');
    showToast('<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Welcome back, ' + data.user.name + '!');
    setTimeout(closeLoginModal, 2800);
  } catch (err) {
    btn.classList.remove('loading'); btn.disabled = false;
    showAuthError('lmFormContent', 'Cannot connect to server. Please make sure the server is running.');
  }
}

function socialSignIn(provider) {
  showToast(`${provider} sign-in coming soon!`);
}

// ═══════════════════════════════════════════
//  SIGNUP MODAL
// ═══════════════════════════════════════════
function openSignupModal() {
  document.getElementById('signupOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSignupModal() {
  document.getElementById('signupOverlay').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.getElementById('signupForm').reset();
    document.getElementById('suSuccess').classList.remove('show');
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('suBarWrap').style.display = 'none';
    document.getElementById('suReqs').classList.remove('show');
    const errEl = document.getElementById('lmErrorMsg');
    if(errEl) errEl.remove();
  }, 500);
}
document.getElementById('signupOverlay').addEventListener('click', function(e){
  if(e.target === this) closeSignupModal();
});

function toggleSignupPassword() {
  const pw = document.getElementById('suPassword');
  const icon = document.getElementById('suEyeIcon');
  const show = pw.type === 'text';
  pw.type = show ? 'password' : 'text';
  icon.innerHTML = show
    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`
    : `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
}

function suValidatePw() {
  const val = document.getElementById('suPassword').value;
  const barWrap = document.getElementById('suBarWrap');
  const fill = document.getElementById('suBarFill');
  const lbl = document.getElementById('suBarLabel');
  const reqs = document.getElementById('suReqs');

  if (!val) {
    barWrap.style.display = 'none';
    reqs.classList.remove('show');
    return false;
  }

  barWrap.style.display = 'block';
  reqs.classList.add('show');

  let met = 0;
  const rules = {
    upper: v => /[A-Z]/.test(v),
    lower: v => /[a-z]/.test(v),
    digit: v => /[0-9]/.test(v),
    length: v => v.length >= 8,
  };

  Object.entries(rules).forEach(([key, fn]) => {
    const pass = fn(val);
    if (pass) met++;
    const row = document.getElementById(`suR-${key}`);
    const dot = document.getElementById(`suC-${key}`);
    if (pass) { row.classList.add('met'); dot.textContent = '✓'; }
    else { row.classList.remove('met'); dot.textContent = ''; }
  });

  const levels = [
    {w: '25%', bg: '#e05555', txt: 'Weak'},
    {w: '50%', bg: '#e0b855', txt: 'Fair'},
    {w: '75%', bg: '#c8a96e', txt: 'Good'},
    {w: '100%', bg: '#5ab870', txt: 'Strong'},
  ];
  const lvl = levels[Math.min(met - 1, 3)];
  if (lvl) { fill.style.width = lvl.w; fill.style.background = lvl.bg; lbl.style.color = lvl.bg; lbl.textContent = lvl.txt; }

  return met >= 3;
}

document.getElementById('suPassword').addEventListener('input', suValidatePw);

// ── Submit (SIGNUP) ──
async function signupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const password = document.getElementById('suPassword').value;
  const phone = document.getElementById('suPhone') ? document.getElementById('suPhone').value.trim() : '';
  const terms = document.getElementById('suTerms').checked;
  const pwOk = suValidatePw();

  if (!name || !email || !terms || !pwOk) {
    showToast('Please fill all required fields correctly');
    return;
  }

  const btn = document.getElementById('suSubmitBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();

    if (!res.ok) {
      btn.classList.remove('loading'); btn.disabled = false;
      showAuthError('signupForm', data.error || 'Registration failed. Please try again.');
      return;
    }

    // Success — save auth data
    saveAuth(data.token, data.user);

    btn.classList.remove('loading');
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('suSuccess').classList.add('show');
    showToast('Welcome to Luxe, ' + data.user.name + '! Your account has been created.');
    setTimeout(closeSignupModal, 2500);
  } catch (err) {
    btn.classList.remove('loading'); btn.disabled = false;
    showAuthError('signupForm', 'Cannot connect to server. Please make sure the server is running.');
  }
}

function socialSignUp(provider) {
  showToast(`${provider} sign-up coming soon!`);
}

// ═══════════════════════════════════════════
//  ACCOUNT MODAL
// ═══════════════════════════════════════════
function openAccountModal() {
  document.getElementById('accountOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  checkLoginState();
}
function closeAccountModal() {
  document.getElementById('accountOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('accountOverlay').addEventListener('click', function(e){
  if(e.target === this) closeAccountModal();
});

function checkLoginState() {
  const user = getUser();
  const loggedIn = document.getElementById('accountLoggedIn');
  const notLogged = document.getElementById('accountNotLogged');

  if (user && getToken()) {
    loggedIn.classList.add('show');
    notLogged.classList.remove('show');
    document.getElementById('accName').textContent = user.name || 'Luxe User';
    document.getElementById('accEmail').textContent = user.email || '';
  } else {
    loggedIn.classList.remove('show');
    notLogged.classList.add('show');
  }
}

function showAccountSection(section) {
  showToast(`Opening ${section}…`);
}

function signOut() {
  clearAuth();
  showToast('You have been signed out');
  closeAccountModal();
}