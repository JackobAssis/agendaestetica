// UI Shell script: lucide init, theme toggle, nav active and action handlers
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (window.lucide) lucide.createIcons();
  } catch (e) {
    console.warn('Lucide not available yet', e);
  }

  const toggle = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('ae_theme');
  if (stored) root.setAttribute('data-theme', stored);

  function setToggleIcon() {
    if (!toggle) return;
    const icon = toggle.querySelector('i');
    if (!icon) return;
    if (root.getAttribute('data-theme') === 'light') {
      icon.setAttribute('data-lucide', 'moon');
    } else {
      icon.setAttribute('data-lucide', 'sun');
    }
  }

  setToggleIcon();
  if (window.lucide) lucide.createIcons();

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.removeItem('ae_theme');
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('ae_theme', 'light');
      }
      setToggleIcon();
      if (window.lucide) lucide.createIcons();
    });
  }

  // Active nav highlighting based on URL
  (function highlightNav(){
    try {
      const links = document.querySelectorAll('.app-nav .nav-item');
      const href = location.href;
      links.forEach(a => {
        a.classList.remove('active');
        const page = a.getAttribute('data-page');
        if (page && href.includes(page + '.html')) { a.classList.add('active'); }
      });
    } catch (e) { /* ignore */ }
  })();

  // Actions handlers
  (function actions(){
    const handlers = {
      'novo-agendamento': () => window.location.href = '../pages/agendar-cliente.html',
      'novo-cliente': () => window.location.href = '../pages/clientes.html',
      'config-horarios': () => { const el = document.getElementById('hora-inicio'); if(el){ el.focus(); window.scrollTo({ top: document.getElementById('form-agenda').offsetTop - 80, behavior: 'smooth' }); } },
      'ver-relatorios': () => window.location.href = '../pages/relatorios.html'
    };
    document.querySelectorAll('.action-btn').forEach(b => {
      b.addEventListener('click', () => {
        const a = b.getAttribute('data-action'); if (handlers[a]) handlers[a]();
      });
    });
  })();
});
