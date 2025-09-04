// Store Functionality

// Cart state
let cart = [];
let cartTotal = 0;

// DOM elements
const categoryButtons = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartToggle = document.getElementById('cart-toggle');
const cartSection = document.getElementById('cart-section');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const newsletterForm = document.getElementById('newsletter-form');

// Product data
const products = {
    'Caminhando na Fé': {
        price: 29.90,
        originalPrice: 39.90,
        image: '/assets/images/book-1.jpg',
        category: 'books'
    },
    'Orações que Transformam': {
        price: 24.90,
        image: '/assets/images/book-2.jpg',
        category: 'books'
    },
    'Camiseta "Fé, Esperança e Amor"': {
        price: 49.90,
        image: '/assets/images/tshirt-1.jpg',
        category: 'apparel'
    },
    'Moletom "Jesus é o Caminho"': {
        price: 89.90,
        originalPrice: 109.90,
        image: '/assets/images/hoodie-1.jpg',
        category: 'apparel'
    },
    'Caneca "Deus é Fiel"': {
        price: 19.90,
        image: '/assets/images/mug-1.jpg',
        category: 'accessories'
    },
    'Chaveiro Cruz': {
        price: 12.90,
        image: '/assets/images/keychain-1.jpg',
        category: 'accessories'
    },
    'Devocional: 365 Dias com Jesus': {
        price: 34.90,
        image: '/assets/images/devotional-1.jpg',
        category: 'devotionals'
    },
    'Diário de Oração': {
        price: 27.90,
        image: '/assets/images/journal-1.jpg',
        category: 'devotionals'
    }
};

// Initialize store functionality
function initStore() {
    initCategoryFilter();
    initCartFunctionality();
    initNewsletterForm();
    loadCartFromStorage();
    updateCartDisplay();
}

// Category filtering
function initCategoryFilter() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter products
            const category = button.dataset.category;
            filterProducts(category);
        });
    });
}

function filterProducts(category) {
    productCards.forEach(card => {
        const productCategory = card.dataset.category;
        
        if (category === 'all' || productCategory === category) {
            card.classList.remove('hidden');
            // Add animation delay for staggered effect
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, Math.random() * 200);
        } else {
            card.classList.add('hidden');
        }
    });
}

// Cart functionality
function initCartFunctionality() {
    // Add to cart buttons
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            addToCart(productTitle);
        });
    });
    
    // Cart toggle
    cartToggle.addEventListener('click', () => {
        cartSection.classList.add('open');
    });
    
    // Cart close
    cartClose.addEventListener('click', () => {
        cartSection.classList.remove('open');
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSection.contains(e.target) && !cartToggle.contains(e.target)) {
            cartSection.classList.remove('open');
        }
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Redirecionando para o checkout... (Funcionalidade em desenvolvimento)');
        }
    });
}

function addToCart(productTitle) {
    const product = products[productTitle];
    if (!product) return;
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.title === productTitle);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: productTitle,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // Show feedback
    showAddToCartFeedback();
}

function removeFromCart(productTitle) {
    cart = cart.filter(item => item.title !== productTitle);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(productTitle, newQuantity) {
    const item = cart.find(item => item.title === productTitle);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productTitle);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('hidden', totalItems === 0);
    
    // Update cart total
    cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = cartTotal.toFixed(2).replace('.', ',');
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.title}', ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.title}', ${item.quantity + 1})">+</button>
                        <button class="quantity-btn" onclick="removeFromCart('${item.title}')" style="margin-left: auto; background-color: #ff4444;">×</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showAddToCartFeedback() {
    // Create and show a temporary feedback message
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = 'Produto adicionado ao carrinho!';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--color-primary-orange);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Local storage functions
function saveCartToStorage() {
    localStorage.setItem('oirmaozinho_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('oirmaozinho_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Newsletter form
function initNewsletterForm() {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Simulate newsletter subscription
        alert(`Obrigado por se inscrever! Confirme sua inscrição no e-mail: ${email}`);
        e.target.reset();
    });
}

// Product search functionality
function initProductSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Buscar produtos...';
    searchInput.className = 'product-search';
    searchInput.style.cssText = `
        width: 100%;
        max-width: 400px;
        padding: 12px;
        margin-bottom: 2rem;
        border: 2px solid var(--color-light-gray);
        border-radius: 8px;
        font-size: 1rem;
    `;
    
    const categoriesSection = document.querySelector('.categories-section');
    categoriesSection.appendChild(searchInput);
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        productCards.forEach(card => {
            const title = card.querySelector('.product-title').textContent.toLowerCase();
            const description = card.querySelector('.product-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// Add CSS for animations
const storeStyles = `
    <style>
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        
        .product-card {
            transition: all 0.3s ease;
        }
        
        .product-card.hidden {
            opacity: 0;
            transform: scale(0.8);
            pointer-events: none;
        }
        
        .cart-feedback {
            animation: fadeInOut 2s ease-in-out;
        }
        
        .cart-item {
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', storeStyles);

// Initialize store when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initStore();
    initProductSearch();
});

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

