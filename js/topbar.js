function setActiveSidebar() {
  const currentPage = window.location.pathname.split("/").pop();

  document.querySelectorAll(".sidebar ul li a").forEach(link => {
    const page = link.dataset.page;
    if (page === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ===== LOAD TOPBAR & SIDEBAR (punyamu, tidak diubah) =====
    const hasTopTemplate = typeof window !== "undefined" && !!window.__TOPBAR_HTML;
    const hasSideTemplate = typeof window !== "undefined" && !!window.__SIDEBAR_HTML;

    let topbarHTML = hasTopTemplate ? window.__TOPBAR_HTML : null;
    let sidebarHTML = hasSideTemplate ? window.__SIDEBAR_HTML : null;

    if (!topbarHTML || !sidebarHTML) {
      const [topResp, sideResp] = await Promise.all([
        fetch("../components/topbar.html"),
        fetch("../components/sidebar.html")
      ]);
      if (!topbarHTML) topbarHTML = await topResp.text();
      if (!sidebarHTML) sidebarHTML = await sideResp.text();
    }

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

    const topTarget = document.getElementById("topbar-container");
    const sideTarget = document.getElementById("sidebar-container");

    if (topTarget) topTarget.insertAdjacentHTML("afterbegin", topbarHTML);
    if (sideTarget) sideTarget.insertAdjacentHTML("afterbegin", sidebarHTML);

    setActiveSidebar();

    // ===== SETUP TOGGLE (INI YANG DIPERBAIKI) =====
    const waitForElements = () => {
      const menuToggle =
        document.querySelector(".menu-toggle") ||
        document.getElementById("menuToggle");

      if (!menuToggle) return false;

      // 🔥 SATU-SATUNYA TOGGLE YANG KITA PAKAI
      menuToggle.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-collapsed");
      });

      return true;
    };

    let attempts = 0;
    const interval = setInterval(() => {
      if (waitForElements() || attempts > 10) {
        clearInterval(interval);
      }
      attempts++;
    }, 200);

  } catch (err) {
    console.error("Error loading topbar/sidebar:", err);
  }
});
