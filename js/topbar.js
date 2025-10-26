document.addEventListener("DOMContentLoaded", async () => {
  try {
    // jika template JS disertakan di HTML, gunakan itu agar tidak terinjeksi
    const hasTopTemplate = typeof window !== "undefined" && !!window.__TOPBAR_HTML;
    const hasSideTemplate = typeof window !== "undefined" && !!window.__SIDEBAR_HTML;

    let topbarHTML = hasTopTemplate ? window.__TOPBAR_HTML : null;
    let sidebarHTML = hasSideTemplate ? window.__SIDEBAR_HTML : null;

    // fallback: fetch dari file (tetap ada pembersihan)
    if (!topbarHTML || !sidebarHTML) {
      const [topResp, sideResp] = await Promise.all([
        fetch("../components/topbar.html"),
        fetch("../components/sidebar.html")
      ]);
      if (!topbarHTML) topbarHTML = await topResp.text();
      if (!sidebarHTML) sidebarHTML = await sideResp.text();
    }

    // fungsi pembersih injeksi (aman)
    const clean = (html) => {
      if (!html) return html;
      return html
        .replace(/<!--\s*Code injected by live-server\s*-->/gi, "")
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<noscript>[^<]*<\/noscript>/gi, "")
        .replace(/\n{2,}/g, "\n");
    };

    topbarHTML = clean(topbarHTML);
    sidebarHTML = clean(sidebarHTML);

    // masukkan ke DOM
    const topTarget = document.getElementById("topbar-container");
    if (topTarget) topTarget.insertAdjacentHTML("afterbegin", topbarHTML);

    const sideTarget = document.getElementById("sidebar-container");
    if (sideTarget) sideTarget.insertAdjacentHTML("afterbegin", sidebarHTML);

    // setup toggle
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");
    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        if (mainContent) mainContent.classList.toggle("collapsed");
      });
    }
  } catch (err) {
    console.error("Error loading components:", err);
  }
});
