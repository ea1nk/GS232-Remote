# Yaesu GS232 NodeJS Class

 Basic NodeJS GS232 Rotator class

 Sample web interface is provided

### Installation:
```
git clone https://github.com/ea1nk/GS232-Remote.git
npm install
```

### Run sample server & interface:
```
node server.js
browser to http://localhost:3001
```

### How to include in your own system:

Import class into your NodeJS app:
```
const YaesuRotatorController = require('./gs232.js');
```
Create a rotator instance:
```
//Port, baudrate, overlap enabled, speed
const rotatorController = new YaesuRotatorController("/dev/ttyUSB0", 9600, true, 2);
```
Commands available:
```
rotatorController.moveLeft()
rotatorController.moveRight()
rotatorController.setAzimuth(azimuth)
rotatorController.moveStop()
rotatorController.getRotatorStatus()

```
