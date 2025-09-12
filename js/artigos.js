// Artigos Page Functionality

// DOM elements
const loadingSection = document.getElementById('loading-section');
const articlesContent = document.getElementById('articles-content');
const articlesGrid = document.getElementById('articles-grid');
const noArticles = document.getElementById('no-articles');

// Initialize artigos page
function initArtigos() {
    // Wait for Firebase to be loaded
    if (typeof firebase === 'undefined') {
        console.log('Aguardando Firebase...');
        setTimeout(initArtigos, 500);
        return;
    }
    
    // Initialize Firebase if not already done
    if (!window.firebaseDb) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                const app = firebase.initializeApp(window.firebaseConfig);
                window.firebaseDb = firebase.firestore();
                console.log('Firebase inicializado no artigos.js');
            } else {
                window.firebaseDb = firebase.firestore();
                console.log('Firebase já estava inicializado');
            }
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            setTimeout(initArtigos, 500);
            return;
        }
    }
    
    loadArtigos();
}

// Load artigos from Firestore
async function loadArtigos() {
    try {
        showLoading();
        
        // Use global db instance
        const db = window.firebaseDb || firebase.firestore();
        
        // Query artigos: type == "artigo"
        // Filtra por status e ordena no JavaScript para evitar índices
        const querySnapshot = await db
            .collection('content')
            .where('type', '==', 'artigo')
            .get();
        
        const artigos = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filtrar apenas artigos publicados
            if (data.status === 'publicado') {
                artigos.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        // Ordenar por timestamp (mais recente primeiro)
        artigos.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Store all artigos for search functionality
        allArtigos = artigos;
        
        console.log(`Carregados ${artigos.length} artigos publicados`);
        
        if (artigos.length === 0) {
            showNoArticles();
        } else {
            renderArtigos(artigos);
        }
        
    } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        
        if (error.code === 'permission-denied') {
            showError('Erro de permissão. Verifique as regras do Firestore ou faça login no dashboard.');
        } else if (error.code === 'unavailable') {
            showError('Serviço indisponível. Verifique sua conexão com a internet.');
        } else {
            showError('Erro ao carregar artigos. Tente novamente mais tarde.');
        }
    }
}

// Render artigos in the grid
function renderArtigos(artigos) {
    articlesGrid.innerHTML = artigos.map(artigo => `
        <article class="article-card" onclick="openPost('${artigo.id}')">
            <div class="article-image-container">
                ${artigo.image ? 
                    `<img src="${artigo.image}" alt="${artigo.title}" class="article-card-image" onerror="this.style.display='none'">` :
                    `<div class="article-card-image" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📝</div>`
                }
            </div>
            <div class="article-card-content">
                <div class="article-card-meta">
                    <span class="article-card-date">${artigo.date || 'Data não disponível'}</span>
                </div>
                <h2 class="article-card-title">${artigo.title}</h2>
                <p class="article-card-excerpt">${artigo.excerpt || 'Leia o artigo completo para descobrir mais sobre este tema.'}</p>
                <span class="article-card-read-more">Ler artigo completo</span>
            </div>
        </article>
    `).join('');
    
    showContent();
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    articlesContent.style.display = 'none';
    noArticles.style.display = 'none';
}

// Show content
function showContent() {
    loadingSection.style.display = 'none';
    articlesContent.style.display = 'block';
    noArticles.style.display = 'none';
}

// Show no articles state
function showNoArticles() {
    loadingSection.style.display = 'none';
    articlesContent.style.display = 'none';
    noArticles.style.display = 'block';
}

// Show error state
function showError(message) {
    loadingSection.style.display = 'none';
    articlesContent.style.display = 'none';
    noArticles.style.display = 'none';
    
    articlesGrid.innerHTML = `
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
let allArtigos = []; // Store all artigos for search
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
    
    // Filter artigos based on search term
    const filteredArtigos = allArtigos.filter(artigo => {
        const title = (artigo.title || '').toLowerCase();
        const content = (artigo.content || '').toLowerCase();
        const author = (artigo.author || '').toLowerCase();
        const excerpt = (artigo.excerpt || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               content.includes(searchTerm) || 
               author.includes(searchTerm) ||
               excerpt.includes(searchTerm);
    });
    
    // Display search results
    displaySearchResults(filteredArtigos, searchTerm);
}

// Display search results
function displaySearchResults(artigos, searchTerm) {
    const articlesGrid = document.getElementById('articles-grid');
    const noArticles = document.getElementById('no-articles');
    const searchResultsInfo = document.getElementById('search-results-info');
    const searchResultsCount = document.getElementById('search-results-count');
    
    // Update search results info
    const count = artigos.length;
    searchResultsCount.textContent = `${count} artigo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''} para "${searchTerm}"`;
    searchResultsInfo.style.display = 'flex';
    
    if (artigos.length === 0) {
        // Show no results message
        articlesGrid.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>Nenhum artigo encontrado</h3>
                <p>Não encontramos artigos que correspondam à sua busca por "<strong>${searchTerm}</strong>".</p>
                <p>Tente usar palavras-chave diferentes ou verifique a ortografia.</p>
            </div>
        `;
        noArticles.style.display = 'none';
    } else {
        // Display filtered artigos with highlighting
        articlesGrid.innerHTML = artigos.map(artigo => createArticleCard(artigo, searchTerm)).join('');
        noArticles.style.display = 'none';
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResultsInfo = document.getElementById('search-results-info');
    const articlesGrid = document.getElementById('articles-grid');
    const noArticles = document.getElementById('no-articles');
    
    searchInput.value = '';
    currentSearchTerm = '';
    searchResultsInfo.style.display = 'none';
    
    // Restore all artigos
    if (allArtigos.length === 0) {
        articlesGrid.innerHTML = '';
        noArticles.style.display = 'block';
    } else {
        articlesGrid.innerHTML = allArtigos.map(artigo => createArticleCard(artigo)).join('');
        noArticles.style.display = 'none';
    }
}

// Highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Create article card with search highlighting
function createArticleCard(artigo, searchTerm = '') {
    const title = searchTerm ? highlightSearchTerm(artigo.title, searchTerm) : artigo.title;
    const excerpt = searchTerm ? highlightSearchTerm(artigo.excerpt, searchTerm) : artigo.excerpt;
    const author = searchTerm ? highlightSearchTerm(artigo.author, searchTerm) : artigo.author;
    
    return `
        <article class="article-card">
            <div class="article-card-image" onclick="openPost('${artigo.id}')">
                <img src="${artigo.imageUrl || '/assets/images/Podcast.png'}" 
                     alt="${artigo.title}" 
                     class="article-img"
                     onerror="this.src='/assets/images/Podcast.png'">
            </div>
            <div class="article-card-content">
                <div class="article-meta">
                    <span class="article-category">${artigo.type === 'artigo' ? 'Artigo' : 'Crônica'}</span>
                    <span class="article-date">${formatDate(artigo.timestamp)}</span>
                </div>
                <h2 class="article-title" onclick="openPost('${artigo.id}')">${title}</h2>
                <p class="article-excerpt">${excerpt}</p>
                <div class="article-author">
                    <span class="author-name">${author}</span>
                </div>
                ${searchTerm ? `
                    <div class="article-actions">
                        <a href="/pages/post.html?id=${artigo.id}" class="read-article-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Ler ${artigo.type === 'artigo' ? 'artigo' : 'crônica'}
                        </a>
                    </div>
                ` : ''}
            </div>
        </article>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initArtigos();
    initSearch();
});
