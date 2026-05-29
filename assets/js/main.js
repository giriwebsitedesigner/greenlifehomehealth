(function () {
  "use strict";

  var PHONE = "916383915367";
  var DEFAULT_MESSAGE = "Hello Green Life Home Health Care, I would like to book a home healthcare appointment in Chennai.";

  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };

  var scriptSrc = document.currentScript && document.currentScript.src;
  var assetRoot = scriptSrc ? new URL("../", scriptSrc) : new URL("assets/", window.location.href);
  var siteRoot = new URL("../", assetRoot);

  function assetUrl(path) {
    return new URL(path, assetRoot).href;
  }

  function sitePathname() {
    var basePath = siteRoot.pathname || "/";
    var current = window.location.pathname || "/";
    if (basePath !== "/" && current.indexOf(basePath) === 0) {
      current = current.slice(basePath.length);
    }
    return "/" + current.replace(/^\/+/, "");
  }

  var pageSlug = sitePathname()
    .replace(/\/index\.html$/i, "/")
    .split("/")
    .filter(Boolean)[0] || "home";
  document.body.classList.add("page-" + pageSlug);
  document.body.dataset.motionPage = pageSlug;

  function syncDesktopRequestMode() {
    var coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var touchPoints = navigator.maxTouchPoints || 0;
    var smallestScreenSide = Math.min(window.screen.width || window.innerWidth, window.screen.height || window.innerHeight);
    var likelyPhoneScreen = smallestScreenSide <= 700 || (/Android|iPhone|Mobile/i).test(navigator.userAgent || "");
    var desktopViewport = window.innerWidth >= 900;
    document.documentElement.classList.toggle("gl-desktop-request", !!((coarsePointer || touchPoints > 0) && likelyPhoneScreen && desktopViewport));
  }

  syncDesktopRequestMode();
  window.addEventListener("resize", syncDesktopRequestMode);

  function initBrandLoader() {
    var loader = document.createElement("div");
    loader.className = "gl-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-label", "Loading Green Life Home Health Care");
    loader.innerHTML =
      '<div class="gl-loader-card">' +
        '<div class="gl-loader-mark">' +
          '<img src="' + assetUrl("icons/green-life-logo.png?v=1") + '" alt="">' +
        '</div>' +
        '<div class="gl-loader-title">Green Life</div>' +
        '<div class="gl-loader-subtitle">Home Health Care</div>' +
        '<div class="gl-loader-line"><span></span></div>' +
      '</div>';
    document.body.classList.add("gl-loading");
    document.body.prepend(loader);

    window.setTimeout(function () {
      loader.classList.add("is-leaving");
      document.body.classList.remove("gl-loading");
      window.setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 650);
    }, 1250);
  }

  if (pageSlug === "home") {
    initBrandLoader();
  }

  function toast(msg) {
    var t = qs("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(function () { t.classList.remove("show"); }, 2800);
  }

  function waUrl(message) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(message || DEFAULT_MESSAGE);
  }

  function openWhatsApp(message) {
    window.open(waUrl(message || DEFAULT_MESSAGE), "_blank");
  }

  function buildAppointmentBody(data) {
    return [
      "Hello Green Life Home Health Care, I would like to book an appointment.",
      "",
      "Name: " + data.name,
      "Phone: " + data.phone,
      "Care Type: " + data.service,
      "Location: " + (data.location || "Chennai"),
      "Preferred Date: " + (data.date || "Flexible"),
      "Patient Name: " + (data.patientName || "Not provided"),
      "Patient Age: " + (data.patientAge || "Not provided"),
      "Patient Gender: " + (data.patientGender || "Not provided"),
      "Patient Weight: " + (data.patientWeight ? data.patientWeight + " kg" : "Not provided"),
      "Diagnosis/Complaints: " + (data.diagnosis || "Please contact me with details.")
    ].join("\n");
  }

  function validateForm(data) {
    var required = ["name", "phone", "service", "patientWeight"];
    var missing = required.filter(function (k) { return !String(data[k] || "").trim(); });
    if (missing.length) {
      toast("Please complete name, phone, care type and patient weight.");
      return false;
    }
    return true;
  }

  function ensureQuickActions() {
    var wrap = qs(".gl-ios-actions");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "gl-ios-actions";
      document.body.appendChild(wrap);
    }
    wrap.setAttribute("aria-label", "Quick contact actions");
    wrap.innerHTML =
      '<a class="wa" href="https://wa.me/' + PHONE + '" aria-label="WhatsApp Now">' +
        '<img src="' + assetUrl("icons/float-whatsapp.png?v=1") + '" alt="">' +
      '</a>' +
      '<a class="phone" href="tel:+916383915367" aria-label="Call Now">' +
        '<img src="' + assetUrl("icons/float-phone.png?v=1") + '" alt="">' +
      '</a>';
  }

  ensureQuickActions();

  function routePath(path) {
    path = String(path || "").replace(/^\/+/, "");
    var target = new URL(path, siteRoot);
    return target.pathname + target.search + target.hash;
  }

  function normalizeFolderRoute(path) {
    var hash = "";
    var query = "";
    var hashIndex = path.indexOf("#");
    if (hashIndex > -1) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }
    var queryIndex = path.indexOf("?");
    if (queryIndex > -1) {
      query = path.slice(queryIndex);
      path = path.slice(0, queryIndex);
    }
    path = path
      .replace(/^\/+/, "")
      .replace(/\/index\.html$/i, "/")
      .replace(/^about\/about\.html$/i, "about/")
      .replace(/^services\/services\.html$/i, "services/")
      .replace(/^appointment\/appointment\.html$/i, "appointment/")
      .replace(/^testimonials\/testimonials\.html$/i, "testimonials/")
      .replace(/^contact\/contact\.html$/i, "contact/")
      .replace(/^gallery\/gallery\.html$/i, "gallery/")
      .replace(/^services\/([^/]+)\.html$/i, "services/$1/");
    if (path && !path.endsWith("/")) path += "/";
    return path + query + hash;
  }

  function siteUrl(path) {
    return routePath(normalizeFolderRoute(path));
  }

  function normalizeSiteLinks() {
    qsa('a[href^="/"]').forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (!/^\/(about|appointment|contact|gallery|services|testimonials)(\/|$)/i.test(href)) return;
      link.setAttribute("href", routePath(normalizeFolderRoute(href)));
    });
  }

  normalizeSiteLinks();

  function ensureServicesMenu() {
    var items = [
      ["All Services", "services/"],
      ["Nursing Care at Home", "services/nursing-care/"],
      ["Physiotherapy at Home", "services/physiotherapy/"],
      ["Post Operative Care", "services/post-operative-care/"],
      ["Geriatric Care", "services/elder-care/"],
      ["Palliative Care", "services/palliative-care/"],
      ["Doctor's Visit at Home", "services/doctor-visit/"],
      ["Pediatric Care", "services/pediatric-care/"],
      ["Professional Care Giver / Care Taker", "services/professional-caregiver/"]
    ];

    qsa(".nav-links").forEach(function (nav) {
      if (qs(".nav-service-menu", nav)) return;
      var serviceLink = qsa("a", nav).find(function (link) {
        var href = link.getAttribute("href") || "";
        var text = link.textContent.trim().toLowerCase();
        // Find Services link - check if href contains services and text is "services"
        return (href.includes("services") || href.includes("/services/")) && text === "services";
      });
      if (!serviceLink) return;

      var menu = document.createElement("div");
      menu.className = "nav-service-menu";
      menu.innerHTML =
        '<a class="' + serviceLink.className + ' nav-service-trigger" href="' + (serviceLink.getAttribute("href") || routePath("services/")) + '" aria-haspopup="true" aria-expanded="false">' +
          '<span>Services</span>' +
        '</a>' +
        '<button class="nav-service-toggle" type="button" aria-label="Show services" aria-expanded="false">' +
          '<span class="nav-service-caret" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="nav-service-dropdown" role="menu" aria-label="Services">' +
          items.map(function (item) {
            return '<a role="menuitem" href="' + routePath(item[1]) + '">' + item[0] + '</a>';
          }).join("") +
        '</div>';

      serviceLink.replaceWith(menu);
      var trigger = qs(".nav-service-trigger", menu);
      var toggle = qs(".nav-service-toggle", menu);
      function openMenu() {
        menu.classList.add("is-open");
        if (trigger) trigger.setAttribute("aria-expanded", "true");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "true");
          toggle.setAttribute("aria-label", "Hide services");
        }
      }
      function closeMenu() {
        menu.classList.remove("is-open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Show services");
        }
      }

      if (toggle) {
        toggle.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (menu.classList.contains("is-open")) {
            closeMenu();
          } else {
            openMenu();
          }
        });
      }
      if (trigger) {
        trigger.addEventListener("click", function () {
          closeMenu();
        });
      }
      qsa(".nav-service-dropdown a", menu).forEach(function (link) {
        link.addEventListener("click", function () {
          closeMenu();
          // Also close mobile nav menu if open
          var nav = qs(".nav-links");
          var hamb = qs(".hamb");
          if (nav) nav.classList.remove("open");
          if (hamb) {
            hamb.classList.remove("open");
            hamb.setAttribute("aria-expanded", "false");
          }
        });
      });
      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });
    });
  }

  ensureServicesMenu();

  var servicePreviewData = {
    "Nursing Care at Home": {
      img: assetUrl("photos/nursing-care.jpg"),
      text: "Skilled bedside nursing and medical routine support at home."
    },
    "Geriatric Care": {
      img: assetUrl("photos/elder-care.jpg"),
      text: "Elder-friendly supervision, comfort and daily routine care."
    },
    "Post Operative Care": {
      img: assetUrl("photos/post-operative-care.jpg"),
      text: "Safe recovery assistance after surgery or hospital discharge."
    },
    "Recovery Care": {
      img: assetUrl("photos/recovery-care.jpg"),
      text: "Practical support while patients regain strength at home."
    },
    "Physiotherapy at Home": {
      img: assetUrl("photos/physiotherapy.jpg"),
      text: "Mobility, strength and recovery support in a familiar home setting."
    },
    "Palliative Care": {
      img: assetUrl("photos/palliative-care.jpg"),
      text: "Comfort-focused care for serious or long-term illness at home."
    },
    "Doctor's Visit at Home": {
      img: assetUrl("photos/doctor-visit.jpg"),
      text: "Doctor consultation at home for elderly, recovering and follow-up patients."
    },
    "Pediatric Care": {
      img: assetUrl("photos/pediatric-care.jpg"),
      text: "Gentle child-focused home support for families and young patients."
    },
    "Professional Care Giver / Care Taker": {
      img: assetUrl("photos/professional-caregiver-care-taker.png"),
      text: "Reliable caregiver and caretaker support for daily patient comfort, supervision and home routines."
    },
    "Injection Services": {
      img: assetUrl("photos/injection-services.jpg"),
      text: "Prescribed injection support and basic procedures at home."
    },
    "Home Nursing Support": {
      img: assetUrl("photos/home-nursing-support.jpg"),
      text: "Flexible nursing support for planned home care routines."
    },
    "ICU Setup Support": {
      img: assetUrl("photos/icu-setup-support.jpg"),
      text: "Home ICU setup coordination and higher-dependency support."
    }
  };

  function renderServicePreview(select) {
    var form = select && select.closest("form");
    if (!form) return;
    var value = select.value;
    var data = servicePreviewData[value];
    var preview = qs(".gl-selected-service", form);
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "gl-selected-service";
      select.closest(".field").insertAdjacentElement("afterend", preview);
    }
    if (!data) {
      preview.classList.remove("show");
      preview.innerHTML = "";
      return;
    }
    preview.innerHTML = '<img src="' + data.img + '" alt="' + value + '"><div><span>Selected care</span><strong>' + value + '</strong><p>' + data.text + '</p></div>';
    preview.classList.add("show");
  }

  qsa("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsApp(el.getAttribute("data-message"));
    });
  });

  qsa(".hamb").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var nav = qs(".nav-links");
      var open = nav && nav.classList.toggle("open");
      btn.classList.toggle("open", !!open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      // Close service menus when main menu is closed
      if (!open) {
        qsa(".nav-service-menu").forEach(function (menu) {
          menu.classList.remove("is-open");
          var trigger = qs(".nav-service-trigger", menu);
          var toggle = qs(".nav-service-toggle", menu);
          if (trigger) trigger.setAttribute("aria-expanded", "false");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Show services");
          }
        });
      }
    });
  });

  qsa(".js-scroll").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      var target = qs(href);
      if (!target) return;
      e.preventDefault();
      var nav = qs(".nav-links");
      var hamb = qs(".hamb");
      if (nav) nav.classList.remove("open");
      if (hamb) {
        hamb.classList.remove("open");
        hamb.setAttribute("aria-expanded", "false");
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  qsa(".gl-service-card[data-service]").forEach(function (card) {
    card.addEventListener("click", function () {
      var form = qs("#homeContactForm");
      var service = form && qs('select[name="service"]', form);
      if (service) service.value = card.dataset.service || "";
      var appointment = qs("#appointment");
      if (appointment) {
        appointment.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.href = siteUrl("appointment/?service=" + encodeURIComponent(card.dataset.service || ""));
      }
    });
  });

  qsa('a[href*="service="]').forEach(function (link) {
    link.addEventListener("click", function () {
      try { sessionStorage.setItem("glService", new URL(link.href).searchParams.get("service") || ""); } catch (e) {}
    });
  });

  if (qs("#homeContactForm")) {
    var params = new URLSearchParams(window.location.search);
    var selectedService = params.get("service") || "";
    if (selectedService) {
      var serviceSelect = qs('#homeContactForm select[name="service"]');
      if (serviceSelect) {
        serviceSelect.value = selectedService;
        renderServicePreview(serviceSelect);
      }
    }
  }

  qsa('select[name="service"]').forEach(function (select) {
    renderServicePreview(select);
    select.addEventListener("change", function () { renderServicePreview(select); });
  });

  qsa(".service-tile[data-href]").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      window.location.href = card.dataset.href;
    });
  });

  if (window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    qsa(".gl-service-card, .gl-service-detail, .review-card, .gl-card, .gl-founder-card, .gl-founder-portrait").forEach(function (card) {
      card.classList.add("motion-reactive");
    });
  }

  qsa(".gl-service-card.reveal").forEach(function (card) {
    card.dataset.motion = "card-flip";
  });

  window.addEventListener("scroll", function () {
    var nav = qs(".navbar");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });

  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    qsa(".reveal").forEach(function (el, index) {
      el.style.setProperty("--motion-index", String(index % 8));
      revealIO.observe(el);
    });

    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        qsa(".metric-num[data-count]", entry.target).forEach(function (node) {
          var target = Number(node.dataset.count || 0);
          var current = 0;
          var step = Math.max(1, Math.ceil(target / 58));
          (function tick() {
            current += step;
            if (current >= target) {
              node.textContent = String(target);
            } else {
              node.textContent = String(current);
              requestAnimationFrame(tick);
            }
          })();
        });
        counterIO.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    qsa(".stats, .mini-stats").forEach(function (el) { counterIO.observe(el); });
  } else {
    qsa(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }

  // Modal automation on homepage
  var modal = qs("#gl-modal");
  if (modal) {
    document.body.appendChild(modal);
    var modalClose = qs(".gl-modal-close");
    var modalOverlay = qs(".gl-modal-overlay");
    var modalContent = qs(".gl-modal-content");
    var modalTimer;

    function openModal() {
      if (modalContent) modalContent.scrollTop = 0;
      modal.classList.add("show");
      document.body.classList.add("gl-modal-open");
    }

    function closeModal() {
      modal.classList.remove("show");
      document.body.classList.remove("gl-modal-open");
      if (modalTimer) window.clearTimeout(modalTimer);
    }

    modal.classList.remove("show");
    document.body.classList.remove("gl-modal-open");
    modalTimer = setTimeout(openModal, 2000);

    // Close button handler
    if (modalClose) {
      modalClose.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // Overlay click to close
    if (modalOverlay) {
      modalOverlay.addEventListener("click", function (e) {
        e.stopPropagation();
        closeModal();
      });
    }

    // ESC key to close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
      }
    });

    // Prevent closing when clicking inside form
    if (modalContent) {
      modalContent.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }
  }

  qsa(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".faq-item").classList.toggle("open");
    });
  });

  qsa("form[data-wa-submit]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (!validateForm(data)) return;
      var message = buildAppointmentBody(data);
      toast("Opening WhatsApp with your appointment details...");
      openWhatsApp(message);
      form.reset();
      qsa("[data-time-open] span", form).forEach(function (node) { node.textContent = "Select time"; });
    });
  });

  qsa("[data-wa-form]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var form = btn.closest("form");
      if (!form) return;
      var data = Object.fromEntries(new FormData(form).entries());
      if (!validateForm(data)) return;
      var message = buildAppointmentBody(data);
      toast("Opening WhatsApp with your appointment details...");
      openWhatsApp(message);
      form.reset();
      qsa("[data-time-open] span", form).forEach(function (node) { node.textContent = "Select time"; });
    });
  });

  var blogPosts = {
    "1": {
      kicker: "Care guide",
      title: "How to choose a home nurse in Chennai",
      intro: "A practical guide for families comparing nursing care at home, shift needs, patient condition and safety routines.",
      sections: [
        { h: "Define the level of care needed", p: "Start with whether the patient needs basic assistance, skilled nursing, or 24/7 supervision. Note mobility, wound care, injections, catheter needs, and doctor instructions." },
        { h: "Verify training and background checks", p: "Ask whether nurses are BLS trained, experienced with similar cases, and verified before home deployment. Green Life assigns support based on clinical need and location." },
        { h: "Discuss shifts and family communication", p: "Clarify day, night, or round-the-clock coverage, handover routines, and how the care team will update your family during recovery." }
      ]
    },
    "2": {
      kicker: "Recovery guide",
      title: "Post-operative care checklist at home",
      intro: "What families should prepare after surgery: hygiene, medication, movement, warning signs and follow-up support.",
      sections: [
        { h: "Prepare the recovery space", p: "Keep the room clean, well ventilated, and free of trip hazards. Arrange easy access to medicines, dressings, water, and emergency contacts." },
        { h: "Follow medication and wound routines", p: "Track doses on time, watch for infection signs, and keep dressing changes as advised. A home nurse can manage vitals and complication alerts." },
        { h: "Plan mobility and follow-up", p: "Support safe movement per doctor guidance. Combine nursing with physiotherapy when strengthening and balance recovery are needed." }
      ]
    },
    "3": {
      kicker: "Elder care",
      title: "Elder care planning for Chennai families",
      intro: "How structured elder support helps daily comfort, safety, medication routines and family peace of mind.",
      sections: [
        { h: "Assess daily living needs", p: "Review bathing, feeding, mobility, fall risk, memory support, and night supervision. Long-term plans work best when needs are documented clearly." },
        { h: "Build a safe home routine", p: "Use medicine reminders, hygiene support, companionship, and regular wellness checks to reduce hospital readmissions and family stress." },
        { h: "Choose flexible care duration", p: "Green Life supports short visits, daily shifts, night care, and extended elder support across Chennai neighborhoods." }
      ]
    }
  };

  if (document.body && document.body.dataset.page === "blog-details") {
    var params = new URLSearchParams(window.location.search);
    var postId = params.get("post") || "1";
    var post = blogPosts[postId] || blogPosts["1"];
    var heroKicker = qs("[data-blog-kicker]");
    var heroTitle = qs("[data-blog-title]");
    var heroIntro = qs("[data-blog-intro]");
    var article = qs("[data-blog-article]");
    if (heroKicker) heroKicker.textContent = post.kicker;
    if (heroTitle) heroTitle.textContent = post.title;
    if (heroIntro) heroIntro.textContent = post.intro;
    if (article) {
      article.innerHTML = post.sections.map(function (s) {
        return "<h2>" + s.h + "</h2><p>" + s.p + "</p>";
      }).join("");
    }
    document.title = post.title + " | Green Life Home Health Care Chennai";
  }

  qsa(".float-actions .calendar").forEach(function (el) {
    var now = new Date();
    var dayNode = el.querySelector(".cal-day");
    var monthNode = el.querySelector(".cal-month");
    if (dayNode) dayNode.textContent = String(now.getDate());
    if (monthNode) {
      monthNode.textContent = now.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
    }
  });


  function initAnalogTimePicker() {
    var openPickers = [];

    function two(value) { return String(value).padStart(2, "0"); }

    qsa("[data-time-open]").forEach(function (button, pickerIndex) {
      var field = button.closest(".field");
      if (!field || field.dataset.timeReady === "true") return;
      field.dataset.timeReady = "true";

      var input = qs("[data-time-value]", field);
      var panel = document.createElement("div");
      panel.className = "gl-time-inline";
      panel.setAttribute("aria-hidden", "true");
      panel.innerHTML =
        '<div class="gl-time-panel" role="dialog" aria-label="Select preferred time">' +
          '<div class="gl-time-top"><span data-time-step-label>Select hour</span><strong data-time-readout><span class="gl-time-main">10:30</span><span class="gl-time-ampm-text">AM</span><span class="gl-time-arrow" aria-hidden="true">➜</span></strong></div>' +
          '<div class="gl-time-clock"><div class="gl-time-hand gl-time-hour-hand" data-time-hour-hand></div><div class="gl-time-hand gl-time-minute-hand" data-time-minute-hand></div><div class="gl-time-center"></div><div class="gl-time-numbers" data-time-numbers></div></div>' +
          '<div class="gl-time-ampm" data-time-ampm hidden><button type="button" data-ampm="AM" class="active">AM</button><button type="button" data-ampm="PM">PM</button></div>' +
          '<div class="gl-time-actions"><button type="button" class="gl-time-cancel" data-time-cancel>Cancel</button><button type="button" class="gl-time-next" data-time-next>Done</button></div>' +
        '</div>';
      field.insertAdjacentElement("afterend", panel);

      var numbers = qs("[data-time-numbers]", panel);
      var hourHand = qs("[data-time-hour-hand]", panel);
      var minuteHand = qs("[data-time-minute-hand]", panel);
      var readout = qs("[data-time-readout]", panel);
      var stepLabel = qs("[data-time-step-label]", panel);
      var nextBtn = qs("[data-time-next]", panel);
      var ampmWrap = qs("[data-time-ampm]", panel);
      var hour = 10;
      var minute = 30;
      var ampm = "AM";
      var step = "hour";

      function valueText() { return two(hour) + ":" + two(minute) + " " + ampm; }

      function setLiveTime() {
        var now = new Date();
        var liveHour = now.getHours();
        ampm = liveHour >= 12 ? "PM" : "AM";
        hour = liveHour % 12 || 12;
        minute = now.getMinutes();
      }

      function parseExisting(value) {
        var match = String(value || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!match) return;
        hour = Math.max(1, Math.min(12, Number(match[1]) || 10));
        minute = Math.max(0, Math.min(59, Number(match[2]) || 0));
        ampm = match[3].toUpperCase();
      }

      function close() {
        panel.classList.remove("show");
        panel.setAttribute("aria-hidden", "true");
      }

      function renderNumbers() {
        var labels = step === "minute" ? ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"] : ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
        numbers.innerHTML = labels.map(function (label, index) {
          var angle = index * 30 - 90;
          var rad = angle * Math.PI / 180;
          var x = 50 + Math.cos(rad) * 41;
          var y = 50 + Math.sin(rad) * 41;
          return '<button type="button" data-value="' + label + '" style="left:' + x + '%;top:' + y + '%">' + label + '</button>';
        }).join("");
      }

      function update() {
        // Render readout as two lines with arrow
        if (readout) {
          var main = two(hour) + ":" + two(minute);
          readout.innerHTML = '<span class="gl-time-main">' + main + '</span>' +
                              '<span class="gl-time-ampm-text">' + ampm + '</span>' +
                              '<span class="gl-time-arrow" aria-hidden="true">➜</span>';
        }
        stepLabel.textContent = step === "hour" ? "Select hour" : step === "minute" ? "Select minutes" : "Select AM or PM";
        nextBtn.textContent = step === "ampm" ? "Done" : "Next";
        ampmWrap.hidden = step !== "ampm";
        qsa("[data-ampm]", panel).forEach(function (btn) { btn.classList.toggle("active", btn.dataset.ampm === ampm); });
        var rotation = step === "minute" ? minute * 6 : (hour % 12) * 30;
        var hourRotation = (hour % 12) * 30 + (minute / 60) * 30;
        var minuteRotation = minute * 6;
        hourHand.style.setProperty("transform", "translateX(-50%) rotate(" + (step === "hour" ? rotation : hourRotation) + "deg)", "important");
        minuteHand.style.setProperty("transform", "translateX(-50%) rotate(" + (step === "minute" ? rotation : minuteRotation) + "deg)", "important");
        hourHand.classList.toggle("show", step !== "minute");
        minuteHand.classList.toggle("show", step !== "hour");
        panel.classList.toggle("is-ampm-step", step === "ampm");
        renderNumbers();
      }

      function open() {
        openPickers.forEach(function (fn) { fn(); });
        setLiveTime();
        step = "hour";
        parseExisting(input && input.value);
        update();
        panel.classList.add("show");
        panel.setAttribute("aria-hidden", "false");
      }

      function finish() {
        var selected = valueText();
        if (input) input.value = selected;
        var text = qs("span", button);
        if (text) text.textContent = selected;
        close();
      }

      openPickers.push(close);
      button.addEventListener("click", function (event) {
        event.preventDefault();
        if (panel.classList.contains("show")) close();
        else open();
      });

      numbers.addEventListener("click", function (event) {
        var target = event.target.closest("button[data-value]");
        if (!target) return;
        if (step === "hour") {
          hour = Number(target.dataset.value) || 12;
          step = "minute";
        } else if (step === "minute") {
          minute = Number(target.dataset.value) || 0;
          step = "ampm";
        }
        update();
      });

      qsa("[data-ampm]", panel).forEach(function (ampmButton) {
        ampmButton.addEventListener("click", function () {
          ampm = ampmButton.dataset.ampm || "AM";
          update();
        });
      });

      nextBtn.addEventListener("click", function () {
        if (step === "hour") step = "minute";
        else if (step === "minute") step = "ampm";
        else finish();
        update();
      });

      var cancel = qs("[data-time-cancel]", panel);
      if (cancel) cancel.addEventListener("click", close);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") openPickers.forEach(function (fn) { fn(); });
    });
  }

  initAnalogTimePicker();

})();
