(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupCarousel() {
    var root = document.querySelector(".hero-carousel");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector(".hero-prev");
    var next = root.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
    inputs.forEach(function (input) {
      var scope = input.closest(".filter-scope") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && input.value === "") {
        input.value = initial;
      }

      function apply() {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          card.classList.toggle("is-hidden-by-filter", query !== "" && text.indexOf(query) === -1);
        });
      }

      input.addEventListener("input", apply);
      apply();
    });

    Array.prototype.slice.call(document.querySelectorAll(".clear-filter")).forEach(function (button) {
      button.addEventListener("click", function () {
        var scope = button.closest(".filter-scope") || document;
        var input = scope.querySelector(".filter-input");
        if (input) {
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.focus();
        }
      });
    });
  }

  window.createMoviePlayer = function (videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function play() {
      if (!video || !url) {
        return;
      }
      hideOverlay();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== url) {
          video.src = url;
        }
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }
      if (video.src !== url) {
        video.src = url;
      }
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", hideOverlay);
    }
  };

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
  });
})();
