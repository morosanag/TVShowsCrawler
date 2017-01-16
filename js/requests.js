var seriesEpisodes = null;
var noEpisodes = null;
var noSeries = null;
var noSeasons = null;
var noUsers = null;

var videoCategories = [ 
       { 'id': '200', 'name': 'All' },
       { 'id': '201', 'name': 'Movies' },
       { 'id': '202', 'name': 'Movies DVDR' },
       { 'id': '203', 'name': 'Music videos' },
       { 'id': '204', 'name': 'Movie clips' },
       { 'id': '205', 'name': 'TV shows' },
       { 'id': '206', 'name': 'Handheld' },
       { 'id': '207', 'name': 'HD - Movies' },
       { 'id': '208', 'name': 'HD - TV shows' },
       { 'id': '209', 'name': '3D' },
       { 'id': '299', 'name': 'Other' } 
  ];

function fileSize(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function genericRequest(type, path, data, callback, callback_error, refreshMethod) {
    console.log("series: " + JSON.stringify(data));
    console.log("user: " + localStorage.getItem('user') + ":" + localStorage.getItem('pass'));
    $.ajax({
        url: path,
        type: type,
        contentType: "application/json",
        data: JSON.stringify(data),
        headers: {
            "Authorization": "Basic " + btoa(localStorage.getItem('user') + ":" + CryptoJS.MD5(localStorage.getItem('pass')))
        },
        success: function(result) {
            console.log("result: " + JSON.stringify(result));
            if (callback != null) {
                callback(result);
            }
            if (refreshMethod != null) {
                refreshMethod();
            }
        },
        error: function(err) {
            if (err.status == 401) {
                window.location.replace("login.html");
            }
            if (callback_error != null) {
                callback_error(err);
            }
        }
    });
}

var html = "";

function iterateFiles2(data) {
    console.log("iterateFiles2");
    html = "<tr><th>Series</th><th>Season</th><th>File</th><th>Size</th><th>Owner</th><th></th></tr>";
    console.log("seriesEpisodes: " + JSON.stringify(seriesEpisodes));
    console.log("data: " + JSON.stringify(data));
    noEpisodes = 0;
    noSeasons = 0;
    for (var i = 0; i < data.children.length; i++) {
        var name = data.children[i].name;
        for (var j = 0; j < data.children[i].children.length; j++) {
            var season = data.children[i].children[j].name;
            noSeasons++;
            var episodes = data.children[i].children[j].children;
            if (episodes.length == 0) {
                noSeasons--;
            }
            for (var k = 0; k < episodes.length; k++) {
                noEpisodes++;
                html += '<tr><td>' + name;
                html += '</td><td>' + season;
                html += '</td><td>' + '<a href="/movies/' + encodeURIComponent(episodes[k].path) + '">' + episodes[k].name + '</a>';
                html += '</td><td>' + fileSize(episodes[k].size);


                var check = true;
                var episode_owner = null;
                for (var x = 0; x < seriesEpisodes.rows.length; x++) {
                    for (var y = 0; y < seriesEpisodes.rows[x].value.episodes.length; y++) {

                        var user = seriesEpisodes.rows[x].value.user;
                        var eps = seriesEpisodes.rows[x].value.episodes[y];
                        console.log("eps: " + JSON.stringify(eps));
                        console.log("user: " + localStorage.getItem('user'));
                        console.log("user2: " + user);
                        if (eps.path == episodes[k].path) {
                            episode_owner = user;
                            if (user != localStorage.getItem('user')) {
                                check = false;
                            }
                        }
                    }
                }
                if (episode_owner == null) {
                    html += '</td><td><span class="label label-warning">' + 'none' + '</span>';
                } else {
                    html += '</td><td><span class="label label-info">' + episode_owner + '</span>';
                }


                html += '</td><td>';
                if (check) {

                    html += '<button class="btn btn-danger" onclick="deleteFile(\'' + encodeURIComponent(episodes[k].path) + '\')">Delete</button>';
                }

                html += '</td></tr>';
            }
        }
    }
    console.log("html: " + html);

}


function iterateFiles(json) {

    html += '<li>';
    if (json.children != undefined) {
        html += json.name;
        if (json.children.length == 0) {
            html += '<button onclick="deleteFolder(\'' + encodeURIComponent(json.path) + '\')">Delete</button>';
        }
        html += '<ul>';
        for (var i = 0; i < json.children.length; i++) {
            iterateFiles(json.children[i]);
        }
        html += "</ul>";
    } else {

        html += '<a href="/movies/' + encodeURIComponent(json.path) + '">' + json.name + '</a><button onclick="deleteFile(\'' + encodeURIComponent(json.path) + '\')">Delete</button>';

    }

    html += "</li>";

}

function deleteFolder(path) {
    genericRequest("GET", "/deleteFile?path=" + path + "&isFolder=true", null, null, null, null);
}

function deleteFile(path) {
    genericRequest("GET", "/deleteFile?path=" + path + "&isFolder=false", null, null, null, showFileSystem);
}

function convertToHTML(data) {
    console.log("before iterateFiles2");
    iterateFiles2(data);
    console.log(html);
    document.getElementById("fileSystem").innerHTML = html;
    setAnalytics();

    CollapsibleLists.applyTo(document.getElementById('fileSystem'));
}

function populateSelect() {
    var html = "";
    console.log("videoCategories: " + JSON.stringify(videoCategories));
    for (var k in videoCategories) {
        html += '<option value="' + videoCategories[k].id + '">' + videoCategories[k].name + '</option>';
    }
    document.getElementById("selectCategory").innerHTML = html;
}

function convertToTable(data) {
    var html = "<tr><th>Series</th><th>Season</th><th>Episode</th><th>Owner</th><th></th></tr>";
    seriesEpisodes = data;
    noSeries = data.rows.length;
    for (var i = 0; i < data.rows.length; i++) {
        html += '<tr><td>' + data.rows[i].value.name;
        html += '</td><td>' + data.rows[i].value.season;
        html += '</td><td>' + data.rows[i].value.episode;
        html += '</td><td><span class="label label-info">' + data.rows[i].value.user + '</span>';
        html += '</td><td>';

        var user = data.rows[i].value.user;
        if (user == localStorage.getItem('user')) {
            html += '<button class="btn btn-danger" onclick="deleteSeries(\'' + data.rows[i].value._id + '\', \'' + data.rows[i].value._rev + '\')">Delete</button>';
        }
        html += '</td></tr>';
    }

    document.getElementById("seriesTable").innerHTML = html;

    showFileSystem();
}

function storeNoUsers(data) {
    noUsers = data.rows[0].value;
}

function getNoUsers() {
    genericRequest("GET", "/noUsers", null, storeNoUsers, null, null);
}

function getAllSeries() {
    genericRequest("GET", "/allSeries", null, convertToTable, alert, null);
}

function showFileSystem() {
    genericRequest("GET", "/files?path=/home/gabi/Desktop/TVShowsCrawler_repo/TVShowsCrawler/new/path/", null, convertToHTML, alert, null);
}

function startDownload() {
    genericRequest("GET", "/search/startDownload", null, null, null, null);
}

function restartServer() {
    genericRequest("GET", "/restart", null, null, null, null);
}

function deleteSeries(id, rev) {
    genericRequest("GET", "/deleteSeries?id=" + id + "&rev=" + rev, null, null, null, getAllSeries);
}

function setAnalytics() {
    document.getElementById("noEpisodes").innerHTML = noEpisodes;
    document.getElementById("noSeries").innerHTML = noSeries;
    document.getElementById("noSeasons").innerHTML = noSeasons;
    document.getElementById("noUsers").innerHTML = noUsers;
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("pass");
    window.location.replace("login.html");
}

function addSeries() {
    var series = {};

    var e = document.getElementById("selectCategory");
    var selectedCategoryId = e.options[e.selectedIndex].value;

    var path = "?name=" + document.getElementById("name").value;
    path += "&season=" + document.getElementById("season").value;
    path += "&episode=" + document.getElementById("episode").value;
    path += "&category=" + selectedCategoryId;

    genericRequest("GET", "/addSeries" + path, null, null, null, getAllSeries);

    document.getElementById("name").innerHTML = "";
    document.getElementById("season").innerHTML = "";
    document.getElementById("episode").innerHTML = "";
}

window.onload = function() {
    CollapsibleLists.apply();
    getNoUsers();
    getAllSeries();
    populateSelect();
};
