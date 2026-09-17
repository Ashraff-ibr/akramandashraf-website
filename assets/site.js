(function(){
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);

  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }));
  }

  // Header elevation and reading progress
  const header = document.querySelector('.site-header');
  const updateScroll = () => {
    if(header) header.classList.toggle('scrolled', window.scrollY > 12);
    document.body.classList.add('scroll-progress');
    const max = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.style.setProperty('--scroll-progress', (max > 0 ? (window.scrollY / max) * 100 : 0) + '%');
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, {passive:true});

  // Scroll reveal animations across all pages
  const revealSelectors = [
    '.section-head','.card','.property-card','.property-detail-grid','.detail-panel','.detail-hero',
    '.service-detail','.step','.audience','.value','.quote','.contact-panel','.form-card','.filters',
    '.cta .container','.page-hero .container','.hero-copy','.hero-art'
  ];
  const elements = [...new Set(revealSelectors.flatMap(sel => Array.from(document.querySelectorAll(sel))))];
  elements.forEach((el,i) => { if(!el.classList.contains('reveal')){ el.classList.add('reveal'); if(i%5===1)el.classList.add('delay-1'); if(i%5===2)el.classList.add('delay-2'); if(i%5===3)el.classList.add('delay-3'); }});
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('revealed'); observer.unobserve(entry.target); }});
    },{threshold:.12,rootMargin:'0px 0px -35px 0px'});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));

  // Property filters
  document.querySelectorAll('[data-filter]').forEach(select => {
    select.addEventListener('change', () => {
      const type = document.querySelector('[data-filter="type"]')?.value || 'all';
      const location = document.querySelector('[data-filter="location"]')?.value || 'all';
      document.querySelectorAll('[data-property]').forEach(card => {
        const matchesType = type === 'all' || card.dataset.type === type;
        const matchesLocation = location === 'all' || card.dataset.location === location;
        card.hidden = !(matchesType && matchesLocation);
      });
    });
  });

  // Keep demo fallback behaviour; live forms are not intercepted.
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      if(form.dataset.live !== 'true'){
        e.preventDefault();
        const box = form.querySelector('.form-status');
        if(box){ box.className='form-status success'; box.innerHTML='<strong>Thank You for Contacting Us</strong><br>Your enquiry has been prepared. Connect this form to your preferred form endpoint before launch to receive submissions automatically.'; }
      }
    });
  });

  // Subtle number reveal for any future counters marked data-count
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    if(!('IntersectionObserver' in window)){ el.textContent = target + suffix; return; }
    let done = false;
    const obs = new IntersectionObserver(entries => {
      if(done || !entries[0].isIntersecting) return;
      done = true; let start = null;
      const duration = 1100;
      const tick = t => { if(!start) start=t; const p=Math.min((t-start)/duration,1); const eased=1-Math.pow(1-p,3); el.textContent=Math.round(target*eased)+suffix; if(p<1)requestAnimationFrame(tick); };
      requestAnimationFrame(tick); obs.disconnect();
    },{threshold:.5});
    obs.observe(el);
  });
})();
