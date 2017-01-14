Introduction
============

![Bower version](https://img.shields.io/bower/v/adminlte.svg)
[![npm version](https://img.shields.io/npm/v/admin-lte.svg)](https://www.npmjs.com/package/admin-lte)
[![Packagist](https://img.shields.io/packagist/v/almasaeed2010/adminlte.svg)](https://packagist.org/packages/almasaeed2010/adminlte)
[![NPM version](https://badge.fury.io/js/thepiratebay.svg)](http://badge.fury.io/js/thepiratebay)

**TVShowsCrawler** -- is a Node JS application that can be used to configure a daemon that crawls TV shows from PirateBay. The purpose of the application is to be deployed on devies that are up and running more than 90% of time and are connected via Ethernet to your LAN. In this way you have your requested content at a very high speed. 

**Technologies**

<table>
  <tr>
    <th><p align="right">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/16/The_Pirate_Bay_logo.svg" width="200px"/>
</p></th>
    <th><p align="left">
  <img src="https://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2016/08/1470860091couch.png" width="200px"/>
</p></th>
  </tr>
</table>


## Installation

### Install CouchDB:

```bash
sudo apt-get update
sudo apt-get install couchdb
```

### Install Node.js and npm:

```bash
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

## Configuration

Create the database used by application:
```bash
curl -X PUT localhost:5984/mpsit
```

Import database into mpsit db from file:
```bash
curl -d @db.json -H "Content-type: application/json" -X POST http://127.0.0.1:5984/mpsit/_bulk_docs
```

Change PATH where you want the files to be downloaded (file ./internal_js/crawler.js):

```javascript
var globalPath = '[PATH]';
```

And also from (./js/requests.js):
```javascript
genericRequest("GET", "/files?path=[PATH]", null, convertToHTML, alert, null)
```




## Browser Support
- IE 9+
- Firefox (latest)
- Chrome (latest)
- Safari (latest)
- Opera (latest)