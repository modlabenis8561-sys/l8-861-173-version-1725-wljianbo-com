(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.mobile-nav');

  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }

  var hero = document.querySelector('.hero');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        schedule();
      });
    });

    if (slides.length) {
      showSlide(0);
      schedule();
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.global-search-form')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      }
    });
  });

  var filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    var input = filterPanel.querySelector('.site-search');
    var selects = Array.prototype.slice.call(filterPanel.querySelectorAll('.filter-select'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-result');
    var params = new URLSearchParams(location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : '');
      var active = {};

      selects.forEach(function (select) {
        active[select.getAttribute('data-kind')] = normalize(select.value);
      });

      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !keyword || text.indexOf(keyword) !== -1;

        Object.keys(active).forEach(function (kind) {
          var wanted = active[kind];
          if (wanted && normalize(card.getAttribute('data-' + kind)) !== wanted) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();

function initMoviePlayer(playUrl) {
  var video = document.querySelector('.player-video');
  var overlay = document.querySelector('.player-overlay');
  var attached = false;
  var hlsInstance = null;

  if (!video || !overlay || !playUrl) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(playUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = playUrl;
    }

    attached = true;
  }

  function beginPlay() {
    attachMedia();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  overlay.addEventListener('click', beginPlay);

  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      beginPlay();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
