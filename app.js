// Survey stepper using Animate.css for full-screen stage transitions (no page scroll)
(function () {
  const ctaBtn = document.getElementById('ctaBtn');
  const progressBtn = document.getElementById('progressBtn');
  const stepsWrap = document.getElementById('steps');
  const form = document.getElementById('surveyForm');
  const thankYou = document.getElementById('thankYou');
  const headerEl = document.querySelector('.site-header');
  const heroEl = document.querySelector('.hero');

  const stages = Array.from(stepsWrap.querySelectorAll('.stage.question'));
  let index = -1;            // current stage index
  let transitioning = false; // prevent overlapping transitions

  // ----- Viewport sizing (lock everything on-screen)
  function setViewportVars(){
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    const hh = headerEl?.offsetHeight || 0;
    document.documentElement.style.setProperty('--header-h', `${hh}px`);
  }
  setViewportVars();
  window.addEventListener('resize', setViewportVars);

  // Hide all stages initially
  stages.forEach(s => s.classList.remove('active'));

  // Remove any Animate.css classes to avoid conflicts
  function clearAnimations(el){
    const toRemove = [];
    el.classList.forEach(c => { if (c.startsWith('animate__')) toRemove.push(c); });
    if (toRemove.length) el.classList.remove(...toRemove);
  }

  // Apply Animate.css class and resolve; optional cleanup control
  function playAnimation(el, name, opts = { cleanup: true }) {
    const { cleanup } = opts;

    return new Promise(resolve => {
      const base = 'animate__animated';
      const full = `animate__${name}`;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        if (cleanup) clearAnimations(el); // <- for IN animations
        el.removeEventListener('animationend', onEnd);
        clearTimeout(fallback);
        resolve();
      };

      const onEnd = (e) => { if (e.target === el) finish(); };

      // Fresh start each time
      clearAnimations(el);
      // reflow to restart
      void el.offsetWidth;
      el.classList.add(base, full);
      el.addEventListener('animationend', onEnd);

      // Fallback timing based on computed styles (duration × iterations + delay)
      const cs = getComputedStyle(el);
      const toMs = (v) => {
        if (!v) return 0;
        const first = v.split(',')[0].trim();
        return first.endsWith('ms') ? parseFloat(first) : parseFloat(first) * 1000;
      };
      const dur = toMs(cs.animationDuration) || 650;
      const delay = toMs(cs.animationDelay) || 0;
      const iterStr = (cs.animationIterationCount || '1').split(',')[0].trim();
      const iters = (iterStr === 'infinite') ? 1 : (parseFloat(iterStr) || 1);
      const total = (dur * iters) + delay + 150;
      const fallback = setTimeout(finish, total);
    });
  }

  function showStage(i) {
    const stage = stages[i];
    if (!stage) return Promise.resolve();
    const inName = stage.dataset.in || 'fadeIn';
    stage.classList.add('active');        // make it visible
    return playAnimation(stage, inName, { cleanup: true }); // cleanup after IN
  }

  async function hideStage(i) {
    const stage = stages[i];
    if (!stage) return;
    const outName = stage.dataset.out || 'fadeOut';
    // Do NOT cleanup yet to avoid a "snap back" frame
    await playAnimation(stage, outName, { cleanup: false });
    stage.classList.remove('active');     // hide immediately after OUT completes
    clearAnimations(stage);               // now safe to cleanup classes
  }

  // Start flow
  ctaBtn.addEventListener('click', async () => {
    if (transitioning) return;
    transitioning = true;

    // Collapse hero so the first stage is directly under the header
    heroEl?.classList.add('collapsed');

    // Reveal floating button
    ctaBtn.classList.add('dock');
    progressBtn.classList.add('show');
    progressBtn.textContent = 'Next';
    progressBtn.dataset.state = 'next';

    index = 0;
    await showStage(index);

    transitioning = false;
    focusCurrentTitle();
  });

  // Next / Submit
  progressBtn.addEventListener('click', async () => {
    const state = progressBtn.dataset.state;
    if (transitioning) return;

    if (state === 'next') {
      if (!validateCurrent()) return;

      transitioning = true;
      progressBtn.disabled = true;

      const isLastIncoming = index + 1 === stages.length - 1;

      await hideStage(index);
      index = index + 1;
      await showStage(index);

      if (isLastIncoming) {
        progressBtn.dataset.state = 'submit';
        progressBtn.textContent = 'Submit';
      }

      progressBtn.disabled = false;
      transitioning = false;
      focusCurrentTitle();

    } else if (state === 'submit') {
      if (!validateCurrent()) return;

      transitioning = true;
      progressBtn.disabled = true;

      form.requestSubmit ? form.requestSubmit() : form.submit();

      setTimeout(() => {
        form.hidden = true;
        progressBtn.classList.remove('show');
        thankYou.hidden = false;
        transitioning = false;
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
