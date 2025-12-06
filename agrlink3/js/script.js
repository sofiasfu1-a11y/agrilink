// ============================================
// DATA STORAGE (File-based using localStorage)
// ============================================

// Initialize storage if not exists
function initStorage() {
    if (!localStorage.getItem('agrilink_users')) {
        localStorage.setItem('agrilink_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('agrilink_products')) {
        // Initialize with empty array - demo products are handled separately in buyer dashboard
        localStorage.setItem('agrilink_products', JSON.stringify([]));
    }
    if (!localStorage.getItem('agrilink_orders')) {
        localStorage.setItem('agrilink_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('agrilink_cart')) {
        localStorage.setItem('agrilink_cart', JSON.stringify([]));
    }
}

// Get data from storage
function getUsers() {
    return JSON.parse(localStorage.getItem('agrilink_users') || '[]');
}

function getProducts() {
    return JSON.parse(localStorage.getItem('agrilink_products') || '[]');
}

function getOrders() {
    return JSON.parse(localStorage.getItem('agrilink_orders') || '[]');
}

function getCart() {
    return JSON.parse(localStorage.getItem('agrilink_cart') || '[]');
}

// Save data to storage
function saveUsers(users) {
    localStorage.setItem('agrilink_users', JSON.stringify(users));
}

function saveProducts(products) {
    localStorage.setItem('agrilink_products', JSON.stringify(products));
}

function saveOrders(orders) {
    localStorage.setItem('agrilink_orders', JSON.stringify(orders));
}

function saveCart(cart) {
    localStorage.setItem('agrilink_cart', JSON.stringify(cart));
}

// Get current user
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('current_user') || 'null');
}

function setCurrentUser(user) {
    sessionStorage.setItem('current_user', JSON.stringify(user));
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initStorage();
    
    // Check if we're on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if we're on farmer dashboard
    if (document.querySelector('.farmer-dashboard')) {
        loadFarmerDashboard();
    }
    
    // Check if we're on buyer dashboard
    if (document.querySelector('.buyer-dashboard')) {
        loadBuyerDashboard();
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const user = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        location: formData.get('location'),
        role: formData.get('role'),
        id: Date.now().toString()
    };
    
    // Save user to storage
    const users = getUsers();
    const existingUser = users.find(u => u.email === user.email);
    if (!existingUser) {
        users.push(user);
        saveUsers(users);
    }
    
    // Set current user
    setCurrentUser(user);
    
    // Redirect based on role
    if (user.role === 'farmer') {
        window.location.href = 'farmer-dashboard.html';
    } else {
        window.location.href = 'buyer-dashboard.html';
    }
}

// ============================================
// FARMER DASHBOARD
// ============================================

function loadFarmerDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'farmer') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display welcome message
    const welcomeBadge = document.querySelector('.welcome-badge');
    if (welcomeBadge) {
        welcomeBadge.textContent = `Welcome, ${currentUser.name}!`;
    }
    
    // Load market prices
    displayMarketPrices(currentUser.location);
    
    // Load farmer's products
    displayFarmerProducts();
    
    // Load orders
    displayFarmerOrders();
    
    // Setup add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Setup search
    const searchInput = document.getElementById('searchProducts');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchProducts);
    }
    
    // Setup sort
    const sortSelect = document.getElementById('sortProducts');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortProducts);
    }
}

function handleAddProduct(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    const formData = new FormData(e.target);
    const product = {
        id: Date.now().toString(),
        farmerName: currentUser.name,
        farmerId: currentUser.id,
        productName: formData.get('productName'),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price')),
        image: formData.get('productImage')
    };
    
    const products = getProducts();
    products.push(product);
    saveProducts(products);
    
    // Reset form
    e.target.reset();
    
    // Refresh display
    displayFarmerProducts();
    
    // Show success message
    showNotification('Product added successfully!', 'success');
}

function displayFarmerProducts() {
    const currentUser = getCurrentUser();
    const products = getProducts().filter(p => p.farmerId === currentUser.id);
    const container = document.getElementById('inventoryList');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No products in inventory. Add your first product!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="inventory-item">
            <div class="inventory-image">${getProductEmoji(product.image)}</div>
            <div class="inventory-details">
                <div class="inventory-name">${product.productName}</div>
                <div class="inventory-meta">Quantity: ${product.quantity} kg | Price: ETB ${product.price}/kg</div>
            </div>
            <div class="product-price">ETB ${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-small btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayFarmerOrders() {
    const currentUser = getCurrentUser();
    const orders = getOrders().filter(o => o.farmerId === currentUser.id);
    const container = document.getElementById('ordersList');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No orders received yet.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div class="order-buyer">${order.buyerName}</div>
                <div class="order-status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</div>
            </div>
            <div class="order-details">
                Product: ${order.productName} | Quantity: ${order.quantity} kg | Total: ETB ${order.total}
            </div>
        </div>
    `).join('');
}

// Get market prices based on location
function getMarketPrices(location) {
    // Demo market price data - in a real app, this would be fetched from an API
    // Prices can vary by location
    const basePrices = {
        'Addis Ababa': [
            { product: "Tomato", avgPrice: 35, image: "tomato.jpg" },
            { product: "Potato", avgPrice: 28, image: "potato.jpg" },
            { product: "Carrot", avgPrice: 30, image: "carrot.jpg" },
            { product: "Apple", avgPrice: 45, image: "apple.jpg" },
            { product: "Onion", avgPrice: 32, image: "onion.jpg" }
        ],
        'Dire Dawa': [
            { product: "Tomato", avgPrice: 33, image: "tomato.jpg" },
            { product: "Potato", avgPrice: 26, image: "potato.jpg" },
            { product: "Carrot", avgPrice: 28, image: "carrot.jpg" },
            { product: "Apple", avgPrice: 42, image: "apple.jpg" },
            { product: "Onion", avgPrice: 30, image: "onion.jpg" }
        ],
        'Hawassa': [
            { product: "Tomato", avgPrice: 32, image: "tomato.jpg" },
            { product: "Potato", avgPrice: 25, image: "potato.jpg" },
            { product: "Carrot", avgPrice: 29, image: "carrot.jpg" },
            { product: "Apple", avgPrice: 40, image: "apple.jpg" },
            { product: "Onion", avgPrice: 31, image: "onion.jpg" }
        ]
    };
    
    // Normalize location for matching (case-insensitive, partial match)
    const normalizedLocation = location ? location.toLowerCase() : '';
    let selectedPrices = basePrices['Addis Ababa']; // Default
    
    // Try to match location
    for (const [city, prices] of Object.entries(basePrices)) {
        if (normalizedLocation.includes(city.toLowerCase()) || city.toLowerCase().includes(normalizedLocation)) {
            selectedPrices = prices;
            break;
        }
    }
    
    return selectedPrices;
}

function displayMarketPrices(location) {
    const marketPrices = getMarketPrices(location);
    const container = document.getElementById('marketPricesContainer');
    
    if (!container) return;
    
    const locationDisplay = location || 'Your Area';
    
    container.innerHTML = `
        <div class="market-prices-header">
            <span class="location-badge">📍 ${locationDisplay}</span>
        </div>
        <div class="market-prices-grid">
            ${marketPrices.map(item => `
                <div class="market-price-card">
                    <div class="market-price-shape">${getProductEmoji(item.image)}</div>
                    <div class="market-price-info">
                        <div class="market-price-product">${item.product}</div>
                        <div class="market-price-amount">ETB ${item.avgPrice}/kg</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function editProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Pre-fill form
    document.getElementById('productName').value = product.productName;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('price').value = product.price;
    document.getElementById('productImage').value = product.image;
    
    // Remove old product
    deleteProduct(productId);
    
    // Scroll to form
    document.getElementById('addProductForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const products = getProducts();
    const filtered = products.filter(p => p.id !== productId);
    saveProducts(filtered);
    displayFarmerProducts();
    showNotification('Product deleted successfully!', 'success');
}

function handleSearchProducts(e) {
    const searchTerm = e.target.value.toLowerCase();
    const currentUser = getCurrentUser();
    const products = getProducts().filter(p => 
        p.farmerId === currentUser.id && 
        p.productName.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('inventoryList');
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No products found matching "${searchTerm}"</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="inventory-item">
            <div class="inventory-image">${getProductEmoji(product.image)}</div>
            <div class="inventory-details">
                <div class="inventory-name">${product.productName}</div>
                <div class="inventory-meta">Quantity: ${product.quantity} kg | Price: ETB ${product.price}/kg</div>
            </div>
            <div class="product-price">ETB ${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-small btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function handleSortProducts(e) {
    const sortBy = e.target.value;
    const currentUser = getCurrentUser();
    let products = getProducts().filter(p => p.farmerId === currentUser.id);
    
    if (sortBy === 'name') {
        products.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortBy === 'quantity') {
        products.sort((a, b) => b.quantity - a.quantity);
    }
    
    // Temporarily save sorted products and re-display
    const container = document.getElementById('inventoryList');
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No products in inventory.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="inventory-item">
            <div class="inventory-image">${getProductEmoji(product.image)}</div>
            <div class="inventory-details">
                <div class="inventory-name">${product.productName}</div>
                <div class="inventory-meta">Quantity: ${product.quantity} kg | Price: ETB ${product.price}/kg</div>
            </div>
            <div class="product-price">ETB ${product.price}</div>
            <div class="product-actions">
                <button class="btn btn-small btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-small btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// BUYER DASHBOARD
// ============================================

function loadBuyerDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'buyer') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display welcome message
    const welcomeBadge = document.querySelector('.welcome-badge');
    if (welcomeBadge) {
        welcomeBadge.textContent = `Welcome, ${currentUser.name}!`;
    }
    
    // Load products
    displayBuyerProducts();
    
    // Load cart
    displayCart();
    
    // Load orders
    displayBuyerOrders();
    
    // Setup filter
    const filterSelect = document.getElementById('filterProducts');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilterProducts);
    }
    
    // Setup sort
    const sortSelect = document.getElementById('sortBuyerProducts');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortBuyerProducts);
    }
}

// Get demo products array
function getDemoProducts() {
    const demoProducts = [
        { 
            name: "Tomato", 
            price: 35, 
            shape: "red-circle", 
            quantity: 50,
            image: "tomato.jpg",
            farmerName: "Demo Farm",
            id: "demo-tomato"
        },
        { 
            name: "Potato", 
            price: 28, 
            shape: "brown-oval", 
            quantity: 40,
            image: "potato.jpg",
            farmerName: "Demo Farm",
            id: "demo-potato"
        },
        { 
            name: "Carrot", 
            price: 30, 
            shape: "orange-triangle", 
            quantity: 25,
            image: "carrot.jpg",
            farmerName: "Demo Farm",
            id: "demo-carrot"
        },
        { 
            name: "Apple", 
            price: 45, 
            shape: "red-circle", 
            quantity: 30,
            image: "apple.jpg",
            farmerName: "Demo Farm",
            id: "demo-apple"
        },
        { 
            name: "Onion", 
            price: 32, 
            shape: "purple-circle", 
            quantity: 20,
            image: "onion.jpg",
            farmerName: "Demo Farm",
            id: "demo-onion"
        }
    ];
    return demoProducts;
}

function displayBuyerProducts() {
    // Get demo products
    const demoProducts = getDemoProducts();
    
    // Get real products from storage (filter out demo products that might be in storage)
    const realProducts = getProducts().filter(p => !p.id.startsWith('demo-'));
    
    // Merge arrays for display
    const allProducts = [...demoProducts, ...realProducts];
    
    const container = document.getElementById('productsGrid');
    
    if (!container) return;
    
    if (allProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌾</div>
                <div class="empty-state-text">No products available. Check back later!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allProducts.map(product => {
        const isDemo = product.id && product.id.startsWith('demo-');
        const productName = product.productName || product.name;
        const productImage = product.image || getImageFromShape(product.shape);
        
        return `
        <div class="product-card ${isDemo ? 'demo-product' : ''}">
            ${isDemo ? '<div class="demo-badge">DEMO</div>' : ''}
            <div class="product-image">${getProductEmoji(productImage)}</div>
            <div class="product-name">${productName}</div>
            <div class="product-info">Farmer: ${product.farmerName}</div>
            <div class="product-info">Available: ${product.quantity} kg</div>
            <div class="product-price">ETB ${product.price}/kg</div>
            <button class="btn btn-add-cart" onclick="addToCart('${product.id}', ${isDemo})">
                Add to Cart
            </button>
        </div>
    `;
    }).join('');
}

// Helper function to map shape to image name
function getImageFromShape(shape) {
    const shapeMap = {
        'red-circle': 'tomato.jpg',
        'brown-oval': 'potato.jpg',
        'orange-triangle': 'carrot.jpg',
        'purple-circle': 'onion.jpg'
    };
    return shapeMap[shape] || 'tomato.jpg';
}

function addToCart(productId, isDemo = false) {
    let product;
    
    if (isDemo) {
        // Handle demo products
        const demoProducts = getDemoProducts();
        product = demoProducts.find(p => p.id === productId);
        if (!product) return;
        
        // Convert demo product to standard format
        product = {
            id: product.id,
            productName: product.name,
            farmerName: product.farmerName,
            price: product.price,
            quantity: product.quantity,
            image: product.image
        };
    } else {
        // Handle real products from storage
        const products = getProducts();
        product = products.find(p => p.id === productId);
        if (!product) return;
    }
    
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.quantity) {
            existingItem.quantity += 1;
        } else {
            showNotification('Not enough quantity available!', 'error');
            return;
        }
    } else {
        cart.push({
            productId: product.id,
            productName: product.productName,
            farmerName: product.farmerName,
            price: product.price,
            quantity: 1,
            image: product.image,
            isDemo: isDemo
        });
    }
    
    saveCart(cart);
    displayCart();
    showNotification('Added to cart!', 'success');
}

function displayCart() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <div class="empty-state-text">Your cart is empty. Start shopping!</div>
            </div>
        `;
        if (totalContainer) {
            totalContainer.textContent = 'ETB 0';
        }
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-image">${getProductEmoji(item.image)}</div>
                <div>
                    <div class="product-name">${item.productName}</div>
                    <div class="product-info">Farmer: ${item.farmerName}</div>
                    <div class="product-info">ETB ${item.price}/kg</div>
                </div>
                <div class="product-info">Qty: ${item.quantity}</div>
                <div class="product-price">ETB ${itemTotal}</div>
            </div>
        `;
    }).join('');
    
    if (totalContainer) {
        totalContainer.textContent = `ETB ${total.toFixed(2)}`;
    }
}

function removeFromCart(productId) {
    const cart = getCart();
    const filtered = cart.filter(item => item.productId !== productId);
    saveCart(filtered);
    displayCart();
    showNotification('Item removed from cart!', 'success');
}

// Show payment modal
function showPaymentModal() {
    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const modal = document.getElementById('paymentModal');
    if (!modal) return;
    
    // Calculate total
    let total = 0;
    const cartItemsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="payment-item">
                <div class="payment-item-info">
                    <span class="payment-item-name">${item.productName}</span>
                    <span class="payment-item-details">${item.quantity} kg × ETB ${item.price}</span>
                </div>
                <span class="payment-item-total">ETB ${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('paymentCartItems').innerHTML = cartItemsHtml;
    document.getElementById('paymentTotal').textContent = `ETB ${total.toFixed(2)}`;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Reset button state
    const btn = document.getElementById('simulatePaymentBtn');
    if (btn) {
        btn.disabled = false;
        btn.querySelector('.payment-btn-text').textContent = '💳 Simulate Payment';
        btn.querySelector('.payment-btn-text').style.display = 'inline';
        btn.querySelector('.payment-btn-loading').style.display = 'none';
        btn.classList.remove('btn-success', 'btn-error', 'processing');
    }
    
    // Clear and reset input fields
    const accountNumberInput = document.getElementById('accountNumber');
    const passcodeInput = document.getElementById('passcode');
    if (accountNumberInput) {
        accountNumberInput.value = '';
        accountNumberInput.classList.remove('input-error');
    }
    if (passcodeInput) {
        passcodeInput.value = '';
        passcodeInput.classList.remove('input-error');
    }
    
    // Remove any existing payment messages
    const existingMessage = document.querySelector('.payment-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Close modal when clicking outside
    modal.onclick = function(e) {
        if (e.target === modal) {
            closePaymentModal();
        }
    };
}

// Close payment modal
function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear input fields
        const accountNumberInput = document.getElementById('accountNumber');
        const passcodeInput = document.getElementById('passcode');
        if (accountNumberInput) {
            accountNumberInput.value = '';
            accountNumberInput.classList.remove('input-error');
        }
        if (passcodeInput) {
            passcodeInput.value = '';
            passcodeInput.classList.remove('input-error');
        }
        
        // Remove any payment messages
        const existingMessage = document.querySelector('.payment-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
}

// Simulate payment process
function simulatePayment() {
    // Get input values
    const accountNumber = document.getElementById('accountNumber').value.trim();
    const passcode = document.getElementById('passcode').value.trim();
    const accountNumberInput = document.getElementById('accountNumber');
    const passcodeInput = document.getElementById('passcode');
    
    // Validate inputs
    if (!accountNumber || !passcode) {
        // Show alert
        showNotification('Please enter your account number and passcode.', 'error');
        
        // Highlight empty fields
        if (!accountNumber) {
            accountNumberInput.classList.add('input-error');
            accountNumberInput.focus();
        }
        if (!passcode) {
            passcodeInput.classList.add('input-error');
            if (accountNumber) {
                passcodeInput.focus();
            }
        }
        
        // Remove error class after a delay
        setTimeout(() => {
            accountNumberInput.classList.remove('input-error');
            passcodeInput.classList.remove('input-error');
        }, 3000);
        
        return;
    }
    
    // Clear any previous error states
    accountNumberInput.classList.remove('input-error');
    passcodeInput.classList.remove('input-error');
    
    const btn = document.getElementById('simulatePaymentBtn');
    const btnText = btn.querySelector('.payment-btn-text');
    const btnLoading = btn.querySelector('.payment-btn-loading');
    
    // Show loading state
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.classList.add('processing');
    
    // Simulate payment processing (1.5 seconds)
    setTimeout(() => {
        // Randomize success/failure for demo (80% success rate)
        // For demo: if account number is "1234567890123456" and passcode is "1234", always succeed
        let isSuccess;
        if (accountNumber === '1234567890123456' && passcode === '1234') {
            isSuccess = true; // Demo credentials always succeed
        } else {
            isSuccess = Math.random() > 0.2; // 80% success rate for other inputs
        }
        
        if (isSuccess) {
            // Payment successful
            btn.classList.remove('processing');
            btn.classList.add('btn-success');
            btnText.textContent = '✓ Payment Successful!';
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            
            // Show success message
            showPaymentMessage('Payment Successful! Your order has been completed.', 'success');
            
            // Process order after short delay
            setTimeout(() => {
                processOrderAfterPayment();
                closePaymentModal();
            }, 1500);
        } else {
            // Payment failed
            btn.classList.remove('processing');
            btn.classList.add('btn-error');
            btnText.textContent = '✗ Payment Failed';
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            
            // Show error message
            showPaymentMessage('Payment Failed. Check account number or passcode.', 'error');
            
            // Highlight input fields on failure
            accountNumberInput.classList.add('input-error');
            passcodeInput.classList.add('input-error');
            
            // Reset button after delay
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('btn-error');
                btnText.textContent = '💳 Simulate Payment';
                accountNumberInput.classList.remove('input-error');
                passcodeInput.classList.remove('input-error');
            }, 2000);
        }
    }, 1500);
}

// Show payment message
function showPaymentMessage(message, type) {
    const modalBody = document.querySelector('.payment-modal-body');
    if (!modalBody) return;
    
    // Remove existing message if any
    const existingMessage = modalBody.querySelector('.payment-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `payment-message payment-message-${type}`;
    messageDiv.textContent = message;
    modalBody.appendChild(messageDiv);
    
    // Auto-remove after 3 seconds if success
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

// Process order after successful payment
function processOrderAfterPayment() {
    const cart = getCart();
    if (cart.length === 0) return;
    
    const currentUser = getCurrentUser();
    const products = getProducts();
    
    // Create orders with "Confirmed" status after payment
    cart.forEach(item => {
        // Handle demo products
        let product;
        if (item.isDemo) {
            // For demo products, create a mock product entry
            product = {
                id: item.productId,
                farmerId: 'demo-farmer',
                farmerName: 'Demo Farm',
                quantity: item.quantity
            };
        } else {
            product = products.find(p => p.id === item.productId);
        }
        
        if (product) {
            const order = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                buyerId: currentUser.id,
                buyerName: currentUser.name,
                farmerId: product.farmerId || 'demo-farmer',
                farmerName: product.farmerName || item.farmerName || 'Demo Farm',
                productName: item.productName,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                status: 'Confirmed', // Changed from 'Pending' to 'Confirmed' after payment
                paymentStatus: 'Paid',
                date: new Date().toISOString()
            };
            
            const orders = getOrders();
            orders.push(order);
            saveOrders(orders);
            
            // Update product quantity (only for real products)
            if (!item.isDemo && product.quantity !== undefined) {
                product.quantity -= item.quantity;
            }
        }
    });
    
    // Clear cart
    saveCart([]);
    if (!cart.some(item => item.isDemo)) {
        saveProducts(products);
    }
    
    displayCart();
    displayBuyerOrders();
    displayBuyerProducts();
    
    showNotification('Order placed successfully! Payment confirmed.', 'success');
}

// Legacy checkout function (kept for compatibility, but now calls payment modal)
function checkout() {
    showPaymentModal();
}

function displayBuyerOrders() {
    const currentUser = getCurrentUser();
    const orders = getOrders().filter(o => o.buyerId === currentUser.id);
    const container = document.getElementById('buyerOrdersList');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">No orders yet. Place your first order!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div class="order-buyer">${order.productName} from ${order.farmerName}</div>
                <div class="order-status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</div>
            </div>
            <div class="order-details">
                Quantity: ${order.quantity} kg | Total: ETB ${order.total}
            </div>
        </div>
    `).join('');
}

function handleFilterProducts(e) {
    const filter = e.target.value;
    
    // Get demo products and real products
    const demoProducts = getDemoProducts();
    const realProducts = getProducts().filter(p => !p.id.startsWith('demo-'));
    
    // Merge arrays
    let allProducts = [...demoProducts, ...realProducts];
    
    if (filter !== 'all') {
        // Filter based on product name
        allProducts = allProducts.filter(p => {
            const name = (p.productName || p.name).toLowerCase();
            if (filter === 'vegetables') {
                return ['tomato', 'potato', 'carrot', 'onion', 'cabbage'].some(v => name.includes(v));
            } else if (filter === 'fruits') {
                return ['apple', 'banana', 'orange', 'mango'].some(v => name.includes(v));
            } else if (filter === 'grains') {
                return ['wheat', 'rice', 'corn', 'barley'].some(v => name.includes(v));
            }
            return true;
        });
    }
    
    const container = document.getElementById('productsGrid');
    if (allProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌾</div>
                <div class="empty-state-text">No products found in this category.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allProducts.map(product => {
        const isDemo = product.id && product.id.startsWith('demo-');
        const productName = product.productName || product.name;
        const productImage = product.image || getImageFromShape(product.shape);
        
        return `
        <div class="product-card ${isDemo ? 'demo-product' : ''}">
            ${isDemo ? '<div class="demo-badge">DEMO</div>' : ''}
            <div class="product-image">${getProductEmoji(productImage)}</div>
            <div class="product-name">${productName}</div>
            <div class="product-info">Farmer: ${product.farmerName}</div>
            <div class="product-info">Available: ${product.quantity} kg</div>
            <div class="product-price">ETB ${product.price}/kg</div>
            <button class="btn btn-add-cart" onclick="addToCart('${product.id}', ${isDemo})">
                Add to Cart
            </button>
        </div>
    `;
    }).join('');
}

function handleSortBuyerProducts(e) {
    const sortBy = e.target.value;
    
    // Get demo products and real products
    const demoProducts = getDemoProducts();
    const realProducts = getProducts().filter(p => !p.id.startsWith('demo-'));
    
    // Merge arrays
    let allProducts = [...demoProducts, ...realProducts];
    
    if (sortBy === 'price-low') {
        allProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        allProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'quantity') {
        allProducts.sort((a, b) => b.quantity - a.quantity);
    }
    
    const container = document.getElementById('productsGrid');
    if (allProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌾</div>
                <div class="empty-state-text">No products available.</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allProducts.map(product => {
        const isDemo = product.id && product.id.startsWith('demo-');
        const productName = product.productName || product.name;
        const productImage = product.image || getImageFromShape(product.shape);
        
        return `
        <div class="product-card ${isDemo ? 'demo-product' : ''}">
            ${isDemo ? '<div class="demo-badge">DEMO</div>' : ''}
            <div class="product-image">${getProductEmoji(productImage)}</div>
            <div class="product-name">${productName}</div>
            <div class="product-info">Farmer: ${product.farmerName}</div>
            <div class="product-info">Available: ${product.quantity} kg</div>
            <div class="product-price">ETB ${product.price}/kg</div>
            <button class="btn btn-add-cart" onclick="addToCart('${product.id}', ${isDemo})">
                Add to Cart
            </button>
        </div>
    `;
    }).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getProductEmoji(imageName) {
    const emojiMap = {
        'tomato.jpg': '🍅',
        'potato.jpg': '🥔',
        'carrot.jpg': '🥕',
        'onion.jpg': '🧅',
        'cabbage.jpg': '🥬',
        'apple.jpg': '🍎'
    };
    return emojiMap[imageName] || '🌾';
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-family: 'Roboto', sans-serif;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

