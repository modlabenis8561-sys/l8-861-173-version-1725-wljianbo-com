(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var form = panel.querySelector("[data-filter-form]");
            if (!form) {
                return;
            }
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!cards.length) {
                cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            }
            var input = form.querySelector("[data-search-input]");
            var typeSelect = form.querySelector("[data-type-filter]");
            var yearSelect = form.querySelector("[data-year-filter]");
            var empty = panel.querySelector("[data-filter-empty]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && input) {
                input.value = initialQuery;
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var type = normalize(typeSelect ? typeSelect.value : "");
                var year = normalize(yearSelect ? yearSelect.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                        ok = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        ok = false;
                    }
                    card.classList.toggle("hidden-card", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });

            [input, typeSelect, yearSelect].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });

            apply();
        });
    }

    function initHomeSearch() {
        var form = document.querySelector("[data-home-search]");
        if (!form) {
            return;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var value = input ? input.value.trim() : "";
            var url = "./search.html";
            if (value) {
                url += "?q=" + encodeURIComponent(value);
            }
            window.location.href = url;
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initHomeSearch();
    });
})();
