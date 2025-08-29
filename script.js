// script.js
'use strict';

/* =========================
   Data
   ========================= */

// Food
const foodVendors = [
  { name: "Odia Zaika", cuisine: "Odia Thali", rating: 4.5, time: "30 min" },
  { name: "Chhapan Bhog", cuisine: "Sweets & Snacks", rating: 4.3, time: "20 min" },
  { name: "Biryani Junction", cuisine: "Biryani & Rolls", rating: 4.6, time: "35 min" },
  { name: "Tandoor Tales", cuisine: "North Indian", rating: 4.2, time: "32 min" },
  { name: "Masala Box", cuisine: "South Indian", rating: 4.4, time: "25 min" }
];

// Kirana
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

// General services
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

/**
 * Create an element with optional class and innerHTML
 * @param {string} tag 
 * @param {string} [className] 
 * @param {string} [html] 
 * @returns {HTMLElement}
 */
const el = (tag, className, html) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

/**
 * Create a card element with title, meta info, lines, and action buttons
 * @param {object} param0 
 * @returns {HTMLElement}
 */
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

// Debounce function for search input
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

/**
 * Trap keyboard focus inside modal
 * @param {HTMLElement} modal 
 * @returns {Function} cleanup function
 */
function trapFocus(modal) {
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return () => { };
  const first = focusables[0], last = focusables[focusables.length - 1];
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

/**
 * Open modal and manage focus and aria attributes
 * @param {HTMLElement} modal 
 */
function openModal(modal) {
  if (!modal) return;
  lastFocus = document.activeElement;
  document.body.classList.add('modal-open');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  untrap = trapFocus(modal);
  // Focus first autofocus element or first button or modal itself
  const autofocusEl = modal.querySelector('[autofocus]');
  if (autofocusEl) autofocusEl.focus();
  else {
    const firstBtn = modal.querySelector('button, [tabindex]:not([tabindex="-1"])');
    if (firstBtn) firstBtn.focus();
    else modal.focus();
  }
}

/**
 * Close modal and restore focus and aria attributes
 * @param {HTMLElement} modal 
 */
function closeModal(modal) {
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  untrap();
  untrap = () => { };
  if (lastFocus) lastFocus.focus();
}

/**
 * Close any open modal
 */
function closeAnyModal() {
  ['confirmModal', 'detailModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal && modal.style.display === 'flex') closeModal(modal);
  });
}

/* =========================
   Public Modal APIs
   ========================= */

/**
 * Show confirmation modal with message
 * @param {string} message 
 */
function showConfirm(message) {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;
  const msgEl = document.getElementById('confirmMessage');
  if (msgEl) msgEl.textContent = message;
  openModal(modal);
}

/**
 * Hide confirmation modal
 */
function hideConfirm() {
  closeModal(document.getElementById('confirmModal'));
}

/**
 * Show detail modal with HTML content and optional title
 * @param {string} html 
 * @param {string} [title] 
 */
function showDetailsHTML(html, title = 'Details') {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailBody');
  if (!modal || !body) return;
  // Clear previous content
  body.innerHTML = '';
  // Create heading with title
  const heading = el('h3', null, title);
  heading.id = 'detailTitle';
  heading.tabIndex = -1;
  body.appendChild(heading);
  // Insert content
  const content = el('div');
  content.innerHTML = html;
  body.appendChild(content);

  // Attach event listeners for buttons inside modal content
  // Use event delegation
  body.querySelectorAll('button').forEach(btn => {
    if (btn.id === 'detailBook') {
      btn.onclick = () => {
        hideDetails();
        simulateFlow('Vet Service Request');
      };
    } else if (btn.id === 'frHelp') {
      btn.onclick = () => {
        hideDetails();
        simulateFlow('Farmer Help Offer');
      };
    }
  });

  openModal(modal);
}

/**
 * Hide detail modal
 */
function hideDetails() {
  closeModal(document.getElementById('detailModal'));
}

/* =========================
   Global Event Listeners
   ========================= */

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAnyModal();
});

window.addEventListener('click', e => {
  if (e.target === document.getElementById('confirmModal')) hideConfirm();
  if (e.target === document.getElementById('detailModal')) hideDetails();
});

/* =========================
   Cart Management
   ========================= */

/**
 * Add item to cart or increase quantity if exists
 * @param {string} name 
 */
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

/**
 * Remove item from cart by name
 * @param {string} name 
 */
function removeFromCart(name) {
  const index = cart.findIndex(item => item.name === name);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCartCount();
  }
}

/**
 * Update cart count badge
 */
function updateCartCount() {
  const badge = ensureCartBadge();
  if (!badge) return;
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = String(totalCount);
  badge.style.display = totalCount ? 'flex' : 'none';
}

/**
 * Ensure cart badge exists in DOM
 * @returns {HTMLElement|null}
 */
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

/* =========================
   Simulated Order Flow
   ========================= */

/**
 * Simulate order flow with confirmation and alerts
 * @param {string} name 
 */
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
    const c = createCard({
      title: v.name,
      meta: [`⭐ ${v.rating}`, v.time],
      lines: [v.cuisine],
      actions: [{ label: 'Order Now', icon: 'fa fa-motorcycle', onClick: () => simulateFlow(v.name) }]
    });
    c.dataset.search = `${v.name} ${v.cuisine}`.toLowerCase();
    wrap.appendChild(c);
  });
}

function renderKirana() {
  const wrap = document.getElementById('kiranaList');
  if (!wrap) return;
  wrap.innerHTML = '';
  kiranaItems.forEach(it => {
    const c = createCard({
      title: it.name,
      lines: [it.price],
      actions: [
        { label: 'Add to Cart', icon: 'fa fa-cart-plus', variant: 'btn-ghost', onClick: () => addToCart(it.name) },
        { label: 'Order Now', icon: 'fa fa-bolt', onClick: () => simulateFlow(it.name) }
      ]
    });
    c.dataset.search = `${it.name} ${it.price}`.toLowerCase();
    wrap.appendChild(c);
  });
}

function renderVets() {
  const provWrap = document.getElementById('vetProviders');
  if (!provWrap) return;
  provWrap.innerHTML = '';
  vetProviders.forEach(v => {
    const c = createCard({
      title: v.name,
      lines: [`${v.specialty} • ${v.location}`, `Consultation Fee: ${v.fee}`],
      actions: [{ label: 'Book Now', icon: 'fa fa-calendar-check', onClick: () => simulateFlow(v.name) }]
    });
    c.dataset.search = `${v.name} ${v.specialty} ${v.location}`.toLowerCase();
    provWrap.appendChild(c);
  });

  const seekWrap = document.getElementById('vetSeekers');
  if (!seekWrap) return;
  seekWrap.innerHTML = '';
  vetSeekers.forEach(r => {
    const c = createCard({
      title: r.animal,
      lines: [`Service: ${r.service}`, `Location: ${r.location}`],
      actions: [{
        label: 'View Details', icon: 'fa fa-eye', variant: 'btn-ghost', onClick: () => {
          showDetailsHTML(`
            <p><strong>Service Needed:</strong> ${r.service}</p>
            <p><strong>Location:</strong> ${r.location}</p>
            <button class="btn btn-primary" id="detailBook">Notify Vet</button>
          `, `${r.animal} Service Request`);
        }
      }]
    });
    c.dataset.search = `${r.animal} ${r.service} ${r.location}`.toLowerCase();
    seekWrap.appendChild(c);
  });
}

function renderFarmers() {
  const agriWrap = document.getElementById('agriServices');
  if (!agriWrap) return;
  agriWrap.innerHTML = '';
  agriServices.forEach(a => {
    const c = createCard({
      title: a.name,
      lines: [`${a.type} • ${a.location}`],
      actions: [{ label: 'Contact Now', icon: 'fa fa-phone', onClick: () => simulateFlow(a.name) }]
    });
    c.dataset.search = `${a.name} ${a.type} ${a.location}`.toLowerCase();
    agriWrap.appendChild(c);
  });

  const reqWrap = document.getElementById('farmerRequests');
  if (!reqWrap) return;
  reqWrap.innerHTML = '';
  farmerRequests.forEach(fr => {
    const c = createCard({
      title: fr.crop,
      lines: [`Need: ${fr.need}`, `Location: ${fr.location}`],
      actions: [{
        label: 'View Details', icon: 'fa fa-eye', variant: 'btn-ghost', onClick: () => {
          showDetailsHTML(`
            <p><strong>Need:</strong> ${fr.need}</p>
            <p><strong>Location:</strong> ${fr.location}</p>
            <button class="btn btn-primary" id="frHelp">Offer Help</button>
          `, `${fr.crop} Request`);
        }
      }]
    });
    c.dataset.search = `${fr.crop} ${fr.need} ${fr.location}`.toLowerCase();
    reqWrap.appendChild(c);
  });
}

function renderServices() {
  const wrap = document.getElementById('serviceList');
  if (!wrap) return;
  wrap.innerHTML = '';
  serviceProviders.forEach(s => {
    const c = createCard({
      title: s.name,
      lines: [`${s.type} • ${s.location}`],
      actions: [{ label: 'Book Now', icon: 'fa fa-wrench', onClick: () => simulateFlow(s.name) }]
    });
    c.dataset.search = `${s.name} ${s.type} ${s.location}`.toLowerCase();
    wrap.appendChild(c);
  });
}

/* =========================
   Search + Reveal + Events
   ========================= */

/**
 * Initialize search input filtering
 */
function initSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;

  // Prevent form submission if inside a form
  if (input.form) {
    input.form.addEventListener('submit', e => e.preventDefault());
  }

  const run = () => {
    const q = (input.value || '').trim().toLowerCase();
    document.querySelectorAll('.grid .card').forEach(card => {
      const text = (card.dataset.search || '').toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  };
  input.addEventListener('input', debounce(run, 150));
}

/**
 * Initialize section reveal on scroll
 */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all sections










