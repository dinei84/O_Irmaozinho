// Dashboard Functionality with Firebase Integration (CDN Version)

// DOM elements
const loginScreen = document.getElementById('login-screen');
const dashboardPanel = document.getElementById('dashboard-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userNameElement = document.getElementById('user-name');

// Content creation elements
const contentTitle = document.getElementById('content-title');
const contentExcerpt = document.getElementById('content-excerpt');
const contentImage = document.getElementById('content-image');
const contentText = document.getElementById('content-text');
const publishButtons = document.querySelectorAll('.publish-btn');
const saveDraftBtn = document.getElementById('save-draft-btn');
const clearFormBtn = document.getElementById('clear-form-btn');

// Content management elements
const contentList = document.getElementById('content-list');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');

// Content storage
let savedContent = [];
let editingId = null; // Para controlar se estamos editando um documento existente

// Initialize dashboard
function initDashboard() {
    // Wait for Firebase to be loaded
    if (typeof firebase === 'undefined') {
        console.log('Aguardando Firebase...');
        setTimeout(initDashboard, 500);
        return;
    }
    
    // Initialize Firebase if not already done
    if (!window.firebaseDb) {
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                const app = firebase.initializeApp(window.firebaseConfig);
                window.firebaseDb = firebase.firestore();
                window.firebaseAuth = firebase.auth();
                console.log('Firebase inicializado no dashboard.js');
            } else {
                window.firebaseDb = firebase.firestore();
                window.firebaseAuth = firebase.auth();
                console.log('Firebase já estava inicializado');
            }
        } catch (error) {
            console.error('Erro ao inicializar Firebase:', error);
            setTimeout(initDashboard, 500);
            return;
        }
    }
    
    checkAuthStatus();
    initLoginForm();
    initLogout();
    initContentCreator();
    initContentManagement();
    
    // Não carregar Firestore imediatamente - aguardar autenticação
    console.log('Dashboard inicializado. Aguardando autenticação...');
}

// Authentication
function checkAuthStatus() {
    const auth = window.firebaseAuth || firebase.auth();
    auth.onAuthStateChanged((user) => {
        if (user) {
            showDashboardPanel(user);
            // Carregar conteúdo apenas quando usuário estiver autenticado
            loadContentFromFirestore();
        } else {
            showLoginScreen();
        }
    });
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    dashboardPanel.classList.remove('show');
}

function showDashboardPanel(user) {
    loginScreen.style.display = 'none';
    dashboardPanel.classList.add('show');
    userNameElement.textContent = user.email;
}

function initLoginForm() {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const auth = window.firebaseAuth || firebase.auth();
            await auth.signInWithEmailAndPassword(email, password);
            loginError.classList.remove('show');
            loginForm.reset();
        } catch (error) {
            console.error('Erro no login:', error);
            loginError.classList.add('show');
            setTimeout(() => {
                loginError.classList.remove('show');
            }, 3000);
        }
    });
}

function initLogout() {
    logoutBtn.addEventListener('click', async () => {
        try {
            const auth = window.firebaseAuth || firebase.auth();
            await auth.signOut();
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    });
}

// Content Creator
function initContentCreator() {
    // Publish buttons
    publishButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const contentType = e.currentTarget.dataset.type;
            publishContent(contentType);
        });
    });
    
    // Save draft
    saveDraftBtn.addEventListener('click', () => {
        saveContent('rascunho');
    });
    
    // Clear form
    clearFormBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar o formulário?')) {
            clearForm();
        }
    });
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (hasUnsavedChanges()) {
            autoSave();
        }
    }, 30000);
}

function publishContent(type) {
    if (!validateForm()) {
        return;
    }
    
    saveContent('publicado', type);
}

function saveContent(status, type = null) {
    const contentData = {
        title: contentTitle.value.trim(),
        excerpt: contentExcerpt.value.trim(),
        image: contentImage.value.trim(),
        body: contentText.value.trim(),
        type: type || 'artigo', // Default to artigo if not specified
        status: status,
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Se estamos editando, adicionar createdAt do documento original
    if (editingId) {
        const originalDoc = savedContent.find(item => item.id === editingId);
        if (originalDoc && originalDoc.createdAt) {
            contentData.createdAt = originalDoc.createdAt;
        }
    } else {
        // Novo documento - adicionar createdAt
        contentData.createdAt = firebase.firestore.Timestamp.now();
    }
    
    // Save to Firestore
    saveToFirestore(contentData);
    
    // Show success message
    const actionText = editingId ? 'atualizado' : (status === 'publicado' ? 'publicado' : 'salvo como rascunho');
    showNotification(`Conteúdo ${actionText} com sucesso!`, 'success');
    
    // Clear form if published or if editing
    if (status === 'publicado' || editingId) {
        clearForm();
    }
    
    // Reload content list
    loadContentFromFirestore();
}

async function saveToFirestore(contentData) {
    try {
        const db = window.firebaseDb || firebase.firestore();
        
        if (editingId) {
            // Atualizar documento existente
            await db.collection('content').doc(editingId).update(contentData);
            console.log('Documento atualizado:', editingId);
        } else {
            // Criar novo documento
            const docRef = await db.collection('content').add(contentData);
            console.log('Novo documento criado:', docRef.id);
        }
    } catch (error) {
        console.error('Erro ao salvar no Firestore:', error);
        showNotification('Erro ao salvar conteúdo', 'error');
    }
}

function validateForm() {
    if (!contentTitle.value.trim()) {
        showNotification('Por favor, digite um título', 'error');
        contentTitle.focus();
        return false;
    }
    
    if (!contentText.value.trim()) {
        showNotification('Por favor, digite o conteúdo', 'error');
        contentText.focus();
        return false;
    }
    
    return true;
}

function clearForm() {
    contentTitle.value = '';
    contentExcerpt.value = '';
    contentImage.value = '';
    contentText.value = '';
    editingId = null; // Reset editing mode
}

function hasUnsavedChanges() {
    return contentTitle.value.trim() || contentText.value.trim();
}

function autoSave() {
    const autoSaveData = {
        title: contentTitle.value,
        excerpt: contentExcerpt.value,
        image: contentImage.value,
        body: contentText.value,
        timestamp: Date.now()
    };
    
    localStorage.setItem('oirmaozinho_autosave', JSON.stringify(autoSaveData));
    showNotification('Rascunho salvo automaticamente', 'info');
}

function loadAutoSave() {
    const autoSaveData = localStorage.getItem('oirmaozinho_autosave');
    if (autoSaveData) {
        const data = JSON.parse(autoSaveData);
        const shouldLoad = confirm('Foi encontrado um rascunho salvo automaticamente. Deseja carregá-lo?');
        
        if (shouldLoad) {
            contentTitle.value = data.title || '';
            contentExcerpt.value = data.excerpt || '';
            contentImage.value = data.image || '';
            contentText.value = data.body || '';
        }
        
        localStorage.removeItem('oirmaozinho_autosave');
    }
}

// Content Management
function initContentManagement() {
    // Filter functionality
    filterType.addEventListener('change', renderContentList);
    filterStatus.addEventListener('change', renderContentList);
}

async function loadContentFromFirestore() {
    try {
        // Verificar se o usuário está autenticado
        const auth = window.firebaseAuth || firebase.auth();
        const user = auth.currentUser;
        if (!user) {
            console.log('Usuário não autenticado, pulando carregamento do Firestore');
            return;
        }

        console.log('Carregando conteúdo do Firestore...');
        const db = window.firebaseDb || firebase.firestore();
        const querySnapshot = await db.collection('content').orderBy('timestamp', 'desc').get();
        savedContent = [];
        
        querySnapshot.forEach((doc) => {
            savedContent.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`Carregados ${savedContent.length} conteúdos`);
        renderContentList();
    } catch (error) {
        console.error('Erro ao carregar conteúdo:', error);
        
        if (error.code === 'permission-denied') {
            showNotification('Erro de permissão. Verifique as regras do Firestore.', 'error');
        } else if (error.code === 'unavailable') {
            showNotification('Firestore indisponível. Verifique sua conexão.', 'error');
        } else {
            showNotification('Erro ao carregar conteúdos', 'error');
        }
    }
}

function renderContentList() {
    const typeFilter = filterType.value;
    const statusFilter = filterStatus.value;
    
    let filteredContent = savedContent;
    
    if (typeFilter) {
        filteredContent = filteredContent.filter(item => item.type === typeFilter);
    }
    
    if (statusFilter) {
        filteredContent = filteredContent.filter(item => item.status === statusFilter);
    }
    
    if (filteredContent.length === 0) {
        contentList.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">Nenhum conteúdo encontrado.</p>';
        return;
    }
    
    contentList.innerHTML = filteredContent.map(item => `
        <div class="content-item" data-id="${item.id}">
            <div class="content-item-info">
                <h4 class="content-item-title">${item.title}</h4>
                <div class="content-item-meta">
                    <span class="content-type-badge ${item.type}">${item.type === 'artigo' ? 'Artigo' : 'Crônica'}</span>
                    <span class="content-status-badge ${item.status}">${item.status === 'publicado' ? 'Publicado' : 'Rascunho'}</span>
                    <span class="content-date">${item.date}</span>
                </div>
            </div>
            <div class="content-item-actions">
                <button class="btn btn-outline btn-sm edit-btn" data-id="${item.id}">Editar</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Excluir</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            editContent(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteContent(id);
        });
    });
}

function editContent(id) {
    const content = savedContent.find(item => item.id === id);
    if (!content) return;
    
    // Set editing mode
    editingId = id;
    
    // Populate form with content data
    contentTitle.value = content.title || '';
    contentExcerpt.value = content.excerpt || '';
    contentImage.value = content.image || '';
    contentText.value = content.body || '';
    
    // Scroll to creator
    document.querySelector('.text-creator-section').scrollIntoView({ behavior: 'smooth' });
    
    // Show editing indicator
    showNotification('Modo de edição ativado. As alterações serão salvas no documento existente.', 'info');
}

async function deleteContent(id, confirm = true) {
    if (confirm && !window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
        return;
    }
    
    try {
        const db = window.firebaseDb || firebase.firestore();
        await db.collection('content').doc(id).delete();
        console.log('Documento excluído:', id);
        showNotification('Conteúdo excluído com sucesso!', 'success');
        
        // Se estávamos editando este documento, limpar o formulário
        if (editingId === id) {
            clearForm();
        }
        
        loadContentFromFirestore();
    } catch (error) {
        console.error('Erro ao excluir conteúdo:', error);
        showNotification('Erro ao excluir conteúdo', 'error');
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'info':
        default:
            notification.style.backgroundColor = '#17a2b8';
            break;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const notificationStyles = `
    <style>
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
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    
    // Load auto-save if available
    setTimeout(loadAutoSave, 1000);
});

// Prevent accidental page refresh when there are unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
});