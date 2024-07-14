document.addEventListener('DOMContentLoaded', (event) => {
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    var player;

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('video-player', {
            height: '390',
            width: '640',
            videoId: '',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        console.log("Player ready");
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED) {
            nextSong();
        }
    }

    window.playPlaylist = function() {
        var url = document.getElementById('playlist-url').value;
        var playlistId = extractPlaylistId(url);
        if (playlistId) {
            socket.emit('play_song', {type: 'playlist', url: playlistId, index: 0});
        } else {
            alert("Invalid playlist URL");
        }
    }

    window.playSong = function() {
        var url = document.getElementById('song-url').value;
        var videoId = extractVideoId(url);
        if (videoId) {
            socket.emit('play_song', {type: 'song', url: videoId});
        } else {
            alert("Invalid video URL");
        }
    }

    window.pauseSong = function() {
        socket.emit('control', {action: 'pause'});
    }

    window.nextSong = function() {
        socket.emit('control', {action: 'next'});
    }

    socket.on('play_song', function(data) {
        if (data.type === 'playlist') {
            player.loadPlaylist({
                listType: 'playlist',
                list: data.url,
                index: data.index
            });
        } else {
            player.loadVideoById(data.url);
        }
    });

    socket.on('control', function(data) {
        if (data.action === 'pause') {
            player.pauseVideo();
        } else if (data.action === 'next') {
            player.nextVideo();
        }
    });

    function extractPlaylistId(url) {
        var regex = /[?&]list=([^#\&\?]+)/;
        var match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    function extractVideoId(url) {
        var regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        var match = url.match(regex);
        return match && match[1] ? match[1] : null;
    }

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
});
