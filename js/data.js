const products = [
  { id: 1, name: 'Silk Oversized Blazer', category: 'fashion', price: 485, oldPrice: 620, emoji: '🧥', badge: 'Sale', rating: 5, variant: 'Black / M' },
  { id: 2, name: 'Gold Chain Necklace', category: 'accessories', price: 245, emoji: '📿', badge: 'New', rating: 5, variant: '18K Gold' },
  { id: 3, name: 'Suede Chelsea Boots', category: 'footwear', price: 395, emoji: '👢', rating: 4, variant: 'Caramel / 40' },
  { id: 4, name: 'Cashmere Turtleneck', category: 'fashion', price: 320, emoji: '👕', badge: null, rating: 5, variant: 'Cream / S' },
  { id: 5, name: 'Artisan Soy Candle Set', category: 'lifestyle', price: 89, emoji: '🕯️', badge: 'New', rating: 4, variant: 'Set of 3' },
  { id: 6, name: 'Leather Mini Crossbody', category: 'accessories', price: 580, oldPrice: 680, emoji: '👜', badge: 'Sale', rating: 5, variant: 'Cognac' },
  { id: 7, name: 'Platform Sneakers', category: 'footwear', price: 290, emoji: '👟', rating: 4, variant: 'White / 39' },
  { id: 8, name: 'Linen Wide-Leg Trousers', category: 'fashion', price: 195, emoji: '👖', rating: 4, variant: 'Sand / M' },
];

let cart = [];
let currentFilter = 'all';