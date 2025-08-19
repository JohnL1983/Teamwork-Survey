document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const thankYou = document.getElementById("thankYou");
  const iframe = document.getElementById("hidden_iframe");
  const submitBtn = form.querySelector('button[type="submit"]');

  // 👇 Versioned survey ID. Bump this (v1 → v2 → v3) to "reset" the form for everyone.
  const SURVEY_ID = 'teamwork-2025-v1';
  const DONE_KEY = `survey_${SURVEY_ID}_done`;

  // If this device already submitted for this version, hide form
  if (localStorage.getItem(DONE_KEY) === "true") {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  }

  const showThanks = () => {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
    localStorage.setItem(DONE_KEY, "true");
  };

  // When the iframe loads (after submit), show thank-you
  iframe?.addEventListener("load", () => {
    showThanks();
  });

  // Validate on submit + fallback thank-you
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // Disable to prevent double submits
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Submitting…";
    }

    // Fallback: if iframe load doesn’t fire, show thanks after 1.5s
    setTimeout(() => {
      if (!thankYou || !thankYou.classList.contains("hidden")) return;
      showThanks();
    }, 1500);
  });
});
