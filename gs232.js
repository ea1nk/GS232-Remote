const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

class YaesuRotatorController {
    constructor(port, baudRate, overlap, speed) {
        this.port = new SerialPort({ path: port, baudRate: baudRate });
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\r" }));
        this.overlap = overlap;
        this.speed = speed || 3;
        this.port.on("error", err => {
            console.log(err);
        });

        this.setOverlap(this.overlap);
        this.setSpeed(this.speed);
    }

    sendCommand(command) {
        const self = this;
        console.log(`Sending command: ${command}`);
        return new Promise(function(resolve, reject) {
            self._writeAndRead(`${command}\r`)
                .then(response => resolve(response.trim()))
                .catch(error => reject(error));
        });
    }

    _writeAndRead(data) {
        const self = this;
        console.log("_write and read " + data);
        return new Promise(function(resolve, reject) {
            const dataListener = responseData => {
                self.parser.removeListener("data", dataListener);
                resolve(responseData);
            };

            self.parser.on("data", dataListener);

            self.port.write(data, err => {
                if (err) {
                    self.parser.removeListener("data", dataListener);
                    reject(err);
                }
            });
        });
    }

    moveLeft() {
        return this.sendCommand("A;");
    }

    moveRight() {
        return this.sendCommand("R;");
    }

    moveStop() {
        return this.sendCommand("S;");
    }

    setAzimuth(azimuth) {
        if (azimuth < 0 || azimuth > 450) {
            return Promise.reject(new Error("Invalid azimuth. Must be between 0 and 450 degrees."));
        }

        const command = `M${azimuth.toString().padStart(3, "0")};`;
        return this.sendCommand(command);
    }

    getRotatorStatus() {
        const command = "C;";
        return this.sendCommand(command).then(response => {
            console.log(response);
            const data = response.split("  ");
            console.log(data);
            const azimuth = parseInt(data[0].split("=")[1]);
            const elevation = parseInt(data[1].split("=")[1]);
            return { azimuth, elevation };
        });
    }

    setOverlap(overlap) {
        const command = overlap ? "P45" : "P36";
        return this.sendCommand(`${command};`);
    }

    setSpeed(speed) {
        const validSpeeds = [2, 3, 4, 5];
        if (!validSpeeds.includes(speed)) {
            return Promise.reject(new Error("Invalid speed. Must be one of: 2, 3, 4, 5"));
        }

        return this.sendCommand(`X${speed};`);
    }
}

module.exports = YaesuRotatorController;
