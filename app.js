// Format SEK
const formatCurrency = (value) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

// --- Demo-produkter ---
const PRODUCTS = [
  { id: 'p1', name: 'Kaffemugg – Grön', price: 149, category: 'Muggar', emoji: '☕️', badge: 'Nyhet' },
  { id: 'p2', name: 'Kaffemugg – Svart', price: 149, category: 'Muggar', emoji: '☕️' },
  { id: 'p3', name: 'T-shirt – Classic Vit', price: 249, category: 'T-shirts', emoji: '👕', badge: 'Bäst säljare' },
  { id: 'p4', name: 'T-shirt – Svart', price: 249, category: 'T-shirts', emoji: '👕' },
  { id: 'p5', name: 'Poster – Minimalist 30×40', price: 199, category: 'Affischer', emoji: '🖼️' },
  { id: 'p6', name: 'Poster – Stadssilhuett 50×70', price: 349, category: 'Affischer', emoji: '🌆' },
  { id: 'p7', name: 'Tygpåse – Everyday', price: 169, category: 'Accessoarer', emoji: '🛍️' },
  { id: 'p8', name: 'Hoodie – Cozy', price: 499, category: 'Hoodies', emoji: '🧥', badge: 'Varm favorit' },
];

// --- Tillstånd & element ---
const state = { query: '', category: 'Alla kategorier', sort: 'relevance', cart: {}, theme: 'dark' };

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
  themeToggle: document.getElementById('themeToggle'),
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  loadTheme();
  loadCart();
  renderCategoryOptions();
  renderProducts();
  updateCartUI();

  // UI events
  els.search.addEventListener('input', (e) => { state.query = e.target.value.trim().toLowerCase(); renderProducts(); });
  els.category.addEventListener('change', (e) => { state.category = e.target.value; renderProducts(); });
  els.sort.addEventListener('change', (e) => { state.sort = e.target.value; renderProducts(); });

  els.cartBtn.addEventListener('click', openCart);
  els.closeCart.addEventListener('click', closeCart);
  els.cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  els.checkoutBtn.addEventListener('click', checkout);
  els.clearCartBtn.addEventListener('click', () => { clearCart(); updateCartUI(); showToast('Kundvagnen tömd.'); });

  els.themeToggle.addEventListener('change', toggleTheme);
});

// --- Tema ---
const THEME_KEY = 'webshop-theme';
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  state.theme = saved;
  document.documentElement.classList.toggle('light', saved === 'light');
  els.themeToggle.checked = saved === 'light';
}
function toggleTheme() {
  const next = els.themeToggle.checked ? 'light' : 'dark';
  state.theme = next;
  document.documentElement.classList.toggle('light', next === 'light');
  localStorage.setItem(THEME_KEY, next);
}

// --- Render kategorier ---
function renderCategoryOptions() {
  const select = els.category;
  select.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'Alla kategorier';
  all.textContent = 'Alla kategorier';
  select.appendChild(all);

  const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
  for (const c of cats) {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    select.appendChild(opt);
  }
}

// --- Filtrera/Sortera ---
function filterProducts() {
  return PRODUCTS.filter(p => {
    const matchQuery = !state.query || p.name.toLowerCase().includes(state.query);
    const matchCat = state.category === 'Alla kategorier' || p.category === state.category;
    return matchQuery && matchCat;
  });
}
function sortProducts(list) {
  const arr = [...list];
  switch (state.sort) {
    case 'price-asc': return arr.sort((a,b) => a.price - b.price);
    case 'price-desc': return arr.sort((a,b) => b.price - a.price);
    case 'name-asc': return arr.sort((a,b) => a.name.localeCompare(b.name, 'sv'));
    case 'name-desc': return arr.sort((a,b) => b.name.localeCompare(a.name, 'sv'));
    default: return arr;
  }
}

// --- Render produkter ---
function renderProducts() {
  const list = sortProducts(filterProducts());
  els.grid.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = `
      <div class="card-media"><div class="emoji">🧐</div></div>
      <div class="card-body">
        <div class="card-title">Inga träffar</div>
        <p class="card-meta">Justera filter eller prova ett annat sökord.</p>
      </div>`;
    els.grid.appendChild(empty);
    return;
  }

  for (const p of list) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <div class="emoji">${p.emoji}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-meta">${p.category}</div>
        <div class="card-actions">
          <span class="price">${formatCurrency(p.price)}</span>
          <button class="primary" data-add="${p.id}">Lägg i kundvagn</button>
        </div>
      </div>`;
    els.grid.appendChild(card);
  }

  // Add-to-cart
  els.grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      addToCart(id);
      showToast('Tillagd i kundvagn ✨');
      openCart();
    });
  });
}

// --- Kundvagn ---
const CART_KEY = 'webshop-cart-v2';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    state.cart = raw ? JSON.parse(raw) : {};
  } catch { state.cart = {}; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }

function getCartItems() {
  return Object.entries(state.cart).map(([id, { qty }]) => {
    const product = PRODUCTS.find(p => p.id === id);
    return { id, product, qty, line: product.price * qty };
  });
}
function cartCount() { return Object.values(state.cart).reduce((s, i) => s + i.qty, 0); }
function cartSubtotal() { return getCartItems().reduce((s, i) => s + i.line, 0); }

function addToCart(id, qty = 1) {
  if (!state.cart[id]) state.cart[id] = { qty: 0 };
  state.cart[id].qty += qty;
  saveCart(); updateCartUI();
}
function updateQty(id, qty) {
  if (qty <= 0) { removeItem(id); return; }
  if (state.cart[id]) {
    state.cart[id].qty = qty;
    saveCart(); updateCartUI();
  }
}
function removeItem(id) { delete state.cart[id]; saveCart(); updateCartUI(); }
function clearCart() { state.cart = {}; saveCart(); updateCartUI(); }

function updateCartUI() {
  els.cartCount.textContent = cartCount();
  const items = getCartItems();
  els.cartItems.innerHTML = '';

  if (items.length === 0) {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.style.gridTemplateColumns = '1fr';
    li.innerHTML = '<div>Din kundvagn är tom.</div>';
    els.cartItems.appendChild(li);
  } else {
    for (const it of items) {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-thumb">${it.product.emoji}</div>
        <div>
          <div class="cart-item-title">${it.product.name}</div>
          <div class="cart-item-meta">${formatCurrency(it.product.price)}</div>
          <div class="qty-controls" role="group" aria-label="Antal">
            <button data-dec="${it.id}" aria-label="Minska antal">−</button>
            <span class="qty" aria-live="polite">${it.qty}</span>
            <button data-inc="${it.id}" aria-label="Öka antal">＋</button>
          </div>
        </div>
        <div style="display:grid; gap:6px; justify-items:end;">
          <div><strong>${formatCurrency(it.line)}</strong></div>
          <button class="icon-button" data-remove="${it.id}" aria-label="Ta bort">Ta bort</button>
        </div>`;
      els.cartItems.appendChild(li);
    }
  }

  els.cartSubtotal.textContent = formatCurrency(cartSubtotal());

  // Delegation
  els.cartItems.querySelectorAll('[data-inc]').forEach(btn => {
    btn.addEventListener('click', () => updateQty(btn.getAttribute('data-inc'), (state.cart[btn.getAttribute('data-inc')]?.qty ?? 0) + 1));
  });
  els.cartItems.querySelectorAll('[data-dec]').forEach(btn => {
    btn.addEventListener('click', () => updateQty(btn.getAttribute('data-dec'), (state.cart[btn.getAttribute('data-dec')]?.qty ?? 0) - 1));
  });
  els.cartItems.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.getAttribute('data-remove')));
  });
}

// --- Drawer ---
function openCart() {
  els.cartOverlay.hidden = false;
  els.cartDrawer.classList.add('open');
  els.cartDrawer.setAttribute('aria-hidden', 'false');
  els.cartBtn.setAttribute('aria-expanded', 'true');
  setTimeout(() => els.cartDrawer.focus(), 50);
}
function closeCart() {
  els.cartOverlay.hidden = true;
  els.cartDrawer.classList.remove('open');
  els.cartDrawer.setAttribute('aria-hidden', 'true');
  els.cartBtn.setAttribute('aria-expanded
