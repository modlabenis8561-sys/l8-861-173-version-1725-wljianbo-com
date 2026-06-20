(function () {
    window.setupMoviePlayer = function (source) {
        var root = document.querySelector("[data-player]");
        if (!root) {
            return;
        }
        var video = root.querySelector("video");
        var cover = root.querySelector(".player-cover");
        var button = root.querySelector(".player-start");
        var status = root.querySelector(".player-status");
        var attached = false;
        var hls = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function attach() {
            if (attached || !video || !source) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("准备播放");
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        setStatus("正在重新连接");
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        setStatus("正在恢复播放");
                        return;
                    }
                    setStatus("播放失败，请稍后再试");
                });
            } else {
                video.src = source;
                setStatus("准备播放");
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    setStatus("点击视频继续播放");
                });
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
