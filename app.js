// Format SEK
const formatCurrency = (value) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

// ====== Produkter med bilder (Unsplash placeholders) ======
const PRODUCTS = [
  {
    id: 'd1',
    name: 'Ullkappa — Sand',
    price: 1699,
    category: 'Dam',
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'd2',
    name: 'Kostymbyxa — Svart',
    price: 799,
    category: 'Dam',
    image: 'https://images.unsplash.com/photo-1520974859132-5d8f49f45f4c?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbe?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'h1',
    name: 'Överskjorta — Taupe',
    price: 599,
    category: 'Herr',
    image: 'https://images.unsplash.com/photo-1520975928316-0f6f8f42c1a2?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1490480781645-b0c27f67c3ad?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'h2',
    name: 'Denim — Raw',
    price: 749,
    category: 'Herr',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'a1',
    name: 'Crossbody — Lädernude',
    price: 999,
    category: 'Accessoarer',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1551024709-8f23befc6cf7?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'a2',
    name: 'Loafers — Svart',
    price: 1299,
    category: 'Accessoarer',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'd3',
    name: 'Skjorta — Poplin Vit',
    price: 449,
    category: 'Dam',
    image: 'https://images.unsplash.com/photo-1544132430-6ce2f1a7b6df?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1520975928316-0f6f8f42c1a2?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'h3',
    name: 'Trench — Kamel',
    price: 1599,
    category: 'Herr',
    image: 'https://images.unsplash.com/photo-1548883354-94bcfe321cbe?q=80&w=1200&auto=format&fit=crop',
    imageHover: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop'
  }
];

// ====== State & elementrefs ======
const state = { query: '', category: 'Alla', sort: 'relevance', cart: {} };

const els = {
  grid: document.getElementById('productGrid'),
  search: document.getElementById('searchInput'),
  category: document.getElementById('categorySelect'),
  sort: document.getElementById('sortSelect'),
  cartBtn: document.getElementById('cartButton'),
  cartDrawer: document.getElementById('cartDrawer'),
  cartOverlay: document.getElementById('cartOverlay'),
  closeCart: document.getElementById('closeCart'),
  cartItems: document.getElementById('cartItems'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartCount: document.getElementById('cartCount'),
  checkoutBtn: document.getElementById('checkoutButton'),
  clearCartBtn: document.getElementById('clearCartButton'),
  toast: document.getElementById('toast'),
};

// ====== Init ======
document.addEventListener('DOMContentLoaded', () => {
 
