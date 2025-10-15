// === Memuat komponen topbar dan sidebar ===
Promise.all([
  fetch("../components/topbar.html").then(res => res.text()),
  fetch("../components/sidebar.html").then(res => res.text())
]).then(([topbarHTML, sidebarHTML]) => {
  document.getElementById("topbar-container").innerHTML = topbarHTML;
  document.getElementById("sidebar-container").innerHTML = sidebarHTML;

  // === Setelah DOM komponen dimuat, baru ambil elemen ===
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
});
