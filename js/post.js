// Post Page Functionality

// DOM elements
const loadingSection = document.getElementById('loading-section');
const postContent = document.getElementById('post-content');
const notFoundSection = document.getElementById('not-found-section');

// Post elements
const postType = document.getElementById('post-type');
const postDate = document.getElementById('post-date');
const postTitle = document.getElementById('post-title');
const postExcerpt = document.getElementById('post-excerpt');
const postImageContainer = document.getElementById('post-image-container');
const postImage = document.getElementById('post-image');
const postBody = document.getElementById('post-body');
const backToArticles = document.getElementById('back-to-articles');
const backToCronicas = document.getElementById('back-to-cronicas');

// Get post ID from URL
function getPostId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Initialize post page
function initPost() {
    // Wait for Firebase to be loaded
    if (typeof firebase === 'undefined') {
        console.log('Aguardando Firebase...');
        setTimeout(initPost, 500);
        return;
    }
    
    // Initialize Firebase if not already done
    if (!window.firebaseDb) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                const app = firebase.initializeApp(window.firebaseConfig);
                window.firebaseDb = firebase.firestore();
                console.log('Firebase inicializado no post.js');
            } else {
                window.firebaseDb = firebase.firestore();
                console.log('Firebase já estava inicializado');
            }
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            setTimeout(initPost, 500);
            return;
        }
    }
    
    const postId = getPostId();
    if (!postId) {
        showNotFound();
        return;
    }
    
    loadPost(postId);
}

// Load post from Firestore
async function loadPost(postId) {
    try {
        showLoading();
        
        // Use global db instance
        const db = window.firebaseDb || firebase.firestore();
        
        const doc = await db
            .collection('content')
            .doc(postId)
            .get();
        
        if (!doc.exists) {
            showNotFound();
            return;
        }
        
        const postData = doc.data();
        
        // Check if post is published
        if (postData.status !== 'publicado') {
            showNotFound();
            return;
        }
        
        renderPost(postData);
        
    } catch (error) {
        console.error('Erro ao carregar post:', error);
        
        if (error.code === 'permission-denied') {
            showNotFound(); // Treat as not found for security
        } else {
            showNotFound();
        }
    }
}

// Render post content
function renderPost(postData) {
    // Set page title
    document.title = `${postData.title} - O Irmãozinho`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = postData.excerpt || postData.title;
    }
    
    // Set post type
    postType.textContent = postData.type === 'artigo' ? 'Artigo' : 'Crônica';
    postType.className = `post-type ${postData.type}`;
    
    // Set post date
    postDate.textContent = postData.date || 'Data não disponível';
    
    // Set post title
    postTitle.textContent = postData.title || 'Título não disponível';
    
    // Set post excerpt
    if (postData.excerpt) {
        postExcerpt.textContent = postData.excerpt;
        postExcerpt.style.display = 'block';
    } else {
        postExcerpt.style.display = 'none';
    }
    
    // Set post image
    if (postData.image) {
        postImage.src = postData.image;
        postImage.alt = postData.title;
        postImageContainer.style.display = 'block';
        
        // Handle image load error
        postImage.onerror = function() {
            postImageContainer.style.display = 'none';
        };
    } else {
        postImageContainer.style.display = 'none';
    }
    
    // Set post body
    if (postData.body) {
        // Convert plain text to HTML with basic formatting
        const formattedBody = formatPostBody(postData.body);
        postBody.innerHTML = formattedBody;
    } else {
        postBody.innerHTML = '<p>Conteúdo não disponível.</p>';
    }
    
    // Show appropriate back button
    if (postData.type === 'artigo') {
        backToArticles.style.display = 'inline-block';
        backToCronicas.style.display = 'none';
    } else if (postData.type === 'cronica') {
        backToArticles.style.display = 'none';
        backToCronicas.style.display = 'inline-block';
    }
    
    showContent();
}

// Format post body (basic text to HTML conversion)
function formatPostBody(body) {
    if (!body) return '';
    
    // Convert line breaks to paragraphs
    let formatted = body
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    formatted = `<p>${formatted}</p>`;
    
    // Clean up empty paragraphs
    formatted = formatted.replace(/<p><\/p>/g, '');
    formatted = formatted.replace(/<p><br><\/p>/g, '');
    
    return formatted;
}

// Show loading state
function showLoading() {
    loadingSection.style.display = 'block';
    postContent.style.display = 'none';
    notFoundSection.style.display = 'none';
}

// Show content
function showContent() {
    loadingSection.style.display = 'none';
    postContent.style.display = 'block';
    notFoundSection.style.display = 'none';
}

// Show not found state
function showNotFound() {
    loadingSection.style.display = 'none';
    postContent.style.display = 'none';
    notFoundSection.style.display = 'block';
    
    // Update page title
    document.title = 'Conteúdo não encontrado - O Irmãozinho';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPost);
