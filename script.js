// script.js
'use strict';

/* =========================
   Dummy Data (Dynamic Cards)
   ========================= */

// 🍲 Food Delivery Vendors
const foodVendors = [
  { name: "Odia Zaika", cuisine: "Odia Thali", rating: 4.5, time: "30 min" },
  { name: "Chhapan Bhog", cuisine: "Sweets & Snacks", rating: 4.3, time: "20 min" },
  { name: "Biryani Junction", cuisine: "Biryani & Rolls", rating: 4.6, time: "35 min" },
  { name: "Tandoor Tales", cuisine: "North Indian", rating: 4.2, time: "32 min" },
  { name: "Masala Box", cuisine: "South Indian", rating: 4.4, time: "25 min" }
];

// 🛒 Kirana Items
const kiranaItems = [
  { name: "Fortune Atta", price: "₹250 / 10kg" },
  { name: "Amul Milk 1L", price: "₹55" },
  { name: "Basmati Rice 5kg", price: "₹499" },
  { name: "Arhar Dal 1kg", price: "₹130" },
  { name: "Sunflower Oil 1L", price: "₹145" },
  { name: "Wheat 10kg", price: "₹320" }
];

// 🐄 Vet Services - Providers
const vetProviders = [
  { name: "Dr. Priya Sahu", specialty: "Livestock Vet", location: "Cuttack", fee: "₹300" },
  { name: "Dr. Ramesh Nayak", specialty: "Pet Specialist", location: "Bhubaneswar", fee: "₹400" },
  { name: "Dr. Anjali Das", specialty: "Poultry Expert", location: "Puri", fee: "₹350" }
];

// 🐕 Vet Services - Seekers (dummy requests)
const vetSeekers = [
  { animal: "Cow", service: "Vaccination", location: "Khordha" },
  { animal: "Dog", service: "Skin Treatment", location: "Cuttack" },
  { animal: "Goat", service: "Checkup", location: "Khordha" }
];

// 🌾 Farmers & Agri
const agriServices = [
  { name: "Krishi Seva Kendra", type: "Seeds & Fertilizers", location: "Khurda" },
  { name: "AgriLab Odisha", type: "Soil Testing", location: "Bhubaneswar" },
  { name: "GreenPump", type: "Irrigation Repair", location: "Cuttack" }
];

const farmerRequests = [
  { crop: "Paddy", need: "Pest Diagnosis", location: "Nimapara" },
  { crop: "Vegetables", need: "Drip Setup", location: "Pipili" },
  { crop: "Groundnut", need: "Soil Test", location: "Khordha" }
];

// 🛠️ General Service Providers
const serviceProviders = [
  { name: "Sanjay Electric Works", type: "Electrician", location: "Nirakarpur" },
  { name: "Manoj Plumber Services", type: "Plumber", location: "Nirakarpur" },
  { name: "Laxmi Woodworks", type: "Carpenter", location: "Khurda" },
  { name: "Tailor Babu", type: "Tailor", location: "Nirakarpur" }
];

/* =========================
   Helpers
   ========================= */

const cart = [];

function el(tag, className, html){
  const e = document.createElement(tag);
  if(className) e.className = className;
  if(html !== undefined) e.innerHTML = html;
  return e;
}

function createCard({ title, lines = [], meta = [], actions = [] }){
  const card = el('div', 'card');
  const h = el('h4', null, title);
  card.appendChild(h);
  if(meta.length){
    const metaRow = el('div','meta');
    meta.forEach(m => metaRow.appendChild(el('span','badge', m)));
    card.appendChild(metaRow);
  }
  lines.forEach(t => card.appendChild(el('p', null, t)));
  if(actions.length){
    const row = el('div','actions');
    actions.forEach(a => {
      const b = el('button','btn');
      b.classList.add(a.variant || 'btn-primary');
      b.innerHTML = a.icon ? `<i class="${a.icon}"></i> ${a.label}` : a.label;
      b.addEventListener('click', a.onClick);
      row.appendChild(b);
    });
    card.appendChild(row);
  }
  return card;
}

function showConfirm(message){
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmModal').style.display = 'flex';
}
function hideConfirm(){
  document.getElementById('confirmModal').style.display = 'none';
}
function showDetails(html){
  document.getElementById('detailBody').innerHTML = html;
  document.getElementById('detailModal').style.display = 'flex';
}
function hideDetails(){
  document.getElementById('detailModal').style.display = 'none';
}

function simulateFlow(name){
  showConfirm(`Order Confirmed! ${name} notified. Delivery on the way 🚴`);
  setTimeout(()=>alert(`Vendor accepted the ${name} request!`), 1500);
  setTimeout(()=>alert(`Delivery agent picked up your ${name}. Approaching soon 🚴`), 3500);
}

/* =========================
   Renderers
   ========================= */

function renderFood(){
  const wrap = document.getElementById('foodList');
  foodVendors.forEach(v=>{
    const c = createCard({
      title: v.name,
      meta: [`⭐ ${v.rating}`, v.time],
      lines: [v.cuisine],
      actions: [{
        label:'Order Now', icon:'fa fa-motorcycle', onClick:()=>simulateFlow(v.name)
      }]
    });
    c.dataset.search = `${v.name} ${v.cuisine}`.toLowerCase();
    wrap.appendChild(c);
  });
}

function renderKirana(){
  const wrap = document.getElementById('kiranaList');
  kiranaItems.forEach(it=>{
    const c = createCard({
      title: it.name,
      lines: [it.price],
      actions: [
        { label:'Add to Cart', icon:'fa fa-cart-plus', variant:'btn-ghost', onClick:()=>{
            cart.push(it.name);
            showConfirm(`${it.name} added to cart!`);
          }},
        { label:'Order Now', icon:'fa fa-bolt', onClick:()=>simulateFlow(it.name) }
      ]
    });
    c.dataset.search = `${it.name} ${it.price}`.toLowerCase();
    wrap.appendChild(c);
  });
}

function renderVets(){
  const provWrap = document.getElementById('vetProviders');
  vetProviders.forEach(v=>{
    const c = createCard({
      title: v.name,
      lines: [`${v.specialty} • ${v.location}`, `Consultation Fee: ${v.fee}`],
      actions: [{ label:'Book Now', icon:'fa fa-calendar-check', onClick:()=>simulateFlow(v.name) }]
    });
    c.dataset.search = `${v.name} ${v.specialty} ${v.location}`.toLowerCase();
    provWrap.appendChild(c);
  });

  const seekWrap = document.getElementById('vetSeekers');
  vetSeekers.forEach(r=>{
    const c = createCard({
      title: r.animal,
      lines: [`Service: ${r.service}`, `Location: ${r.location}`],
      actions: [{ label:'View Details', icon:'fa fa-eye', variant:'btn-ghost', onClick:()=>{
        showDetails(`
          <h3>${r.animal}</h3>
          <p><strong>Service Needed:</strong> ${r.service}</p>
          <p><strong>Location:</strong> ${r.location}</p>
          <button class="btn btn-primary" id="detailBook">Notify Vet</button>
        `);
        setTimeout(()=>{
          const btn = document.getElementById('detailBook');
          if(btn) btn.onclick = ()=>{ hideDetails(); simulateFlow(`${r.animal} ${r.service}`); };
        },0);
      }}]
    });
    c.dataset.search = `${r.animal} ${r.service} ${r.location}`.toLowerCase();
    seekWrap.appendChild(c);
  });
}

function renderFarmers(){
  const agriWrap = document.getElementById('agriServices');
  agriServices.forEach(a=>{
    const c = createCard({
      title: a.name,
      lines: [`${a.type} • ${a.location}`],
      actions: [{ label:'Contact Now', icon:'fa fa-phone', onClick:()=>simulateFlow(a.name) }]
    });
    c.dataset.search = `${a.name} ${a.type} ${a.location}`.toLowerCase();
    agriWrap.appendChild(c);
  });

  const reqWrap = document.getElementById('farmerRequests');
  farmerRequests.forEach(fr=>{
    const c = createCard({
      title: fr.crop,
      lines: [`Need: ${fr.need}`, `Location: ${fr.location}`],
      actions: [{ label:'View Details', icon:'fa fa-eye', variant:'btn-ghost', onClick:()=>{
        showDetails(`
          <h3>${fr.crop}</h3>
          <p><strong>Need:</strong> ${fr.need}</p>
          <p><strong>Location:</strong> ${fr.location}</p>
          <button class="btn btn-primary" id="frHelp">Offer Help</button>
        `);
        setTimeout(()=>{
          const btn = document.getElementById('frHelp');
          if(btn) btn.onclick = ()=>{ hideDetails(); simulateFlow(`${fr.crop} ${fr.need}`); };
        },0);
      }}]
    });
    c.dataset.search = `${fr.crop} ${fr.need} ${fr.location}`.toLowerCase();
    reqWrap.appendChild(c);
  });
}

function renderServices(){
  const wrap = document.getElementById('serviceList');
  serviceProviders.forEach(s=>{
    const c = createCard({
      title: s.name,
      lines: [`${s.type} • ${s.location}`],
      actions: [{ label:'Book Now', icon:'fa fa-wrench', onClick:()=>simulateFlow(s.name) }]
    });
    c.dataset.search = `${s.name} ${s.type} ${s.location}`.toLowerCase();
    wrap.appendChild(c);
  });
}

/* =========================
   Search + Reveal + Events
   ========================= */

function initSearch(){
  const input = document.getElementById('globalSearch');
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.grid .card').forEach(card=>{
      const text = (card.dataset.search||'').toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  });
}

function initReveal(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('section-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  document.querySelectorAll('.section').forEach(sec => obs.observe(sec));
}

function initModals(){
  document.getElementById('confirmClose').onclick = hideConfirm;
  document.getElementById('confirmOk').onclick = hideConfirm;
  document.getElementById('detailClose').onclick = hideDetails;
  window.addEventListener('click', (e)=>{
    if(e.target === document.getElementById('confirmModal')) hideConfirm();
    if(e.target === document.getElementById('detailModal')) hideDetails();
  });
}

/* =========================
   Init
   ========================= */
/* ---- debounce for search (saves CPU on phones) ---- */
function debounce(fn, delay=200){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); };
}
function initSearch(){
  const input = document.getElementById('globalSearch');
  const run = ()=> {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.grid .card').forEach(card=>{
      const text = (card.dataset.search||'').toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  };
  input.addEventListener('input', debounce(run, 120));
}

/* ---- modal a11y: ESC to close, focus trap, restore focus ---- */
let lastFocus = null;
function trapFocus(modal){
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if(!focusables.length) return ()=>{};
  const first = focusables[0], last = focusables[focusables.length-1];
  function handler(e){
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    if(e.key === 'Escape'){ closeAnyModal(); }
  }
  modal.addEventListener('keydown', handler);
  return ()=> modal.removeEventListener('keydown', handler);
}
let untrap = ()=>{};
function openModal(el){
  lastFocus = document.activeElement;
  document.body.classList.add('modal-open');
  el.style.display = 'flex';
  untrap = trapFocus(el);
  (el.querySelector('[autofocus]') || el.querySelector('button') || el).focus();
}
function closeModal(el){
  el.style.display = 'none';
  document.body.classList.remove('modal-open');
  untrap(); untrap = ()=>{};
  if(lastFocus) lastFocus.focus();
}
function closeAnyModal(){
  ['confirmModal','detailModal'].forEach(id=>{
    const el = document.getElementById(id);
    if(el && el.style.display === 'flex') closeModal(el);
  });
}

/* swap in these implementations in your show/hide calls */
function showConfirm(message){
  document.getElementById('confirmMessage').textContent = message;
  openModal(document.getElementById('confirmModal'));
}
function hideConfirm(){ closeModal(document.getElementById('confirmModal')); }
function showDetails(html){
  const m = document.getElementById('detailModal');
  const body = document.getElementById('detailBody');
  body.innerHTML = html;
  // give the dialog a title for aria-labelledby
  body.insertAdjacentHTML('afterbegin','<h3 id="detailTitle" tabindex="-1" autofocus></h3>');
  openModal(m);
}
function hideDetails(){ closeModal(document.getElementById('detailModal')); }

/* ESC close & outside click (already had outside; add ESC global) */
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeAnyModal(); });

/* ---- cart badge hook (uses your .cart-count class) ---- */
function updateCartCount(){
  let badge = document.querySelector('.cart-count');
  if(!badge){
    const wrap = document.querySelector('.search-wrap') || document.querySelector('.brand');
    if(!wrap) return;
    const b = document.createElement('span'); b.className='cart-count'; wrap.style.position='relative'; wrap.appendChild(b);
    badge = b;
  }
  badge.textContent = String(cart.length);
  badge.style.display = cart.length ? 'flex' : 'none';
}
// call after addToCart
function addToCart(name){
  cart.push(name);
  updateCartCount();
  showConfirm(`${name} added to cart!`);
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderFood();
  renderKirana();
  renderVets();
  renderFarmers();
  renderServices();
  initSearch();
  initReveal();
  initModals();
});



