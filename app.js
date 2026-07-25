// ========================================
// SHOPCOMPARE PH — MAIN APPLICATION
// Phase 1.0 — Production Ready
// ========================================

// ---------- STATE ----------
let favorites = JSON.parse(localStorage.getItem('sc_favorites') || '[]');
let currentCategory = 'all';
let searchTimeout = null;

// ---------- DOM ELEMENTS ----------
const el = {
    grid: document.getElementById('productsGrid'),
    searchInput: document.getElementById('searchInput'),
    searchForm: document.getElementById('searchForm'),
    suggestions: document.getElementById('searchSuggestions'),
    emptyState: document.getElementById('emptyState'),
    modal: document.getElementById('compareModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalClose: document.getElementById('modalClose'),
    hamburger: document.getElementById('hamburger'),
    navMobile: document.getElementById('navMobile'),
    themeToggle: document.getElementById('themeToggle'),
    themeToggle2: document.getElementById('themeToggle2')
};

// ---------- INITIALIZE ----------
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProducts(PRODUCTS);
    bindEvents();
});

// ---------- BIND EVENTS ----------
function bindEvents() {
    // Category clicks
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.cat;
            filterAndRender();
        });
    });

    // Search
    el.searchInput.addEventListener('input', onSearchInput);
    el.searchForm.addEventListener('submit', e => {
        e.preventDefault();
        doSearch(el.searchInput.value.trim());
    });

    // Modal
    el.modalClose.addEventListener('click', closeModal);
    el.modal.addEventListener('click', e => {
        if (e.target === el.modal) closeModal();
    });

    // Mobile menu
    el.hamburger.addEventListener('click', () => {
        el.navMobile.classList.toggle('active');
    });

    // Dark mode
    [el.themeToggle, el.themeToggle2].forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });
}

// ---------- RENDER PRODUCTS ----------
function renderProducts(list) {
    el.grid.innerHTML = '';
    el.emptyState.style.display = 'none';

    if (list.length === 0) {
        el.emptyState.style.display = 'block';
        return;
    }

    list.forEach((p, i) => {
        const isFav = favorites.includes(p.id);
        const lowest = Math.min(p.shopee, p.lazada, p.tiktok);

        el.grid.innerHTML += `
            <div class="product-card" style="animation-delay: ${i * 0.06}s">
                <div class="product-img">
                    ${p.icon}
                    <div class="product-badges">
                        ${p.discount ? `<span class="badge discount">-${p.discount}%</span>` : ''}
                        ${p.freeShipping ? `<span class="badge free">🚚 Libre</span>` : ''}
                    </div>
                    <button class="fav-btn ${isFav?'active':''}" data-id="${p.id}">❤️</button>
                </div>
                <div class="product-body">
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-meta">
                        <span class="stars">★ ${p.rating}</span>
                        <span>(${p.reviews})</span>
                        <span>• Nabenta ${p.sold.toLocaleString()}</span>
                    </div>
                    <div class="product-price">₱${lowest.toLocaleString()} <span>Pinakamababa</span></div>
                    <button class="compare-btn" data-id="${p.id}">⚖️ Ihambing Presyo</button>
                </div>
            </div>
        `;
    });

    // Bind dynamic buttons
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleFav(btn.dataset.id * 1));
    });
    document.querySelectorAll('.compare-btn').forEach(btn => {
        btn.addEventListener('click', () => openCompare(btn.dataset.id * 1));
    });
}

// ---------- FILTER & SEARCH ----------
function filterAndRender(query = '') {
    let list = PRODUCTS;

    if (currentCategory !== 'all') {
        list = list.filter(p => p.category === currentCategory);
    }

    if (query) {
        const q = query.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    renderProducts(list);
}

function onSearchInput() {
    clearTimeout(searchTimeout);
    const q = el.searchInput.value.trim();

    if (q.length >= 1) {
        searchTimeout = setTimeout(() => {
            const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
            if (matches.length) {
                el.suggestions.innerHTML = matches.map(p => `
                    <div class="suggestion-item" data-name="${p.name}">🔍 ${p.name}</div>
                `).join('');
                el.suggestions.classList.add('active');
                el.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        el.searchInput.value = item.dataset.name;
                        el.suggestions.classList.remove('active');
                        filterAndRender(item.dataset.name);
                    });
                });
            } else {
                el.suggestions.classList.remove('active');
            }
        }, 250);
    } else {
        el.suggestions.classList.remove('active');
        filterAndRender();
    }
}

function doSearch(q) {
    el.suggestions.classList.remove('active');
    filterAndRender(q);
}

// ---------- FAVORITES ----------
function toggleFav(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('sc_favorites', JSON.stringify(favorites));
    filterAndRender(el.searchInput.value.trim());
}

// ---------- COMPARE MODAL ----------
function openCompare(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;

    const lowest = Math.min(p.shopee, p.lazada, p.tiktok);
    const highest = Math.max(p.shopee, p.lazada, p.tiktok);
    const savings = highest - lowest;

    el.modalTitle.textContent = p.name;
    el.modalBody.innerHTML = `
        <div class="price-row ${p.shopee === lowest ? 'lowest' : ''}">
            <span class="store-name">🛒 Shopee</span>
            <span class="store-price">₱${p.shopee.toLocaleString()} ${p.shopee === lowest ? ' ✅' : ''}</span>
        </div>
        <div class="price-row ${p.lazada === lowest ? 'lowest' : ''}">
            <span class="store-name">📦 Lazada</span>
            <span class="store-price">₱${p.lazada.toLocaleString()} ${p.lazada === lowest ? ' ✅' : ''}</span>
        </div>
        <div class="price-row ${p.tiktok === lowest ? 'lowest' : ''}">
            <span class="store-name">🎵 TikTok Shop</span>
            <span class="store-price">₱${p.tiktok.toLocaleString()} ${p.tiktok === lowest ? ' ✅' : ''}</span>
        </div>
        <div class="savings-box">💰 Matipid ka ng ₱${savings.toLocaleString()}!</div>
        <button class="go-btn">🔍 Pumunta sa Pinakamababang Presyo</button>
    `;
    el.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    el.modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- DARK MODE ----------
function initTheme() {
    const saved = localStorage.getItem('sc_theme');
    if (saved === 'dark') document.documentElement.dataset.theme = 'dark';
}

function toggleTheme() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('sc_theme', isDark ? 'light' : 'dark');
}
