function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  updateCartBadge();
  showToast(`<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ${product.name} added to cart`);
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateCartBadge();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) removeFromCart(id);
  else { renderCart(); updateCartBadge(); }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  container.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (!cart.length) {
    empty.style.display = 'flex';
    footer.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  footer.style.display = 'block';

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="product-img-wrap cart-item-img" style="font-size:2.5rem;width:80px;height:90px;border-radius:6px;flex-shrink:0">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-variant">${item.variant || ''}</div>
        <div class="cart-item-actions">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
          <span class="item-price">$${(item.price * item.qty).toFixed(2)}</span>
          <button class="remove-item" onclick="removeFromCart(${item.id})">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>`;
    container.insertBefore(div, empty);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartSubtotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cartCountLabel').textContent = `${cart.reduce((s,i) => s+i.qty, 0)} item${cart.reduce((s,i)=>s+i.qty,0)!==1?'s':''}`;
}

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);
}

function checkout() {
  showToast('<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Order placed successfully! 🎉');
  cart = [];
  renderCart();
  updateCartBadge();
  closeCart();
}