var clear = require('clear');
//Import BLE Library
//The library has been modified in order to display the beacon's localName variable on tlm beacon
var nobleEddy = require('./noble-eddystone');
scanner = new nobleEddy();


var previousBeacon;	//variable to save previous Beacon ID
var threshold = -45;  //Min RSSI gain to be detected

/**
 *   UPDATED beacon event
 *   Display closest beacon found
 **/
scanner.on('updated', function(beacon) {

	if (beacon.rssi > threshold) {

		if (previousBeacon !== beacon.id) {	//if beacon's ID changes, clean screen

			clear();
			previousBeacon = beacon.id;
		}
		var tag = 'MAC: ' + beacon.id.toUpperCase() + ' RSSI: ' + beacon.rssi + " Bateria: ";
		if(beacon.tlm.vbatt < 2900){
			tag += "\x1b[31m" + beacon.tlm.vbatt + "\x1b[37m";
			console.error(tag);
		}else{
			tag +=	"\x1b[32m" + beacon.tlm.vbatt + "\x1b[37m"
			console.log(tag);	
		}

	}
   
});


scanner.startScanning(true);	//start scanner
