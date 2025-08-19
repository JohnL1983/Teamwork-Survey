document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const thankYou = document.getElementById("thankYou");
  const iframe = document.getElementById("hidden_iframe");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Keep a simple local lock so the same device doesn't re-submit accidentally
  const DONE_KEY = "survey_teamwork_2025_done";

  if (localStorage.getItem(DONE_KEY) === "true") {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  }

  const showThanks = () => {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
    localStorage.setItem(DONE_KEY, "true");
  };

  // Show thank-you when the hidden iframe finishes loading after POST
  iframe?.addEventListener("load", () => {
    showThanks();
  });

  // Validate on submit + fallback thank-you (in case iframe load is blocked)
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    // Disable to avoid double submits
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Submitting…";
    }

    // Do NOT preventDefault — allow form to post to iframe.
    setTimeout(() => {
      if (!thankYou || !thankYou.classList.contains("hidden")) return;
      showThanks();
    }, 1500);
  });
});
