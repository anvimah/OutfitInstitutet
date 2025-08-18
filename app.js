// ===== Verktyg =====
const formatCurrency = (value) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(value);

// ===== Produkter (med bilder) =====
// Byt gärna till egna bilder i /images. Dessa använder picsum som exempel.
const PRODUCTS = [
  { id: 'l01', name: 'Kappa — Ull, Svart',      price: 1499, category: 'Jackor',   image: 'https://cdn.pixabay.com/photo/2021/07/01/05/18/woman-6378281_1280.jpg' },
  { id: 'l02', name: 'Trench — Sand',           price: 1399, category: 'Jackor',   image: 'https://picsum.photos/seed/trenchsand/900/1200' },
  { id: 'l03', name: 'Skjorta — Poplin Vit',    price: 499,  category: 'Skjortor', image: 'https://picsum.photos/seed/shirtwhite2/900/1200' },
  { id: 'l04', name: 'Stickad — Offwhite',      price: 699,  category: 'Stickat',  image: 'https://picsum.photos/seed/knitow2/900/1200' },
  { id: 'l05', name: 'Byxa — Rak, Beige',       price: 649,  category: 'Byxor',    image: 'https://cdn.pixabay.com/photo/2024/02/12/15/18/woman-8568749_1280.jpg' },
  { id: 'l06', name: 'Sneakers — Vit',          price: 999,  category: 'Skor',     image: 'https://picsum.photos/seed/sneakerwhite2/900/1200' },
  { id: 'l07', name: 'Loafers — Svart Läder',   price: 1199, category: 'Skor',     image: 'https://picsum.photos/seed/loafersblack2/900/1200' },
  { id: 'l08', name: 'Axelremsväska — Svart',   price: 899,  category: 'Accessoarer', image: 'https://cdn.pixabay.com/photo/2016/11/23/18/12/bag-1854148_1280.jpg' },
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
  year: document.getElementById('year'),
};

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  els.year.textContent = new Date().getFullYear();

  setupReveal();     // init scroll reveal
  setupParallax();   // init hero-parallax

  loadCart();
  renderCategoryOptions();
  renderProducts(true); // initial render med stagger
  updateCartUI();

  // events
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

// ===== Reveal on scroll (stagger) =====
function setupReveal(){
  const items = document.querySelectorAll('[data-animate]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const delay = parseFloat(entry.target.getAttribute('data-delay') || '0');
        entry.target.style.transitionDelay = `${delay}s`;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  items.forEach(el=>io.observe(el));
}

// ===== Hero parallax (muspekar + scroll) =====
function setupParallax(){
  const hero = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.orb');
  if(!hero || !orbs.length) return;

  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const offset = Math.min(40, scrollY * 0.05);
    orbs.forEach((o, i)=>{ o.style.transform = `translateY(${i%2===0 ? offset : -offset}px)`; });
  }, { passive:true });

  hero.addEventListener('mousemove', (e)=>{
    const r = hero.getBoundingClientRect();
    const cx = e.clientX - (r.left + r.width/2);
    const cy = e.clientY - (r.top + r.height/2);
    const dx = Math.max(Math.min(cx / 40, 20), -20);
    const dy = Math.max(Math.min(cy / 40, 20), -20);
    orbs.forEach((o, i)=>{ o.style.transform = `translate(${dx*(i?-.4:.4)}px, ${dy*(i?.4:-.4)}px)`; });
  });
}

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

// ===== Filtrering/Sortering =====
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

// ===== Render produkter (staggered reveal) =====
function renderProducts(withStagger=false) {
  const list = sortProducts(filterProducts());
  els.grid.innerHTML = '';

  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = `
      <div class="card-media"></div>
      <div class="card-body">
        <div class="card-title">Inga produkter</div>
        <div class="card-meta">Justera filter eller sökord.</div>
      </div>`;
    els.grid.appendChild(empty);
    return;
  }

  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-animate','fade-up');
    if(withStagger) card.setAttribute('data-delay', (0.03*i).toFixed(2));
    card.innerHTML = `
      <div class="card-media">
        <img src="${p.image}" alt="${p.name}" class="product-img"
             onerror="this.onerror=null;this.src='https://picsum.photos/seed/${p.id}/900/1200';" />
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
  });

  // aktivera reveal för nya kort
  setupReveal();

  // Lägg i kundvagn
  els.grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      addToCart(id);
      pulseCart();
      showToast('Tillagd i kundvagn ✨');
      openCart();
    });
  });
}

// ===== Kundvagn =====
const CART_KEY = 'livfull-cart-v1';
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

// ===== Cart drawer =====
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

// ===== Checkout (demo) =====
function checkout(){
  const items = getCartItems();
  if (!items.length){ showToast('Din kundvagn är tom.'); return; }
  const lines = items.map(i => `${i.product.name} × ${i.qty} = ${formatCurrency(i.line)}`);
  alert(['Tack för din beställning! (demo)','',...lines,'','Summa: '+formatCurrency(cartSubtotal())].join('\n'));
  clearCart(); closeCart();
}

// ===== Micro: pulse på varukorgsknapp & toast =====
function pulseCart(){
  els.cartButton?.classList.add('pulse');
  setTimeout(()=>els.cartButton?.classList.remove('pulse'), 450);
}
function showToast(text){
  els.toast.textContent = text;
  els.toast.hidden = false;
  els.toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.classList.remove('show');
    setTimeout(() => els.toast.hidden = true, 220);
  }, 1400);
}



