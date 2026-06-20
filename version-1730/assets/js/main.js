(function () {
  const body = document.body;
  const menuButton = document.querySelector('[data-menu-button]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      body.classList.remove('menu-open');
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-search-input]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
    const empty = scope.querySelector('[data-empty]');
    let filter = 'all';

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (input && query) {
      input.value = query;
    }

    function apply() {
      const value = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const filterMatch = filter === 'all' || text.indexOf(filter) !== -1;
        const queryMatch = value === '' || text.indexOf(value) !== -1;
        const matched = filterMatch && queryMatch;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        filter = button.dataset.filter || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  });
})();
