(function () {
  window.initMoviePlayer = function (streamUrl) {
    const video = document.getElementById('movie-player');
    const cover = document.getElementById('player-cover');

    if (!video || !streamUrl) {
      return;
    }

    let attached = false;
    let hlsInstance = null;

    const attachStream = function () {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
            return;
          }
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
        return;
      }

      video.src = streamUrl;
    };

    const play = function () {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      const request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    };

    if (cover) {
      cover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
