# Yaesu GS232 NodeJS Class

## Basic NodeJS GS232 Rotator class

Usage:
```
const YaesuRotatorController = require('./gs232.js');

//Port, baudrate, overlap enabled, speed
const rotatorController = new YaesuRotatorController("/dev/ttyUSB0", 9600, true, 2);

```

