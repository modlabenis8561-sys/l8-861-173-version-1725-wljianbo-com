(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var form = scope.querySelector('[data-inline-search]');
    var pills = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-pill]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');
    var active = 'all';
    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.year, card.dataset.region].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchPill = active === 'all' || haystack.indexOf(active.toLowerCase()) !== -1;
        var show = matchKeyword && matchPill;
        card.dataset.hidden = show ? 'false' : 'true';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        active = pill.getAttribute('data-filter-pill') || 'all';
        pills.forEach(function (item) {
          item.classList.toggle('active', item === pill);
        });
        apply();
      });
    });
    apply();
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q) {
    document.querySelectorAll('[data-search-input]').forEach(function (input) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    });
  }

  function attachPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-play-url') || '';
    function play() {
      if (!url) {
        return;
      }
      shell.classList.add('is-playing');
      if (video.dataset.ready === '1') {
        video.play().catch(function () {});
        return;
      }
      video.dataset.ready = '1';
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', play);
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      play();
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }

  document.querySelectorAll('[data-player-shell]').forEach(attachPlayer);
})();
