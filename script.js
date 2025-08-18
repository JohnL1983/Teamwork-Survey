document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const thankYou = document.getElementById("thankYou");
  const iframe = document.getElementById("hidden_iframe");
  const DONE_KEY = "survey_teamwork_2025_done";

  // Simple UUID
  const makeUUID = () =>
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );

  // Pre-fill metadata
  const params = new URLSearchParams(location.search);
  document.getElementById("respondentId").value = makeUUID();
  document.getElementById("utm_source").value = params.get("utm_source") || "";
  document.getElementById("utm_medium").value = params.get("utm_medium") || "";
  document.getElementById("utm_campaign").value = params.get("utm_campaign") || "";
  document.getElementById("userAgent").value = navigator.userAgent;

  // Duplicate UX
  if (localStorage.getItem(DONE_KEY) === "true") {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  }

  // When the iframe loads (after submit), show thank-you
  iframe.addEventListener("load", () => {
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
    localStorage.setItem(DONE_KEY, "true");
  });

  // Client-side validity
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
    }
  });
});
