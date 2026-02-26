const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let fx = 0, fy = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  fx += (e.clientX - fx) * 0.12;
  fy += (e.clientY - fy) * 0.12;
  follower.style.left = e.clientX + 'px';
  follower.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .product-card, .cat-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width = '20px'; cursor.style.height = '20px'; });
  el.addEventListener('mouseleave', () => { cursor.style.width = '10px'; cursor.style.height = '10px'; });
});