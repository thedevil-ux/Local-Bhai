// script.js
'use strict';

// Dummy data arrays provided
const foodVendors = [
  { name: "Odia Zaika", cuisine: "Odia Thali", rating: 4.5, time: "30 min" },
  { name: "Chhapan Bhog", cuisine: "Sweets & Snacks", rating: 4.3, time: "20 min" },
  { name: "Biryani Junction", cuisine: "Biryani & Rolls", rating: 4.6, time: "35 min" }
];

const kiranaItems = [
  { name: "Fortune Atta", price: "₹250 / 10kg" },
  { name: "Amul Milk 1L", price: "₹55" },
  { name: "Basmati Rice 5kg", price: "₹499" },
  { name: "Arhar Dal 1kg", price: "₹130" }
];

const vetProviders = [
  { name: "Dr. Priya Sahu", specialty: "Livestock Vet", location: "Cuttack" },
  { name: "Dr. Ramesh Nayak", specialty: "Pet Specialist", location: "Bhubaneswar" },
  { name: "Dr. Anjali Das", specialty: "Poultry Expert", location: "Puri" }
];

const vetSeekers = [
  { animal: "Cow", service: "Vaccination", location: "Khordha" },
  { animal: "Dog", service: "Skin Treatment", location: "Cuttack" },
  { animal: "Goat", service: "Checkup", location: "Khordha" }
];

const serviceProviders = [
  { name: "Sanjay Electric Works", type: "Electrician", location: "Nirakarpur" },
  { name: "Manoj Plumber Services", type: "Plumber", location: "Nirakarpur" },
  { name: "Laxmi Woodworks", type: "Carpenter", location: "Khurda" },
  { name: "Tailor Babu", type: "Tailor", location: "Nirakarpur" }
];

// Simple cart to collect kirana items added via the Add to Cart button.
// This is a basic simulation that stores item names in an array. In a
// production system this would integrate with a backend or local
// storage. Users are notified when items are added.
const cart = [];

// Helper to create card element
function createCardHTML(title, lines, buttonText) {
  // Builds a standard card with a single action button. When
  // multiple actions are required (e.g. Add to Cart and Order Now
  // for kirana items), a specialised rendering function will
  // construct the button group separately. The helper assembles
  // the heading, descriptive lines and a single button.
  let inner = `<h4>${title}</h4>`;
  lines.forEach(line => {
    inner += `<p>${line}</p>`;
  });
  // Append button only if text provided
  if (buttonText) {
    inner += `<button>${buttonText}</button>`;
  }
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = inner;
  return div;
}

function renderFood() {
  const container = document.getElementById('foodList');
  foodVendors.forEach(vendor => {
    const card = createCardHTML(
      vendor.name,
      [vendor.cuisine, `⭐ ${vendor.rating}`, vendor.time],
      'Order Now'
    );
    card.dataset.search = (vendor.name + ' ' + vendor.cuisine).toLowerCase();
    card.querySelector('button').addEventListener('click', () => handleOrder(vendor.name));
    container.appendChild(card);
  });
}

function renderKirana() {
  const container = document.getElementById('kiranaList');
  kiranaItems.forEach(item => {
    // Create a base card without button since we'll add a button group
    const card = createCardHTML(
      item.name,
      [item.price],
      ''
    );
    card.dataset.search = item.name.toLowerCase();
    // Build a button group with Add to Cart and Order Now
    const btnGroup = document.createElement('div');
    btnGroup.className = 'card-buttons';
    // Add to Cart button
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add to Cart';
    addBtn.addEventListener('click', () => {
      addToCart(item.name);
    });
    // Order Now button
    const orderBtn = document.createElement('button');
    orderBtn.textContent = 'Order Now';
    orderBtn.addEventListener('click', () => handleOrder(item.name));
    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(orderBtn);
    card.appendChild(btnGroup);
    container.appendChild(card);
  });
}

function renderVets() {
  const providerContainer = document.getElementById('vetProviders');
  vetProviders.forEach(provider => {
    // Vet providers: we still use the standard card with a Book Now button
    const card = createCardHTML(
      provider.name,
      [provider.specialty, provider.location],
      'Book Now'
    );
    card.dataset.search = (provider.name + ' ' + provider.specialty + ' ' + provider.location).toLowerCase();
    card.querySelector('button').addEventListener('click', () => handleOrder(provider.name));
    providerContainer.appendChild(card);
  });
  const seekerContainer = document.getElementById('vetSeekers');
  vetSeekers.forEach(req => {
    // For service seekers we remove the explicit Details button and
    // instead make the entire card clickable. Clicking a card opens
    // a modal with more information about the request.
    const card = createCardHTML(
      req.animal,
      [`Service: ${req.service}`, `Location: ${req.location}`],
      ''
    );
    card.dataset.search = (req.animal + ' ' + req.service + ' ' + req.location).toLowerCase();
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showDetails(req));
    seekerContainer.appendChild(card);
  });
}

function renderServices() {
  const container = document.getElementById('serviceList');
  serviceProviders.forEach(sp => {
    const card = createCardHTML(
      sp.name,
      [sp.type, sp.location],
      'Book Now'
    );
    card.dataset.search = (sp.name + ' ' + sp.type + ' ' + sp.location).toLowerCase();
    card.querySelector('button').addEventListener('click', () => handleOrder(sp.name));
    container.appendChild(card);
  });
}

// Add to cart logic: push item name into the cart array and show a
// confirmation message to the user. We reuse the confirmation modal
// for consistency. In a more advanced implementation the cart would
// show a count in the header or open a mini-cart.
function addToCart(name) {
  cart.push(name);
  showConfirmModal(`${name} added to cart!`);
}

// Modal handling
function showConfirmModal(message) {
  const modal = document.getElementById('confirmModal');
  const msgEl = document.getElementById('confirmMessage');
  msgEl.textContent = message;
  modal.style.display = 'flex';
}

function hideConfirmModal() {
  document.getElementById('confirmModal').style.display = 'none';
}

function showDetails(req) {
  const modal = document.getElementById('detailModal');
  const body = document.getElementById('detailBody');
  body.innerHTML = `<h4>${req.animal}</h4><p>Service Needed: ${req.service}</p><p>Location: ${req.location}</p>`;
  modal.style.display = 'flex';
}

function hideDetails() {
  document.getElementById('detailModal').style.display = 'none';
}

function handleOrder(name) {
  showConfirmModal(`Order Confirmed! ${name} notified. Delivery on the way 🚴`);
  // simulate vendor and delivery notifications
  setTimeout(() => alert(`Vendor accepted the ${name} request!`), 2000);
  setTimeout(() => alert(`Delivery agent picked up your ${name}. Approaching soon 🚴`), 4000);
}

// Search filter
function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const searchText = card.dataset.search || '';
      if (searchText.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

// Intersection Observer for fade-in
function initIntersection() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  sections.forEach(sec => observer.observe(sec));
}

document.addEventListener('DOMContentLoaded', () => {
  renderFood();
  renderKirana();
  renderVets();
  renderServices();
  initSearch();
  initIntersection();
  // modal close buttons
  document.getElementById('confirmClose').onclick = hideConfirmModal;
  document.getElementById('detailClose').onclick = hideDetails;
  // close when clicking outside modal
  window.onclick = (e) => {
    if (e.target === document.getElementById('confirmModal')) hideConfirmModal();
    if (e.target === document.getElementById('detailModal')) hideDetails();
  };
});

