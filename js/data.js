/* =============================================
   FOODIES — Shared Data Layer
   localStorage-based menu management
   ============================================= */

const STORAGE_KEY = 'foodies_menu_items';
const ADMIN_KEY = 'foodies_admin_auth';
const ADMIN_PASSWORD = 'foodies2024';
const WHATSAPP_NUMBER = '923012980226';

/* ---------- Category Definitions ---------- */
const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'burgers', name: 'Burgers', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'fries', name: 'Fries & Sides', icon: '🍟' },
  { id: 'wraps', name: 'Wraps', icon: '🌯' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];

/* ---------- Category Gradient Colors ---------- */
const CATEGORY_GRADIENTS = {
  burgers: 'linear-gradient(135deg, #ff6b35 0%, #d63031 100%)',
  pizza: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
  fries: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
  wraps: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
  drinks: 'linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)',
  desserts: 'linear-gradient(135deg, #e84393 0%, #fd79a8 100%)',
};

/* ---------- Default Seed Menu Items ---------- */
const DEFAULT_ITEMS = [
  {
    id: 'item_1',
    name: 'Zinger Burger',
    description: 'Crispy fried chicken fillet with spicy mayo, fresh lettuce & sesame bun',
    price: 650,
    category: 'burgers',
    image: '',
    emoji: '🍔',
    isAvailable: true,
  },
  {
    id: 'item_2',
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with cheddar cheese, pickles, onions & secret sauce',
    price: 750,
    category: 'burgers',
    image: '',
    emoji: '🍔',
    isAvailable: true,
  },
  {
    id: 'item_3',
    name: 'Chicken Cheese Burger',
    description: 'Grilled chicken breast with melted mozzarella, jalapeños & garlic aioli',
    price: 700,
    category: 'burgers',
    image: '',
    emoji: '🧀',
    isAvailable: true,
  },
  {
    id: 'item_4',
    name: 'Double Smash Burger',
    description: 'Two smashed beef patties with American cheese, caramelized onions & smoky sauce',
    price: 900,
    category: 'burgers',
    image: '',
    emoji: '🔥',
    isAvailable: true,
  },
  {
    id: 'item_5',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella cheese on hand-tossed dough — 12 inch',
    price: 1200,
    category: 'pizza',
    image: '',
    emoji: '🍕',
    isAvailable: true,
  },
  {
    id: 'item_6',
    name: 'Chicken Tikka Pizza',
    description: 'Spicy tikka chicken, bell peppers, onions with special desi sauce — 12 inch',
    price: 1350,
    category: 'pizza',
    image: '',
    emoji: '🍕',
    isAvailable: true,
  },
  {
    id: 'item_7',
    name: 'Fajita Pizza',
    description: 'Chicken fajita with mushrooms, olives & mozzarella blend — 12 inch',
    price: 1300,
    category: 'pizza',
    image: '',
    emoji: '🍕',
    isAvailable: true,
  },
  {
    id: 'item_8',
    name: 'Loaded Fries',
    description: 'Crispy fries topped with cheese sauce, jalapeños & chicken chunks',
    price: 450,
    category: 'fries',
    image: '',
    emoji: '🍟',
    isAvailable: true,
  },
  {
    id: 'item_9',
    name: 'Regular Fries',
    description: 'Golden crispy french fries with ketchup & seasoning salt',
    price: 250,
    category: 'fries',
    image: '',
    emoji: '🍟',
    isAvailable: true,
  },
  {
    id: 'item_10',
    name: 'Mozzarella Sticks',
    description: 'Golden fried mozzarella sticks served with marinara dipping sauce',
    price: 400,
    category: 'fries',
    image: '',
    emoji: '🧀',
    isAvailable: true,
  },
  {
    id: 'item_11',
    name: 'Chicken Wrap',
    description: 'Grilled chicken strips with fresh veggies, ranch sauce in a tortilla wrap',
    price: 500,
    category: 'wraps',
    image: '',
    emoji: '🌯',
    isAvailable: true,
  },
  {
    id: 'item_12',
    name: 'Spicy Shawarma',
    description: 'Middle Eastern style chicken shawarma with garlic sauce & pickled turnips',
    price: 450,
    category: 'wraps',
    image: '',
    emoji: '🌯',
    isAvailable: true,
  },
  {
    id: 'item_13',
    name: 'Coca Cola',
    description: 'Ice cold Coca Cola 500ml bottle — the classic refreshment',
    price: 150,
    category: 'drinks',
    image: '',
    emoji: '🥤',
    isAvailable: true,
  },
  {
    id: 'item_14',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime soda with mint leaves & crushed ice',
    price: 200,
    category: 'drinks',
    image: '',
    emoji: '🍋',
    isAvailable: true,
  },
  {
    id: 'item_15',
    name: 'Mango Shake',
    description: 'Thick creamy mango milkshake made with fresh mangoes & ice cream',
    price: 350,
    category: 'drinks',
    image: '',
    emoji: '🥭',
    isAvailable: true,
  },
  {
    id: 'item_16',
    name: 'Chocolate Brownie',
    description: 'Warm fudge brownie with vanilla ice cream & chocolate drizzle',
    price: 350,
    category: 'desserts',
    image: '',
    emoji: '🍫',
    isAvailable: true,
  },
  {
    id: 'item_17',
    name: 'Molten Lava Cake',
    description: 'Rich chocolate cake with a gooey molten center, served with cream',
    price: 400,
    category: 'desserts',
    image: '',
    emoji: '🎂',
    isAvailable: true,
  },
  {
    id: 'item_18',
    name: 'Chicken Nuggets (10pc)',
    description: 'Tender chicken nuggets with your choice of BBQ, ranch or honey mustard sauce',
    price: 500,
    category: 'fries',
    image: '',
    emoji: '🍗',
    isAvailable: true,
  },
];

/* ========== CRUD Operations ========== */

function getMenuItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
    return [...DEFAULT_ITEMS];
  }
  return JSON.parse(data);
}

function saveMenuItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getMenuItem(id) {
  return getMenuItems().find(item => item.id === id) || null;
}

function addMenuItem(item) {
  const items = getMenuItems();
  item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  items.push(item);
  saveMenuItems(items);
  return item;
}

function updateMenuItem(id, updates) {
  const items = getMenuItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates, id };
    saveMenuItems(items);
    return items[index];
  }
  return null;
}

function deleteMenuItem(id) {
  const items = getMenuItems().filter(item => item.id !== id);
  saveMenuItems(items);
}

function deleteMultipleItems(ids) {
  const items = getMenuItems().filter(item => !ids.includes(item.id));
  saveMenuItems(items);
}

function getAvailableItems() {
  return getMenuItems().filter(item => item.isAvailable);
}

function getItemsByCategory(category) {
  if (category === 'all') return getAvailableItems();
  return getAvailableItems().filter(item => item.category === category);
}

function resetToDefaults() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
}

/* ========== WhatsApp Integration ========== */

function generateWhatsAppLink(cart, customer, total) {
  // Using Unicode escapes so emojis work regardless of file encoding
  var burger = '\ud83c\udf54';      // burger emoji
  var clipboard = '\ud83d\udccb';    // clipboard
  var person = '\ud83d\udc64';       // person
  var phone = '\ud83d\udcde';        // phone
  var pin = '\ud83d\udccd';          // pin
  var city = '\ud83c\udfd9\ufe0f';   // city
  var memo = '\ud83d\udcdd';         // memo
  var trolley = '\ud83d\uded2';      // cart
  var money = '\ud83d\udcb0';        // money bag
  var pray = '\ud83d\ude4f';         // pray

  var line = '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501';

  var msg = burger + ' *FOODIES - New Order!*\n\n';
  msg += line + '\n';
  msg += clipboard + ' *Customer Details:*\n';
  msg += person + ' Name: ' + customer.name + '\n';
  msg += phone + ' Phone: ' + customer.phone + '\n';
  msg += pin + ' Address: ' + customer.address + '\n';
  msg += city + ' City: ' + customer.city + '\n';
  if (customer.notes) {
    msg += memo + ' Notes: ' + customer.notes + '\n';
  }
  msg += line + '\n\n';
  msg += trolley + ' *Order Items:*\n';

  cart.forEach(function(item, i) {
    var subtotal = item.price * item.quantity;
    msg += '  ' + (i + 1) + '. ' + item.quantity + 'x ' + item.name + ' - Rs. ' + subtotal.toLocaleString() + '\n';
  });

  msg += '\n' + line + '\n';
  msg += money + ' *Total: Rs. ' + total.toLocaleString() + '*\n';
  msg += line + '\n\n';
  msg += 'Thank you for choosing Foodies! ' + pray;

  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
}

/* ========== Utility ========== */

function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString();
}

function getCategoryName(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat.name : catId;
}

function getCategoryEmoji(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  return cat ? cat.icon : '🍽️';
}
