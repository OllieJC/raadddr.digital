import { TRANSLATIONS } from "./translations.js";

// --- Configuration & Data ---
const LANGUAGES = [
  { code: "en-gb", name: "English (UK)" },
  { code: "en-us", name: "English (US)" },
  { code: "fr", name: "Français" },
];

const ACTIVITY_KEYS = [
  "research",
  "analyse",
  "architect",
  "design",
  "develop",
  "deliver",
  "run",
];
const DEFAULT_LANG = "en-gb";

function normalizeLang(langCode) {
  return (langCode || DEFAULT_LANG).toLowerCase();
}

function normalizeActivity(fragment) {
  if (!fragment) return null;
  const clean = fragment.replace(/^#/, "").toLowerCase();
  return ACTIVITY_KEYS.includes(clean) ? clean : null;
}

// --- State Management ---
function detectLanguage() {
  const stored = localStorage.getItem("raadddr_lang");
  if (stored) return normalizeLang(stored);

  if (navigator.language) {
    return normalizeLang(navigator.language);
  }

  return DEFAULT_LANG;
}

const state = {
  lang: detectLanguage(),
  theme:
    localStorage.getItem("raadddr_theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"),
};

// --- DOM Elements ---
const els = {
  html: document.documentElement,
  grid: document.querySelector(".acronym-grid"),
  langBtn: document.getElementById("langBtn"),
  langLabel: document.getElementById("langLabel"),
  langModal: document.getElementById("langModal"),
  langList: document.getElementById("langList"),
  closeLangModal: document.getElementById("closeLangModal"),
  themeToggle: document.getElementById("themeToggle"),
  themeLabel: document.getElementById("themeLabel"),
  themeIcon: document.getElementById("themeIcon"),
  detailModal: document.getElementById("detailModal"),
  closeDetailModal: document.getElementById("closeDetailModal"),
  mLetter: document.getElementById("mLetter"),
  mTitle: document.getElementById("mTitle"),
  mRoles: document.getElementById("mRoles"),
  mDesc: document.getElementById("mDesc"),
  i18nTargets: document.querySelectorAll("[data-i18n]"),
};

// Make close buttons unfocusable until their modal is active
if (els.closeDetailModal) els.closeDetailModal.tabIndex = -1;
if (els.closeLangModal) els.closeLangModal.tabIndex = -1;

// --- Helpers ---
function getLangData(langCode) {
  const normalized = normalizeLang(langCode);
  return (
    TRANSLATIONS[normalized] ||
    TRANSLATIONS[normalized.split("-")[0]] ||
    TRANSLATIONS[DEFAULT_LANG]
  );
}

function getHtmlValue(value) {
  if (value !== undefined && value !== null) {
    if (typeof value === "string") {
      return value
        .replaceAll(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replaceAll("\n", "<br>");
    }
    return value;
  }
  return "";
}

function getText(langCode, key) {
  const langData = getLangData(langCode);
  const fallback = TRANSLATIONS[DEFAULT_LANG] || {};
  const value =
    langData && langData[key] !== undefined ? langData[key] : fallback[key];
  return getHtmlValue(value);
}

function getActivity(langCode, key) {
  const langData = getLangData(langCode);
  const base = TRANSLATIONS[DEFAULT_LANG] || {};
  const pick = (suffix) => {
    const val = langData ? langData[`${key}${suffix}`] : undefined;
    if (val !== undefined && val !== null) return val;
    return base[`${key}${suffix}`];
  };

  return {
    id: key,
    letter: pick("Letter"),
    label: pick("Label"),
    prefix: pick("Prefix") || "",
    roles: pick("Roles") || [],
    desc: pick("Desc"),
  };
}

// --- Rendering ---
function updateContent() {
  const langCode = normalizeLang(state.lang);
  const currentLang =
    LANGUAGES.find((l) => l.code === langCode) ||
    LANGUAGES.find((l) => langCode.startsWith(l.code)) ||
    LANGUAGES[0];
  const currentLangName = currentLang ? currentLang.name : "";

  els.i18nTargets.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = getText(langCode, key);
  });

  els.langLabel.textContent = currentLangName;
  updateThemeLabel();
  els.html.setAttribute("lang", langCode);

  ACTIVITY_KEYS.forEach((key) => {
    const buttonEle = document.getElementById(`${key}Button`);
    const rolesEle = document.getElementById(`${key}Roles`);
    const activity = getActivity(langCode, key);

    if (rolesEle) {
      rolesEle.innerHTML = "";
      activity.roles.forEach((role) => {
        const pill = document.createElement("span");
        pill.className = "role-pill";
        pill.innerHTML = role;
        rolesEle.appendChild(pill);
      });
    }

    if (buttonEle) {
      buttonEle.onclick = () => openDetailModal(buttonEle);
    }
  });
}

function updateThemeLabel() {
  const labelKey =
    state.theme === "dark" ? "themeLabelDark" : "themeLabelLight";
  els.themeLabel.innerHTML = getText(state.lang, labelKey);
}

// --- Modal Logic ---
function openDetailModal(sender) {
  const activityStr = sender.id.replace("Button", "");
  const activity = getActivity(state.lang, activityStr);
  const currentItemId = sender.id;
  markActiveActivity(activityStr);

  els.closeDetailModal.setAttribute("data-current-item", currentItemId);
  els.mLetter.innerHTML = getHtmlValue(activity.letter);
  const prefixStr = activity.prefix;
  const labelStr = activity.label;
  els.mTitle.innerHTML = prefixStr
    ? `<em>${prefixStr}</em> ${labelStr}`
    : labelStr;

  els.mRoles.innerHTML = "";
  const roles = activity.roles;
  if (roles && roles.length > 0) {
    roles.forEach((role) => {
      const pill = document.createElement("span");
      pill.className = "role-pill";
      pill.innerHTML = role;
      els.mRoles.appendChild(pill);
    });
  }

  els.mDesc.innerHTML = getHtmlValue(activity.desc);
  els.detailModal.classList.add("active");
  requestAnimationFrame(() => {
    if (els.closeDetailModal) els.closeDetailModal.tabIndex = 0;
    els.closeDetailModal?.focus();
  });
}

function closeDetailModal() {
  els.detailModal.classList.remove("active");
  const currentItemId = els.closeDetailModal.getAttribute("data-current-item");
  const currentItem = document.getElementById(currentItemId);
  currentItem?.focus();
  els.closeDetailModal.removeAttribute("data-current-item");
  if (els.closeDetailModal) els.closeDetailModal.tabIndex = -1;
  clearActiveActivity();
}

function openLangModal() {
  els.langList.innerHTML = LANGUAGES.map((lang) => {
    const isActive = lang.code === normalizeLang(state.lang);
    return `
                <button type="button" tabindex="0" class="lang-btn ${
                  isActive ? "active" : ""
                }" onclick="selectLanguage('${lang.code}')">
                    <span>${lang.name}</span>
                    <svg class="check icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </button>
            `;
  }).join("");
  els.langModal.classList.add("active");
  requestAnimationFrame(() => {
    if (els.closeLangModal) els.closeLangModal.tabIndex = 0;
    els.closeLangModal?.focus();
  });
}

function closeLangModal() {
  els.langModal.classList.remove("active");
  if (els.closeLangModal) els.closeLangModal.tabIndex = -1;
  requestAnimationFrame(() => {
    els.langBtn?.focus();
  });
}

// Exposed for inline onclick in language list
window.selectLanguage = (code) => {
  state.lang = normalizeLang(code);
  localStorage.setItem("raadddr_lang", state.lang);
  updateContent();
  closeLangModal();
};

// --- Theme Logic ---
function updateTheme() {
  els.html.setAttribute("data-theme", state.theme);
  const d =
    state.theme === "dark"
      ? "M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-5.4-5.4c0-1.81.73-3.44 1.91-4.64C12.92 3.04 12.46 3 12 3zm0-2a11 11 0 0111 11 11 11 0 01-11 11A11 11 0 011 12 11 11 0 0112 1z"
      : "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000 1.41.996.996 0 001.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06z";

  els.themeIcon.querySelector("path").setAttribute("d", d);
  updateThemeLabel();
}

// --- Event Listeners ---
function init() {
  els.langBtn.addEventListener("click", openLangModal);
  els.closeLangModal.addEventListener("click", closeLangModal);
  els.langModal.addEventListener("click", (e) => {
    if (e.target === els.langModal) closeLangModal();
  });

  els.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("raadddr_theme", state.theme);
    updateTheme();
  });

  els.closeDetailModal.addEventListener("click", closeDetailModal);
  els.detailModal.addEventListener("click", (e) => {
    if (e.target === els.detailModal) closeDetailModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (els.detailModal.classList.contains("active")) {
        e.preventDefault();
        els.closeDetailModal?.focus();
        return;
      }
      if (els.langModal.classList.contains("active")) {
        e.preventDefault();
        trapFocusInLangModal(e.shiftKey);
        return;
      }
    }

    if (e.key === "Escape") {
      if (els.langModal.classList.contains("active")) {
        closeLangModal();
      } else if (els.detailModal.classList.contains("active")) {
        closeDetailModal();
      }
    }
  });

  // Handle fragment on initial load: language override or activity modal
  const initialFragment = window.location.hash;
  const langMatch = initialFragment
    ? LANGUAGES.find(
        (l) => l.code === normalizeLang(initialFragment.replace("#", ""))
      )
    : null;

  let activityKey = null;

  if (langMatch) {
    state.lang = langMatch.code;
    localStorage.setItem("raadddr_lang", state.lang);
  } else {
    activityKey = normalizeActivity(initialFragment);
  }

  // Initial paint
  updateTheme();
  updateContent();

  if (activityKey) {
    const button = document.getElementById(`${activityKey}Button`);
    if (button) {
      openDetailModal(button);
    }
  }
}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

function markActiveActivity(key) {
  ACTIVITY_KEYS.forEach((k) => {
    const section = document.getElementById(k);
    if (!section) return;
    if (k === key) {
      section.setAttribute("aria-expanded", "true");
      section.setAttribute("data-active", "true");
    } else {
      section.removeAttribute("aria-expanded");
      section.removeAttribute("data-active");
    }
  });
}

function clearActiveActivity() {
  ACTIVITY_KEYS.forEach((k) => {
    const section = document.getElementById(k);
    if (!section) return;
    section.removeAttribute("aria-expanded");
    section.removeAttribute("data-active");
  });
}

function trapFocusInLangModal(isShift) {
  const focusables = Array.from(
    els.langModal.querySelectorAll(
      'button:not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.offsetParent !== null
  );

  if (!focusables.length) return;

  const active = document.activeElement;
  let index = focusables.indexOf(active);

  if (isShift) {
    index = index <= 0 ? focusables.length - 1 : index - 1;
  } else {
    index = index === focusables.length - 1 ? 0 : index + 1;
  }

  focusables[index].focus();
}
