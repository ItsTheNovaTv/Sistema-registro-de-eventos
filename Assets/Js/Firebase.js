// Firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyAWn1lHmK3RR1KYU10GPUxmm0HT5LDEFAA",
  authDomain: "sistema-registro-de-eventos.firebaseapp.com",
  projectId: "sistema-registro-de-eventos",
  storageBucket: "sistema-registro-de-eventos.firebasestorage.app",
  messagingSenderId: "988660578275",
  appId: "1:988660578275:web:ff5a97c115c70a70c352d6",
  measurementId: "G-73SJXBBDG2"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar para usar en otros archivos
export { db };
