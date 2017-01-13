var database = "mpsit";
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb();

function deleteSeries(seriesId, revId, res) {
	couch.del(database, seriesId, revId).then(({data, headers, status}) => {
    	console.log("series deleted: " + JSON.stringify(data));
    	res.send(data);
	}, err => {
    	console.log("series deleted - error: " + err);
	});
}


function getUsers(callback, req, resp) {
	couch.get(database, "users").then(({data, headers, status}) => {
    	callback(data, req, resp);
    }, err => {
    	console.log("getUsers - error: " + err);
	});
}

function getUsers2(callback, req, resp, next) {
	couch.get(database, "users").then(({data, headers, status}) => {
    	callback(data, req, resp, next);
    }, err => {
    	console.log("getUsers - error: " + err);
	});
}

function getSeries(seriesId) {
	couch.get(database, seriesId).then(({data, headers, status}) => {
    	console.log("getSeries: " + JSON.stringify(data));
	}, err => {
    	console.log("getSeries - error: " + err);
	});
}

function updateSeries(series) {
	couch.update(database, series)
	.then(({data, headers, status}) => {
		console.log("updateSeries " + series.name + " added successfully!");
	}, err => {
		console.log("updateSeries " + series.name + " error: " + err);
	});
}

function addSeries(series) {
	couch.insert(database, series)
	.then(({data, headers, status}) => {
		console.log("addSeries " + series.name + " added successfully!");
		console.log("status: " + status + " data: " + JSON.stringify(data));
	}, err => {
		console.log("addSeries " + series.name + " error: " + err);
	});
}

function getAllSeries2(res) {
	const startkey = [];
	const endKey = [];
	const viewUrl = "_design/allSeries/_view/allSeries";
	const queryOptions = {};
	 
	couch.get(database, viewUrl, queryOptions).then(({data, headers, status}) => {
		console.log("getAllSeries_OK: " + JSON.stringify(data));
		data.index = 0;
		data.nextSeason = false;
		res.send(data);
	}, err => {
		console.log("getAllSeries_ERROR: " + err);
		return null;
	});
}

function getAllSeries(callback) {
	const startkey = [];
	const endKey = [];
	const viewUrl = "_design/allSeries/_view/allSeries";
	const queryOptions = {};
	 
	couch.get(database, viewUrl, queryOptions).then(({data, headers, status}) => {
		console.log("getAllSeries_OK: " + JSON.stringify(data));
		data.index = 0;
		data.nextSeason = false;
		callback(data);
	}, err => {
		console.log("getAllSeries_ERROR: " + err);
		return null;
	});
}

function getNoUsers(res, res) {
	const viewUrl = "_design/noUsers/_view/noUsers";
	 
	const queryOptions = {};
	 
	couch.get(database, viewUrl, queryOptions).then(({data, headers, status}) => {
		console.log("getNoUsers_result: " + JSON.stringify(data));
		res.send(data);
	}, err => {
		console.log("getAllSeries_ERROR: " + err);
		return null;
	});
}

module.exports.getSeries = getSeries;
module.exports.updateSeries = updateSeries;
module.exports.addSeries = addSeries;
module.exports.getAllSeries = getAllSeries;
module.exports.getAllSeries2 = getAllSeries2;
module.exports.deleteSeries = deleteSeries;
module.exports.getUsers = getUsers;
module.exports.getUsers2 = getUsers2;
module.exports.getNoUsers = getNoUsers;
