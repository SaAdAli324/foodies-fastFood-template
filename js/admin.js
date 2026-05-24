/* =============================================
   FOODIES — Admin Dashboard Logic
   ============================================= */

/* ========== DOM References ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Login
const loginScreen = $('#loginScreen');
const loginForm = $('#loginForm');
const loginPassword = $('#loginPassword');
const loginError = $('#loginError');

// Layout
const adminLayout = $('#adminLayout');
const sidebar = $('#sidebar');
const sidebarOverlay = $('#sidebarOverlay');
const sidebarToggle = $('#sidebarToggle');
const logoutBtn = $('#logoutBtn');

// Views
const dashboardView = $('#dashboardView');
const itemsView = $('#itemsView');
const categoriesView = $('#categoriesView');
const pageTitle = $('#pageTitle');
const addItemBtn = $('#addItemBtn');

// Stats
const statTotal = $('#statTotal');
const statAvailable = $('#statAvailable');
const statCategories = $('#statCategories');
const statUnavailable = $('#statUnavailable');

// Tables
const dashboardTableBody = $('#dashboardTableBody');
const itemsTableBody = $('#itemsTableBody');
const searchInput = $('#searchInput');

// Item Modal
const itemModalOverlay = $('#itemModalOverlay');
const itemModalTitle = $('#itemModalTitle');
const itemModalClose = $('#itemModalClose');
const itemForm = $('#itemForm');
const editItemId = $('#editItemId');
const itemName = $('#itemName');
const itemDesc = $('#itemDesc');
const itemPrice = $('#itemPrice');
const itemCategory = $('#itemCategory');
const itemEmoji = $('#itemEmoji');
const itemImage = $('#itemImage');
const imagePreview = $('#imagePreview');
const imageUploadIcon = $('#imageUploadIcon');
const imageUploadText = $('#imageUploadText');
const imageUploadArea = $('#imageUploadArea');
const imageRemoveBtn = $('#imageRemoveBtn');
const itemCancelBtn = $('#itemCancelBtn');
const itemSubmitBtn = $('#itemSubmitBtn');

// Delete Modal
const deleteModalOverlay = $('#deleteModalOverlay');
const deleteItemNameEl = $('#deleteItemName');
const deleteCancelBtn = $('#deleteCancelBtn');
const deleteConfirmBtn = $('#deleteConfirmBtn');

// Toast
const toastContainer = $('#toastContainer');

/* ========== State ========== */
let currentView = 'dashboard';
let deleteTargetId = null;
let currentImageData = '';
let searchQuery = '';

/* ========== Initialize ========== */
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

/* ========== Auth ========== */
function checkAuth() {
  const isAuth = localStorage.getItem(ADMIN_KEY);
  if (isAuth === 'true') {
    showAdmin();
  } else {
    loginScreen.style.display = 'flex';
    adminLayout.classList.remove('visible');
  }
}

function showAdmin() {
  loginScreen.style.display = 'none';
  adminLayout.classList.add('visible');
  refreshAll();
}

/* ========== Event Listeners ========== */
function setupEventListeners() {
  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pwd = loginPassword.value;
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, 'true');
      loginError.classList.remove('visible');
      showAdmin();
    } else {
      loginError.classList.add('visible');
      loginPassword.value = '';
      loginPassword.focus();
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(ADMIN_KEY);
    loginScreen.style.display = 'flex';
    adminLayout.classList.remove('visible');
    loginPassword.value = '';
  });

  // Sidebar nav
  $$('.sidebar__nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
      // Close mobile sidebar
      sidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('visible');
    });
  });

  // Mobile sidebar
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    sidebarOverlay.classList.toggle('visible');
  });
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    sidebarOverlay.classList.remove('visible');
  });

  // Dashboard "View All" button
  $('#dashViewAllBtn').addEventListener('click', () => switchView('items'));

  // Add Item buttons
  addItemBtn.addEventListener('click', openAddModal);
  $('#addItemBtn2').addEventListener('click', openAddModal);

  // Item Modal
  itemModalClose.addEventListener('click', closeItemModal);
  itemCancelBtn.addEventListener('click', closeItemModal);
  itemModalOverlay.addEventListener('click', (e) => {
    if (e.target === itemModalOverlay) closeItemModal();
  });

  // Item Form
  itemForm.addEventListener('submit', handleItemSubmit);

  // Image Upload
  itemImage.addEventListener('change', handleImageUpload);
  imageRemoveBtn.addEventListener('click', removeImage);

  // Emoji Picker
  $$('.emoji-option').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.emoji-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      itemEmoji.value = btn.dataset.emoji;
    });
  });

  // Delete Modal
  deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) closeDeleteModal();
  });
  deleteCancelBtn.addEventListener('click', closeDeleteModal);
  deleteConfirmBtn.addEventListener('click', confirmDelete);

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderItemsTable();
  });
}

/* ========== View Switching ========== */
function switchView(view) {
  currentView = view;

  // Hide all views
  dashboardView.style.display = 'none';
  itemsView.style.display = 'none';
  categoriesView.style.display = 'none';

  // Show target
  if (view === 'dashboard') {
    dashboardView.style.display = 'block';
    pageTitle.textContent = 'Dashboard';
    addItemBtn.style.display = 'none';
  } else if (view === 'items') {
    itemsView.style.display = 'block';
    pageTitle.textContent = 'Menu Items';
    addItemBtn.style.display = 'inline-flex';
  } else if (view === 'categories') {
    categoriesView.style.display = 'block';
    pageTitle.textContent = 'Categories';
    addItemBtn.style.display = 'none';
  }

  // Update sidebar active state
  $$('.sidebar__nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  refreshAll();
}

/* ========== Refresh Data ========== */
function refreshAll() {
  const items = getMenuItems();
  const available = items.filter(i => i.isAvailable);
  const categories = [...new Set(items.map(i => i.category))];

  // Stats
  statTotal.textContent = items.length;
  statAvailable.textContent = available.length;
  statCategories.textContent = categories.length;
  statUnavailable.textContent = items.length - available.length;

  // Render views
  renderDashboardTable(items);
  renderItemsTable();
  renderCategoryStats(items);
}

/* ========== Dashboard Table ========== */
function renderDashboardTable(items) {
  const recent = items.slice(-8).reverse();

  if (recent.length === 0) {
    dashboardTableBody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="table-empty">
            <div class="table-empty__icon">📭</div>
            <div class="table-empty__text">No items yet. Add your first item!</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  dashboardTableBody.innerHTML = recent.map(item => {
    const gradient = CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS.burgers;
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<span style="font-size: 24px;">${item.emoji || '🍽️'}</span>`;

    return `
      <tr>
        <td>
          <div class="table-item-info">
            <div class="table-item-image" style="background: ${gradient};">${imgHTML}</div>
            <div>
              <div class="table-item-name">${escapeHtml(item.name)}</div>
              <div class="table-item-desc">${escapeHtml(item.description)}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="category-badge">${getCategoryEmoji(item.category)} ${getCategoryName(item.category)}</span>
        </td>
        <td class="table-price">${formatPrice(item.price)}</td>
        <td>
          <div class="toggle-switch ${item.isAvailable ? 'active' : ''}" onclick="toggleAvailability('${item.id}')" title="${item.isAvailable ? 'Available' : 'Unavailable'}">
            <div class="toggle-switch__dot"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ========== Items Table ========== */
function renderItemsTable() {
  let items = getMenuItems();

  // Filter by search
  if (searchQuery) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.category.toLowerCase().includes(searchQuery)
    );
  }

  if (items.length === 0) {
    itemsTableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="table-empty">
            <div class="table-empty__icon">${searchQuery ? '🔍' : '📭'}</div>
            <div class="table-empty__text">${searchQuery ? 'No items match your search' : 'No items yet. Add your first item!'}</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  itemsTableBody.innerHTML = items.map(item => {
    const gradient = CATEGORY_GRADIENTS[item.category] || CATEGORY_GRADIENTS.burgers;
    const imgHTML = item.image
      ? `<img src="${item.image}" alt="${item.name}">`
      : `<span style="font-size: 24px;">${item.emoji || '🍽️'}</span>`;

    return `
      <tr>
        <td>
          <div class="table-item-info">
            <div class="table-item-image" style="background: ${gradient};">${imgHTML}</div>
            <div>
              <div class="table-item-name">${escapeHtml(item.name)}</div>
              <div class="table-item-desc">${escapeHtml(item.description)}</div>
            </div>
          </div>
        </td>
        <td class="hide-mobile">
          <span class="category-badge">${getCategoryEmoji(item.category)} ${getCategoryName(item.category)}</span>
        </td>
        <td class="table-price">${formatPrice(item.price)}</td>
        <td>
          <div class="toggle-switch ${item.isAvailable ? 'active' : ''}" onclick="toggleAvailability('${item.id}')" title="${item.isAvailable ? 'Available' : 'Unavailable'}">
            <div class="toggle-switch__dot"></div>
          </div>
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn" onclick="openEditModal('${item.id}')" title="Edit">✏️</button>
            <button class="action-btn action-btn--danger" onclick="openDeleteModal('${item.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* ========== Category Stats ========== */
function renderCategoryStats(items) {
  const catGrid = $('#categoryStats');
  const catCounts = {};

  CATEGORIES.forEach(cat => {
    if (cat.id !== 'all') {
      catCounts[cat.id] = {
        name: cat.name,
        icon: cat.icon,
        total: 0,
        available: 0,
      };
    }
  });

  items.forEach(item => {
    if (catCounts[item.category]) {
      catCounts[item.category].total++;
      if (item.isAvailable) catCounts[item.category].available++;
    }
  });

  const colors = ['--orange', '--blue', '--green', '--purple'];
  let i = 0;

  catGrid.innerHTML = Object.entries(catCounts).map(([id, data]) => {
    const colorClass = colors[i % colors.length];
    i++;
    return `
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon${colorClass}">${data.icon}</div>
        <div class="stat-card__value">${data.total}</div>
        <div class="stat-card__label">${data.name} (${data.available} available)</div>
      </div>
    `;
  }).join('');
}

/* ========== Toggle Availability ========== */
function toggleAvailability(id) {
  const item = getMenuItem(id);
  if (item) {
    updateMenuItem(id, { isAvailable: !item.isAvailable });
    refreshAll();
    showToast(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`, 'success');
  }
}

/* ========== Add/Edit Modal ========== */
function openAddModal() {
  editItemId.value = '';
  itemModalTitle.textContent = 'Add New Item';
  itemSubmitBtn.textContent = '+ Add Item';
  itemForm.reset();
  clearImagePreview();
  clearEmojiSelection();
  currentImageData = '';
  itemModalOverlay.classList.add('open');
}

function openEditModal(id) {
  const item = getMenuItem(id);
  if (!item) return;

  editItemId.value = id;
  itemModalTitle.textContent = 'Edit Item';
  itemSubmitBtn.textContent = '💾 Save Changes';

  // Fill form
  itemName.value = item.name;
  itemDesc.value = item.description;
  itemPrice.value = item.price;
  itemCategory.value = item.category;
  itemEmoji.value = item.emoji || '';

  // Emoji selection
  clearEmojiSelection();
  const emojiBtn = document.querySelector(`.emoji-option[data-emoji="${item.emoji}"]`);
  if (emojiBtn) emojiBtn.classList.add('selected');

  // Image
  if (item.image) {
    currentImageData = item.image;
    showImagePreview(item.image);
  } else {
    currentImageData = '';
    clearImagePreview();
  }

  itemModalOverlay.classList.add('open');
}

function closeItemModal() {
  itemModalOverlay.classList.remove('open');
  itemForm.reset();
  clearImagePreview();
  clearEmojiSelection();
  currentImageData = '';
}

function handleItemSubmit(e) {
  e.preventDefault();

  const name = itemName.value.trim();
  const description = itemDesc.value.trim();
  const price = parseFloat(itemPrice.value);
  const category = itemCategory.value;
  const emoji = itemEmoji.value;

  // Validation
  if (!name || !description || !price || !category || !emoji) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (price <= 0) {
    showToast('Price must be greater than 0', 'error');
    return;
  }

  const itemData = {
    name,
    description,
    price,
    category,
    emoji,
    image: currentImageData,
    isAvailable: true,
  };

  const id = editItemId.value;
  if (id) {
    // Edit existing
    const existing = getMenuItem(id);
    itemData.isAvailable = existing ? existing.isAvailable : true;
    updateMenuItem(id, itemData);
    showToast(`${name} updated successfully!`, 'success');
  } else {
    // Add new
    addMenuItem(itemData);
    showToast(`${name} added to the menu!`, 'success');
  }

  closeItemModal();
  refreshAll();
}

/* ========== Image Upload ========== */
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be less than 2MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    currentImageData = event.target.result;
    showImagePreview(currentImageData);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  imagePreview.src = src;
  imagePreview.classList.add('visible');
  imageUploadArea.classList.add('has-image');
  imageUploadIcon.style.display = 'none';
  imageUploadText.style.display = 'none';
  imageRemoveBtn.classList.add('visible');
}

function clearImagePreview() {
  imagePreview.src = '';
  imagePreview.classList.remove('visible');
  imageUploadArea.classList.remove('has-image');
  imageUploadIcon.style.display = 'block';
  imageUploadText.style.display = 'block';
  imageRemoveBtn.classList.remove('visible');
  itemImage.value = '';
}

function removeImage(e) {
  e.stopPropagation();
  currentImageData = '';
  clearImagePreview();
}

function clearEmojiSelection() {
  $$('.emoji-option').forEach(b => b.classList.remove('selected'));
  itemEmoji.value = '';
}

/* ========== Delete Modal ========== */
function openDeleteModal(id) {
  deleteTargetId = id;
  const item = getMenuItem(id);
  if (item) {
    deleteItemNameEl.textContent = `Are you sure you want to delete "${item.name}"? This action cannot be undone.`;
  }
  deleteModalOverlay.classList.add('open');
}

function closeDeleteModal() {
  deleteModalOverlay.classList.remove('open');
  deleteTargetId = null;
}

function confirmDelete() {
  if (deleteTargetId) {
    const item = getMenuItem(deleteTargetId);
    deleteMenuItem(deleteTargetId);
    closeDeleteModal();
    refreshAll();
    showToast(`${item ? item.name : 'Item'} deleted`, 'success');
  }
}

/* ========== Toast ========== */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.innerHTML = `
    <span class="toast__icon">${icon}</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ========== Utility ========== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
