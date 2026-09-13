(function(){
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if(toggle && nav){
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
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
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', e => {
      if(form.dataset.live !== 'true'){
        e.preventDefault();
        const box = form.querySelector('.form-status');
        if(box){ box.className='form-status success'; box.innerHTML='<strong>Thank You for Contacting Us</strong><br>Your enquiry has been prepared. Connect this form to your preferred form endpoint before launch to receive submissions automatically.'; }
      }
    });
  });
})();
