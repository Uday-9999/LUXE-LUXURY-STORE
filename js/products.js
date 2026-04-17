function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.style.transitionDelay = `${i * 0.07}s`;
    const stars = '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating);
    card.innerHTML = `
      <div class="product-img-wrap">
        <img class="product-img" src="${p.image}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div class="product-img-fallback" style="display:none">${p.name.charAt(0)}</div>
        ${p.badge ? `<div class="product-badge${p.badge==='Sale'?' sale':''}">${p.badge}</div>` : ''}
        <div class="product-actions-overlay">
          <button class="btn-add-cart" onclick="addToCart(${JSON.stringify(p).replace(/"/g,'&quot;')})">Add to Cart</button>
          <button class="btn-wishlist">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div>
            ${p.oldPrice ? `<span class="product-old-price">$${p.oldPrice}</span>` : ''}
            <span class="product-price">$${p.price}</span>
          </div>
          <div class="product-rating">${stars}</div>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  setTimeout(() => observeReveal(), 50);
}

function filterProducts(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === filter || (filter==='all' && btn.textContent.toLowerCase()==='all'));
  });
  renderProducts(filter);
  if (filter !== 'all') document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}