
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class YaesuRotatorController {
  constructor(port, overlap, speed) {
    this.port = new SerialPort({ path: port, baudRate: 9600 });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r' }));
    //Set overlap ON-OFF
    overlap == true? this.port.write('P45\r') : this.port.write('P36\r')
    //Set speed (defaults to  X3)
    !speed? this.port.write(`X2\r`) : this.port.write(`X${speed}\r`)
  }


  moveLeft() {
    const command = 'A;';
    return this.sendCommand(command);
  }

  moveRight() {
    const command = 'R;';
    return this.sendCommand(command);
  }

  stop() {
    const command = 'S;';
    return this.sendCommand(command);
  }

  setAzimuth(azimuth) {
    if (azimuth < 0 || azimuth > 450) {
      return Promise.reject(new Error('Invalid azimuth. Must be between 0 and 450 degrees.'));
    }

    const command = `M${azimuth.toString().padStart(3, '0')};`;
    return this.sendCommand(command);
  }

  getRotatorStatus() {
    const command = 'C2;';
    return this.sendCommand(command).then((response) => {
      // Parse the response to extract the status information
      const azimuth = parseInt(response.slice(2, 5), 10);
      const elevation = parseInt(response.slice(5, 8), 10);
      // You can parse other status information if needed.
      return { azimuth, elevation };
    });
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      // Assuming you have a method to write to the serial port or send the command to the rotator
      this.port.write(command, (err) => {
        if (err) {
          reject(err);
        } else {
          // Assuming there is a way to read the response from the serial port or the rotator.
          this.port.once('data', (data) => {
            resolve(data.toString());
          });
        }
      });
    });
  }
}
