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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCronicas);
