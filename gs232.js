const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const RESPONSE_TIMEOUT_MS = 2000;

class YaesuRotatorController {
    constructor(port, baudRate, overlap, speed) {
        this.port = new SerialPort({ path: port, baudRate: baudRate });
        this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\r" }));
        this.overlap = overlap;
        this.speed = speed || 3;
        this.queue = Promise.resolve();
        this.port.on("error", err => {
            console.log(err);
        });

        this.setOverlap(this.overlap).catch(err => console.error(err));
        this.setSpeed(this.speed).catch(err => console.error(err));
    }

    // Commands are serialized: the controller has no request ids, so a reply
    // can only be matched to a command if just one is in flight at a time.
    sendCommand(command, expectData = false) {
        console.log(`Sending command: ${command}`);
        const result = this.queue.then(() => this._writeAndRead(`${command}\r`, expectData));
        this.queue = result.catch(() => {});
        return result.then(response => response.trim());
    }

    _writeAndRead(data, expectData) {
        const self = this;
        return new Promise(function(resolve, reject) {
            const cleanup = () => {
                clearTimeout(timer);
                self.parser.removeListener("data", dataListener);
            };

            // Commands without data only answer with CR (an empty line);
            // data commands answer CR LF + payload, so skip the empty lines.
            const dataListener = responseData => {
                if (expectData && !responseData.trim()) return;
                cleanup();
                resolve(responseData);
            };

            const timer = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout waiting for response to ${JSON.stringify(data)}`));
            }, RESPONSE_TIMEOUT_MS);

            self.parser.on("data", dataListener);

            self.port.write(data, err => {
                if (err) {
                    cleanup();
                    reject(err);
                }
            });
        });
    }

    // L: start turning counter-clockwise (left)
    moveLeft() {
        return this.sendCommand("L");
    }

    // R: start turning clockwise (right)
    moveRight() {
        return this.sendCommand("R");
    }

    // S: stop everything (A would only stop azimuth rotation)
    moveStop() {
        return this.sendCommand("S");
    }

    setAzimuth(azimuth) {
        const max = this.overlap ? 450 : 360;
        if (!Number.isInteger(azimuth) || azimuth < 0 || azimuth > max) {
            return Promise.reject(new Error(`Invalid azimuth. Must be an integer between 0 and ${max} degrees.`));
        }

        return this.sendCommand(`M${azimuth.toString().padStart(3, "0")}`);
    }

    // C2 returns azimuth and elevation: "AZ=aaa EL=eee" (GS-232B)
    // or "+0aaa+0eee" (GS-232A).
    getRotatorStatus() {
        return this.sendCommand("C2", true).then(response => {
            const match =
                response.match(/AZ\s*=\s*(\d+)\s*EL\s*=\s*(\d+)/i) ||
                response.match(/\+0*(\d+)\s*\+0*(\d+)/);
            if (!match) {
                throw new Error(`Unexpected status response: ${JSON.stringify(response)}`);
            }
            return { azimuth: parseInt(match[1], 10), elevation: parseInt(match[2], 10) };
        });
    }

    // P45: 450 degree mode, P36: 360 degree mode
    setOverlap(overlap) {
        this.overlap = !!overlap;
        return this.sendCommand(this.overlap ? "P45" : "P36");
    }

    // Xn: azimuth speed, 1 (slowest) to 4 (fastest)
    setSpeed(speed) {
        const validSpeeds = [1, 2, 3, 4];
        if (!validSpeeds.includes(speed)) {
            return Promise.reject(new Error("Invalid speed. Must be one of: 1, 2, 3, 4"));
        }

        this.speed = speed;
        return this.sendCommand(`X${speed}`);
    }
}

module.exports = YaesuRotatorController;
