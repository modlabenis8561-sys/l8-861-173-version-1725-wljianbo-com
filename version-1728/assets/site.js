(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearch() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-search-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var empty = scope.querySelector("[data-empty-state]");
            var section = scope.parentElement;
            var items = section ? Array.prototype.slice.call(section.querySelectorAll("[data-search-item]")) : [];
            var activeFilter = "全部";

            function filterItems() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute("data-search-text") || "").toLowerCase();
                    var keywordMatch = !keyword || text.indexOf(keyword) >= 0;
                    var filterMatch = activeFilter === "全部" || text.indexOf(activeFilter.toLowerCase()) >= 0;
                    var show = keywordMatch && filterMatch;
                    item.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (input) {
                input.addEventListener("input", filterItems);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.getAttribute("data-filter-value") || "全部";
                    buttons.forEach(function (other) {
                        other.classList.toggle("is-active", other === button);
                    });
                    filterItems();
                });
            });
            filterItems();
        });
    }
}());

function initVideoPlayer(videoId, overlayId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = streamUrl;
    }

    function playVideo(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        attachStream();
        overlay.classList.add("is-hidden");
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", playVideo);
    if (button) {
        button.addEventListener("click", playVideo);
    }
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
