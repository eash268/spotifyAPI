var app = {

	// local variables
	current_songs: "",
	password: "Bearer BQDm3mZmRe-tBHECkycsG4EtACm6aXTVs4PIsNQTBM46wWfFUwCJy_CujfZZwbvppNOCfuUAhtgZ-VMRi5TS80XMSPXyCwy-sYB2u3K8-0c9O4BocqrdZsB2NOMBHi2mGs2o32ntg4sxLRbwlcnNdfPhYB7FyADO2zENjg",
	mix_songs: [],
	scores_obj: [],

	// local methods
	getCurrentSong: function() {
		var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    
	    app.alertSongNameById(vars["current_song"]);
	    app.getSongMetrics(vars["current_song"]);
    },

    alertSongNameById: function(sid) {
    	var target_url = "https://api.spotify.com/v1/tracks/" + sid;

    	$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: target_url,
            success: function(res) {
            	alert(res.name)
            },
            error: function(err) {
            	console.log(err);
            }
        });
    },

    getSongMetrics: function(sid) {
    	var target_url = "https://api.spotify.com/v1/audio-features/" + sid;

    	$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: target_url,
            success: function(res) {
            	song_metrics = {
            		"sid": sid,
            		"danceability": res["danceability"],
            		"energy": res["energy"],
            		"key": res["key"],
            		"liveness": res["liveness"],
            		"loudness": res["loudness"],
            		"tempo": res["tempo"],
            		"time_signature": res["time_signature"],
				};

				app.getMatchFromPlaylist(song_metrics);

            },
            error: function(err) {
            	console.log(err);
            }
        });
    },

    getMixScore: function(source_metrics, target_id) {
    	if (source_metrics.sid == target_id) {
    		return
    	}

	    var target_url = "https://api.spotify.com/v1/audio-features/" + target_id;

    	$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: target_url,
            success: function(res) {
            	target_metrics = {
            		"sid": target_id,
            		"danceability": res["danceability"],
            		"energy": res["energy"],
            		"key": res["key"],
            		"liveness": res["liveness"],
            		"loudness": res["loudness"],
            		"tempo": res["tempo"],
            		"time_signature": res["time_signature"],
				};

				if (source_metrics.time_signature != target_metrics.time_signature) {
					return NaN;
				}

				var score = Math.abs(source_metrics.danceability) - Math.abs(target_metrics.danceability) +
							Math.abs(source_metrics.energy) - Math.abs(target_metrics.energy) +
							Math.abs(source_metrics.key) - Math.abs(target_metrics.key) +
							Math.abs(source_metrics.liveness) - Math.abs(target_metrics.liveness) +
							Math.abs(source_metrics.loudness) - Math.abs(target_metrics.loudness) +
							Math.abs(source_metrics.tempo) - Math.abs(target_metrics.tempo);

				// save to scores object
				var pair_id = source_metrics.sid + target_metrics.sid;
				app.scores_obj.push({
					"song1": source_metrics.sid,
					"song2": target_metrics.sid,
					"score": Math.abs(score)
				});

            },
            error: function(err) {
            	console.log(err);
            }
        });
    },

    getMatchFromPlaylist: function(metrics_obj) {
        $.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: "https://api.spotify.com/v1/playlists/6pgZ4wJj54Fujy4RJDPWaX",
            success: function(res) {
            	app.mix_songs = res.tracks.items;

            	let logger = "Comparing to " + res.tracks.items.length + " songs.";
            	console.log(logger);

            	for (let i = 0; i < app.mix_songs.length; i++) {
            		var target_id = app.mix_songs[i].track.id;
            		app.getMixScore(metrics_obj,target_id);
            	}

            	setTimeout(function() {app.findTopMatch()}, 5000);

            },
            error: function(err) {
            	console.log(err);
            }
        });
    },

    findTopMatch: function() {
    	var current_min = 50;
    	var current_song1;
    	var current_song2;

    	for (let i = 0; i < app.scores_obj.length; i++) {
    		if (app.scores_obj[i].score < current_min) {
    			current_min = app.scores_obj[i].score;
    			current_song1 = app.scores_obj[i].song1;
				current_song2 = app.scores_obj[i].song2;
    		}
    	}

    	app.alertSongNameById(current_song2);
    }
}

app.getCurrentSong();