// Cronicas Page Functionality

// DOM elements
const loadingSection = document.getElementById('loading-section');
const cronicasContent = document.getElementById('cronicas-content');
const cronicasGrid = document.getElementById('cronicas-grid');
const noCronicas = document.getElementById('no-cronicas');

// Initialize cronicas page
function initCronicas() {
    // Wait for Firebase to be loaded
    if (typeof firebase === 'undefined') {
        console.log('Aguardando Firebase...');
        setTimeout(initCronicas, 500);
        return;
    }
    
    // Initialize Firebase if not already done
    if (!window.firebaseDb) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                const app = firebase.initializeApp(window.firebaseConfig);
                window.firebaseDb = firebase.firestore();
                console.log('Firebase inicializado no cronicas.js');
            } else {
                window.firebaseDb = firebase.firestore();
                console.log('Firebase já estava inicializado');
            }
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            setTimeout(initCronicas, 500);
            return;
        }
    }
    
    loadCronicas();
}

// Load cronicas from Firestore
async function loadCronicas() {
    try {
        showLoading();
        
        // Use global db instance
        const db = window.firebaseDb || firebase.firestore();
        
        // Query cronicas: type == "cronica"
        // Filtra por status e ordena no JavaScript para evitar índices
        const querySnapshot = await db
            .collection('content')
            .where('type', '==', 'cronica')
            .get();
        
        const cronicas = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filtrar apenas crônicas publicadas
            if (data.status === 'publicado') {
                cronicas.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        // Ordenar por timestamp (mais recente primeiro)
        cronicas.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Store all cronicas for search functionality
        allCronicas = cronicas;
        
        console.log(`Carregadas ${cronicas.length} crônicas publicadas`);
        
        if (cronicas.length === 0) {
            showNoCronicas();
        } else {
            renderCronicas(cronicas);
        }
        
    } catch (error) {
        console.error('Erro ao carregar crônicas:', error);
        
        if (error.code === 'permission-denied') {
            showError('Erro de permissão. Verifique as regras do Firestore ou faça login no dashboard.');
        } else if (error.code === 'unavailable') {
            showError('Serviço indisponível. Verifique sua conexão com a internet.');
        } else {
            showError('Erro ao carregar crônicas. Tente novamente mais tarde.');
        }
    }
}

// Render cronicas in the grid
function renderCronicas(cronicas) {
    cronicasGrid.innerHTML = cronicas.map(cronica => `
        <article class="article-card" onclick="openPost('${cronica.id}')">
            <div class="article-image-container">
                ${cronica.image ? 
                    `<img src="${cronica.image}" alt="${cronica.title}" class="article-card-image" onerror="this.style.display='none'">` :
                    `<div class="article-card-image" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-primary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📖</div>`
                }
            </div>
            <div class="article-card-content">
                <div class="article-card-meta">
                    <span class="article-card-date">${cronica.date || 'Data não disponível'}</span>
                </div>
                <h2 class="article-card-title">${cronica.title}</h2>
                <p class="article-card-excerpt">${cronica.excerpt || 'Leia a crônica completa para descobrir mais sobre esta reflexão.'}</p>
                <span class="article-card-read-more">Ler crônica completa</span>
            </div>
        </article>
    `).join('');
    
    showContent();
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    cronicasContent.style.display = 'none';
    noCronicas.style.display = 'none';
}

// Show content
function showContent() {
    loadingSection.style.display = 'none';
    cronicasContent.style.display = 'block';
    noCronicas.style.display = 'none';
}

// Show no cronicas state
function showNoCronicas() {
    loadingSection.style.display = 'none';
    cronicasContent.style.display = 'none';
    noCronicas.style.display = 'block';
}

// Show error state
function showError(message) {
    loadingSection.style.display = 'none';
    cronicasContent.style.display = 'none';
    noCronicas.style.display = 'none';
    
    cronicasGrid.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
    
    showContent();
}

// Open post page
function openPost(id) {
    window.location.href = `/pages/post.html?id=${id}`;
}

// Search functionality
let allCronicas = []; // Store all cronicas for search
let currentSearchTerm = '';

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsCount = document.getElementById('search-results-count');

    // Search on button click
    searchBtn.addEventListener('click', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Real-time search as user types (with debounce)
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (searchInput.value.trim().length >= 2) {
                performSearch();
            } else if (searchInput.value.trim().length === 0) {
                clearSearch();
            }
        }, 300);
    });
    
    // Clear search
    clearSearchBtn.addEventListener('click', clearSearch);
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm.length < 2) {
        return;
    }
    
    currentSearchTerm = searchTerm;
    
    // Filter cronicas based on search term
    const filteredCronicas = allCronicas.filter(cronica => {
        const title = (cronica.title || '').toLowerCase();
        const content = (cronica.content || '').toLowerCase();
        const author = (cronica.author || '').toLowerCase();
        const excerpt = (cronica.excerpt || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               content.includes(searchTerm) || 
               author.includes(searchTerm) ||
               excerpt.includes(searchTerm);
    });
    
    // Display search results
    displaySearchResults(filteredCronicas, searchTerm);
}

// Display search results
function displaySearchResults(cronicas, searchTerm) {
    const cronicasGrid = document.getElementById('cronicas-grid');
    const noCronicas = document.getElementById('no-cronicas');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsCount = document.getElementById('search-results-count');
    
    // Update search results info
    const count = cronicas.length;
    searchResultsCount.textContent = `${count} crônica${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''} para "${searchTerm}"`;
    searchResultsInfo.style.display = 'flex';
    
    if (cronicas.length === 0) {
        // Show no results message
        cronicasGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>Nenhuma crônica encontrada</h3>
                <p>Não encontramos crônicas que correspondam à sua busca por "<strong>${searchTerm}</strong>".</p>
                <p>Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
            </div>
        `;
        noCronicas.style.display = 'none';
    } else {
        // Display filtered cronicas with highlighting
        cronicasGrid.innerHTML = cronicas.map(cronica => createCronicaCard(cronica, searchTerm)).join('');
        noCronicas.style.display = 'none';
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResultsInfo = document.getElementById('search-results-info');
    const cronicasGrid = document.getElementById('cronicas-grid');
    const noCronicas = document.getElementById('no-cronicas');
    
    searchInput.value = '';
    currentSearchTerm = '';
    searchResultsInfo.style.display = 'none';
    
    // Restore all cronicas
    if (allCronicas.length === 0) {
        cronicasGrid.innerHTML = '';
        noCronicas.style.display = 'block';
    } else {
        cronicasGrid.innerHTML = allCronicas.map(cronica => createCronicaCard(cronica)).join('');
        noCronicas.style.display = 'none';
    }
}

// Highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Create cronica card with search highlighting
function createCronicaCard(cronica, searchTerm = '') {
    const title = searchTerm ? highlightSearchTerm(cronica.title, searchTerm) : cronica.title;
    const excerpt = searchTerm ? highlightSearchTerm(cronica.excerpt, searchTerm) : cronica.excerpt;
    const author = searchTerm ? highlightSearchTerm(cronica.author, searchTerm) : cronica.author;
    
    return `
        <article class="article-card">
            <div class="article-card-image" onclick="openPost('${cronica.id}')">
                <img src="${cronica.imageUrl || '/assets/images/Podcast.png'}" 
                     alt="${cronica.title}" 
                     class="article-img"
                     onerror="this.src='/assets/images/Podcast.png'">
            </div>
            <div class="article-card-content">
                <div class="article-meta">
                    <span class="article-category">${cronica.type === 'artigo' ? 'Artigo' : 'Crônica'}</span>
                    <span class="article-date">${formatDate(cronica.timestamp)}</span>
                </div>
                <h2 class="article-title" onclick="openPost('${cronica.id}')">${title}</h2>
                <p class="article-excerpt">${excerpt}</p>
                <div class="article-author">
                    <span class="author-name">${author}</span>
                </div>
                ${searchTerm ? `
                    <div class="article-actions">
                        <a href="/pages/post.html?id=${cronica.id}" class="read-article-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Ler ${cronica.type === 'artigo' ? 'artigo' : 'crônica'}
                        </a>
                    </div>
                ` : ''}
            </div>
        </article>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCronicas();
    initSearch();
});
