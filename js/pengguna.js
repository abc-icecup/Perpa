// ===============================
// 🔹 IMPORT DARI FIREBASE CONFIG
// ===============================
import {
  database,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
} from "../api/firebase_config.js"; // ubah path sesuai lokasi sebenarnya

// ===============================
// 🔹 MODAL & VARIABEL DASAR
// ===============================
const openModalBtn = document.getElementById("openModalBtn");
const modalTambah = document.getElementById("modalTambah");
const closeModalBtn = document.getElementById("closeModalBtn");
const closeModalBtn2 = document.getElementById("closeModalBtn2");
const formTambah = document.getElementById("formTambah");
const tableBody = document.querySelector("#tabelPengguna tbody");

let editMode = false;
let editKey = null;

// ===============================
// 🔹 MODAL KONTROL
// ===============================
openModalBtn.addEventListener("click", () => {
  formTambah.reset();
  editMode = false;
  modalTambah.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => modalTambah.classList.add("hidden"));
closeModalBtn2.addEventListener("click", () => modalTambah.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === modalTambah) modalTambah.classList.add("hidden");
});

// ===============================
// 🔹 RENDER TABEL DARI FIREBASE
// ===============================
function renderTabel() {
  const penggunaRef = ref(database, "kelola_pengguna");
  onValue(penggunaRef, (snapshot) => {
    tableBody.innerHTML = "";
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach((key) => {
        const item = data[key];
        tambahBaris(key, item.nama, item.jabatan, item.idRfid, item.status);
      });
    }
  });
}

// ===============================
// 🔹 TAMBAH BARIS KE TABEL
// ===============================
function tambahBaris(key, nama, jabatan, idRfid, status = "Aktif") {
  const newRow = document.createElement("tr");
  newRow.classList.add("border-b");
  newRow.dataset.key = key;

  const tombolStatus =
    status === "Aktif"
      ? `<button class="toggleStatusBtn bg-red-500 text-white px-3 py-1 rounded text-sm w-24">Nonaktifkan</button>`
      : `<button class="toggleStatusBtn bg-green-500 text-white px-3 py-1 rounded text-sm w-24">Aktifkan</button>`;

  newRow.innerHTML = `
    <td class="py-2 px-3">${nama}</td>
    <td>${jabatan}</td>
    <td>${idRfid}</td>
    <td>${status}</td>
    <td class="flex items-center gap-2 py-2">
      ${tombolStatus}
      <div class="relative flex items-center">
        <button class="text-gray-600 px-2" onclick="toggleMenu(this)">⋮</button>
        <div class="hidden absolute right-0 mt-2 w-24 bg-white border rounded shadow-lg z-10">
          <button class="flex items-center gap-1 px-2 py-1 w-full hover:bg-gray-100 text-sm editBtn">✏️ Edit</button>
          <button class="flex items-center gap-1 px-2 py-1 w-full hover:bg-gray-100 text-sm hapusBtn">🗑️ Hapus</button>
        </div>
      </div>
    </td>
  `;
  tableBody.appendChild(newRow);
}

// ===============================
// 🔹 FUNGSI TOGGLE MENU TITIK TIGA
// ===============================
function toggleMenu(button) {
  const menu = button.nextElementSibling;

  // Tutup semua menu lain dulu
  document.querySelectorAll(".relative .absolute").forEach((el) => {
    if (el !== menu) el.classList.add("hidden");
  });

  // Tampilkan atau sembunyikan menu yang diklik
  menu.classList.toggle("hidden");
}
window.toggleMenu = toggleMenu;

// Tutup menu kalau klik di luar area titik tiga
window.addEventListener("click", (e) => {
  if (!e.target.closest(".relative")) {
    document.querySelectorAll(".relative .absolute").forEach((menu) => {
      menu.classList.add("hidden");
    });
  }
});

// ===============================
// 🔹 TAMBAH / EDIT DATA KE FIREBASE
// ===============================
formTambah.addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = document.getElementById("namaInput").value.trim();
  const jabatan = document.getElementById("jabatanInput").value.trim();
  const idRfid = document.getElementById("rfidInput").value.trim();

  if (!nama || !jabatan || !idRfid) {
    alert("Semua kolom wajib diisi!");
    return;
  }

  const penggunaRef = ref(database, "kelola_pengguna");

  if (editMode && editKey) {
    const updateRef = ref(database, `kelola_pengguna/${editKey}`);
    update(updateRef, { nama, jabatan, idRfid })
      .then(() => alert("Data pengguna berhasil diperbarui!"))
      .catch((err) => {
        console.error("Gagal memperbarui:", err);
        alert("Terjadi kesalahan saat memperbarui data.");
      });
  } else {
    const newRef = push(penggunaRef);
    set(newRef, { nama, jabatan, idRfid, status: "Aktif" })
      .then(() => {
        alert("Pengguna berhasil ditambahkan!");
        formTambah.reset();
        modalTambah.classList.add("hidden");
      })
      .catch((error) => {
        console.error("Gagal menambahkan pengguna:", error);
        alert("Gagal menambahkan pengguna. Cek console untuk detail.");
      });
  }

  formTambah.reset();
  modalTambah.classList.add("hidden");
  editMode = false;
  editKey = null;
});

// ===============================
// 🔹 EVENT GLOBAL (EDIT / HAPUS / TOGGLE STATUS)
// ===============================
tableBody.addEventListener("click", (e) => {
  const target = e.target;
  const row = target.closest("tr");
  if (!row) return;
  const key = row.dataset.key;

  // Hapus
  if (target.classList.contains("hapusBtn")) {
    const nama = row.children[0].innerText;
    if (confirm(`Hapus pengguna "${nama}"?`)) {
      const delRef = ref(database, `kelola_pengguna/${key}`);
      remove(delRef);
    }
  }

  // Edit
  if (target.classList.contains("editBtn")) {
    const nama = row.children[0].innerText;
    const jabatan = row.children[1].innerText;
    const idRfid = row.children[2].innerText;

    document.getElementById("namaInput").value = nama;
    document.getElementById("jabatanInput").value = jabatan;
    document.getElementById("rfidInput").value = idRfid;

    editMode = true;
    editKey = key;
    modalTambah.classList.remove("hidden");
  }

  // Toggle Status
  if (target.classList.contains("toggleStatusBtn")) {
    const statusCell = row.children[3];
    const statusBaru = statusCell.innerText === "Aktif" ? "Nonaktif" : "Aktif";
    const updateRef = ref(database, `kelola_pengguna/${key}`);
    update(updateRef, { status: statusBaru });
  }
});

// ===============================
// 🔹 JALANKAN SAAT HALAMAN DIBUKA
// ===============================
document.addEventListener("DOMContentLoaded", renderTabel);
