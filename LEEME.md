# Clase NodeJS para Yaesu GS232

Clase básica en NodeJS para controlar rotores con interfaz Yaesu GS-232A / GS-232B por puerto serie.

Se incluye una interfaz web de ejemplo.

### Instalación
```
git clone https://github.com/ea1nk/GS232-Remote.git
cd GS232-Remote
npm install
```

### Servidor e interfaz de ejemplo
```
node server.js
```
El servidor abre el puerto serie `/dev/ttyUSB0` (9600 baudios) y expone un servidor Socket.IO en el puerto 3001. La interfaz de ejemplo es [interface.html](interface.html), que se conecta a `http://localhost:3001`. Ajusta el puerto serie en [server.js](server.js) si el tuyo es otro.

### Cómo usarla en tu propio proyecto

Importa la clase:
```js
const YaesuRotatorController = require("./gs232");
```
Crea una instancia:
```js
// Puerto, baudios, modo 450° (true) o 360° (false), velocidad (1-4)
const rotor = new YaesuRotatorController("/dev/ttyUSB0", 9600, true, 2);
```
Comandos disponibles (todos devuelven una `Promise`):

| Método | Comando GS-232 | Descripción |
|---|---|---|
| `moveLeft()` | `L` | Gira a la izquierda (antihorario) |
| `moveRight()` | `R` | Gira a la derecha (horario) |
| `moveStop()` | `S` | Detiene el rotor |
| `setAzimuth(azimuth)` | `Maaa` | Gira al azimut indicado (entero, 0-360 o 0-450 según el modo) |
| `getRotatorStatus()` | `C2` | Devuelve `{ azimuth, elevation }` |
| `setOverlap(overlap)` | `P45` / `P36` | Modo 450° (`true`) o 360° (`false`) |
| `setSpeed(speed)` | `Xn` | Velocidad de azimut, de 1 (lenta) a 4 (rápida) |

Ejemplo:
```js
await rotor.setAzimuth(90);
const { azimuth, elevation } = await rotor.getRotatorStatus();
```

Los comandos se envían de uno en uno, en orden, y si el controlador no responde en 2 segundos la promesa se rechaza.

### Licencia
MIT
