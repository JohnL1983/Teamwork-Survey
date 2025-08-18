document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const thankYou = document.getElementById("thankYou");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Gather responses
    const formData = new FormData(form);
    const responses = {};
    formData.forEach((value, key) => {
      responses[key] = value;
    });

    console.log("Survey responses:", responses);

    // Hide form, show thank you
    form.classList.add("hidden");
    thankYou.classList.remove("hidden");
  });
});
