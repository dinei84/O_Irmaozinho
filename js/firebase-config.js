// Firebase Configuration - CDN Version
// This file will be loaded after Firebase SDK is loaded via CDN

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvBppTLTDs8qALcOjSmQgZU_KoPODp1I0",
  authDomain: "admoirmaozinho.firebaseapp.com",
  projectId: "admoirmaozinho",
  storageBucket: "admoirmaozinho.firebasestorage.app",
  messagingSenderId: "79331048689",
  appId: "1:79331048689:web:02506c8ddbdd3369f97d50",
  measurementId: "G-4NF3N0878T"
};

// Initialize Firebase (will be available globally after CDN loads)
let app, auth, db;

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase scripts to be fully loaded
    function waitForFirebase() {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
            try {
                app = firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                db = firebase.firestore();
                
                // Make Firebase services globally available
                window.firebaseApp = app;
                window.firebaseAuth = auth;
                window.firebaseDb = db;
                
                console.log('Firebase inicializado com sucesso');
            } catch (error) {
                console.error('Erro ao inicializar Firebase:', error);
            }
        } else if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            // Firebase already initialized
            app = firebase.app();
            db = firebase.firestore();
            
            // Only initialize auth if auth module is available
            if (typeof firebase.auth === 'function') {
                auth = firebase.auth();
                window.firebaseAuth = auth;
            }
            
            window.firebaseApp = app;
            window.firebaseDb = db;
            
            console.log('Firebase já estava inicializado');
        } else {
            // Firebase not ready yet, wait more
            setTimeout(waitForFirebase, 100);
        }
    }
    
    // Start waiting for Firebase
    setTimeout(waitForFirebase, 100);
});

// Export configuration for use in other files
window.firebaseConfig = firebaseConfig;
