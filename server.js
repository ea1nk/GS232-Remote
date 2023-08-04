const YaesuRotatorController = require("./gs232b");
const GS = new YaesuRotatorController("/dev/ttyUSB0", 9600, true, 2);
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "http://localhost",
        methods: ["GET", "POST"],
    },
});

async function updateRotatorStatus(socket) {
    try {
        const status = await GS.getRotatorStatus();
        socket.emit("status", status);
    } catch (error) {
        console.error("Error getting rotator status:", error);
    }
}

io.on("connection", socket => {
    console.log("Client connected");

    updateRotatorStatus(socket);

    socket.on("set-azimuth", (value) => {
        GS.setAzimuth(value)
            .then(() => {
                console.log("Ok!")
                updateRotatorStatus(io);
            })
            .catch(error => {
                console.error("Error setting azimuth:", error);
            });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

    socket.on("get-status", () => {
        updateRotatorStatus(socket);
    });

    socket.on("move-left", () => {
        console.log("moveLeft");
        GS.moveLeft();
    });

    socket.on("move-right", () => {
        console.log("moveRight");
        GS.moveRight();
    });

    socket.on("move-stop", () => {
        console.log("Stop!");
        GS.moveStop();
    });
});

server.listen(3001, () => {
    console.log("Server listening on port 3001");
});
