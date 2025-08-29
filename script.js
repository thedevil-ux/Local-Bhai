// script.js
'use strict';

/* =========================
   Data
   ========================= */

// Food vendors
const foodVendors = [
  { name: "Odia Zaika", cuisine: "Odia Thali", rating: 4.5, time: "30 min" },
  { name: "Chhapan Bhog", cuisine: "Sweets & Snacks", rating: 4.3, time: "20 min" },
  { name: "Biryani Junction", cuisine: "Biryani & Rolls", rating: 4.6, time: "35 min" },
  { name: "Tandoor Tales", cuisine: "North Indian", rating: 4.2, time: "32 min" },
  { name: "Masala Box", cuisine: "South Indian", rating: 4.4, time: "25 min" }
];

// Kirana items
const kiranaItems = [
  { name: "Fortune Atta", price: "₹250 / 10kg" },
  { name: "Amul Milk 1L", price: "₹55" },
  { name: "Basmati Rice 5kg", price: "₹499" },
  { name: "Arhar Dal 1kg", price: "₹130" },
  { name: "Sunflower Oil 1L", price: "₹145" },
  { name: "Wheat 10kg", price: "₹320" }
];

// Vet providers & seekers
const vetProviders = [
  { name: "Dr. Priya Sahu", specialty: "Livestock Vet", location: "Cuttack", fee: "₹300" },
  { name: "Dr. Ramesh Nayak", specialty: "Pet Specialist", location: "Bhubaneswar", fee: "₹400" },
  { name: "Dr. Anjali Das", specialty: "Poultry Expert", location: "Puri", fee: "₹350" }
];
const vetSeekers = [
  { animal: "Cow", service: "Vaccination", location: "Khordha" },
  { animal: "Dog", service: "Skin Treatment", location: "Cuttack" },
  { animal: "Goat", service: "Checkup", location: "Khordha" }
];

// Farmers & Agri
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

// General service providers
const serviceProviders = [
  { name: "Sanjay Electric Works", type: "Electrician", location: "Nirakarpur" },
  { name: "Manoj Plumber Services", type: "Plumber", location: "Nirakarpur" },
  { name: "Laxmi Woodworks", type: "Carpenter", location: "Khurda" },
  { name: "Tailor Babu", type: "Tailor", location: "Nirakarpur" }
];

/* =========================
   State & Helpers
   ========================= */

const cart = [];

/** Create an element with optional class and inner HTML */
const el = (tag, className, html) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

/** Create a card: title + optional meta + lines + actions */
function createCard({ title, lines = [], meta = [], actions = [] }) {
  const card = el('div', 'card');
  const h = el('h4', null, title);
  card.appendChild(h);
  if (meta.length) {
    const metaRow = el('div', 'meta');
    meta.forEach(m => metaRow.appendChild(el('span', 'badge', m)));
    card.appendChild(metaRow);
  }
  lines.forEach(t => card.appendChild(el('p', null, t)));
  if (actions.length) {
    const row = el('div', 'actions');
    actions.forEach(a => {
      const b = el('button', 'btn');
      b.classList.add(a.variant || 'btn-primary');
      b.innerHTML = a.icon ? `<i class="${a.icon}" aria-hidden="true"></i> ${a.label}` : a.label;
      b.addEventListener('click', a.onClick);
      row.appendChild(b);
    });
    card.appendChild(row);
  }
  return card;
}

/** Debounce function: limits calls to once per delay */
const debounce = (fn, delay = 150) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

/* =========================
   Modal Management (a11y)
   ========================= */

let lastFocus = null;
let untrap = () => {};

/** Trap focus within a modal */
function trapFocus(modal) {
  const focusables = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusables.length) return () => {};
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  function handler(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') {
      closeAnyModal();
    }
  }
  modal.addEventListener('keydown', handler);
  return () => modal.removeEventListener('keydown', handler);
}

/** Open a modal and trap focus */
function openModal(modal) {
  if (!modal) return;
  lastFocus = document.activeElement;
  document.body.classList.add('modal-open');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  untrap = trapFocus(modal);
  const autofocusEl = modal.querySelector('[autofocus]');
  if (autofocusEl) autofocusEl.focus();
  else {
    const firstFocusable = modal.querySelector('button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
    else modal.focus();
  }
}

/** Close a modal and restore focus */
function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  untrap(); untrap = () => {};
  if (lastFocus) lastFocus.focus();
}

/** Close whichever modal is open */
function closeAnyModal() {
  ['confirmModal', 'detailModal'].forEach(id => {
    const m = document.getElementById(id);
    if (m && m.style.display === 'flex') closeModal(m);
  });
}

// Modal wrappers
function showConfirm(message) {
  const modal = document.getElementById('confirmModal');
  const msgEl = document.getElementById('confirmMessage');
  if (msgEl) msgEl.textContent = message;
  openModal(modal);
}
function hideConfirm() { closeModal(document.getElementById('confirmModal')); }

function showDetailsHTML(html, title = 'Details') {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailBody');
  if (!modal || !body) return;
  body.innerHTML = '';
  const heading = el('h3', null, title);
  heading.id = 'detailTitle'; heading.tabIndex = -1;
  body.appendChild(heading);
  const content = el('div');
  content.innerHTML = html;
  body.appendChild(content);
  // button IDs replaced in generic simulation; hooking
  body.querySelectorAll('button').forEach(btn => {
    if (btn.id === 'detailBook') {
      btn.onclick = () => { hideDetails(); simulateFlow('Vet Service Request'); };
    } else if (btn.id === 'frHelp') {
      btn.onclick = () => { hideDetails(); simulateFlow('Farmer Help Offer'); };
    }
  });
  openModal(modal);
}
function hideDetails() { closeModal(document.getElementById('detailModal')); }

// Global events
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeAnyModal(); });
window.addEventListener('click', e => {
  if (e.target === document.getElementById('confirmModal')) hideConfirm();
  if (e.target === document.getElementById('detailModal')) hideDetails();
});

/* =========================
   Cart
   ========================= */

/** Ensure the cart badge exists */
function ensureCartBadge() {
  let badge = document.querySelector('.cart-count');
  if (!badge) {
    const wrap = document.querySelector('.search-wrap');
    if (!wrap) return null;
    badge = document.createElement('span');
    badge.className = 'cart-count';
    badge.textContent = '0';
    wrap.appendChild(badge);
  }
  return badge;
}

/** Update cart count badge */
function updateCartCount() {
  const badge = ensureCartBadge();
  if (!badge) return;
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = String(total);
  badge.style.display = total ? 'flex' : 'none';
}

/** Add item to cart */
function addToCart(name) {
  if (!name) return;
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, quantity: 1 });
  }
  updateCartCount();
  showConfirm(`${name} added to cart!`);
}

/* =========================
   Simulated Order Flow
   ========================= */

function simulateFlow(name) {
  showConfirm(`Order Confirmed! ${name} notified. Delivery on the way 🚴`);
  setTimeout(() => alert(`Vendor accepted the ${name} request!`), 1500);
  setTimeout(() => alert(`Delivery agent picked up your ${name}. Approaching soon 🚴`), 3500);
}

/* =========================
   Renderers
   ========================= */

function renderFood() {
  const wrap = document.getElementById('foodList');
  if (!wrap) return;
  wrap.innerHTML = '';
  foodVendors.forEach(v => {
    const card = createCard({
      title: v.name,
      meta: [`⭐ ${v.rating}`, v.time],
      lines: [v.cuisine],
      actions: [{ label: 'Order Now', icon: 'fa fa-motorcycle', onClick: () => simulateFlow(v.name) }]
    });
    card.dataset.search = `${v.name} ${v.cuisine}`.toLowerCase();
    wrap.appendChild(card);
  });
}

function renderKirana() {
  const wrap = document.getElementById('kiranaList');
  if (!wrap) return;
  wrap.innerHTML = '';
  kiranaItems.forEach(it => {
    const card = createCard({
      title: it.name,
      lines: [it.price],
      actions: [
        { label: 'Add to Cart', icon: 'fa fa-cart-plus', variant: 'btn-ghost', onClick: () => addToCart(it.name) },
        { label: 'Order Now', icon: 'fa fa-bolt', onClick: () => simulateFlow(it.name) }
      ]
    });
    card.dataset.search = `${it.name} ${it.price}`.toLowerCase();
    wrap.appendChild(card);
  });
}

function renderVets() {
  const prov = document.getElementById('vetProviders');
  if (!prov) return;
  prov.innerHTML = '';
  vetProviders.forEach(v => {
    const card = createCard({
      title: v.name,
      lines: [`${v.specialty} • ${v.location}`, `Consultation Fee: ${v.fee}`],
      actions: [{ label: 'Book Now', icon: 'fa fa-calendar-check', onClick: () => simulateFlow(v.name) }]
    });
    card.dataset.search = `${v.name} ${v.specialty} ${v.location}`.toLowerCase();
    prov.appendChild(card);
  });

  const seek = document.getElementById('vetSeekers');
  if (!seek) return;
  seek.innerHTML = '';
  vetSeekers.forEach(req => {
    const card = createCard({
      title: req.animal,
      lines: [`Service: ${req.service}`, `Location: ${req.location}`],
      actions: [{
        label: 'View Details', icon: 'fa fa-eye', variant: 'btn-ghost',
        onClick: () => {
          showDetailsHTML(`
            <p><strong>Service Needed:</strong> ${req.service}</p>
            <p><strong>Location:</strong> ${req.location}</p>
            <button class="btn btn-primary" id="detailBook">Notify Vet</button>
          `, `${req.animal} Service Request`);
        }
      }]
    });
    card.dataset.search = `${req.animal} ${req.service} ${req.location}`.toLowerCase();
    seek.appendChild(card);
  });
}

function renderFarmers() {
  const agriWrap = document.getElementById('agriServices');
  if (!agriWrap) return;
  agriWrap.innerHTML = '';
  agriServices.forEach(srv => {
    const card = createCard({
      title: srv.name,
      lines: [`${srv.type} • ${srv.location}`],
      actions: [{ label: 'Contact Now', icon: 'fa fa-phone', onClick: () => simulateFlow(srv.name) }]
    });
    card.dataset.search = `${srv.name} ${srv.type} ${srv.location}`.toLowerCase();
    agriWrap.appendChild(card);
  });

  const reqWrap = document.getElementById('farmerRequests');
  if (!reqWrap) return;
  reqWrap.innerHTML = '';
  farmerRequests.forEach(req => {
    const card = createCard({
      title: req.crop,
      lines: [`Need: ${req.need}`, `Location: ${req.location}`],
      actions: [{
        label: 'View Details', icon: 'fa fa-eye', variant: 'btn-ghost',
        onClick: () => {
          showDetailsHTML(`
            <p><strong>Need:</strong> ${req.need}</p>
            <p><strong>Location:</strong> ${req.location}</p>
            <button class="btn btn-primary" id="frHelp">Offer Help</button>
          `, `${req.crop} Request`);
        }
      }]
    });
    card.dataset.search = `${req.crop} ${req.need} ${req.location}`.toLowerCase();
    reqWrap.appendChild(card);
  });
}

function renderServices() {
  const wrap = document.getElementById('serviceList');
  if (!wrap) return;
  wrap.innerHTML = '';
  serviceProviders.forEach(s => {
    const card = createCard({
      title: s.name,
      lines: [`${s.type} • ${s.location}`],
      actions: [{ label: 'Book Now', icon: 'fa fa-wrench', onClick: () => simulateFlow(s.name) }]
    });
    card.dataset.search = `${s.name} ${s.type} ${s.location}`.toLowerCase();
    wrap.appendChild(card);
  });
}

/* =========================
   Search + Reveal + Init
   ========================= */

function initSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;
  if (input.form) input.form.addEventListener('submit', e => e.preventDefault());
  const run = () => {
    const q = (input.value || '').trim().toLowerCase();
    document.querySelectorAll('.grid .card').forEach(card => {
      const text = (card.dataset.search || '').toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  };
  input.addEventListener('input', debounce(run, 150));
}

function initReveal() {
  const sections = document.querySelectorAll('.section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach(s => s.classList.add('section-visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  sections.forEach(sec => obs.observe(sec));
}

function initModals() {
  const confirmClose = document.getElementById('confirmClose');
  const confirmOk    = document.getElementById('confirmOk');
  const detailClose  = document.getElementById('detailClose');
  if (confirmClose) confirmClose.onclick = hideConfirm;
  if (confirmOk)    confirmOk.onclick    = hideConfirm;
  if (detailClose)  detailClose.onclick  = hideDetails;
}

/* Init all on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  renderFood();
  renderKirana();
  renderVets();
  renderFarmers();
  renderServices();
  initSearch();
  initReveal();
  initModals();
  ensureCartBadge(); // prepare cart badge
});











