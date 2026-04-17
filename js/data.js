const products = [
  // Men
  { id: 1, name: 'Tailored Wool Blazer', category: 'men', price: 485, oldPrice: 620, image: 'Assests/Blazer.jpg', badge: 'Sale', rating: 5, variant: 'Navy / M' },
  { id: 2, name: 'Oxford Cotton Shirt', category: 'men', price: 145, image: 'Assests/cotton shirt.jpg', badge: 'New', rating: 5, variant: 'White / L' },
  { id: 3, name: 'Slim Fit Chinos', category: 'men', price: 125, image: 'Assests/Pant.jpg', rating: 4, variant: 'Beige / 32' },
  { id: 4, name: 'Leather Oxford Shoes', category: 'men', price: 395, image: 'Assests/boots.jpg', badge: null, rating: 5, variant: 'Black / 42' },
  { id: 5, name: 'Cashmere V-Neck Sweater', category: 'men', price: 320, image: 'Assests/Sweater.jfif', badge: null, rating: 5, variant: 'Grey / XL' },

  // Women
  { id: 6, name: 'Silk Wrap Dress', category: 'women', price: 580, image: 'Assests/Silk dress.jpg', badge: 'New', rating: 5, variant: 'Emerald / S' },
  { id: 7, name: 'Gold Chain Necklace', category: 'women', price: 245, image: 'Assests/Chain.jfif', badge: 'New', rating: 5, variant: '18K Gold' },
  { id: 8, name: 'Suede Stiletto Heels', category: 'women', price: 395, oldPrice: 495, image: 'Assests/Heels.jfif', badge: 'Sale', rating: 4, variant: 'Nude / 38' },
  { id: 9, name: 'Leather Crossbody Bag', category: 'women', price: 380, image: 'Assests/Leather bag.jfif', rating: 5, variant: 'Tan' },
  { id: 10, name: 'Oversized Linen Blouse', category: 'women', price: 165, image: 'Assests/Oversized blouse.jfif', badge: null, rating: 4, variant: 'White / M' },

  // Kids
  { id: 11, name: 'Kids Sneakers', category: 'kids', price: 85, image: 'Assests/Kids shoes.jfif', badge: 'New', rating: 5, variant: 'Age 6-8' },
  { id: 12, name: 'Cotton Dinosaur T-Shirt', category: 'kids', price: 45, image: 'Assests/Tshirt for kids.jfif', badge: null, rating: 4, variant: 'Age 4-6' },
  { id: 13, name: 'Denim Jacket', category: 'kids', price: 95, oldPrice: 120, image: 'Assests/DEnim Jacket.jfif', badge: 'Sale', rating: 5, variant: 'Age 8-10' },
  { id: 14, name: 'Floral Summer Dress', category: 'kids', price: 75, image: 'Assests/FLoral Dress for kids.jfif', badge: null, rating: 4, variant: 'Age 5-7' },
  { id: 15, name: 'Kids Backpack', category: 'kids', price: 65, image: 'Assests/BAg for kids.jfif', badge: 'New', rating: 5, variant: 'Blue' },

  // Accessories
  { id: 16, name: 'Artisan Soy Candle Set', category: 'accessories', price: 89, image: 'Assests/Candles.jfif', badge: 'New', rating: 4, variant: 'Set of 3' },
  { id: 17, name: 'Leather Wallet', category: 'accessories', price: 145, image: 'Assests/Wallet.jfif', rating: 5, variant: 'Black' },
  { id: 18, name: 'Sunglasses', category: 'accessories', price: 195, oldPrice: 250, image: 'Assests/Sun Glasses.jfif', badge: 'Sale', rating: 4, variant: 'Aviator' },

  // Sale
  { id: 19, name: 'Platform Sneakers', category: 'sale', price: 190, oldPrice: 290, image: 'Assests/Platform sneakers.jfif', badge: '-40%', rating: 4, variant: 'White / 39' },
  { id: 20, name: 'Silk Scarf', category: 'sale', price: 95, oldPrice: 150, image: 'Assests/Scraf.jfif', badge: '-35%', rating: 5, variant: 'Burgundy' },
];

let cart = [];
let currentFilter = 'all';