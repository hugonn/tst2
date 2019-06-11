var clear = require('clear');
var fs = require('fs');

//Import BLE Library
//The library has been modified in order to display the beacon's localName variable on tlm beacon
var nobleEddy = require('./noble-eddystone');
scanner = new nobleEddy();

//Load list of known beacon
var list = JSON.parse(fs.readFileSync('./knownTags.json', 'utf8'));


/**
 *   FOUND beacon event
 *   Adds to list if found new beacon
 **/
scanner.on('found', function(beacon) {


    var exists = list.filter((tag) => {
        return tag.id === beacon.id;
    });


    if (exists.length === 0) {
        list.push(beacon);
    }

});


/**
 *   UPDATED beacon event
 *   Add beacon's localName if discovered
 **/
scanner.on('updated', function(beacon) {

    if (beacon.localName) {

        var theBeacon = list.filter((tag) => {
            return tag.id === beacon.id;
        });

        if (theBeacon.length > 0) {
            if (!theBeacon[0].localName) {
                theBeacon[0].localName = beacon.localName;
            }
        }

    }
});


var flag = true; //Flag that tells if all beacons on list have a localName

/**
*   Save list to JSON file
*   If all beacons have a localName, stops saving until new beacons are discoverd
**/
setInterval(() => {

    var tagsDone = list.filter((tag) => {
        if (tag.localName) {
            return tag;
        }
    });

    if (!flag) {
        fs.writeFileSync('./knownTags.json', JSON.stringify(list), 'utf-8');

        var percent = (tagsDone.length * 100) / list.length;
        console.log(`Loaded: ${tagsDone.length}/${list.length}  Completed: ${percent.toFixed(2)}%`);
    }

    if (tagsDone.length === list.length) {
        flag = true;
    } else {
        flag = false;
    }



}, 10000);


//turn on scanner
scanner.startScanning(true);