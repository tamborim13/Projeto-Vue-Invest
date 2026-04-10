// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Adicionando o Storage
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyABIh1BXJg-6QGs34OuTaNpkvUWzQSeCWY",
  authDomain: "vue-firebase-31de1.firebaseapp.com",
  projectId: "vue-firebase-31de1",
  storageBucket: "vue-firebase-31de1.firebasestorage.app", // O endereço do seu storage já está aqui!
  messagingSenderId: "133522615554",
  appId: "1:133522615554:web:13b1ed664aab4a814e261b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Instâncias
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializando o Storage

// Exporta tudo para usar nos componentes Vue
export { auth, db, storage };