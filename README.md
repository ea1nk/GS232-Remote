# Yaesu GS232 NodeJS Class

## Basic NodeJS GS232 Rotator class

### Installation:
```
git clone https://github.com/ea1nk/RemoteBox.git
npm install
```

### How to include in your own system:

Import class into your NodeJS app:
```
const YaesuRotatorController = require('./gs232.js');
```
Create a rotator instace:
```
//Port, baudrate, overlap enabled, speed
const rotatorController = new YaesuRotatorController("/dev/ttyUSB0", 9600, true, 2);
```
Commands available:
```
rotatorController.moveLeft()
rotatorController.moveRight()
rotatorController.setAzimuth(azimuth)
rotatorController.stop()
rotatorController.getRotatorStatus()

```
