var couchdb = require('./couch_db');
var basicAuth = require('basic-auth');

function addSeries(req, res) {
    var user = basicAuth(req);
    if(user == undefined) {
      resp.sendStatus(401);
    }
    var series = {};
    console.log("req.body: " + req.body);
    series.name = req.param("name");
    series.season = parseFloat(req.param("season"));
    series.episode = parseFloat(req.param("episode"));
    series.episodes = [];
    series.isNew = true;
    series.type = "series";
    series.user = user.name;
    series.category = req.param("category");
    couchdb.addSeries(series);

    res.send("OK");
}

function deleteFile(req, res) {

    var path = req.param("path");
    var isFolder = req.param("isFolder");

    console.log("isFolder: " + isFolder);

    console.log("delete file: " + path);

    if(isFolder == 'true') {
      fs.rmdirSync(path);
      console.log("folder deleted");
    } else {
      fs.unlink(path);
      console.log("file deleted");
    }

    res.send("OK");
}

function deleteSeries(req, res) {
    var id = req.param("id");
    var rev = req.param("rev");
    couchdb.deleteSeries(id, rev, res);
}

function allSeries(req, res) {
    couchdb.getAllSeries2(res);
}

function noUsers(req, res) {
    couchdb.getNoUsers(req, res);
}

module.exports.addSeries = addSeries;
module.exports.deleteFile = deleteFile;
module.exports.deleteSeries = deleteSeries;
module.exports.allSeries = allSeries;
module.exports.noUsers = noUsers;
module.exports.allSeries = allSeries;