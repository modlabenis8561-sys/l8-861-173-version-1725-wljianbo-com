(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
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
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    var hero = document.querySelector(".hero-section");
    if (hero) {
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
    if (!searchInputs.length) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-row"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip-filter"));
    var empty = document.querySelector(".empty-state");
    var state = {
      text: "",
      chip: "all"
    };
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" "));
        var matchText = !state.text || haystack.indexOf(state.text) !== -1;
        var matchChip = state.chip === "all" || haystack.indexOf(state.chip) !== -1;
        var show = matchText && matchChip;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        state.text = normalize(input.value);
        apply();
      });
    });
    chips.forEach(function (button) {
      button.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        state.chip = normalize(button.getAttribute("data-filter"));
        apply();
      });
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initializeMoviePlayer(streamUrl) {
  var video = document.getElementById("videoPlayer");
  var overlay = document.getElementById("videoOverlay");
  if (!video || !overlay || !streamUrl) {
    return;
  }
  var hls = null;
  var attached = false;
  var parsed = false;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      parsed = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        parsed = true;
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          overlay.classList.remove("is-hidden");
        }
      });
      return;
    }
    video.src = streamUrl;
    parsed = true;
  }

  function playVideo() {
    overlay.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (!parsed) {
          return;
        }
        overlay.classList.remove("is-hidden");
      });
    }
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attachSource();
    playVideo();
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
}
