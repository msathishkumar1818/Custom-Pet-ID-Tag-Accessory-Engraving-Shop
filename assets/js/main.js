/**
 * MAIN JAVASCRIPT ENGINE
 * Custom Pet ID Tag & Accessory Engraving Shop
 * Handles: Preloader, Fixed Header, Dark Mode (#000000), RTL/LTR Engine,
 * Dropdown (Click-Only), Mobile Drawer, Accordion, Scroll-to-Top, Active Navigation.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. PRELOADER
  // -------------------------------------------------------------
  const preloader = document.getElementById('page-preloader');
  function removePreloader() {
    if (preloader && !preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 450);
    }
  }

  window.addEventListener('load', removePreloader);
  // Safety timeout: dismiss after 1.5s max in case of slow resources
  setTimeout(removePreloader, 1500);

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // 2. THEME ENGINE (STRICT #000000 DARK MODE)
  // -------------------------------------------------------------
  const THEME_KEY = 'pet_tag_theme';
  const htmlEl = document.documentElement;
  const darkToggleBtns = document.querySelectorAll('.js-dark-toggle, #theme-dark-btn, #drawer-dark-btn');

  function applyTheme(isDark) {
    if (isDark) {
      htmlEl.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      htmlEl.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
    updateThemeUI(isDark);
  }

  function updateThemeUI(isDark) {
    darkToggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      const sunIcon = btn.querySelector('.icon-sun, .light-icon');
      const moonIcon = btn.querySelector('.icon-moon, .dark-icon');
      if (sunIcon && moonIcon) {
        if (isDark) {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        }
      }
    });
  }

  // Initialize theme from storage or system preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
  applyTheme(initialDark);

  darkToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentlyDark = htmlEl.classList.contains('dark');
      applyTheme(!currentlyDark);
    });
  });

  // -------------------------------------------------------------
  // 3. DIRECTION ENGINE (RTL / LTR)
  // -------------------------------------------------------------
  const DIR_KEY = 'pet_tag_direction';
  const rtlToggleBtns = document.querySelectorAll('.js-rtl-toggle, #theme-rtl-btn, #drawer-rtl-btn');

  function applyDirection(dir) {
    htmlEl.setAttribute('dir', dir);
    localStorage.setItem(DIR_KEY, dir);
    updateDirectionUI(dir);
  }

  function updateDirectionUI(dir) {
    const isRtl = dir === 'rtl';
    rtlToggleBtns.forEach(btn => {
      btn.setAttribute('aria-label', isRtl ? 'Switch to LTR' : 'Switch to RTL');
      const rtlText = btn.querySelector('.rtl-text, .toggle-text-rtl');
      if (rtlText) {
        rtlText.textContent = isRtl ? 'LTR' : 'RTL';
      }
    });
  }

  const savedDir = localStorage.getItem(DIR_KEY) || 'ltr';
  applyDirection(savedDir);

  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
      const currentDir = htmlEl.getAttribute('dir') || 'ltr';
      applyDirection(currentDir === 'rtl' ? 'ltr' : 'rtl');
    });
  });

  // -------------------------------------------------------------
  // 4. DESKTOP HOME DROPDOWN (CLICK ONLY - NO HOVER EVER)
  // -------------------------------------------------------------
  const dropdownWrappers = document.querySelectorAll('.js-nav-dropdown, #home-dropdown-wrapper');

  dropdownWrappers.forEach(wrapper => {
    const trigger = wrapper.querySelector('.dropdown-trigger, #home-dropdown-btn');
    const panel = wrapper.querySelector('.dropdown-panel, #home-dropdown-menu');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('is-open');

      // Close all other dropdowns first
      dropdownWrappers.forEach(other => {
        if (other !== wrapper) {
          other.classList.remove('is-open');
          const otherTrigger = other.querySelector('.dropdown-trigger, #home-dropdown-btn');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        wrapper.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        wrapper.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    dropdownWrappers.forEach(wrapper => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('is-open');
        const trigger = wrapper.querySelector('.dropdown-trigger, #home-dropdown-btn');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close dropdown on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownWrappers.forEach(wrapper => {
        wrapper.classList.remove('is-open');
        const trigger = wrapper.querySelector('.dropdown-trigger, #home-dropdown-btn');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
      closeMobileMenu();
    }
  });

  // -------------------------------------------------------------
  // 5. MOBILE DRAWER NAVIGATION
  // -------------------------------------------------------------
  const mobileToggleBtns = document.querySelectorAll('.js-mobile-toggle, #mobile-menu-open-btn, .mobile-drawer-toggle');
  const drawerCloseBtns = document.querySelectorAll('.js-drawer-close, #mobile-menu-close-btn, .drawer-close-btn');
  const drawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const drawerAccordions = document.querySelectorAll('.js-drawer-accordion');

  function resetDrawerAccordions() {
    drawerAccordions.forEach(acc => {
      acc.classList.remove('is-open');
      const btn = acc.querySelector('.drawer-accordion-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  // Ensure closed on initial page load
  resetDrawerAccordions();

  function openMobileMenu() {
    if (drawer && drawerBackdrop) {
      resetDrawerAccordions(); // Strictly closed by default on drawer open
      drawer.classList.add('is-open');
      drawerBackdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      mobileToggleBtns.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
    }
  }

  function closeMobileMenu() {
    if (drawer && drawerBackdrop) {
      drawer.classList.remove('is-open');
      drawerBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      mobileToggleBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      resetDrawerAccordions(); // Reset to closed state when drawer closes
    }
  }

  mobileToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileMenu();
    });
  });

  drawerCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
    });
  });

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeMobileMenu);
  }

  // Clicking ANY mobile navigation link closes the drawer immediately
  const drawerNavLinks = document.querySelectorAll('.mobile-drawer a');
  drawerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Automatically close mobile menu and unlock body scroll if resized to large desktop (> 1366px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1366) {
      closeMobileMenu();
    }
  }, { passive: true });

  // -------------------------------------------------------------
  // 6. MOBILE ACCORDION (FOR HOME SUBMENU - CLICK ONLY)
  // -------------------------------------------------------------
  drawerAccordions.forEach(acc => {
    const btn = acc.querySelector('.drawer-accordion-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = acc.classList.contains('is-open');
      if (isOpen) {
        acc.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        acc.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // -------------------------------------------------------------
  // 7. ACTIVE NAVIGATION HIGHLIGHTER
  // -------------------------------------------------------------
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const rawPath = pathParts.length ? pathParts[pathParts.length - 1] : '';
  const currentPath = (rawPath === '' || rawPath === '/' || !rawPath.includes('.html')) ? 'index.html' : rawPath;

  const allNavLinks = document.querySelectorAll('.nav-link, .dropdown-panel a, .drawer-nav-link, .drawer-sublink');
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.split('/').pop();
    if (cleanHref === currentPath || (currentPath === 'index.html' && (cleanHref === 'index.html' || cleanHref === '' || cleanHref === './'))) {
      link.classList.add('active');
      // If inside dropdown or accordion, highlight parent as well
      const parentDropdown = link.closest('.js-nav-dropdown');
      if (parentDropdown) {
        const trigger = parentDropdown.querySelector('.dropdown-trigger');
        if (trigger) trigger.classList.add('active');
      }
      const parentAccordion = link.closest('.js-drawer-accordion');
      if (parentAccordion) {
        // Do NOT automatically open accordion; strictly keep closed until clicked
        const btn = parentAccordion.querySelector('.drawer-accordion-btn');
        if (btn) btn.classList.add('active');
      }
    }
  });

  // Explicit check: when on Home 1 (index.html), ensure both Home accordion button and Home 1 sublink are active
  if (currentPath === 'index.html') {
    const homeSublink1 = document.querySelector('.drawer-sublink[href="index.html"], .drawer-sublink[href="./index.html"]');
    if (homeSublink1) homeSublink1.classList.add('active');

    const homeAccordionBtn = document.querySelector('.drawer-accordion .drawer-accordion-btn');
    if (homeAccordionBtn) homeAccordionBtn.classList.add('active');
  }

  // -------------------------------------------------------------
  // 8. SCROLL EFFECTS: FIXED HEADER & SCROLL-TO-TOP
  // -------------------------------------------------------------
  const siteHeader = document.querySelector('.site-header');
  const scrollTopBtn = document.getElementById('scroll-to-top');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Header shadow/blur state
    if (siteHeader) {
      if (scrollY > 20) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }

    // Scroll to top button visibility
    if (scrollTopBtn) {
      if (scrollY > 300) {
        scrollTopBtn.classList.add('is-visible');
      } else {
        scrollTopBtn.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // -------------------------------------------------------------
  // 9. INTERACTIVE TAG CUSTOMIZER ENGINE (for design.html)
  // -------------------------------------------------------------
  const customizerRoot = document.getElementById('tag-customizer-app');
  if (customizerRoot) {
    const liveTagShape = document.getElementById('live-tag-svg-shape');
    const livePetName = document.getElementById('live-tag-pet-name');
    const livePhone = document.getElementById('live-tag-phone');
    const liveMicrochip = document.getElementById('live-tag-microchip');
    const livePrice = document.getElementById('live-customizer-price');

    const inputPetName = document.getElementById('input-tag-name');
    const inputPhone = document.getElementById('input-tag-phone');
    const inputMicrochip = document.getElementById('input-tag-microchip');

    const metalSelectors = document.querySelectorAll('.js-metal-select');
    const shapeSelectors = document.querySelectorAll('.js-shape-select');
    const fontSelectors = document.querySelectorAll('.js-font-select');
    const sizeSelectors = document.querySelectorAll('.js-size-select');

    let currentPrice = 24.00;
    let basePrice = 24.00;
    let sizeAdder = 0.00;

    // Live Text Inputs
    if (inputPetName && livePetName) {
      inputPetName.addEventListener('input', (e) => {
        livePetName.textContent = e.target.value.trim() ? e.target.value.toUpperCase() : 'LUNA';
      });
    }

    if (inputPhone && livePhone) {
      inputPhone.addEventListener('input', (e) => {
        livePhone.textContent = e.target.value.trim() ? e.target.value : '555-019-2849';
      });
    }

    if (inputMicrochip && liveMicrochip) {
      inputMicrochip.addEventListener('input', (e) => {
        liveMicrochip.textContent = e.target.value.trim() ? e.target.value : 'MICROCHIPPED & REWARD';
      });
    }

    // Metal Finishes
    metalSelectors.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        metalSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const metal = btn.getAttribute('data-metal');
        const livePlate = document.getElementById('live-tag-plate');
        if (livePlate) {
          livePlate.setAttribute('data-finish', metal);
        }
      });
    });

    // Shapes
    shapeSelectors.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        shapeSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.getAttribute('data-shape');
        const livePlate = document.getElementById('live-tag-plate');
        if (livePlate) {
          livePlate.setAttribute('data-shape', shape);
        }
      });
    });

    // Fonts
    fontSelectors.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        fontSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const fontClass = btn.getAttribute('data-font');
        if (livePetName) {
          livePetName.className = 'customizer-text-name ' + fontClass;
        }
      });
    });

    // Sizes & Price
    sizeSelectors.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        sizeSelectors.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const added = parseFloat(btn.getAttribute('data-add') || '0');
        sizeAdder = added;
        if (livePrice) {
          const total = (basePrice + sizeAdder).toFixed(2);
          livePrice.textContent = '$' + total;
        }
      });
    });
  }

  /* ========================================================================
     CONTACT PAGE — INTERACTIVE FAQ ACCORDION & INQUIRY FORM
     ======================================================================== */
  const faqButtons = document.querySelectorAll('.faq-accordion-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.faq-accordion-item');
      if (!parent) return;
      const isOpen = parent.classList.contains('active');
      document.querySelectorAll('.faq-accordion-item').forEach(item => item.classList.remove('active'));
      if (!isOpen) {
        parent.classList.add('active');
      }
    });
  });

  const subjectPills = document.querySelectorAll('.subject-pill-btn');
  subjectPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      subjectPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  const speciesFilterBtns = document.querySelectorAll('.species-filter-nav .filter-btn');
  speciesFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speciesFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const contactForm = document.getElementById('atelier-inquiry-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.btn-contact-submit');
      if (submitBtn) {
        const origText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Proof Request Received!</span>';
        submitBtn.style.backgroundColor = '#16a34a';
        setTimeout(() => {
          submitBtn.innerHTML = origText;
          submitBtn.style.backgroundColor = '';
          contactForm.reset();
        }, 3000);
      }
    });
  }

})();


