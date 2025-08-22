// Brand-driven survey stepper with animations & a sliding/docking CTA
(function () {
  const ctaBtn = document.getElementById('ctaBtn');          // big hero start button (visual)
  const progressBtn = document.getElementById('progressBtn'); // sticky bottom button (Next/Submit)
  const stepsWrap = document.getElementById('steps');
  const form = document.getElementById('surveyForm');
  const thankYou = document.getElementById('thankYou');

  const questions = Array.from(stepsWrap.querySelectorAll('.question'));
  let index = -1; // -1 = not started

  // Hide all questions initially
  questions.forEach(q => q.classList.remove('active','out-left','out-right'));

  // Start flow from hero CTA
  ctaBtn.addEventListener('click', () => {
    // Visually dock the hero button and show the progress button
    ctaBtn.classList.add('dock');
    progressBtn.classList.add('show');
    progressBtn.textContent = 'Next';
    progressBtn.dataset.state = 'next';

    // Reveal the form area (first question)
    goTo(0, 'in');
    // Move focus into the first prompt
    focusCurrentLegend();
  });

  // Core navigation button handler (Next / Submit)
  progressBtn.addEventListener('click', (e) => {
    const state = progressBtn.dataset.state;

    if (state === 'next') {
      // Validate current step; block if incomplete
      if (!validateCurrent()) return;

      // If next is the last question, switch text to Submit on reveal
      if (index < questions.length - 1) {
        const leaving = index;
        const entering = index + 1;
        goTo(entering, leaving % 2 === 0 ? 'left' : 'right'); // alternate exit direction
        if (entering === questions.length - 1) {
          // Last step just entered → change button to Submit
          progressBtn.dataset.state = 'submit';
          progressBtn.textContent = 'Submit';
        }
      }
    } else if (state === 'submit') {
      if (!validateCurrent()) return;
      // Submit form to hidden iframe (same behavior as your current setup)
      form.requestSubmit
        ? form.requestSubmit()
        : form.submit();
      // Lock UI
      progressBtn.disabled = true;
      // Simulate a brief delay and then show Thank You
      setTimeout(() => {
        form.hidden = true;
        progressBtn.classList.remove('show');
        thankYou.hidden = false;
      }, 300);
    }
  });

  // Programmatic step navigation
  function goTo(targetIndex, exitDirection = 'left') {
    const prev = questions[index];
    const next = questions[targetIndex];

    if (prev) {
      // animate out
      prev.classList.remove('active','out-left','out-right');
      prev.classList.add(exitDirection === 'left' ? 'out-left' : 'out-right');
      // After animation, fully hide the previous step
      setTimeout(() => prev.classList.remove('out-left','out-right'), 460);
    }
    if (next) {
      next.classList.remove('out-left','out-right');
      next.classList.add('active');
    }
    index = targetIndex;
    // Ensure the step is scrolled into view (esp. on mobile)
    next?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Validation for radios / textarea within current step
  function validateCurrent() {
    const step = questions[index];
    if (!step) return true;

    // Collect inputs within this step
    const required = step.querySelectorAll('input[required], textarea[required], select[required]');
    if (required.length === 0) return true;

    // Grouped radios: consider valid if any in the group is checked
    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      const names = [...new Set([...radios].map(r => r.name))];
      for (const name of names) {
        const group = step.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const checked = [...group].some(r => r.checked);
        if (!checked) {
          // highlight subtly
          pulse(step);
          // move focus to first radio
          group[0].focus();
          return false;
        }
      }
      return true;
    }

    // Textarea / inputs
    const fields = step.querySelectorAll('textarea[required], input[required], select[required]');
    for (const el of fields) {
      if (!el.value.trim()) {
        pulse(step);
        el.focus();
        return false;
      }
    }
    return true;
  }

  function pulse(el){
    el.style.boxShadow = '0 0 0 3px rgba(255,76,6,.35)';
    setTimeout(() => { el.style.boxShadow = ''; }, 350);
  }

  function focusCurrentLegend(){
    const legend = questions[index]?.querySelector('.question-title, legend');
    if (legend) {
      // Make it programmatically focusable momentarily
      legend.setAttribute('tabindex','-1');
      legend.focus({preventScroll:true});
      setTimeout(()=> legend.removeAttribute('tabindex'), 0);
    }
  }

  // Progressive enhancement: If JS disabled, show all questions & native submit
  document.documentElement.classList.add('js');
})();
