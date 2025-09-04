// Home Page Dynamic Content Loader
// Carrega conteúdos dinamicamente do Firebase

// Initialize Firebase (config already loaded by firebase-config.js)
let homeDb;
if (window.firebaseConfig && firebase.apps.length === 0) {
    firebase.initializeApp(window.firebaseConfig);
    homeDb = firebase.firestore();
} else if (firebase.apps.length > 0) {
    homeDb = firebase.firestore();
} else {
    console.error('Firebase configuration not found');
}

// Load dynamic content when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Home page loaded, starting dynamic content loading...');
    console.log('Firebase apps:', firebase.apps.length);
    console.log('DB instance:', homeDb);
    
    if (homeDb) {
        loadFeaturedArticle();
        loadLatestContent();
    } else {
        console.error('Database not initialized, keeping static content');
    }
});

// Load featured article (most recent content)
async function loadFeaturedArticle() {
    try {
        console.log('Loading featured article...');
        // Get all published content and filter/sort in JavaScript to avoid index requirements
        const snapshot = await homeDb.collection('content')
            .where('status', '==', 'publicado')
            .get();

        console.log('Featured article snapshot:', snapshot.size, 'documents found');

        if (!snapshot.empty) {
            const publishedContent = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                publishedContent.push({ id: doc.id, ...data });
            });
            
            // Sort by timestamp in JavaScript
            publishedContent.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            // Get the most recent (first after sorting)
            const featuredData = publishedContent[0];
            console.log('Featured article data:', featuredData);
            updateFeaturedArticle(featuredData);
        } else {
            // Fallback to static content if no published content
            console.log('No published content found, keeping static content');
        }
    } catch (error) {
        console.error('Error loading featured article:', error);
        // Keep static content as fallback
    }
}

// Update featured article section
function updateFeaturedArticle(data) {
    console.log('Updating featured article with data:', data);
    
    const featuredImage = document.querySelector('.featured-img');
    const featuredCategory = document.querySelector('.featured-category');
    const featuredDate = document.querySelector('.featured-date');
    const featuredTitle = document.querySelector('.featured-title');
    const featuredExcerpt = document.querySelector('.featured-excerpt');
    const featuredLink = document.querySelector('.featured-card .btn');

    if (featuredImage) {
        if (data.image && data.image.trim() !== '') {
            featuredImage.src = data.image;
            // Add error handling for external images
            featuredImage.onerror = function() {
                console.log('Failed to load featured image, using default');
                this.src = '/assets/images/Podcast.png';
            };
        } else {
            // Use a default image or placeholder
            featuredImage.src = '/assets/images/Podcast.png';
        }
        featuredImage.alt = data.title || 'Artigo em destaque';
    }

    if (featuredCategory) {
        featuredCategory.textContent = data.type === 'artigo' ? 'Artigo' : 'Crônica';
    }

    if (featuredDate) {
        featuredDate.textContent = formatDate(data.date);
    }

    if (featuredTitle) {
        featuredTitle.textContent = data.title || 'Título não disponível';
    }

    if (featuredExcerpt) {
        const excerpt = data.excerpt || (data.body ? data.body.substring(0, 150) + '...' : 'Resumo não disponível');
        featuredExcerpt.textContent = excerpt;
    }

    if (featuredLink) {
        const linkPath = data.type === 'artigo' ? '/pages/artigos.html' : '/pages/cronicas.html';
        featuredLink.href = `${linkPath}#${data.id}`;
    }
}

// Load latest content (last 4 published items)
async function loadLatestContent() {
    try {
        console.log('Loading latest content...');
        // Get all published content and filter/sort in JavaScript to avoid index requirements
        const snapshot = await homeDb.collection('content')
            .where('status', '==', 'publicado')
            .get();

        console.log('Latest content snapshot:', snapshot.size, 'documents found');

        if (!snapshot.empty) {
            const publishedContent = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                publishedContent.push({ id: doc.id, ...data });
            });
            
            // Sort by timestamp in JavaScript
            publishedContent.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            
            // Get the first 4 (most recent)
            const latestContent = publishedContent.slice(0, 4);
            console.log('Latest content items:', latestContent);
            updateLatestContent(latestContent);
        } else {
            console.log('No published content found, keeping static content');
        }
    } catch (error) {
        console.error('Error loading latest content:', error);
        // Keep static content as fallback
    }
}

// Update latest content section
function updateLatestContent(contentItems) {
    const contentGrid = document.querySelector('.content-grid');
    
    if (!contentGrid) return;

    // Clear existing content
    contentGrid.innerHTML = '';

    contentItems.forEach((item, index) => {
        const articleCard = createArticleCard(item);
        contentGrid.appendChild(articleCard);
    });
}

// Create article card element
function createArticleCard(data) {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card';

    // Use Podcast.png as default image if no image provided
    const imageSrc = (data.image && data.image.trim() !== '') ? data.image : '/assets/images/Podcast.png';
    const linkPath = data.type === 'artigo' ? '/pages/artigos.html' : '/pages/cronicas.html';
    const title = data.title || 'Título não disponível';
    const excerpt = data.excerpt || (data.body ? data.body.substring(0, 120) + '...' : 'Resumo não disponível');

    articleCard.innerHTML = `
        <img src="${imageSrc}" alt="${title}" class="article-card-image" onerror="this.src='/assets/images/Podcast.png'">
        <div class="article-card-content">
            <h3 class="article-card-title">
                ${title}
            </h3>
            <p class="article-card-excerpt">
                ${excerpt}
            </p>
            <div class="article-card-meta">
                <span class="article-category">${data.type === 'artigo' ? 'Artigo' : 'Crônica'}</span>
                <span class="article-date">${formatDate(data.date)}</span>
            </div>
        </div>
    `;

    // Add click event to navigate to content
    articleCard.addEventListener('click', () => {
        window.location.href = `${linkPath}#${data.id}`;
    });

    return articleCard;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return dateString; // Return original string if parsing fails
    }
}

// Add loading states
function showLoading() {
    const featuredCard = document.querySelector('.featured-card');
    const contentGrid = document.querySelector('.content-grid');
    
    if (featuredCard) {
        featuredCard.classList.add('loading');
    }
    
    if (contentGrid) {
        contentGrid.classList.add('loading');
    }
}

function hideLoading() {
    const featuredCard = document.querySelector('.featured-card');
    const contentGrid = document.querySelector('.content-grid');
    
    if (featuredCard) {
        featuredCard.classList.remove('loading');
    }
    
    if (contentGrid) {
        contentGrid.classList.remove('loading');
    }
}

// Error handling
function showError(message) {
    console.error('Home content error:', message);
    // Could add user-friendly error message here
}

// Export functions for potential external use
window.HomeContent = {
    loadFeaturedArticle,
    loadLatestContent,
    updateFeaturedArticle,
    updateLatestContent
};
