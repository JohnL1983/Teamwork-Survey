document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const thankYou = document.getElementById("thankYou");
  const iframe = document.getElementById("hidden_iframe");
  const submitBtn = form.querySelector('button[type="submit"]');
  const DONE_KEY = "survey_teamwork_2025_done";

  // Simple UUID
  const makeUUID = () =>
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );

  // Pre-fill metadata
  const params = new URLSearchParams(location.search);
  const respondentIdEl = document.getElementById("respondentId");
  const utmSourceEl = document.getElementById("utm_source");
  const utmMediumEl = document.getElementById("utm_medium");
  const utmCampaignEl = document.getElementById("utm_campaign");
  const userAgentEl = document.getElementById("userAgent");

  if (respondentIdEl) respondentIdEl.value = makeUUID();
  if (utmSourceEl) utmSourceEl.value = params.get("utm_source") || "";
  if (utmMediumEl) utmMediumEl.value = params.get("utm_medium") || "";
  if (utmCampaignEl) utmCampaignEl.value = params.get("utm_campaign") || "";
  if (userAgentEl) userAgentEl.value = navigator.userAgent;

  // Duplicate UX
  if (localStorage.getItem(DONE_KEY) === "true") {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  }

  // Show thank-you and lock UI
  const showThanks = () => {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
    localStorage.setItem(DONE_KEY, "true");
  };

  // When the iframe loads (after submit), show thank-you
  iframe?.addEventListener("load", () => {
    showThanks();
  });

  // Client-side validity + fallback timer
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // Disable button to prevent accidental double submits
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Submitting…";
    }

    // Fallback: if iframe 'load' doesn't fire (e.g., X-Frame-Options not allowed),
    // optimistically show thank-you after 1500ms. The POST still goes through.
    // Do NOT preventDefault here; let the form submit to the hidden iframe.
    setTimeout(() => {
      // Only show if user hasn't already been thanked (e.g., via iframe load)
      if (!thankYou || !thankYou.classList.contains("hidden")) return;
      showThanks();
    }, 1500);
  });
});
