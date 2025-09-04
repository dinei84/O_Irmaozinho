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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initArtigos);
