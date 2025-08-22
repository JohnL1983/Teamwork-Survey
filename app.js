// Survey stepper using Animate.css for full-screen stage transitions
(function () {
  const ctaBtn = document.getElementById('ctaBtn');
  const progressBtn = document.getElementById('progressBtn');
  const stepsWrap = document.getElementById('steps');
  const form = document.getElementById('surveyForm');
  const thankYou = document.getElementById('thankYou');

  const stages = Array.from(stepsWrap.querySelectorAll('.stage.question'));
  let index = -1; // not started

  stages.forEach(s => s.classList.remove('active'));

  // Helper to apply Animate.css classes and await the end
  function playAnimation(el, name) {
    return new Promise(resolve => {
      const base = 'animate__animated';
      const full = `animate__${name}`;
      // reset previous run
      el.classList.remove(base);
      // force reflow so animation restarts
      void el.offsetWidth;
      el.classList.add(base, full);

      function onEnd(e){
        if (e.target !== el) return;
        el.classList.remove(base, full);
        el.removeEventListener('animationend', onEnd);
        resolve();
      }
      el.addEventListener('animationend', onEnd);
    });
  }

  function showStage(i) {
    const stage = stages[i];
    if (!stage) return;

    const inName = stage.dataset.in || 'fadeIn';
    stage.classList.add('active');
    // Animate the full-screen stage; the card sits centered
    return playAnimation(stage, inName);
  }

  async function hideStage(i) {
    const stage = stages[i];
    if (!stage) return;

    const outName = stage.dataset.out || 'fadeOut';
    await playAnimation(stage, outName);
    stage.classList.remove('active');
  }

  // Start flow
  ctaBtn.addEventListener('click', async () => {
    ctaBtn.classList.add('dock');
    progressBtn.classList.add('show');
    progressBtn.textContent = 'Next';
    progressBtn.dataset.state = 'next';
    index = 0;
    await showStage(index);
    focusCurrentTitle();
  });

  // Next / Submit
  progressBtn.addEventListener('click', async () => {
    const state = progressBtn.dataset.state;

    if (state === 'next') {
      if (!validateCurrent()) return;

      const isLastIncoming = index + 1 === stages.length - 1;
      await hideStage(index);
      index = index + 1;
      await showStage(index);

      if (isLastIncoming) {
        progressBtn.dataset.state = 'submit';
        progressBtn.textContent = 'Submit';
      }
      focusCurrentTitle();
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

  // Validation limited to current stage
  function validateCurrent() {
    const stage = stages[index];
    if (!stage) return true;

    const radios = stage.querySelectorAll('input[type="radio"]');
    if (radios.length) {
      const names = [...new Set([...radios].map(r => r.name))];
      for (const name of names) {
        const group = stage.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const checked = [...group].some(r => r.checked);
        if (!checked) {
          pulse(stage.querySelector('.card') || stage);
          group[0].focus();
          return false;
        }
      }
      return true;
    }

    const fields = stage.querySelectorAll('textarea[required], input[required], select[required]');
    for (const el of fields) {
      if (!el.value.trim()) {
        pulse(stage.querySelector('.card') || stage);
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
    const title = stages[index]?.querySelector('.question-title, legend');
    if (title) {
      title.setAttribute('tabindex','-1');
      title.focus({preventScroll:true});
      setTimeout(()=> title.removeAttribute('tabindex'), 0);
    }
  }

  document.documentElement.classList.add('js');
})();
