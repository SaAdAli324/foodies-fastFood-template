/* =============================================
   FOODIES — Customer Storefront Logic
   ============================================= */

/* ========== State ========== */
let cart = [];
let currentCategory = 'all';

/* ========== DOM References ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const navbar = $('#navbar');
const navLinks = $('#navLinks');
const mobileToggle = $('#mobileToggle');
const cartToggle = $('#cartToggle');
const cartBadge = $('#cartBadge');
const cartOverlay = $('#cartOverlay');
const cartSidebar = $('#cartSidebar');
const cartClose = $('#cartClose');
const cartItemsEl = $('#cartItems');
const cartFooter = $('#cartFooter');
const cartSubtotal = $('#cartSubtotal');
const cartSidebarCount = $('#cartSidebarCount');
const checkoutBtn = $('#checkoutBtn');
const checkoutOverlay = $('#checkoutOverlay');
const checkoutClose = $('#checkoutClose');
const checkoutForm = $('#checkoutForm');
const checkoutItemsEl = $('#checkoutItems');
const checkoutTotal = $('#checkoutTotal');
const categoryTabs = $('#categoryTabs');
const menuGrid = $('#menuGrid');
const toastContainer = $('#toastContainer');

/* ========== Initialize ========== */
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderCategoryTabs();
  renderMenu();
  updateCartUI();
  setupEventListeners();
  setupScrollAnimations();
});

/* ========== Event Listeners ========== */
function setupEventListeners() {
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Mobile nav toggle
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    mobileToggle.textContent = navLinks.classList.contains('mobile-open') ? '✕' : '☰';
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      mobileToggle.textContent = '☰';
    });
  });

  // Cart toggle
  cartToggle.addEventListener('click', openCart);
  cartOverlay.addEventListener('click', closeCart);
  cartClose.addEventListener('click', closeCart);

  // Checkout
  checkoutBtn.addEventListener('click', openCheckout);
  checkoutClose.addEventListener('click', closeCheckout);
  checkoutOverlay.addEventListener('click', (e) => {
    if (e.target === checkoutOverlay) closeCheckout();
  });

  // Checkout form submit
  checkoutForm.addEventListener('submit', handleCheckout);

  // Active nav link on scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

/* ========== Category Tabs ========== */
function renderCategoryTabs() {
  categoryTabs.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = `category-tab${cat.id === currentCategory ? ' active' : ''}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', cat.id === currentCategory);
    tab.innerHTML = `
      <span class="category-tab__icon">${cat.icon}</span>
      ${cat.name}
    `;
    tab.addEventListener('click', () => {
      currentCategory = cat.id;
      $$('.category-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderMenu();
    });
    categoryTabs.appendChild(tab);
  });
}

/* ========== Menu Rendering ========== */
function renderMenu() {
  const items = getItemsByCategory(currentCategory);

  if (items.length === 0) {
    menuGrid.className = 'menu-grid empty-state';
    menuGrid.innerHTML = `
      <div class="empty-message">
        <div class="empty-message__icon">🍽️</div>
        <div class="empty-message__text">No items available</div>
        <div class="empty-message__sub">Check back soon for new additions!</div>
      </div>
    `;
    return;
  }

  menuGrid.className = 'menu-grid';
  menuGrid.innerHTML = items.map(item => createFoodCard(item)).join('');

  // Attach add-to-cart listeners
  menuGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      addToCart(id);
      btn.classList.add('added');
      setTimeout(() => btn.classList.remove('added'), 500);
    });
  });
}

function createFoodCard(item) {
  const gradient = CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS.burgers;
  const catName = getCategoryName(item.category);

  const imageHTML = item.image
    ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
    : `<div class="food-card__emoji-bg" style="background: ${gradient};">${item.emoji || '🍽️'}</div>`;

  return `
    <article class="food-card" id="food-${item.id}">
      <div class="food-card__image">
        ${imageHTML}
        <span class="food-card__category-badge">${catName}</span>
      </div>
      <div class="food-card__body">
        <h3 class="food-card__name">${escapeHtml(item.name)}</h3>
        <p class="food-card__desc">${escapeHtml(item.description)}</p>
        <div class="food-card__footer">
          <div class="food-card__price">
            ${formatPrice(item.price)}
          </div>
          <button class="add-to-cart-btn" data-id="${item.id}" aria-label="Add ${item.name} to cart">+</button>
        </div>
      </div>
    </article>
  `;
}

/* ========== Cart Management ========== */
function addToCart(itemId) {
  const item = getMenuItem(itemId);
  if (!item) return;

  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      emoji: item.emoji || '🍽️',
      image: item.image || '',
      quantity: 1,
    });
  }
  saveCart();
  updateCartUI();
  showToast(`${item.name} added to cart!`, 'success');
}

function removeFromCart(itemId) {
  cart = cart.filter(c => c.id !== itemId);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function updateQuantity(itemId, delta) {
  const item = cart.find(c => c.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartItems();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCart() {
  localStorage.setItem('foodies_cart', JSON.stringify(cart));
}

function loadCart() {
  const data = localStorage.getItem('foodies_cart');
  cart = data ? JSON.parse(data) : [];
}

function updateCartUI() {
  const count = getCartCount();
  const total = getCartTotal();

  // Badge
  cartBadge.textContent = count;
  if (count > 0) {
    cartBadge.classList.add('visible');
    cartBadge.classList.add('pulse');
    setTimeout(() => cartBadge.classList.remove('pulse'), 400);
  } else {
    cartBadge.classList.remove('visible');
  }

  // Sidebar count
  cartSidebarCount.textContent = count;

  // Subtotal
  cartSubtotal.textContent = formatPrice(total);

  // Footer visibility
  cartFooter.style.display = count > 0 ? 'block' : 'none';

  // Render cart items
  renderCartItems();
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <div class="cart-empty__text">Your cart is empty</div>
        <div class="cart-empty__sub">Add some delicious items from the menu!</div>
      </div>
    `;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => {
    const gradient = CATEGORY_GRADIENTS.burgers;
    const imageHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<span>${item.emoji}</span>`;

    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__image" style="background: ${gradient};">
          ${imageHTML}
        </div>
        <div class="cart-item__details">
          <div class="cart-item__name">${escapeHtml(item.name)}</div>
          <div class="cart-item__price">${formatPrice(item.price * item.quantity)}</div>
          <div class="cart-item__controls">
            <button class="cart-item__qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
            <span class="cart-item__qty">${item.quantity}</span>
            <button class="cart-item__qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart('${item.id}')" aria-label="Remove ${item.name}">✕</button>
      </div>
    `;
  }).join('');
}

/* ========== Cart Sidebar ========== */
function openCart() {
  cartOverlay.classList.add('open');
  cartSidebar.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartOverlay.classList.remove('open');
  cartSidebar.classList.remove('open');
  document.body.style.overflow = '';
}

/* ========== Checkout ========== */
function openCheckout() {
  closeCart();
  renderCheckoutSummary();
  checkoutOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  checkoutOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCheckoutSummary() {
  const total = getCartTotal();

  checkoutItemsEl.innerHTML = cart.map(item => `
    <div class="checkout-summary__item">
      <span>${item.quantity}x ${escapeHtml(item.name)}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  checkoutTotal.textContent = formatPrice(total);
}

function handleCheckout(e) {
  e.preventDefault();

  // Get form values
  const name = $('#customerName').value.trim();
  const phone = $('#customerPhone').value.trim();
  const address = $('#customerAddress').value.trim();
  const city = $('#customerCity').value.trim();
  const notes = $('#customerNotes').value.trim();

  // Validation
  let isValid = true;

  if (!name) {
    $('#fg-name').classList.add('error');
    isValid = false;
  } else {
    $('#fg-name').classList.remove('error');
  }

  if (!phone || phone.length < 10) {
    $('#fg-phone').classList.add('error');
    isValid = false;
  } else {
    $('#fg-phone').classList.remove('error');
  }

  if (!address) {
    $('#fg-address').classList.add('error');
    isValid = false;
  } else {
    $('#fg-address').classList.remove('error');
  }

  if (!city) {
    $('#fg-city').classList.add('error');
    isValid = false;
  } else {
    $('#fg-city').classList.remove('error');
  }

  if (!isValid) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  // Generate WhatsApp link
  const total = getCartTotal();
  const customer = { name, phone, address, city, notes };
  const whatsappLink = generateWhatsAppLink(cart, customer, total);

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  // Reset form
  checkoutForm.reset();
  closeCheckout();

  showToast('Redirecting to WhatsApp...', 'success');

  // Open WhatsApp
  setTimeout(() => {
    window.open(whatsappLink, '_blank');
  }, 500);
}

/* ========== Scroll Animations ========== */
function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  $$('.animate-on-scroll').forEach(el => observer.observe(el));
}

function updateActiveNavLink() {
  const sections = ['home', 'menu', 'about', 'contact'];
  const scrollPos = window.scrollY + 200;

  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const link = navLinks.querySelector(`a[href="#${sectionId}"]`);
    if (!link) return;

    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

/* ========== Toast Notifications ========== */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `
    <span class="toast__icon">${icon}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ========== Utility ========== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
