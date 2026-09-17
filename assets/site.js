(function(){
  'use strict';

  const body = document.body;
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);

  // Page entrance + scroll progress
  const transition = document.createElement('div');
  transition.className = 'page-transition';
  transition.setAttribute('aria-hidden','true');
  body.appendChild(transition);
  requestAnimationFrame(() => body.classList.add('page-ready'));

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden','true');
  body.appendChild(progress);

  const header = document.querySelector('.site-header');
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? Math.min(100, scrollTop / max * 100) : 0) + '%';
    if(header) header.classList.toggle('scrolled', scrollTop > 12);
  };
  window.addEventListener('scroll', updateScrollUI, {passive:true});
  updateScrollUI();

  // Mobile navigation
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Open menu');
    }));
  }

  // Correct active nav item on every page.
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a[href]').forEach(a => {
    const href = a.getAttribute('href').split('#')[0];
    if(href === current || (current === '' && href === 'index.html')) a.classList.add('active');
    else if(!href.startsWith('http') && href !== 'index.html') a.classList.remove('active');
  });

  // Scroll reveal
  const revealTargets = document.querySelectorAll('.section, .page-hero, .section-head, .card, .property-card, .service-detail, .detail-panel, .form-card, .visual-card, .image-gallery figure, .process, .about-split, .contact-grid, .cta, .footer');
  revealTargets.forEach((el,i) => {
    if(!el.classList.contains('reveal')) el.classList.add('reveal');
    if(el.classList.contains('grid-3') || el.classList.contains('grid-2') || el.classList.contains('process') || el.classList.contains('image-gallery') || el.classList.contains('values') || el.classList.contains('audiences')){
      el.classList.add('stagger-children');
    }
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window && !reduced){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -50px 0px'});
    revealTargets.forEach(el => observer.observe(el));
  }else{
    revealTargets.forEach(el => el.classList.add('revealed'));
  }

  // Gentle hero parallax on pointer devices.
  const heroImage = document.querySelector('.hero-image');
  if(heroImage && !reduced && window.matchMedia('(pointer:fine)').matches){
    heroImage.addEventListener('pointermove', e => {
      const r = heroImage.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width-.5)*14;
      const y = ((e.clientY-r.top)/r.height-.5)*10;
      heroImage.style.setProperty('--mx', x+'px');
      heroImage.style.setProperty('--my', y+'px');
      heroImage.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    });
    heroImage.addEventListener('pointerleave', () => {
      heroImage.style.backgroundPosition = 'center';
    });
  }

  // Subtle card tilt on desktop.
  if(!reduced && window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.card, .property-card, .service-detail').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r=card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.2).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform='');
    });
  }

  // Property filters with smooth visibility.
  const filterSelects = document.querySelectorAll('[data-filter]');
  const applyFilters = () => {
    const type = document.querySelector('[data-filter="type"]')?.value || 'all';
    const location = document.querySelector('[data-filter="location"]')?.value || 'all';
    document.querySelectorAll('[data-property]').forEach(card => {
      const matchesType = type === 'all' || card.dataset.type === type;
      const matchesLocation = location === 'all' || card.dataset.location === location;
      card.hidden = !(matchesType && matchesLocation);
    });
  };
  filterSelects.forEach(select => select.addEventListener('change', applyFilters));

  // Image lightbox for property/visual galleries.
  const lightbox = document.createElement('div');
  lightbox.className='lightbox';
  lightbox.innerHTML='<button class="lightbox-close" type="button" aria-label="Close image">×</button><img alt=""><div class="lightbox-caption"></div>';
  body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeLightbox = () => lightbox.classList.remove('open');
  document.querySelectorAll('.visual-card img, .image-gallery img, .property-image').forEach(img => {
    img.setAttribute('loading','lazy');
    img.addEventListener('click', () => {
      lightboxImg.src=img.currentSrc || img.src;
      lightboxImg.alt=img.alt || '';
      lightboxCaption.textContent=img.alt || 'Akram and Ashraf Nigeria Limited';
      lightbox.classList.add('open');
    });
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeLightbox(); });

  // Live forms: preserve FormSubmit behavior while adding friendly validation/loading state.
  document.querySelectorAll('form[action*="formsubmit.co"]').forEach(form => {
    const wrapper = form.closest('.form-card') || form.parentElement;
    form.addEventListener('submit', e => {
      if(!form.checkValidity()){
        e.preventDefault();
        form.reportValidity();
        return;
      }
      wrapper?.classList.add('is-submitting');
    });
  });

  // Smooth internal anchor scrolling.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id=a.getAttribute('href');
      const target=document.querySelector(id);
      if(target){e.preventDefault();target.scrollIntoView({behavior: reduced?'auto':'smooth',block:'start'});}
    });
  });

  // Elegant page transitions for local HTML navigation.
  document.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', e => {
      const href=a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || a.target==='_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if(href.endsWith('.html') || href === './'){
        e.preventDefault();
        body.classList.remove('page-ready');
        body.classList.add('page-leaving');
        setTimeout(()=>{window.location.href=href;},430);
      }
    });
  });
})();
