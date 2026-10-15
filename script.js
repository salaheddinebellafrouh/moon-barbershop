(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade cards in as they scroll into view
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => revealer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // Highlight the category chip for the section on screen
  const nav = document.querySelector('.chips-inner');
  const chips = Array.from(document.querySelectorAll('.chip'));
  const chipFor = new Map(chips.map((c) => [c.getAttribute('href').slice(1), c]));

  function setActive(id) {
    const chip = chipFor.get(id);
    if (!chip || chip.classList.contains('active')) return;
    chips.forEach((c) => c.classList.toggle('active', c === chip));
    const left = chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2;
    nav.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    chipFor.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // The footer is too short to reach the spy band, so catch the bottom of the page
  window.addEventListener('scroll', () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) setActive('infos');
  }, { passive: true });

  // Open / closed badge, using the shop's local time (Morocco)
  const status = document.getElementById('status');
  const OPEN_AT = 10 * 60 + 30;
  const CLOSE_AT = 22 * 60 + 30;

  function updateStatus() {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      const get = (type) => Number(parts.find((p) => p.type === type).value);
      const minutes = get('hour') * 60 + get('minute');
      const open = minutes >= OPEN_AT && minutes < CLOSE_AT;
      status.classList.toggle('open', open);
      status.querySelector('span').textContent = open ? 'Ouvert maintenant' : 'Fermé · ouvre à 10:30';
      status.hidden = false;
    } catch (e) {
      status.hidden = true;
    }
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // Full-screen view of the original menu image
  const lightbox = document.getElementById('lightbox');
  document.querySelectorAll('[data-open-menu]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
      else window.open('images/menu.jpg', '_blank');
    });
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('[data-close]')) lightbox.close();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
