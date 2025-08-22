// Animated survey with unique per-question in/out motions + full-viewport backdrop
(function () {
  const ctaBtn = document.getElementById('ctaBtn');
  const progressBtn = document.getElementById('progressBtn');
  const stepsWrap = document.getElementById('steps');
  const form = document.getElementById('surveyForm');
  const thankYou = document.getElementById('thankYou');

  const questions = Array.from(stepsWrap.querySelectorAll('.question'));
  let index = -1; // not started

  // Initial visibility
  questions.forEach(q => q.classList.remove('active'));

  // Start from CTA
  ctaBtn.addEventListener('click', () => {
    ctaBtn.classList.add('dock');
    progressBtn.classList.add('show');
    progressBtn.textContent = 'Next';
    progressBtn.dataset.state = 'next';
    goTo(0); // first question
    focusCurrentTitle();
  });

  // Next/Submit button
  progressBtn.addEventListener('click', () => {
    const state = progressBtn.dataset.state;

    if (state === 'next') {
      if (!validateCurrent()) return;

      const isLastIncoming = index + 1 === questions.length - 1;
      goTo(index + 1);

      if (isLastIncoming) {
        progressBtn.dataset.state = 'submit';
        progressBtn.textContent = 'Submit';
      }
    } else if (state === 'submit') {
      if (!validateCurrent()) return;
      form.requestSubmit ? form.requestSubmit() : form.submit();
      progressBtn.disabled = true;
      setTimeout(() => {
        form.hidden = true;
        progressBtn.classList.remove('show');
        thankYou.hidden = false;
      }, 300);
    }
  });

  // Core: move to a target step, applying that step's unique animations
  function goTo(targetIndex) {
    const leaving = questions[index];
    const entering = questions[targetIndex];

    if (leaving) {
      const outClass = leaving.dataset.out || 'out-left-blur';
      leaving.classList.remove('active');
      // ensure reflow so out animation plays even when toggling quickly
      void leaving.offsetWidth;
      leaving.classList.add(outClass);
      // cleanup out class after anim completes
      leaving.addEventListener('animationend', function cleanOut(e){
        if (e.target !== leaving) return;
        leaving.classList.remove(outClass);
        leaving.removeEventListener('animationend', cleanOut);
      });
    }

    if (entering) {
      const inClass = entering.dataset.in || 'in-pop';
      entering.classList.add('active');
      // play the in animation fresh each time
      entering.classList.remove(inClass);
      void entering.offsetWidth;
      entering.classList.add(inClass);

      entering.addEventListener('animationend', function cleanIn(e){
        if (e.target !== entering) return;
        entering.classList.remove(inClass);
        entering.removeEventListener('animationend', cleanIn);
      });
    }

    index = targetIndex;
    entering?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Validation limited to the current step
  function validateCurrent() {
    const step = questions[index];
    if (!step) return true;

    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      const names = [...new Set([...radios].map(r => r.name))];
      for (const name of names) {
        const group = step.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const checked = [...group].some(r => r.checked);
        if (!checked) {
          pulse(step);
          group[0].focus();
          return false;
        }
      }
      return true;
    }

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

  function focusCurrentTitle(){
    const title = questions[index]?.querySelector('.question-title, legend');
    if (title) {
      title.setAttribute('tabindex','-1');
      title.focus({preventScroll:true});
      setTimeout(()=> title.removeAttribute('tabindex'), 0);
    }
  }

  document.documentElement.classList.add('js');
})();
