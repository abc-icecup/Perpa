// js/login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// === Konfigurasi Firebase ===
const firebaseConfig = {
    apiKey: "AIzaSyDEWoyMTrhtn0z8fzXjSLD8pA6ABD5f1nE",
    authDomain: "perpa-smart-lock.firebaseapp.com",
    projectId: "perpa-smart-lock",
    storageBucket: "perpa-smart-lock.firebasestorage.app",
    messagingSenderId: "1062552963709",
    appId: "1:1062552963709:web:caa81d7851fef9d6627f14"
};

// === Inisialisasi Firebase ===
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// === Elemen UI ===
const form = document.querySelector("form");
const emailInput = form.querySelector("input[type='email']");
const passInput = form.querySelector("input[type='password']");
const errorBox = document.getElementById("error-message");

// === Event Login ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  // Reset pesan error
  errorBox.textContent = "";
  errorBox.style.display = "none";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Jika sukses, redirect
    window.location.href = "../pages/index.html";
  } catch (error) {
    let message = "Terjadi kesalahan.";
    if (error.code === "auth/user-not-found") {
      message = "Email tidak terdaftar.";
    } else if (error.code === "auth/wrong-password") {
      message = "Password salah.";
    } else if (error.code === "auth/invalid-email") {
      message = "Format email tidak valid.";
    } else if (error.code === "auth/too-many-requests") {
      message = "Terlalu banyak percobaan login. Coba lagi nanti.";
    }
    errorBox.textContent = message;
    errorBox.style.display = "block";
  }
});
