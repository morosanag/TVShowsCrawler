// external
var express = require('express');
var dirTree = require('directory-tree');
var bodyParser = require('body-parser');
var http = require('http');

// internal
var couchdb = require('./internal_js/couch_db');
var videoStreamer = require('./internal_js/video_stream');
var security = require('./internal_js/security');
var crawler = require('./internal_js/crawler');
var seriesHandler = require('./internal_js/seriesHandler');

const fs = require('fs');
var app = express();

app.use(express.static('dist/css/'));
app.use(bodyParser.json());

var auth = function(req, res, next) {
    security.auth(req, res, next);
}

app.get('/signin', (req, res) => {
    fs.readFile('./login.html', (err, html) => res.end(html));
});

app.use('/', express.static(__dirname + '/'));

app.get('/noUsers', (req, res) => {
    seriesHandler.noUsers(req, res);
});

app.get("/login", function(req, res) {
    security.login(req, res);
});

app.post('/signup', function(req, res) {
    security.signup(req, res);
});

app.get('/movies/:fileName', (req, res) => {
    videoStreamer.playVideo(req, res);
});

app.get('/addSeries', function(req, res) {
    seriesHandler.addSeries(req, res);
});

app.get('/deleteFile', function(req, res) {
    seriesHandler.deleteFile(req, res);
});

app.get('/restart', function(req, res) {
    process.exit();
});

app.get('/deleteSeries', function(req, res) {
    seriesHandler.deleteSeries(req, res);
});

app.get('/allSeries', auth, function(req, res) {
    seriesHandler.allSeries(req, res);
});

app.get('/search/startDownload', function(req, res) {
    crawler.startDownload(req, res);
});

app.get('/files', function(req, res) {
    var path = req.param("path");
    var tree = dirTree(path, ['.fla', '.flv', '.swf', '.wmv', '.mpg', '.mpeg', '.mp4', '.mov', '.asf', '.avi', '.rm', '.mkv']);
    res.send(tree);
});

var server = app.listen(3000, function() {
    var host = server.address().address
    var port = server.address().port

    var tree = dirTree('./movies');
})

console.log("Server running at http://127.0.0.1:3000/");