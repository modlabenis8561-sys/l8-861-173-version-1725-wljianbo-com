(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });

            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                showSlide(idx);
            });
        });

        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInput = document.getElementById('movieSearch');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeFilter = 'all';

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalizeText([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.textContent
        ].join(' '));
    }

    function applySearch() {
        if (!cards.length) {
            return;
        }

        var keyword = searchInput ? normalizeText(searchInput.value) : '';
        var filter = normalizeText(activeFilter);

        cards.forEach(function (card) {
            var text = cardText(card);
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var filterMatch = filter === 'all' || text.indexOf(filter) !== -1;
            card.classList.toggle('hidden-by-search', !(keywordMatch && filterMatch));
        });
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            searchInput.value = query;
        }

        searchInput.addEventListener('input', applySearch);
        applySearch();
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';

            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });

            applySearch();
        });
    });

    function setupPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-overlay');
        var message = box.querySelector('.player-message');
        var stream = video ? video.getAttribute('data-stream') : '';
        var ready = false;
        var instance = null;

        if (!video || !button || !stream) {
            return;
        }

        function showMessage() {
            if (message) {
                message.hidden = false;
            }
        }

        function attachStream() {
            if (ready) {
                return true;
            }

            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                instance.loadSource(stream);
                instance.attachMedia(video);
                ready = true;
                return true;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return true;
            }

            showMessage();
            return false;
        }

        function play() {
            if (!attachStream()) {
                return;
            }

            box.classList.add('is-playing');
            video.play().catch(function () {
                box.classList.remove('is-playing');
                showMessage();
            });
        }

        button.addEventListener('click', play);

        video.addEventListener('click', function () {
            if (!ready) {
                play();
            }
        });

        video.addEventListener('playing', function () {
            box.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                box.classList.remove('is-playing');
            }
        });

        video.addEventListener('error', showMessage);

        window.addEventListener('beforeunload', function () {
            if (instance) {
                instance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
}());
