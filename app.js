// Clean, serialized stepper with Animate.css (no page scroll, static backdrop)
(function () {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const headerEl = $('.site-header');
  const heroEl = $('#hero');
  const ctaBtn = $('#ctaBtn');
  const progressBtn = $('#progressBtn');
  const form = $('#surveyForm');
  const stepsWrap = $('#steps');
  const thankYou = $('#thankYou');

  const stages = $$('.stage.question', stepsWrap);

  let index = -1;            // current stage index
  let transitioning = false; // serialize transitions

  // ----- Sizing: compute safe viewport + header height
  function setViewportVars(){
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    const hh = headerEl?.getBoundingClientRect().height || 0;
    document.documentElement.style.setProperty('--header-h', `${Math.round(hh)}px`);
  }
  setViewportVars();
  window.addEventListener('resize', setViewportVars);

  // Helper: remove any lingering animate.css classes
  function clearAnimateClasses(el){
    const toRemove = [];
    el.classList.forEach(c => { if (c.startsWith('animate__')) toRemove.push(c); });
    if (toRemove.length) el.classList.remove(...toRemove);
  }

  // Play an Animate.css animation; resolve even if animationend is missed
  function animate(el, name, {cleanup=true} = {}){
    return new Promise(resolve => {
      // If animate.css failed to load, just resolve quickly
      const ADD = 'animate__animated';
      const FULL = `animate__${name}`;
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        if (cleanup) clearAnimateClasses(el);
        el.removeEventListener('animationend', onEnd);
        clearTimeout(fallback);
        resolve();
      };
      const onEnd = (e) => { if (e.target === el) finish(); };

      clearAnimateClasses(el);
      void el.offsetWidth;            // restart
      el.classList.add(ADD, FULL);
      el.addEventListener('animationend', onEnd);

      // Fallback based on computed animation duration
      const cs = getComputedStyle(el);
      const toMs = v => {
        if (!v) return 0;
        const first = v.split(',')[0].trim();
        return first.endsWith('ms') ? parseFloat(first) : parseFloat(first) * 1000;
      };
      const dur = toMs(cs.animationDuration) || 650;
      const delay = toMs(cs.animationDelay) || 0;
      const itersRaw = (cs.animationIterationCount || '1').split(',')[0].trim();
      const iters = itersRaw === 'infinite' ? 1 : (parseFloat(itersRaw) || 1);
      const total = (dur * iters) + delay + 150;
      const fallback = setTimeout(finish, total);
    });
  }

  // Show a stage (unhide, play IN)
  function showStage(i){
    const stage = stages[i];
    if (!stage) return Promise.resolve();
    stage.hidden = false;                            // participate in layout
    const inName = stage.dataset.in || 'fadeIn';
    return animate(stage, inName, {cleanup:true});   // cleanup IN classes after
  }

  // Hide a stage (play OUT, then hide and cleanup)
  async function hideStage(i){
    const stage = stages[i];
    if (!stage) return;
    const outName = stage.dataset.out || 'fadeOut';
    await animate(stage, outName, {cleanup:false});  // don't clear yet
    stage.hidden = true;                             // remove from layout (prevents "pop back")
    clearAnimateClasses(stage);                      // now safe to cleanup
  }

  // Validation for current stage only
  function validateCurrent(){
    const stage = stages[index];
    if (!stage) return true;

    const radios = stage.querySelectorAll('input[type="radio"]');
    if (radios.length){
      const names = [...new Set([...radios].map(r => r.name))];
      for (const name of names){
        const group = stage.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const checked = [...group].some(r => r.checked);
        if (!checked){
          pulse(stage.querySelector('.card') || stage);
          group[0].focus();
          return false;
        }
      }
      return true;
    }

    const fields = stage.querySelectorAll('textarea[required], input[required], select[required]');
    for (const el of fields){
      if (!el.value.trim()){
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

  function focusTitle(){
    const title = stages[index]?.querySelector('.question-title, legend');
    if (title){
      title.setAttribute('tabindex','-1');
      title.focus({preventScroll:true});
      setTimeout(()=> title.removeAttribute('tabindex'), 0);
    }
  }

  // Start flow
  ctaBtn.addEventListener('click', async () => {
    if (transitioning) return;
    transitioning = true;

    // Hide hero fully; reveal progress button
    heroEl.hidden = true;
    progressBtn.hidden = false;
    progressBtn.dataset.state = 'next';
    progressBtn.textContent = 'Next';

    index = 0;
    await showStage(index);

    transitioning = false;
    focusTitle();
  });

  // Next / Submit
  progressBtn.addEventListener('click', async () => {
    if (transitioning) return;
    const state = progressBtn.dataset.state;

    if (state === 'next'){
      if (!validateCurrent()) return;

      transitioning = true;
      progressBtn.disabled = true;

      const isLastIncoming = (index + 1 === stages.length - 1);

      await hideStage(index);
      index = index + 1;
      await showStage(index);

      if (isLastIncoming){
        progressBtn.dataset.state = 'submit';
        progressBtn.textContent = 'Submit';
      }

      progressBtn.disabled = false;
      transitioning = false;
      focusTitle();
    }
    else if (state === 'submit'){
      if (!validateCurrent()) return;

      transitioning = true;
      progressBtn.disabled = true;

      form.requestSubmit ? form.requestSubmit() : form.submit();
      setTimeout(() => {
        stepsWrap.hidden = true;
        progressBtn.hidden = true;
        thankYou.hidden = false;
        transitioning = false;
      }, 300);
    }
  });

  // Progressive enhancement flag
  document.documentElement.classList.add('js');
})();
