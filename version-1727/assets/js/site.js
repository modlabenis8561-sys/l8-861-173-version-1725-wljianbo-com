(function () {
    'use strict';

    function getRootPrefix() {
        var path = window.location.pathname.replace(/\\/g, '/');
        return path.indexOf('/details/') !== -1 ? '../' : './';
    }

    function initMobileNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.mobile-nav');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
        var next = document.querySelector('[data-hero-next]');
        var prev = document.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === index);
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

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-hero-thumb') || 0));
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        start();
    }

    function initGlobalSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        var index = window.MOVIE_SEARCH_INDEX || [];
        var rootPrefix = getRootPrefix();

        if (!inputs.length || !index.length) {
            return;
        }

        inputs.forEach(function (input) {
            var results = input.parentElement.querySelector('.search-results');

            if (!results) {
                return;
            }

            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();

                if (!query) {
                    results.classList.remove('is-visible');
                    results.innerHTML = '';
                    return;
                }

                var matched = index.filter(function (movie) {
                    var haystack = [
                        movie.title,
                        movie.region,
                        movie.year,
                        movie.category,
                        movie.genre,
                        movie.tags
                    ].join(' ').toLowerCase();

                    return haystack.indexOf(query) !== -1;
                }).slice(0, 10);

                if (!matched.length) {
                    results.innerHTML = '<p>没有找到匹配影片</p>';
                    results.classList.add('is-visible');
                    return;
                }

                results.innerHTML = matched.map(function (movie) {
                    var href = rootPrefix + 'details/movie-' + movie.id4 + '.html';
                    return '<a href="' + href + '"><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.region + ' · ' + movie.year + ' · ' + movie.category) + '</span></a>';
                }).join('');
                results.classList.add('is-visible');
            });

            input.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    input.value = '';
                    results.classList.remove('is-visible');
                    results.innerHTML = '';
                }
            });

            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    results.classList.remove('is-visible');
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('.movie-grid[data-filterable="true"]'));

        grids.forEach(function (grid) {
            var panel = grid.parentElement.previousElementSibling;

            if (!panel || !panel.classList.contains('filter-panel')) {
                panel = document.querySelector('.filter-panel');
            }

            if (!panel) {
                return;
            }

            var textInput = panel.querySelector('[data-filter-text]');
            var regionSelect = panel.querySelector('[data-filter-region]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var categorySelect = panel.querySelector('[data-filter-category]');
            var count = panel.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

            function applyFilters() {
                var query = textInput ? textInput.value.trim().toLowerCase() : '';
                var region = regionSelect ? regionSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var category = categorySelect ? categorySelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var pass = true;

                    if (query && haystack.indexOf(query) === -1) {
                        pass = false;
                    }

                    if (region && card.getAttribute('data-region') !== region) {
                        pass = false;
                    }

                    if (year && card.getAttribute('data-year') !== year) {
                        pass = false;
                    }

                    if (category && card.getAttribute('data-category') !== category) {
                        pass = false;
                    }

                    card.hidden = !pass;

                    if (pass) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
                }
            }

            [textInput, regionSelect, yearSelect, categorySelect].forEach(function (element) {
                if (element) {
                    element.addEventListener('input', applyFilters);
                    element.addEventListener('change', applyFilters);
                }
            });

            applyFilters();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var message = shell.querySelector('.player-message');
            var source = shell.getAttribute('data-video-url');
            var hlsInstance = null;

            if (!video || !overlay || !source) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function bindSource() {
                if (video.getAttribute('data-source-bound') === 'true') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.setAttribute('data-source-bound', 'true');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    video.setAttribute('data-source-bound', 'true');

                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setMessage('播放源加载异常，请稍后重试。');
                        }
                    });
                    return;
                }

                setMessage('当前浏览器暂不支持 HLS 播放。');
            }

            function play() {
                bindSource();
                overlay.classList.add('is-hidden');
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('请再次点击播放器开始播放。');
                    });
                }
            }

            overlay.addEventListener('click', play);
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
                setMessage('');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    overlay.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initGlobalSearch();
        initFilters();
        initPlayers();
    });
}());
