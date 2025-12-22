// ===============================
// 🔥 IMPORT FIREBASE
// ===============================
import { database } from "../api/firebase_config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// ===============================
// 📌 ELEMENT HTML
// ===============================
const dotKondisi        = document.getElementById("dot-kondisi");
const kondisiText       = document.getElementById("kondisi-text");

const kunciText         = document.getElementById("kunci-text");
const kunciIcon         = document.getElementById("kunci-icon");

const statusPintuText   = document.getElementById("status-pintu-text");
const statusPintuIcon   = document.getElementById("status-pintu-icon");

const statusSistemText  = document.getElementById("status-sistem");

const jumlahAksesText   = document.getElementById("jumlah-akses");
const tbody             = document.getElementById("riwayat-body");

// ===============================
// 🎨 ICON
// ===============================
const ICONS = {
  status_kunci: {
    "Terkunci": "../assets/kunci.svg",
    "Tidak Terkunci": "../assets/unlock.png"
  },
  status_pintu: {
    "Aman": "../assets/svgg.svg",
    "Tidak Aman": "../assets/unsecured.png"
  }
};

// ===============================
// ⚡ REALTIME RIWAYAT
// ===============================
const riwayatRef = ref(database, "riwayat_akses");

onValue(riwayatRef, (snapshot) => {
  if (!snapshot.exists()) return;

  const dataRiwayat = Object.values(snapshot.val()).sort(
    (a, b) => new Date(b.iso_timestamp) - new Date(a.iso_timestamp)
  );

  const latest = dataRiwayat[0];

  // ===============================
  // 🔹 KONDISI PINTU
  // ===============================
  kondisiText.textContent = latest.kondisi_pintu;
  dotKondisi.style.backgroundColor =
    latest.kondisi_pintu === "Terbuka" ? "#EE2727" : "#14B8A6";
  kondisiText.style.color =
    latest.kondisi_pintu === "Terbuka" ? "#EE2727" : "";

  // ===============================
  // 🔹 STATUS KUNCI
  // ===============================
  kunciText.textContent = latest.status_kunci;
  kunciIcon.src = ICONS.status_kunci[latest.status_kunci] || "";
  kunciText.style.color =
    latest.status_kunci === "Tidak Terkunci" ? "#EE2727" : "";

  // ===============================
  // 🔹 STATUS PINTU
  // ===============================
  let statusPintu = "Tidak Aman";

  if (
    latest.kondisi_pintu === "Tertutup" &&
    latest.status_kunci === "Terkunci" &&
    latest.status_akses !== "Ilegal"
  ) {
    statusPintu = "Aman";
  }

  statusPintuText.textContent = statusPintu;
  statusPintuIcon.src = ICONS.status_pintu[statusPintu] || "";
  statusPintuText.style.color =
    statusPintu === "Tidak Aman" ? "#EE2727" : "";

  // ===============================
  // 🔹 RIWAYAT (MAX 5)
  // ===============================
  tbody.innerHTML = "";

  const today = new Date().toISOString().slice(0, 10);
  let jumlahHariIni = 0;

  dataRiwayat.forEach(item => {
    if (item.iso_timestamp.slice(0, 10) === today) {
      jumlahHariIni++;
    }
  });

  dataRiwayat.slice(0, 5).forEach(item => {
    const tr = document.createElement("tr");

    const namaTampil =
      item.nama && item.nama.trim() !== "" ? item.nama : "-";

    tr.innerHTML = `
      <td>${item.iso_timestamp.slice(11, 16)}</td>
      <td>${item.idRfid || "-"}</td>
      <td>${namaTampil}</td>
    `;

    if (item.status_akses === "Ilegal") {
      tr.style.color = "#EE2727";
      tr.style.fontWeight = "600";
    }

    tbody.appendChild(tr);
  });

  jumlahAksesText.textContent = jumlahHariIni;
});

// ===============================
// 🔄 STATUS SISTEM
// ===============================
const statusSistemRef = ref(database, "status_sistem/status_sistem");

onValue(statusSistemRef, (snapshot) => {
  statusSistemText.textContent = snapshot.val() || "Offline";
});
