var PirateBay = require('thepiratebay');
var couchdb = require('./couch_db');
var globalPath = '/home/gabi/Desktop/sample_nodejs_project/new/path/';

function startDownload(req, res) {
    couchdb.getAllSeries(findSeries);
    res.send("OK");
}

function startDownload4(magnetLink, callback, seriesArray, seriesSeason, seriesEpisode, name) {
    var torrentStream = require('torrent-stream');
    var engine = torrentStream(magnetLink, {
        tracker: true,
        trackers: [
            'udp://tracker.leechers-paradise.org:6969',
            'udp://zer0day.ch:1337',
            'udp://open.demonii.com:1337',
            'udp://tracker.coppersurfer.tk:6969',
            'udp://exodus.desync.com:6969'
        ]
    });

    engine.on('ready', function() {
        engine.files.forEach(function(file) {
            console.log('start download:', file.name);
            var stream = file.createReadStream();
            file.select();
            var fs = require('fs');
            // check if the directory exists 
            if (!fs.existsSync(globalPath + name)) {
                try {
                    fs.mkdirSync(globalPath + name);
                } catch (e) {
                    if (e.code != 'EEXIST') throw e;
                }
            }

            var dir_path = globalPath + name + '/' + seriesSeason;
            if (!fs.existsSync(dir_path)) {
                try {
                    fs.mkdirSync(dir_path);
                } catch (e) {
                    if (e.code != 'EEXIST') throw e;
                }
            }
            // if not, create it
            file.createReadStream().pipe(fs.createWriteStream(dir_path + '/' + file.name));
        });
    });

    engine.on('idle', function() {
        engine.files.forEach(function(file) {
            console.log('download completed');

            // set season and episode in database
            var series = seriesArray.rows[seriesArray.index].value;
            series.season = seriesSeason;
            series.episode = seriesEpisode;
            series.type = "series";

            var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');

            var episode = {
                'season': seriesSeason,
                'episode': seriesEpisode,
                'path': globalPath + name + '/' + seriesSeason + '/' + file.name,
                'date': utc
            };
            series.episodes.push(episode);

            series.isNew = false;
            couchdb.updateSeries(series);

            // search the next episode of the same series
            couchdb.getAllSeries(findSeries);

        });
    });
}

// besides the response from couchDB
// we also add index, and if the we increment the season or the episode
function findSeries(seriesJSON) {
    console.log("findSeries");
    console.log("seriesJSON: " + JSON.stringify(seriesJSON));

    var series = seriesJSON.rows[seriesJSON.index].value;
    console.log("series: " + JSON.stringify(series));

    var seasonNO = seriesJSON.nextSeason ? (series.season + 1) : series.season;
    console.log("seasonNO: " + seasonNO);

    var episodeNO;
    console.log("series.isNew: " + series.isNew);
    if (series.isNew === true) {
        episodeNO = series.episode;
    } else {
        episodeNO = seriesJSON.nextSeason ? 1 : (series.episode + 1);
    }
    console.log("episdeNO: " + episodeNO);

    var season = "S" + ((seasonNO < 10) ? ("0" + seasonNO) : seasonNO);
    console.log("season: " + season);

    var episode = "E" + ((episodeNO < 10) ? ("0" + episodeNO) : episodeNO);
    console.log("episode: " + episode);

    var filename = series.name + " " + season + episode;
    console.log("filename: " + filename);

    var searchOptions = {
        category: '/search/0/99/200',
        page: 0,
        orderBy: 'seeds',
        sortBy: 'desc',
    };

    if ('category' in series) {
        searchOptions.category = '/search/0/99/' + series.category;
    }

    PirateBay.search(filename, searchOptions)
        .then(function(data) {
            if (data.length == 0) {
                console.log(filename + " is not found");
                if (seriesJSON.nextSeason) {
                    seriesJSON.index++;
                    seriesJSON.nextSeason = false;
                } else {
                    seriesJSON.nextSeason = true;
                }
                findSeries(seriesJSON);
            } else {
                console.log(filename + " is found");
                startDownload4(data[0].magnetLink, findSeries, seriesJSON, seasonNO, episodeNO, series.name);
            }
        })
        .catch(function(err) {
            console.log(err);
        })

}

module.exports.startDownload = startDownload;