const SUPABASE_URL = 'https://jbubyhkksxydrgempdqz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWJ5aGtrc3h5ZHJnZW1wZHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDQ0MTQsImV4cCI6MjA4NzY4MDQxNH0.mSawRej1vCYsakTC1S7raTG8zfJe-Faqg02asCFpqDg';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);


let currentUser = null;
let authTab = 'signin';

(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) setLoggedIn(session.user);
})();

sb.auth.onAuthStateChange((_event, session) => {
  if (session?.user) setLoggedIn(session.user);
  else setLoggedOut();
});

function setLoggedIn(user) {
  currentUser = user;
  const email = user.email || '';
  const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User';
  const initials = name.slice(0, 2).toUpperCase();
  document.getElementById('navSignInBtn').style.display = 'none';
  document.getElementById('navUser').classList.add('visible');
  document.getElementById('navAvatar').textContent = initials;
  document.getElementById('navUserName').textContent = name.split(' ')[0];
  document.getElementById('dropdownName').textContent = name;
  document.getElementById('dropdownEmail').textContent = email;
}

function setLoggedOut() {
  currentUser = null;
  document.getElementById('navSignInBtn').style.display = '';
  document.getElementById('navUser').classList.remove('visible');
  document.getElementById('userDropdown').classList.remove('open');
}

function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('open');
}
function closeDropdown() {
  document.getElementById('userDropdown').classList.remove('open');
}
document.addEventListener('click', e => {
  const navUser = document.getElementById('navUser');
  if (navUser && !navUser.contains(e.target)) closeDropdown();
});

async function signOut() {
  closeDropdown();
  await sb.auth.signOut();
  setLoggedOut();
  showToast('<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Signed out. See you next time!');
}