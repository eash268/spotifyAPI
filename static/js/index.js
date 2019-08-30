var app = {

	// local variables
	current_songs: "",
	password: "Bearer BQAesmhmjMpOpTxhId9CqA3XVg8X5cuK4vG9ovz8DgglpDt_35cYDy7GaxfSDYVkxh909fIxsB2jooR1wIsCKqRuBTe7RMrdOF6kb2AeVXWoFdHN30OVNgBVzwHPNqJOYOK5HFpiZwPpjKnZe_mnXdcR_FkykEPPAN28Dg",
	mix_songs: [],
	scores_obj: [],

	// local methods
	getCurrentSong: function() {
		console.log("get current song")
		var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    
	    app.alertSongNameById(vars["current_song"]);
	    app.getSongMetrics(vars["current_song"]);
    },

    alertSongNameById: function(sid) {
		console.log("alert song name by id");
    	var target_url = "https://api.spotify.com/v1/tracks/" + sid;

    	$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: target_url,
            success: function(res) {
            	alert(res.name);
            },
            error: function(err) {
            	console.log(err);
            }
        });
	},
	
	logSongMetricsById: function(sid) {
		var target_url = "https://api.spotify.com/v1/audio-features/" + sid;
		var info_target_url = "https://api.spotify.com/v1/audio-features/" + sid;
		
		$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: target_url,
            success: function(res) {
            	console.log(res)
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
				console.log(res)
            	song_metrics = {
					"sid": res["id"],
					"acousticness": res["acousticness"],
            		"danceability": res["danceability"],
					"energy": res["energy"],
					"instrumentalness": res["instrumentalness"],
            		"key": res["key"],
            		"liveness": res["liveness"],
					"loudness": res["loudness"],
					"speechiness": res["speechiness"],
            		"tempo": res["tempo"],
					"time_signature": res["time_signature"],
					"valence": res["valence"],
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
    		return;
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
					"sid": res["id"],
					"acousticness": res["acousticness"],
            		"danceability": res["danceability"],
					"energy": res["energy"],
					"instrumentalness": res["instrumentalness"],
            		"key": res["key"],
            		"liveness": res["liveness"],
					"loudness": res["loudness"],
					"speechiness": res["speechiness"],
            		"tempo": res["tempo"],
					"time_signature": res["time_signature"],
					"valence": res["valence"],
				};

				var tempo_offset = Math.abs(source_metrics.tempo) - Math.abs(target_metrics.tempo)
				var key_offset = Math.abs(source_metrics.key) - Math.abs(target_metrics.key)
				if (source_metrics.time_signature !== target_metrics.time_signature) {
					console.log("incompatible time signatures");
					return NaN;
				} else if ( Math.abs(key_offset) > 2 ) {
					console.log("incompatible keys");
					return NaN;
				} else if ( Math.abs(tempo_offset) > 10 ) {
					console.log("incompatible tempos");
					return NaN;
				}

				var score = Math.abs(source_metrics.acousticness) - Math.abs(target_metrics.acousticness) +
							Math.abs(source_metrics.danceability) - Math.abs(target_metrics.danceability) +
							Math.abs(source_metrics.energy) - Math.abs(target_metrics.energy) +
							Math.abs(source_metrics.instrumentalness) - Math.abs(target_metrics.instrumentalness) +
							Math.abs(source_metrics.key) - Math.abs(target_metrics.key) +
							Math.abs(source_metrics.liveness) - Math.abs(target_metrics.liveness) +
							Math.abs(source_metrics.loudness) - Math.abs(target_metrics.loudness) +
							Math.abs(source_metrics.speechiness) - Math.abs(target_metrics.speechiness) +
							Math.abs(source_metrics.valence) - Math.abs(target_metrics.valence);

				// save to scores object
				var pair_id = source_metrics.sid + target_metrics.sid;
				console.log("pushing mix score");
				app.scores_obj.push({
					"song1": source_metrics.sid,
					"song2": target_metrics.sid,
					"song1metrics": source_metrics,
					"song2metrics": target_metrics,
					"score": Math.abs(score)
				});
            },
            error: function(err) {
				console.log("error getting mix score");
            }
        });
    },

    getMatchFromPlaylist: function(metrics_obj) {
		$.ajax({
            type: 'GET',
            headers: {
                Authorization: app.password
            },
            url: "https://api.spotify.com/v1/playlists/3xJBfj9bwLJtM52ifPnN8N/",
            success: function(res) {
				console.log(res.name + " is the playlist you're comparing to")
            },
            error: function(err) {
            	console.log(err);
            }
		});

		for (let index = 0; index < 1000; index += 100) {
			var batch_url = "https://api.spotify.com/v1/playlists/3xJBfj9bwLJtM52ifPnN8N/tracks?offset=" + index + "&limit=100"
			//var batch_url = "https://api.spotify.com/v1/playlists/7htu5ftbLBRFAwiuHVcUAg/tracks?offset=" + index + "&limit=100"
			$.ajax({
				type: 'GET',
				headers: {
					Authorization: app.password
				},
				url: batch_url,
				success: function(res) {
					app.mix_songs = app.mix_songs.concat(res.items);
				},
				error: function(err) {
					console.log(err);
				}
			});
		}
		
		// waiting 5 seconds to let the above finish
		setTimeout(function () {
			let logger = "Comparing to " + app.mix_songs.length + " songs.";
			console.log(logger);
			console.log(app.mix_songs);

			i = 0;
			myVar = setInterval(function(){ 
				i++;
				if (i == app.mix_songs.length) {
					clearInterval(myVar);
					alert("done");
					return;
				}
				var target_id = app.mix_songs[i].track.id;
				app.getMixScore(metrics_obj, target_id);
			}, 100);
		}, 5000);
    },

    findTopMatch: function() {
    	var current_min = 50;
    	var current_song1;
		var current_song2;
		
		console.log(app.scores_obj)

    	for (let i = 0; i < app.scores_obj.length; i++) {
    		if (app.scores_obj[i].score < current_min) {
    			current_min = app.scores_obj[i].score;
    			current_song1 = app.scores_obj[i].song1;
				current_song2 = app.scores_obj[i].song2;
    		}
		}
		app.alertSongNameById(current_song2);
		app.logSongMetricsById(current_song1);
		app.logSongMetricsById(current_song2);
    }
}

app.getCurrentSong();