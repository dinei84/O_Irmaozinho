// Firebase Configuration Example
// Copy this file to firebase-config.js and replace with your actual values

const firebaseConfig = {
    apiKey: "your_firebase_api_key_here",
    authDomain: "your_project.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project.firebasestorage.app",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id",
    measurementId: "your_measurement_id"
};

// Make it available globally
window.firebaseConfig = firebaseConfig;
