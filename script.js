document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("surveyForm");
    const thankYou = document.getElementById("thankYou");
    const endpoint = "https://script.google.com/macros/s/AKfycbwv3ryUUiYjNXvVxdWNfbLILStZmL2NAJ3ycXZFeaMWBGl4yUfWNZXDrzK5wgGBV2w/exec"; // <-- paste from deployment

    // Generate a simple UUID for respondentId
    const makeUUID = () =>
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );

    // Pre-fill metadata
    const params = new URLSearchParams(window.location.search);
    document.getElementById("respondentId").value = makeUUID();
    document.getElementById("utm_source").value = params.get("utm_source") || "";
    document.getElementById("utm_medium").value = params.get("utm_medium") || "";
    document.getElementById("utm_campaign").value = params.get("utm_campaign") || "";

    // Duplicate-protection UX
    const DONE_KEY = "survey_teamwork_2025_done";
    if (localStorage.getItem(DONE_KEY) === "true") {
        form.classList.add("hidden");
        thankYou.classList.remove("hidden");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Basic HTML5 validity check
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Build JSON from form
        const formData = new FormData(form);
        const payload = {};
        formData.forEach((value, key) => payload[key] = value);
        payload.userAgent = navigator.userAgent;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // Send your origin so Apps Script can reply with matching CORS headers
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                form.classList.add("hidden");
                thankYou.classList.remove("hidden");
                localStorage.setItem(DONE_KEY, "true");
            } else {
                const err = await res.text();
                alert("Submission failed. Please try again.\n" + err);
            }
        } catch (err) {
            alert("Network error. Please try again.");
            console.error(err);
        }
    });
});
