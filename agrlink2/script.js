// Initialize localStorage data structures
function initializeStorage() {
    if (!localStorage.getItem('userInfo')) {
        localStorage.setItem('userInfo', JSON.stringify({}));
    }
    if (!localStorage.getItem('farmerProducts')) {
        localStorage.setItem('farmerProducts', JSON.stringify([]));
    }
    if (!localStorage.getItem('buyerCart')) {
        localStorage.setItem('buyerCart', JSON.stringify([]));
    }
    if (!localStorage.getItem('farmerOrders')) {
        // Initialize with sample orders
        const sampleOrders = [
            { buyer: 'Buyer A', product: 'Potatoes', quantity: 20, price: 500 },
            { buyer: 'Buyer B', product: 'Tomatoes', quantity: 5, price: 150 }
        ];
        localStorage.setItem('farmerOrders', JSON.stringify(sampleOrders));
    }
}

// Product image mapping
const productImages = {
    'potato': '🥔',
    'tomato': '🍅',
    'onion': '🧅',
    'green-pepper': '🫑',
    'carrot': '🥕',
    'teff': '🌾',
    'wheat': '🌾',
    'avocado': '🥑'
};

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    // Load data when specific pages are shown
    if (pageId === 'my-products') {
        loadMyProducts();
    } else if (pageId === 'orders-received') {
        loadOrdersReceived();
    } else if (pageId === 'buyer-homepage') {
        loadBuyerProducts();
        updateCartCount();
    } else if (pageId === 'cart') {
        loadCart();
    } else if (pageId === 'checkout') {
        loadCheckout();
    }
}

// Login/Signup form handler
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userInfo = {
        fullName: document.getElementById('fullName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        email: document.getElementById('email').value,
        location: document.getElementById('location').value,
        role: document.getElementById('role').value
    };
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    if (userInfo.role === 'farmer') {
        showPage('farmer-dashboard');
    } else if (userInfo.role === 'buyer') {
        showBuyerHomepage();
    }
});

// Logout function
function logout() {
    localStorage.removeItem('userInfo');
    showPage('login-page');
    document.getElementById('login-form').reset();
}

// Add Product form handler
document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const product = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        quantity: parseInt(document.getElementById('quantity').value),
        price: parseInt(document.getElementById('price').value),
        image: document.getElementById('productImage').value,
        farmer: JSON.parse(localStorage.getItem('userInfo')).fullName
    };
    
    const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
    products.push(product);
    localStorage.setItem('farmerProducts', JSON.stringify(products));
    
    alert('Product added successfully!');
    document.getElementById('add-product-form').reset();
    showPage('farmer-dashboard');
});

// Load My Products
function loadMyProducts() {
    const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const myProducts = products.filter(p => p.farmer === userInfo.fullName);
    
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    if (myProducts.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No products added yet. <a href="#" onclick="showPage(\'add-product\')" style="color: var(--primary-green);">Add your first product</a></p>';
        return;
    }
    
    myProducts.forEach(product => {
        const card = createProductCard(product, false);
        grid.appendChild(card);
    });
}

// Load Orders Received
function loadOrdersReceived() {
    const orders = JSON.parse(localStorage.getItem('farmerOrders') || '[]');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No orders received yet.</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <h3>${order.buyer}</h3>
            <p>Ordered ${order.quantity}kg ${order.product}</p>
            <p style="color: var(--primary-green); font-weight: 600;">Total: ${order.price} ETB</p>
        `;
        ordersList.appendChild(orderItem);
    });
}

// Load Buyer Products
function loadBuyerProducts() {
    const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
    const grid = document.getElementById('buyer-products-grid');
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No products available. Farmers haven\'t added any products yet.</p>';
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product, true);
        grid.appendChild(card);
    });
}

// Create Product Card
function createProductCard(product, isBuyer) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.dataset.category = getProductCategory(product.name);
    
    const imageEmoji = productImages[product.image] || '🌾';
    
    if (isBuyer) {
        card.innerHTML = `
            <div class="product-image">${imageEmoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-details">Available: ${product.quantity}kg</div>
                <div class="product-price">${product.price} ETB</div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="product-image">${imageEmoji}</div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-details">Quantity: ${product.quantity}kg</div>
                <div class="product-price">${product.price} ETB</div>
            </div>
        `;
    }
    
    return card;
}

// Get product category for filtering
function getProductCategory(productName) {
    const name = productName.toLowerCase();
    if (name.includes('potato') || name.includes('tomato') || name.includes('onion') || 
        name.includes('pepper') || name.includes('carrot')) {
        return 'vegetables';
    } else if (name.includes('teff') || name.includes('wheat')) {
        return 'grains';
    } else if (name.includes('avocado')) {
        return 'fruits';
    }
    return 'all';
}

// Add to Cart
function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.cartQuantity < product.quantity) {
            existingItem.cartQuantity += 1;
        } else {
            alert('Not enough quantity available!');
            return;
        }
    } else {
        cart.push({
            ...product,
            cartQuantity: 1
        });
    }
    
    localStorage.setItem('buyerCart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Load Cart
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Your cart is empty. <a href="#" onclick="showPage(\'buyer-homepage\')" style="color: var(--primary-green);">Start shopping</a></p>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('cart-total').textContent = '0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.cartQuantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.productId = item.id;
        
        const imageEmoji = productImages[item.image] || '🌾';
        
        cartItem.innerHTML = `
            <div class="cart-item-image">${imageEmoji}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price} ETB per kg</div>
            </div>
            <div class="quantity-selector">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.cartQuantity}" min="1" max="${item.quantity}" onchange="updateQuantityInput(${item.id}, this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">${itemTotal} ETB</div>
            <button class="btn btn-secondary" onclick="removeFromCart(${item.id})" style="padding: 8px 15px;">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    document.getElementById('cart-total').textContent = total;
    document.getElementById('checkout-btn').disabled = false;
}

// Update Quantity
function updateQuantity(productId, change) {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    const newQuantity = item.cartQuantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.quantity) {
        alert('Not enough quantity available!');
        return;
    }
    
    item.cartQuantity = newQuantity;
    localStorage.setItem('buyerCart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Update Quantity from Input
function updateQuantityInput(productId, value) {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    const newQuantity = parseInt(value);
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.quantity) {
        alert('Not enough quantity available!');
        item.cartQuantity = item.quantity;
        localStorage.setItem('buyerCart', JSON.stringify(cart));
        loadCart();
        return;
    }
    
    item.cartQuantity = newQuantity;
    localStorage.setItem('buyerCart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}

// Remove from Cart
function removeFromCart(productId) {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const filteredCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('buyerCart', JSON.stringify(filteredCart));
    loadCart();
    updateCartCount();
}

// Load Checkout
function loadCheckout() {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    const checkoutItems = document.getElementById('checkout-items');
    checkoutItems.innerHTML = '';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.cartQuantity;
        total += itemTotal;
        
        const checkoutItem = document.createElement('div');
        checkoutItem.className = 'checkout-item';
        checkoutItem.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="color: var(--text-light); font-size: 0.9rem;">${item.cartQuantity}kg × ${item.price} ETB</div>
            </div>
            <div style="font-weight: 600; color: var(--primary-green);">${itemTotal} ETB</div>
        `;
        checkoutItems.appendChild(checkoutItem);
    });
    
    document.getElementById('checkout-total').textContent = total;
}

// Place Order
function placeOrder() {
    const cart = JSON.parse(localStorage.getItem('buyerCart') || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Create orders for each farmer
    const orders = JSON.parse(localStorage.getItem('farmerOrders') || '[]');
    
    cart.forEach(item => {
        const order = {
            buyer: userInfo.fullName,
            product: item.name,
            quantity: item.cartQuantity,
            price: item.price * item.cartQuantity,
            paymentMethod: paymentMethod
        };
        orders.push(order);
    });
    
    localStorage.setItem('farmerOrders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.setItem('buyerCart', JSON.stringify([]));
    
    showPage('order-confirmation');
}

// Filter Products by Search
function filterProducts() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const cards = document.querySelectorAll('#buyer-products-grid .product-card');
    
    cards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Filter by Category
function filterByCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('#buyer-products-grid .product-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Show Buyer Homepage (with initialization)
function showBuyerHomepage() {
    showPage('buyer-homepage');
    // Add some sample products if none exist
    const products = JSON.parse(localStorage.getItem('farmerProducts') || '[]');
    if (products.length === 0) {
        // Add sample products for demo
        const sampleProducts = [
            { id: 1, name: 'Potatoes', quantity: 100, price: 25, image: 'potato', farmer: 'Sample Farmer' },
            { id: 2, name: 'Tomatoes', quantity: 50, price: 30, image: 'tomato', farmer: 'Sample Farmer' },
            { id: 3, name: 'Onions', quantity: 75, price: 35, image: 'onion', farmer: 'Sample Farmer' },
            { id: 4, name: 'Green Pepper', quantity: 40, price: 40, image: 'green-pepper', farmer: 'Sample Farmer' },
            { id: 5, name: 'Carrots', quantity: 60, price: 28, image: 'carrot', farmer: 'Sample Farmer' },
            { id: 6, name: 'Teff', quantity: 200, price: 50, image: 'teff', farmer: 'Sample Farmer' },
            { id: 7, name: 'Wheat', quantity: 150, price: 45, image: 'wheat', farmer: 'Sample Farmer' },
            { id: 8, name: 'Avocado', quantity: 30, price: 60, image: 'avocado', farmer: 'Sample Farmer' }
        ];
        localStorage.setItem('farmerProducts', JSON.stringify(sampleProducts));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    // Check if user is already logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.role) {
        if (userInfo.role === 'farmer') {
            showPage('farmer-dashboard');
        } else if (userInfo.role === 'buyer') {
            showBuyerHomepage();
        }
    } else {
        showPage('login-page');
    }
});

