// ===== Verktyg =====
const formatCurrency = (value) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

// ===== Produkter (Arket-inspirerade, med bilder) =====
// Byt gärna ut image-länkar till egna filer i /images (t.ex. 'images/kappa.jpg').
const PRODUCTS = [
  { id: 'a01', name: 'Kappa — Ull, Svart',      price: 1499, category: 'Jackor',     image: 'https://picsum.photos/seed/arket-coat1/900/1200' },
  { id: 'a02', name: 'Trench — Sand',           price: 1399, category: 'Jackor',     image: 'https://picsum.photos/seed/arket-trench/900/1200' },
  { id: 'a03', name: 'Skjorta — Poplin Vit',    price: 499,  category: 'Skjortor',   image: 'https://picsum.photos/seed/arket-shirt-white/900/1200' },
  { id: 'a04', name: 'Skjorta — Indigo',        price: 529,  category: 'Skjortor',   image: 'https://picsum.photos/seed/arket-shirt-indigo/900/1200' },
  { id: 'a05', name: 'Stickad — Offwhite',      price: 699,  category: 'Stickat',    image: 'https://picsum.photos/seed/arket-knit-ow/900/1200' },
  { id: 'a06', name: 'Stickad — Svart',         price: 699,  category: 'Stickat',    image: 'https://picsum.photos/seed/arket-knit-black/900/1200' },
  { id: 'a07', name: 'Byxa — Rak, Beige',       price: 649,  category: 'Byxor',      image: 'https://picsum.photos/seed/arket-trouser-beige/900/1200' },
  { id: 'a08', name: 'Byxa — Rak, Svart',       price: 649,  category: 'Byxor',      image: 'https://picsum.photos/seed/arket-trouser-black/900/1200' },
  { id: 'a09', name: 'Jeans — Ljus tvätt',      price: 699,  category: 'Jeans',      image: 'https://picsum.photos/seed/arket-jeans-light/900/1200' },
  { id: 'a10', name: 'Jeans — Mörk tvätt',      price: 699,  category: 'Jeans',      image: 'https://picsum.photos/seed/arket-jeans-dark/900/1200' },
  { id: 'a11', name: 'T-shirt — Vit',           price: 249,  category: 'T-shirts',   image: 'https://picsum.photos/seed/arket-tee-white/900/1200' },
  { id: 'a12', name: 'T-shirt — Svart',         price: 249,  category: 'T-shirts',   image: 'https://picsum.photos/seed/arket-tee-black/900/1200' },
  { id: 'a13', name: 'Loafers — Läder, Svart',  price: 1199, category: 'Skor',       image: 'https://picsum.photos/seed/arket-loafers/900/1200' },
  { id: 'a14', name: 'Sneakers — Vit',          price: 999,  category: 'Skor',       image: 'https://picsum.photos/seed/arket-sneaker/900/1200' },
  { id: 'a15', name: 'Axelremsväska — Svart',   price: 899,  category: 'Accessoarer',image: 'https://picsum.photos/seed/arket-bag/900/1200' },
  { id: 'a16', name: 'Mössa — Lammull',         price: 299,  category: 'Accessoarer',image: 'https://picsum.photos/seed/arket-beanie/900/1200' },
];

// ===== State & element =====
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

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  loadCart();
  renderCategoryOptions();
  renderProducts();
  updateCartUI();

  els.search.addEventListener('input', (e) => { state.query = e.target.value.trim().toLowerCase(); renderProducts(); });
  els.category.addEventListener('change', (e) => { state.category = e.target.value; renderProducts(); });
  els.sort.addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });

  els.cartBtn.addEventListener('click', openCart);
  els.closeCart.addEventListener('click', closeCart);
  els.cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  els.checkoutBtn.addEventListener('click', checkout);
  els.clearCartBtn.addEventListener('click', () => { clearCart(); updateCartUI(); showToast('Kundvagnen tömd.'); });
});

// ===== Kategorier =====
function renderCategoryOptions() {
  els.category.innerHTML = '';
  const all = document.createElement('option'); all.value = 'Alla'; all.textContent = 'Alla kategorier';
  els.category.appendChild(all);
  const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
  for (const c of cats) {
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c;
    els.category.appendChild(opt);
  }
}

// ===== Filt
