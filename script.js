function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}

menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.getElementById("year").textContent = new Date().getFullYear();

const root = document.documentElement;
const themeBtn = document.createElement("button");
themeBtn.className = "theme-btn";
themeBtn.type = "button";
themeBtn.setAttribute("aria-label", "Switch between dark and light theme");
document.querySelector(".nav").appendChild(themeBtn);

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "light" ? "🌙" : "☀️";
}

applyTheme(safeGet("portfolio-theme") === "light" ? "light" : "dark");

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  safeSet("portfolio-theme", next);
});

const progress = document.createElement("div");
progress.className = "progress";
document.body.appendChild(progress);

const toTop = document.createElement("button");
toTop.className = "to-top";
toTop.type = "button";
toTop.setAttribute("aria-label", "Back to top");
toTop.textContent = "↑";
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
document.body.appendChild(toTop);

function onScroll() {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  toTop.classList.toggle("show", h.scrollTop > 500);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const heroActions = document.querySelector(".hero-actions");

if (heroActions) {
  const line = document.createElement("p");
  line.className = "typed-line";
  line.innerHTML = 'I\'m into <span class="typed"></span><span class="cursor"></span>';
  heroActions.parentNode.insertBefore(line, heroActions.previousElementSibling || heroActions);

  const typedEl = line.querySelector(".typed");
  const phrases = [
    "building web apps.",
    "personal finance tools.",
    "mobile-first design.",
    "game development.",
    "learning something new every day."
  ];

  if (reduceMotion) {
    typedEl.textContent = phrases[0];
  } else {
    let p = 0, i = 0, deleting = false;

    (function tick() {
      const word = phrases[p];
      typedEl.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 75;

      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && i === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 350;
      } else {
        i += deleting ? -1 : 1;
      }

      setTimeout(tick, delay);
    })();
  }
}

document.querySelectorAll(".project, .skill-card, .process-card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

const sections = document.querySelectorAll("main section[id]");
const links = document.querySelectorAll(".nav-links a");

document.querySelectorAll(".skill-cols, .process-grid").forEach((grid) => {
  grid.querySelectorAll(".reveal").forEach((el, idx) => {
    el.style.transitionDelay = idx * 0.12 + "s";
  });
});

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((s) => navObserver.observe(s));

  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
          setTimeout(() => (entry.target.style.transitionDelay = ""), 1200);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

const copyBtn = document.getElementById("copyEmail");
const copyNote = document.getElementById("copyNote");

if (copyBtn) {
  const email = copyBtn.dataset.email;

  function say(msg) {
    if (!copyNote) return;
    copyNote.textContent = msg;
    setTimeout(() => (copyNote.textContent = ""), 2500);
  }

  function fallbackCopy() {
    const ta = document.createElement("textarea");
    ta.value = email;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, email.length);
    let ok = false;

    try {
      ok = document.execCommand("copy");
    } catch (e) {}

    document.body.removeChild(ta);
    return ok;
  }

  copyBtn.addEventListener("click", () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(
        () => say("Copied: " + email),
        () => say(fallbackCopy() ? "Copied: " + email : "Press and hold the email above to copy it.")
      );
    } else {
      say(fallbackCopy() ? "Copied: " + email : "Press and hold the email above to copy it.");
    }
  });
}
