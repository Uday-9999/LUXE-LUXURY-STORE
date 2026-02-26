function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 300);
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('searchInput').value = '';
}
document.getElementById('searchInput').addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  const results = document.getElementById('searchResults');
  results.innerHTML = '';
  if (!q) return;
  const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  if (!filtered.length) {
    results.innerHTML = '<p style="color:var(--muted);font-size:.85rem;padding:12px 0">No products found.</p>';
    return;
  }
  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.innerHTML = `<div class="emoji">${p.emoji}</div><div><div class="name">${p.name}</div><div class="price">$${p.price}</div></div>`;
    card.onclick = () => { addToCart(p); closeSearch(); };
    results.appendChild(card);
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSearch(); closeCart(); }
});