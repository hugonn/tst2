var clear = require('clear');
const readline = require('readline');
const fs = require('fs');

//JSON to CSV
const json2csv = require('json2csv').parse;
const fields = ['index', 'mac', 'battery']; //CSV header
const opts = {
  fields
};




//Import BLE Library
//The library has been modified in order to display the beacon's localName variable on tlm beacon
var nobleEddy = require('./noble-eddystone');
scanner = new nobleEddy();

//Load list of known beacon
var list = JSON.parse(fs.readFileSync('./knownTags.json', 'utf8'));


var threshold = -50;  //Min RSSI gain to be detected


var tagList = []; //Discovered beacons
var index = 0;  //Total of Discovered beacons

var runningFlag = false;  //Accepting new beacons

//User Input Setup
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
var userInput = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
* Header Text
**/
var text = () => {

  clear();
  console.log('****************************************');
  console.log('Press ctrl + s to Save List');
  console.log('Press ctrl + r to Clear List');
  console.log('Press ctrl + c to Quit');
  console.log('****************************************');
  getLoadStatus();
  console.log('****************************************');
  console.log();
};

/**
* Clear Screen and reset discovered beacons
**/
var clearScreen = () => {

  tagList = [];
  index = 0;
  text();

};


/**
* Save tagList as .csv file
**/
var saveCsv = () => {

  try {
    runningFlag = false;  //Stop readeing new tags
    
    const csv = json2csv(tagList, opts);
    clearScreen();
    console.log(csv);

    var fileName;

    //Prompt user for a filename
    userInput.question("Choose a name for this list:", function(answer) {
      fileName = answer;

      //Write file
      fs.writeFile(`./savedFiles/${fileName}.csv`, csv, function(err) {
        if (err) {
          return console.log(err);
        }

        console.log(`The file ${fileName}.csv was saved!\n`);
        userInput.close();
        process.exit(); //Quit application

      });
    });
  } catch (err) {
    console.error(err);
  }
};


/**
* Setup keyboard user commands
**/
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else if (key.ctrl && key.name === 's') {
	console.log('\x1b[0m')
    saveCsv();
  } else if (key.ctrl && key.name === 'r') {
	console.log('\x1b[0m')
    clearScreen();

  }
});


/**
* Check if beacon is close enough
**/
var check = (beacon) => {


  if (beacon.rssi > threshold && runningFlag) {

    var tag = beacon.id.toUpperCase();
    var battery = beacon.tlm.vbatt;

    var exists = tagList.filter((t) => (t.mac === tag));

    if (exists.length === 0) {  //If beacon is not listed yet adds it

      index++;
      var theTag = {
        mac: tag,
        index: index,
        battery: battery
      }

      tagList.push(theTag);

      var tagType = (beacon) => {

        if (!beacon.localName) {
          return 'Unknown';
        } else if (beacon.localName.includes('DEV')) {
          return 'DEV';
        } else {
          return beacon.localName;
        }

      };

      if(battery < 2900){
	console.error(`\x1b[31m ${index} - ${tag} - ${battery} - ${tagType(beacon)}`);
	}
	else{

      console.log(`\x1b[32m ${index} - ${tag} - ${battery} - ${tagType(beacon)}`);
	}
    }

  }


};


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

  check(beacon);

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

  check(beacon);
});


/**
 *   Print (total of beacons with localName) / (total of discovered beacons)
 **/
var getLoadStatus = () => {

  var tagsDone = list.filter((tag) => {
    if (tag.localName) {
      return tag;
    }
  });

  var percent = (tagsDone.length * 100) / list.length;
  console.log(`Loaded: ${tagsDone.length}/${list.length}  Completed: ${percent.toFixed(2)}%`);

};


/**
*   Save list to JSON file
**/
setInterval(() => {

  fs.writeFileSync('./knownTags.json', JSON.stringify(list), 'utf-8');

}, 10000);



text(); //print header
scanner.startScanning(true);  //turn on scanner
runningFlag = true; //start accepting tags
