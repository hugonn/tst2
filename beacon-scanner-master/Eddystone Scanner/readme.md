# Eddystone beacon reader applications


## Instalation

This application was developed on Linux OS.
Windows is not supported for the time being

On linux terminal execute the command:
```
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```

After the apt-get installation is completed, change you current directory to the root of the project, then execute the following command:
```
npm install
```

Last, make sure the computer's Bluetooth device is ON

### Reset Beacon List

You may want to clean the discovered beacons list. In order to do so, delete the file `knownTags.json` before running an application.


## Applications

### find_all_tag_data

	This application tries to find all Eddystone beacons on range. The results are saved, periodically, to a `knownTags.json` .

	In order to run the application, from the root of the project, run the command:
	```
	sudo node find_all_tag_data.js
	```


### scan_single_tag

	This application displays the closest Eddystone beacon found.

	In order to run the application, from the root of the project, run the command:
	```
	sudo node scan_single_tag.js
	```

### scan_tag_list

	This application displays a list of Eddystone beacons found close to de computer.
	The user can then choose to save the results to a CSV file.
	Saved files can then be found on the `./savedFiles` directory.

	In order to run the application, from the root of the project, run the command:
	```
	sudo node scan_tag_list.js
	```