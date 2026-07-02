import {
  serializeFromForm,
  hydrateForm,
  getCompletionPercent,
} from "./models/questionnaire.js";
import { loadDraft, saveDraft, clearDraft } from "./storage.js";
import { submitQuestionnaire, isFirebaseConfigured } from "./firebase.js";

const SECTIONS = [
  { id: "guest-booking", label: "Guest & Booking" },
  { id: "property-rules", label: "Property Rules" },
  { id: "availability", label: "Availability" },
  { id: "payments", label: "Payments & Fees" },
  { id: "pricing-rules", label: "Pricing Rules" },
  { id: "property-details", label: "Property Details" },
  { id: "client-budget", label: "Client Budget" },
];

let saveTimer = null;

function debouncedSave(form) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDraft(serializeFromForm(form));
    updateProgress(form);
  }, 300);
}

function updateProgress(form) {
  const data = serializeFromForm(form);
  const percent = getCompletionPercent(data);
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressText) progressText.textContent = `${percent}% complete`;
}

function updateAllConditionals(form) {
  const cancelOnline = form.querySelector(
    'input[name="cancelOnline"]:checked',
  )?.value;
  const cancelPanel = document.getElementById("cancel-conditions-panel");
  if (cancelPanel) {
    cancelPanel.hidden = cancelOnline !== "with_conditions";
    cancelPanel.setAttribute(
      "aria-hidden",
      String(cancelOnline !== "with_conditions"),
    );
  }

  const hasRules = form.querySelector(
    'input[name="hasPropertyRules"]:checked',
  )?.value;
  const rulesPanel = document.getElementById("property-rules-text-panel");
  if (rulesPanel) {
    rulesPanel.hidden = hasRules !== "yes";
    rulesPanel.setAttribute("aria-hidden", String(hasRules !== "yes"));
  }

  const hasWaivers = form.querySelector(
    'input[name="hasLiabilityWaivers"]:checked',
  )?.value;
  const waiversPanel = document.getElementById("liability-waivers-panel");
  if (waiversPanel) {
    waiversPanel.hidden = hasWaivers !== "yes";
    waiversPanel.setAttribute("aria-hidden", String(hasWaivers !== "yes"));
  }

  const requiresSignature = form.querySelector(
    'input[name="requiresSignature"]:checked',
  )?.value;
  const signaturePanel = document.getElementById("signature-details-panel");
  if (signaturePanel) {
    signaturePanel.hidden = requiresSignature !== "yes";
    signaturePanel.setAttribute(
      "aria-hidden",
      String(requiresSignature !== "yes"),
    );
  }

  const hasDeposit = form.querySelector(
    'input[name="hasSecurityDeposit"]:checked',
  )?.value;
  const depositPanel = document.getElementById("security-deposit-panel");
  if (depositPanel) {
    depositPanel.hidden = hasDeposit !== "yes";
    depositPanel.setAttribute("aria-hidden", String(hasDeposit !== "yes"));
  }

  const checkMode = form.querySelector(
    'input[name="checkInOutMode"]:checked',
  )?.value;
  const fixedPanel = document.getElementById("fixed-times-panel");
  const flexiblePanel = document.getElementById("flexible-times-panel");
  if (fixedPanel) {
    fixedPanel.hidden = checkMode !== "fixed";
    fixedPanel.setAttribute("aria-hidden", String(checkMode !== "fixed"));
  }
  if (flexiblePanel) {
    flexiblePanel.hidden = checkMode !== "flexible";
    flexiblePanel.setAttribute("aria-hidden", String(checkMode !== "flexible"));
  }

  const paymentOther = form.querySelector(
    'input[name="paymentMethods"][value="other"]:checked',
  );
  const otherPanel = document.getElementById("payment-methods-other-panel");
  if (otherPanel) {
    otherPanel.hidden = !paymentOther;
    otherPanel.setAttribute("aria-hidden", String(!paymentOther));
  }

  const refunds = form.querySelector(
    'input[name="automaticRefunds"]:checked',
  )?.value;
  const refundPanel = document.getElementById("refund-details-panel");
  if (refundPanel) {
    refundPanel.hidden = refunds !== "partial";
    refundPanel.setAttribute("aria-hidden", String(refunds !== "partial"));
  }

  const seasonal = form.querySelector(
    'input[name="seasonalPricing"]:checked',
  )?.value;
  const seasonalPanel = document.getElementById("seasonal-pricing-panel");
  if (seasonalPanel) {
    seasonalPanel.hidden = seasonal !== "yes";
    seasonalPanel.setAttribute("aria-hidden", String(seasonal !== "yes"));
  }

  const holiday = form.querySelector(
    'input[name="holidayEventRates"]:checked',
  )?.value;
  const holidayPanel = document.getElementById("holiday-rates-panel");
  if (holidayPanel) {
    holidayPanel.hidden = holiday !== "yes";
    holidayPanel.setAttribute("aria-hidden", String(holiday !== "yes"));
  }
}

function showBanner(id, message, type = "info") {
  const banner = document.getElementById(id);
  if (!banner) return;
  banner.hidden = false;
  banner.textContent = message;
  banner.className = `banner banner--${type}`;
}

function hideBanner(id) {
  const banner = document.getElementById(id);
  if (banner) banner.hidden = true;
}

function showErrors(errors) {
  const list = document.getElementById("error-list");
  const panel = document.getElementById("error-panel");
  if (!list || !panel) return;
  list.innerHTML = errors.map((e) => `<li>${e}</li>`).join("");
  panel.hidden = errors.length === 0;
}

function showWarnings(warnings) {
  const list = document.getElementById("warning-list");
  const panel = document.getElementById("warning-panel");
  if (!list || !panel) return;
  list.innerHTML = warnings.map((w) => `<li>${w}</li>`).join("");
  panel.hidden = warnings.length === 0;
}

function buildSectionNav() {
  const nav = document.getElementById("section-nav");
  if (!nav) return;
  nav.innerHTML = SECTIONS.map(
    (section) =>
      `<a href="#${section.id}" class="section-nav__link">${section.label}</a>`,
  ).join("");
}

function initIntersectionObserver() {
  const links = document.querySelectorAll(".section-nav__link");
  const sections = SECTIONS.map((s) => document.getElementById(s.id)).filter(
    Boolean,
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${entry.target.id}`,
            );
          });
        }
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

function setSubmitState(form, submitting) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const clearBtn = document.getElementById("clear-draft-btn");
  if (submitBtn) {
    submitBtn.disabled = submitting;
    submitBtn.textContent = submitting
      ? "Submitting..."
      : "Submit questionnaire";
  }
  if (clearBtn) clearBtn.disabled = submitting;
}

export function initForm() {
  console.log("what up doe!");
  const form = document.getElementById("discovery-form");
  if (!form) return;

  buildSectionNav();
  initIntersectionObserver();

  const draft = loadDraft();
  if (draft) {
    hydrateForm(form, draft);
    showBanner(
      "status-banner",
      "Draft restored from your last session.",
      "info",
    );
  }

  updateAllConditionals(form);
  updateProgress(form);

  if (!isFirebaseConfigured()) {
    showBanner(
      "firebase-banner",
      "Firebase is not configured yet. You can still fill out and save a draft locally. Update js/config.js to enable submission.",
      "warning",
    );
  }

  form.addEventListener("input", () => {
    hideBanner("status-banner");
    updateAllConditionals(form);
    debouncedSave(form);
  });

  form.addEventListener("change", () => {
    hideBanner("status-banner");
    updateAllConditionals(form);
    debouncedSave(form);
  });

  document.getElementById("clear-draft-btn")?.addEventListener("click", () => {
    if (!window.confirm("Clear your saved draft? This cannot be undone."))
      return;
    clearDraft();
    form.reset();
    updateAllConditionals(form);
    updateProgress(form);
    showErrors([]);
    showWarnings([]);
    hideBanner("success-banner");
    showBanner("status-banner", "Draft cleared.", "info");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showErrors([]);
    showWarnings([]);
    hideBanner("success-banner");

    const data = serializeFromForm(form);

    setSubmitState(form, true);
    try {
      const docId = await submitQuestionnaire(data);
      clearDraft();
      form.reset();
      updateAllConditionals(form);
      updateProgress(form);
      showBanner(
        "success-banner",
        `Thank you! Your responses were submitted successfully (reference: ${docId}).`,
        "success",
      );
      document
        .getElementById("success-banner")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      showBanner(
        "status-banner",
        error.message || "Submission failed. Please try again.",
        "error",
      );
    } finally {
      setSubmitState(form, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", initForm);
