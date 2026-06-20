(function () {
  window.initMoviePlayer = function (options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const card = video ? video.closest('.player-card') : null;
    const stream = options.stream;
    let loaded = false;
    let hls = null;

    if (!video || !overlay || !stream) {
      return;
    }

    function markError() {
      if (card) {
        card.classList.add('has-error');
      }
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          hls.destroy();
          markError();
        });
        return;
      }

      video.src = stream;
    }

    function play() {
      attach();
      overlay.classList.add('is-hidden');
      video.controls = true;
      const request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('error', markError);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
