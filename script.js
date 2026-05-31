/**
 * Visual Rooms E-commerce Experience - Single Page Application (SPA)
 * Implements routing, state management, decoupling, and secure DOM injection.
 */

// 1. STATE MANAGEMENT
const AppState = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    cartItems: [], // Array of objects: { id, roomId, name, price, hours }
    roomRatings: {
        1: 0,
        2: 0,
        3: 0
    }
};

// 2. DOM REFERENCES
const DOM = {
    body: document.body,
    
    // Theme
    darkToggleBtns: document.querySelectorAll('.js-dark-toggle, .js-dark-toggle-alt'),
    iconMoon: document.querySelector('.icon-moon'),
    iconSun: document.querySelector('.icon-sun'),
    
    // Navigation & SPA
    menuToggleBtn: document.querySelector('.js-menu-toggle'),
    sidebar: document.querySelector('.js-sidebar'),
    sidebarOverlay: document.querySelector('.js-sidebar-overlay'),
    navLinks: document.querySelectorAll('.js-nav-link'),
    sections: document.querySelectorAll('.page-section'),
    
    // Rating
    rateBtns: document.querySelectorAll('.js-rate-btn'),
    
    // Cart & Products
    addToCartBtns: document.querySelectorAll('.js-add-to-cart'),
    cartBadge: document.querySelector('.js-cart-count'),
    cartContent: document.querySelector('.js-cart-content'),
    totalHoursDisplay: document.querySelector('.js-total-hours'),
    cartTotalDisplay: document.querySelector('.js-cart-total'),
    
    // Checkout
    checkoutBtn: document.querySelector('.js-checkout-btn'),
    successModal: document.querySelector('.js-success-modal'),
    closeModalBtn: document.querySelector('.js-close-modal')
};

// 3. INITIALIZATION
function init() {
    applyTheme();
    bindEvents();
    renderRatings();
}

// 4. EVENT BINDING
function bindEvents() {
    // Theme
    DOM.darkToggleBtns.forEach(btn => btn.addEventListener('click', toggleDarkMode));
    
    // Sidebar
    DOM.menuToggleBtn.addEventListener('click', toggleMenu);
    DOM.sidebarOverlay.addEventListener('click', toggleMenu);
    
    // SPA Navigation
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Ratings
    DOM.rateBtns.forEach(btn => {
        btn.addEventListener('click', handleRating);
    });

    // Add to Cart
    DOM.addToCartBtns.forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Checkout
    DOM.checkoutBtn.addEventListener('click', handleCheckout);
    DOM.closeModalBtn.addEventListener('click', handleCloseModal);
}

// 5. PROCESS & OUTPUT (SPA ROUTING)
function handleNavigation(event) {
    event.preventDefault();
    const targetId = event.currentTarget.dataset.target;
    
    // Hide all sections
    DOM.sections.forEach(sec => sec.classList.remove('is-active'));
    
    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('is-active');
    }

    // Close sidebar if on mobile
    DOM.sidebar.classList.remove('is-open');
    DOM.sidebarOverlay.classList.remove('is-active');

    // If navigating to cart, render it
    if (targetId === 'page-cart') {
        renderCart();
    }
}

// --- Dark Mode Logic ---
function toggleDarkMode() {
    AppState.isDarkMode = !AppState.isDarkMode;
    localStorage.setItem('theme', AppState.isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    if (AppState.isDarkMode) {
        DOM.body.classList.add('dark-mode');
        if(DOM.iconMoon) DOM.iconMoon.style.display = 'none';
        if(DOM.iconSun) DOM.iconSun.style.display = 'block';
    } else {
        DOM.body.classList.remove('dark-mode');
        if(DOM.iconMoon) DOM.iconMoon.style.display = 'block';
        if(DOM.iconSun) DOM.iconSun.style.display = 'none';
    }
}

// --- Sidebar Menu Logic ---
function toggleMenu() {
    DOM.sidebar.classList.toggle('is-open');
    DOM.sidebarOverlay.classList.toggle('is-active');
}

// --- Room Rating Logic ---
function handleRating(event) {
    const btn = event.currentTarget;
    const roomId = btn.dataset.room;
    const action = btn.dataset.action;

    if (action === 'plus' && AppState.roomRatings[roomId] < 5) {
        AppState.roomRatings[roomId]++;
    } else if (action === 'minus' && AppState.roomRatings[roomId] > 0) {
        AppState.roomRatings[roomId]--;
    }

    renderRatings();
}

function renderRatings() {
    Object.keys(AppState.roomRatings).forEach(roomId => {
        const display = document.getElementById(`rating-${roomId}`);
        if (display) {
            display.textContent = AppState.roomRatings[roomId];
        }
    });
}

// --- Add to Cart Logic ---
function handleAddToCart(event) {
    const btn = event.currentTarget;
    const roomId = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    
    // Get hours from the adjacent input
    const hoursInput = document.getElementById(`hours-${roomId}`);
    const hours = parseInt(hoursInput.value) || 1;

    // Check if room is already in cart
    const existingItem = AppState.cartItems.find(item => item.roomId === roomId);
    if (existingItem) {
        // Prompt user for update instead of adding duplicate
        const newTotal = prompt(`You already added ${name} for ${existingItem.hours} hours. Enter the new TOTAL hours you need:`, existingItem.hours);
        if (newTotal !== null && parseInt(newTotal) > 0) {
            existingItem.hours = parseInt(newTotal);
            // Visual Feedback for update
            const originalText = btn.textContent;
            btn.textContent = 'Updated ✓';
            setTimeout(() => btn.textContent = originalText, 2000);
        }
        return;
    }

    // Visual Feedback for adding
    btn.classList.add('is-loading');
    const originalText = btn.textContent;
    btn.textContent = 'Adding...';

    setTimeout(() => {
        // Update State
        AppState.cartItems.push({
            id: roomId + Date.now(), // unique cart item id
            roomId,
            name,
            price,
            hours
        });

        updateCartBadge();

        // Reset Button
        btn.classList.remove('is-loading');
        btn.textContent = 'Added ✓';
        setTimeout(() => btn.textContent = originalText, 2000);
    }, 500);
}

function updateCartBadge() {
    DOM.cartBadge.textContent = AppState.cartItems.length;
    DOM.cartBadge.classList.add('is-bumping');
    setTimeout(() => DOM.cartBadge.classList.remove('is-bumping'), 300);
}

// --- Render Cart View ---
function renderCart() {
    // Clear current content
    DOM.cartContent.innerHTML = '';

    if (AppState.cartItems.length === 0) {
        DOM.cartContent.innerHTML = `<div class="empty-cart-msg">Your cart is empty. <br><br> <button class="btn-primary js-nav-link" data-target="page-catalog">Browse Rooms</button></div>`;
        // Re-bind dynamically injected navigation link
        const newLink = DOM.cartContent.querySelector('.js-nav-link');
        if (newLink) newLink.addEventListener('click', handleNavigation);
        
        DOM.totalHoursDisplay.textContent = '0';
        DOM.cartTotalDisplay.textContent = '0';
        return;
    }

    let totalHours = 0;
    let totalPrice = 0;

    AppState.cartItems.forEach(item => {
        const itemTotal = item.price * item.hours;
        totalHours += item.hours;
        totalPrice += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        
        // Creating structure safely
        cartItemEl.innerHTML = `
            <div class="cart-item-details">
                <h3 class="js-item-name"></h3>
                <p>$<span class="js-item-price"></span>/hr</p>
                <div class="cart-item-actions">
                    <label for="cart-update-${item.id}">Hrs:</label>
                    <input type="number" id="cart-update-${item.id}" class="hours-input js-cart-update-input" min="1" data-id="${item.id}">
                    <button class="btn-remove js-cart-remove-btn" data-id="${item.id}">Remove</button>
                </div>
            </div>
            <div class="cart-item-price">
                $<span class="js-item-total"></span>
            </div>
        `;

        // Injecting data safely via textContent and value properties
        cartItemEl.querySelector('.js-item-name').textContent = item.name;
        cartItemEl.querySelector('.js-item-price').textContent = item.price;
        cartItemEl.querySelector('.js-item-total').textContent = itemTotal;
        cartItemEl.querySelector('.js-cart-update-input').value = item.hours;

        // Bind update listener
        cartItemEl.querySelector('.js-cart-update-input').addEventListener('change', (e) => {
            const newHours = parseInt(e.target.value);
            if(newHours > 0) {
                updateCartItem(item.id, newHours);
            } else {
                e.target.value = item.hours; // revert if invalid
            }
        });

        // Bind remove listener
        cartItemEl.querySelector('.js-cart-remove-btn').addEventListener('click', () => {
            removeCartItem(item.id);
        });

        DOM.cartContent.appendChild(cartItemEl);
    });

    DOM.totalHoursDisplay.textContent = totalHours;
    DOM.cartTotalDisplay.textContent = totalPrice;
}

// --- Cart Update & Remove Logic ---
function updateCartItem(cartItemId, newHours) {
    const item = AppState.cartItems.find(i => i.id === cartItemId);
    if (item) {
        item.hours = newHours;
        renderCart(); // Re-render to update totals
    }
}

function removeCartItem(cartItemId) {
    AppState.cartItems = AppState.cartItems.filter(i => i.id !== cartItemId);
    updateCartBadge();
    renderCart();
}

// --- Checkout Logic ---
function handleCheckout() {
    if (AppState.cartItems.length === 0) return;

    const originalText = DOM.checkoutBtn.textContent;
    DOM.checkoutBtn.classList.add('is-loading');
    DOM.checkoutBtn.textContent = 'Processing...';

    setTimeout(() => {
        // Show success modal
        DOM.successModal.classList.add('is-active');
        
        // Clear Cart State
        AppState.cartItems = [];
        DOM.cartBadge.textContent = '0';
        renderCart();

        // Reset btn
        DOM.checkoutBtn.classList.remove('is-loading');
        DOM.checkoutBtn.textContent = originalText;
    }, 1500);
}

function handleCloseModal() {
    DOM.successModal.classList.remove('is-active');
    
    // Navigate to Home
    DOM.sections.forEach(sec => sec.classList.remove('is-active'));
    document.getElementById('page-home').classList.add('is-active');
}

// Start application
init();
