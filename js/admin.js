// Admin Panel Functionality

// Admin credentials (in a real application, this would be handled server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'oirmaozinho2025'
};

// DOM elements
const loginScreen = document.getElementById('login-screen');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const userNameElement = document.getElementById('user-name');
const editorForm = document.getElementById('editor-form');
const contentBody = document.getElementById('content-body');
const toolbarButtons = document.querySelectorAll('.toolbar-btn');
const saveDraftBtn = document.getElementById('save-draft-btn');
const contentList = document.getElementById('content-list');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');

// Content storage
let savedContent = JSON.parse(localStorage.getItem('oirmaozinho_content') || '[]');

// Initialize admin panel
function initAdmin() {
    checkAuthStatus();
    initLoginForm();
    initLogout();
    initEditor();
    initContentList();
    loadSavedContent();
}

// Authentication
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('oirmaozinho_admin_logged_in');
    if (isLoggedIn === 'true') {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminPanel.classList.remove('show');
}

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.classList.add('show');
    userNameElement.textContent = 'Administrador';
}

function initLoginForm() {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('oirmaozinho_admin_logged_in', 'true');
            showAdminPanel();
            loginError.classList.remove('show');
            loginForm.reset();
        } else {
            loginError.classList.add('show');
            setTimeout(() => {
                loginError.classList.remove('show');
            }, 3000);
        }
    });
}

function initLogout() {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('oirmaozinho_admin_logged_in');
        showLoginScreen();
    });
}

// Rich Text Editor
function initEditor() {
    // Toolbar functionality
    toolbarButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.dataset.command;
            
            if (command === 'createLink') {
                const url = prompt('Digite a URL do link:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            contentBody.focus();
            updateToolbarState();
        });
    });
    
    // Update toolbar state based on selection
    contentBody.addEventListener('keyup', updateToolbarState);
    contentBody.addEventListener('mouseup', updateToolbarState);
    
    // Form submission
    editorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveContent('publicado');
    });
    
    // Save draft
    saveDraftBtn.addEventListener('click', () => {
        saveContent('rascunho');
    });
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (hasUnsavedChanges()) {
            autoSave();
        }
    }, 30000);
}

function updateToolbarState() {
    toolbarButtons.forEach(button => {
        const command = button.dataset.command;
        if (document.queryCommandState(command)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function saveContent(status) {
    const formData = new FormData(editorForm);
    const contentData = {
        id: Date.now(),
        type: formData.get('content-type'),
        status: status,
        title: formData.get('content-title'),
        excerpt: formData.get('content-excerpt'),
        image: formData.get('content-image'),
        body: contentBody.innerHTML,
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now()
    };
    
    // Validate required fields
    if (!contentData.type || !contentData.title || !contentData.body.trim()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Add to saved content
    savedContent.unshift(contentData);
    localStorage.setItem('oirmaozinho_content', JSON.stringify(savedContent));
    
    // Show success message
    showNotification(`Conteúdo ${status === 'publicado' ? 'publicado' : 'salvo como rascunho'} com sucesso!`, 'success');
    
    // Reset form if published
    if (status === 'publicado') {
        editorForm.reset();
        contentBody.innerHTML = '';
    }
    
    // Update content list
    renderContentList();
}

function autoSave() {
    const formData = new FormData(editorForm);
    const title = formData.get('content-title');
    
    if (title && title.trim()) {
        const autoSaveData = {
            type: formData.get('content-type'),
            title: title,
            excerpt: formData.get('content-excerpt'),
            image: formData.get('content-image'),
            body: contentBody.innerHTML,
            timestamp: Date.now()
        };
        
        localStorage.setItem('oirmaozinho_autosave', JSON.stringify(autoSaveData));
        showNotification('Rascunho salvo automaticamente', 'info');
    }
}

function hasUnsavedChanges() {
    const formData = new FormData(editorForm);
    const title = formData.get('content-title');
    const body = contentBody.innerHTML;
    
    return title && title.trim() && body && body.trim();
}

function loadAutoSave() {
    const autoSaveData = localStorage.getItem('oirmaozinho_autosave');
    if (autoSaveData) {
        const data = JSON.parse(autoSaveData);
        const shouldLoad = confirm('Foi encontrado um rascunho salvo automaticamente. Deseja carregá-lo?');
        
        if (shouldLoad) {
            document.getElementById('content-type').value = data.type || '';
            document.getElementById('content-title').value = data.title || '';
            document.getElementById('content-excerpt').value = data.excerpt || '';
            document.getElementById('content-image').value = data.image || '';
            contentBody.innerHTML = data.body || '';
        }
        
        localStorage.removeItem('oirmaozinho_autosave');
    }
}

// Content List Management
function initContentList() {
    // Filter functionality
    filterType.addEventListener('change', renderContentList);
    filterStatus.addEventListener('change', renderContentList);
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
            const id = parseInt(e.target.dataset.id);
            editContent(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteContent(id);
        });
    });
}

function editContent(id) {
    const content = savedContent.find(item => item.id === id);
    if (!content) return;
    
    // Populate form with content data
    document.getElementById('content-type').value = content.type;
    document.getElementById('content-status').value = content.status;
    document.getElementById('content-title').value = content.title;
    document.getElementById('content-excerpt').value = content.excerpt || '';
    document.getElementById('content-image').value = content.image || '';
    contentBody.innerHTML = content.body;
    
    // Scroll to editor
    document.querySelector('.editor-section').scrollIntoView({ behavior: 'smooth' });
    
    // Remove the content from the list (it will be re-added when saved)
    deleteContent(id, false);
}

function deleteContent(id, confirm = true) {
    if (confirm && !window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
        return;
    }
    
    savedContent = savedContent.filter(item => item.id !== id);
    localStorage.setItem('oirmaozinho_content', JSON.stringify(savedContent));
    renderContentList();
    
    if (confirm) {
        showNotification('Conteúdo excluído com sucesso!', 'success');
    }
}

function loadSavedContent() {
    renderContentList();
    
    // Load auto-save if available
    setTimeout(loadAutoSave, 1000);
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
        
        .notification {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdmin);

// Prevent accidental page refresh when there are unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
});

