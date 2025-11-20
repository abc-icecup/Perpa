document.addEventListener("DOMContentLoaded", async () => {
  try {
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

    // insert HTML into page
    const topTarget = document.getElementById("topbar-container");
    if (topTarget) topTarget.insertAdjacentHTML("afterbegin", topbarHTML);

    const sideTarget = document.getElementById("sidebar-container");
    if (sideTarget) sideTarget.insertAdjacentHTML("afterbegin", sidebarHTML);

    // helper: setup listeners once we have references (try immediate first)
    const setupListeners = () => {
      const menuToggle = topTarget ? topTarget.querySelector("#menuToggle") : document.getElementById("menuToggle");
      const sidebar = sideTarget ? sideTarget.querySelector("#sidebar") : document.getElementById("sidebar");
      const mainContent = document.querySelector(".main-content");

      if (!menuToggle || !sidebar || !mainContent) return false; // not ready yet

      // flag: has user toggled manually?
      let userToggled = false;

      // Initialize responsive behavior ONCE (do not auto-change after user toggles)
      const initResponsiveOnce = () => {
        if (window.innerWidth <= 768) {
          // mobile: sidebar hidden by default (overlay)
          sidebar.classList.remove("collapsed");
          sidebar.classList.remove("open");
          mainContent.classList.remove("collapsed");
        } else {
          // desktop: sidebar visible by default (expanded)
          sidebar.classList.remove("collapsed");
          sidebar.classList.remove("open");
          mainContent.classList.remove("collapsed");
        }
      };
      initResponsiveOnce();

      // Toggle behavior (user click)
      menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        userToggled = true; // user explicitly toggled
        // On mobile (<=768) we'll use 'open' as overlay state; on desktop toggle 'collapsed'
        if (window.innerWidth <= 768) {
          // mobile: open overlay
          const nowOpen = sidebar.classList.toggle("open");
          // ensure collapsed is off in mobile overlay mode
          sidebar.classList.remove("collapsed");
          if (nowOpen) {
            // optionally prevent background scroll
            document.body.style.overflow = "hidden";
          } else {
            document.body.style.overflow = "";
          }
        } else {
          // desktop: shrink/grow sidebar
          const isCollapsed = sidebar.classList.toggle("collapsed");
          if (isCollapsed) {
            mainContent.classList.add("collapsed");
          } else {
            mainContent.classList.remove("collapsed");
          }
          // ensure overlay .open is off for desktop
          sidebar.classList.remove("open");
        }
      });

      // Click outside sidebar on mobile closes overlay
      document.addEventListener("click", (ev) => {
        if (window.innerWidth <= 768) {
          const isOpen = sidebar.classList.contains("open");
          if (isOpen) {
            // if click is outside the sidebar and not the menuToggle, close
            const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
            const clickedSidebar = path.includes(sidebar);
            const clickedToggle = path.includes(menuToggle);
            if (!clickedSidebar && !clickedToggle) {
              sidebar.classList.remove("open");
              document.body.style.overflow = "";
            }
          }
        }
      });

      // IMPORTANT: remove any automatic resize auto-toggle behavior
      // But keep a very small listener to update layout *only* if necessary (no class toggling).
      // This listener will NOT change collapsed/open state if user already toggled.
      const neutralResizeHandler = () => {
        // if user already toggled, respect their choice — do nothing
        if (userToggled) return;
        // Otherwise, adapt initial layout passively (no forced toggle):
        // e.g., if switching between mobile and desktop we remove overlay classes so UI remains sane.
        if (window.innerWidth <= 768) {
          // mobile: ensure overlay is not unintentionally left collapsed
          sidebar.classList.remove("collapsed");
          // keep overlay closed by default
          sidebar.classList.remove("open");
          mainContent.classList.remove("collapsed");
          document.body.style.overflow = "";
        } else {
          // desktop: ensure not overlay
          sidebar.classList.remove("open");
          // keep sidebar expanded by default
          sidebar.classList.remove("collapsed");
          mainContent.classList.remove("collapsed");
          document.body.style.overflow = "";
        }
      };

      // Listen but do not change user choice; debounced to avoid thrashing
      let resizeTimer = null;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(neutralResizeHandler, 150);
      });

      // Sidebar menu click -> redirect (requires data-page attributes on li)
      const sidebarLinks = sidebar.querySelectorAll("ul li");
      sidebarLinks.forEach((li) => {
        li.addEventListener("click", () => {
          const targetPage = li.getAttribute("data-page");
          // set active visual
          sidebarLinks.forEach(i => i.classList.remove("active"));
          li.classList.add("active");

          // on mobile close overlay after click
          if (window.innerWidth <= 768) {
            sidebar.classList.remove("open");
            document.body.style.overflow = "";
          }

          // redirect if defined
          if (targetPage) {
            window.location.href = targetPage;
            return;
          }
        });
      });

      // Search input -> dispatch custom event for page-specific handlers
      const searchInput = topTarget ? topTarget.querySelector(".search-bar") : document.querySelector(".search-bar");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          const query = String(e.target.value || "").trim();
          const ev = new CustomEvent("topbarSearch", { detail: { query } });
          document.dispatchEvent(ev);
        });
      }

      return true;
    };

    // Try immediate setup (limited attempts)
    let attempts = 0;
    const intv = setInterval(() => {
      const ok = setupListeners();
      attempts++;
      if (ok || attempts > 8) clearInterval(intv);
    }, 250);

  } catch (err) {
    console.error("Error loading components:", err);
  }
});
