// ---------- Hjälpare ----------
const formatCurrency = (value) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

// ---------- Produkter med BILDER ----------
/*
  Lägg dina bilder i /images och uppdatera sökvägarna nedan.
  Tips: använd .webp för lättare filer.
*/
const PRODUCTS = [
  { id: 'p1', name: 'Kappa — Svart', price: 1299, category: 'Jackor', image: 'images/kappa-svart.jpg' },
  { id: 'p2', name: 'Skjorta — Vit Poplin', price: 399, category: 'Skjortor', image: 'images/skjorta-vit.jpg' },
  { id: 'p3', name: 'Byxa — Rak, Beige', price: 549, category: 'Byxor', image: 'images/byxa-beige.jpg' },
  { id: 'p4', name: 'Knit — Offwhite', price: 499, category: 'Stickat', image: 'images/knit-offwhite.jpg' },
  { id: 'p5', name: 'T-shirt — Svart', price: 199, category: 'T-shirts', image: 'images/tshirt-svart.jpg' },
  { id: 'p6', name: 'Loafers — Läder', price: 999, category: 'Skor', image: 'images/loafers.jpg' },
];

// ---------- State & element ----------
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

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year')?.textContent = new Date().getFullYear();

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

// ---------- Kategorier ----------
function renderCategoryOptions() {
  els.category.innerHTML = '';
  const all = document.createElement('option'); all.value = 'Alla'; all.textContent = 'Alla';
  els.category.appendChild(all);
  const cats = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
  for (const c of cats) {
    const opt = document.createElement('option'); opt.value = c; opt.textContent = c;
    els.category.appendChild(opt);
  }
}

// ---------- Filtrering/Sortering ----------
function filterProducts() {
  return PRODUCTS.filter(p => {
    const q = state.query;
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchC = state.category === 'Alla' || p.category === state.category;
    return matchQ && matchC;
  });
}
function sortProducts(list) {
  const arr = [...list];
  switch (state.sort) {
    case 'price-asc': return arr.sort((a,b)=>a.price-b.price);
    case 'price-desc': return arr.sort((a,b)=>b.price-a.price);
    case 'name-asc': return arr.sort((a,b)=>a.name.localeCompare(b.name,'sv'));
    case 'name-desc': return arr.sort((a,b)=>b.name.localeCompare(a.name,'sv'));
    default: return arr;
  }
}

// ---------- Render produkter (med IMG) ----------
function renderProducts() {
  const list = sortProducts(filterProducts());
  els.grid.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = `<div class="card-media"></div>
      <div class="card-body"><div class="card-title">Inga produkter</div>
      <div class="card-meta">Prova att justera filtren.</div></div>`;
    els.grid.appendChild(empty);
    return;
  }

  for (const p of list) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        <img src="${p.image}" alt="${p.name}" class="product-img"
             onerror="this.onerror=null;this.src='https://picsum.photos/seed/${p.id}/800/1000';" />
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

  els.grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      addToCart(e.currentTarget.getAttribute('data-add'));
      showToast('Tillagd i kundvagn');
      openCart();
    });
  });
}

// ---------- Kundvagn ----------
const CART_KEY = 'webshop-cart-img-v1';
function loadCart(){ try{ state.cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch{ state.cart = {}; } }
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }
function getCartItems(){
  return Object.entries(state.cart).map(([id,{qty}])=>{
    const product = PRODUCTS.find(p=>p.id===id);
    return { id, product, qty, line: product.price * qty };
  });
}
function cartCount(){ return Object.values(state.cart).reduce((s,i)=>s+i.qty,0); }
function cartSubtotal(){ return getCartItems().reduce((s,i)=>s+i.line,0); }
function addToCart(id, qty=1){ if(!state.cart[id]) state.cart[id]={qty:0}; state.cart[id].qty+=qty; saveCart(); updateCartUI(); }
function updateQty(id, qty){ if(qty<=0){ removeItem(id); return; } if(state.cart[id]){ state.cart[id].qty=qty; saveCart(); updateCartUI(); } }
function removeItem(id){ delete state.cart[id]; saveCart(); updateCartUI(); }
function clearCart(){ state.cart={}; saveCart(); updateCartUI(); }

function updateCartUI(){
  els.cartCount.textContent = cartCount();
  const items = getCartItems();
  els.cartItems.innerHTML = '';
  if (!items.length){
    const li = document.createElement('li');
    li.className='cart-item'; li.style.gridTemplateColumns='1fr';
    li.innerHTML = '<div>Din kundvagn är tom.</div>';
    els.cartItems.appendChild(li);
  } else {
    for (const it of items){
      const li = document.createElement('li');
      li.className='cart-item';
      li.innerHTML = `
        <div class="cart-thumb"><img src="${it.product.image}" alt=""></div>
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

  els.cartItems.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>updateQty(b.dataset.inc,(state.cart[b.dataset.inc]?.qty||0)+1));
  els.cartItems.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>updateQty(b.dataset.dec,(state.cart[b.dataset.dec]?.qty||0)-1));
  els.cartItems.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeItem(b.dataset.remove));
}

// ---------- Drawer ----------
function openCart(){
  els.cartOverlay.hidden=false;
  els.cartDrawer.classList.add('open');
  els.cartDrawer.setAttribute('aria-hidden','false');
  els.cartBtn.setAttribute('aria-expanded','true');
  setTimeout(()=>els.cartDrawer.focus(),50);
}
function closeCart(){
  els.cartOverlay.hidden=true;
  els.cartDrawer.classList.remove('open');
  els.cartDrawer.setAttribute('aria-hidden','true');
  els.cartBtn.setAttribute('aria-expanded','false');
  els.cartBtn.focus();
}

// ---------- Checkout (demo) ----------
function checkout(){
  const items = getCartItems();
  if (!items.length){ showToast('Din kundvagn är tom.'); return; }
  alert(
    'Tack för din beställning! (demo)\n\n' +
    items.map(i=>`${i.product.name} × ${i.qty} = ${formatCurrency(i.line)}`).join('\n') +
    '\n\nSumma: ' + formatCurrency(cartSubtotal())
  );
  clearCart(); closeCart();
}

// ---------- Toast ----------
let toastTimer;
function showToast(text){
  const t = document.getElementById('toast');
  t.textContent = text; t.hidden=false; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.hidden=true,220); }, 1500);
}
