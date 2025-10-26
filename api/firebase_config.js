// ===============================
// 🔹 FIREBASE CONFIGURATION
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// 🔐 Ganti dengan kredensial proyek kamu sendiri
const firebaseConfig = {
  apiKey: "AIzaSyDEWoyMTrhtn0z8fzXjSLD8pA6ABD5f1nE",
  authDomain: "perpa-smart-lock.firebaseapp.com",
  databaseURL: "https://perpa-smart-lock-default-rtdb.firebaseio.com",
  projectId: "perpa-smart-lock",
  storageBucket: "perpa-smart-lock.firebasestorage.app",
  messagingSenderId: "1062552963709",
  appId: "1:1062552963709:web:caa81d7851fef9d6627f14"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export modul supaya bisa digunakan di file lain
export { app, database, ref, push, set, update, remove, onValue };

