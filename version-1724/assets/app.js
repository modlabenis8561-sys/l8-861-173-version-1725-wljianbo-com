(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const menu = document.querySelector('.nav-menu');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 360);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      window.location.href = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
    });
  });

  document.querySelectorAll('[data-local-filter]').forEach(function (form) {
    const input = form.querySelector('input');
    const select = form.querySelector('select');
    const list = document.querySelector('[data-filter-list]');
    const cards = list ? Array.from(list.querySelectorAll('[data-movie-card]')) : [];

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      const type = select ? select.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        const cardType = (card.getAttribute('data-type') || '').toLowerCase();
        const matchedText = !query || text.indexOf(query) !== -1;
        const matchedType = !type || cardType.indexOf(type) !== -1;
        card.classList.toggle('is-filter-hidden', !(matchedText && matchedType));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }
  });

  const searchForm = document.querySelector('[data-search-page-form]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchStatus = document.querySelector('[data-search-status]');

  if (searchForm && searchResults && searchStatus && Array.isArray(window.SEARCH_DATA)) {
    const input = searchForm.querySelector('input[name="q"]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    const cardHtml = function (movie) {
      const tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
        '    <span class="poster-shade"></span>',
        '    <span class="poster-play">▶</span>',
        '    <span class="poster-badge">' + escapeHtml(movie.year || movie.type) + '</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="movie-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</p>',
        '    <p class="movie-desc">' + escapeHtml(movie.description) + '</p>',
        '    <div class="movie-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('\n');
    };

    const runSearch = function (query) {
      const normalized = query.trim().toLowerCase();

      if (!normalized) {
        searchResults.innerHTML = '';
        searchStatus.textContent = '请输入关键词开始搜索。';
        return;
      }

      const results = window.SEARCH_DATA.filter(function (movie) {
        return movie.searchText.indexOf(normalized) !== -1;
      }).slice(0, 120);

      searchStatus.textContent = results.length ? '找到相关影片：' + results.length + ' 部' : '没有找到匹配影片。';
      searchResults.innerHTML = results.map(cardHtml).join('\n');
    };

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input ? input.value.trim() : '';
      const url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', url);
      runSearch(query);
    });

    runSearch(initialQuery);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
