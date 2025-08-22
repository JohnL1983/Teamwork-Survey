// Survey stepper using Animate.css for full-screen stage transitions
(function () {
  const ctaBtn = document.getElementById('ctaBtn');
  const progressBtn = document.getElementById('progressBtn');
  const stepsWrap = document.getElementById('steps');
  const form = document.getElementById('surveyForm');
  const thankYou = document.getElementById('thankYou');
  const headerEl = document.querySelector('.site-header');

  const stages = Array.from(stepsWrap.querySelectorAll('.stage.question'));
  let index = -1; // not started

  // ----- Viewport sizing: lock everything on-screen (no page scroll)
  function setViewportVars(){
    // Mobile-safe 1% viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Exact header height
    const hh = headerEl?.offsetHeight || 0;
    document.documentElement.style.setProperty('--header-h', `${hh}px`);
  }
  setViewportVars();
  window.addEventListener('resize', setViewportVars);

  stages.forEach(s => s.classList.remove('active'));

  // Helper to apply Animate.css classes and resolve even if animationend never fires
  function playAnimation(el, name) {
    return new Promise(resolve => {
      const base = 'animate__animated';
      const full = `animate__${name}`;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        el.classList.remove(base, full);
        el.removeEventListener('animationend', onEnd);
        clearTimeout(fallback);
        resolve();
      };
      const onEnd = (e) => { if (e.target === el) finish(); };

      el.classList.remove(base, full);
      void el.offsetWidth;
      el.classList.add(base, full);
      el.addEventListener('animationend', onEnd);

      const root = getComputedStyle(document.documentElement);
      const durStr = (root.getPropertyValue('--animate-duration') || '.65s').trim();
      const ms = durStr.endsWith('ms') ? parseFloat(durStr) : parseFloat(durStr) * 1000;
      const fallback = setTimeout(finish, Math.max(200, ms + 150));
    });
  }

  function showStage(i) {
    const stage = stages[i];
    if (!stage) return Promise.resolve();
    const inName = stage.dataset.in || 'fadeIn';
    stage.classList.add('active');
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
