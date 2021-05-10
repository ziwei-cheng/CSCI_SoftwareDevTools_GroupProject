//import functions from other files=============================
const { createPlayerState, gameLoop, createBullet, initWalls } = require('./game');
const { FRAME_RATE, COOLDOWN_TIME } = require('./constants');
const { makeid } = require('./utils')


// set up express, cors, and socket io ========================
const express = require('express');
const cors = require('cors');
const path = require('path')
const fetch = require('node-fetch')

// setp up express 
const app = express();
app.use(cors());
app.use(express.json())

app.set("views", path.join(__dirname, "../frontend/pages"))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, "../frontend")))

// listen on port,setup socketio
const port = process.env.PORT || 5000;
console.log(port)
const server = app.listen(port);
const io = require("socket.io")(server);

// get all the routes
const routes = require('./routes/routes');
app.use(routes);

const state = {};
const clientRooms = {};
const maps = {}; // walls for each room

// io handle========================================
io.on('connection', client => {
    client.on('mousemove', handleMouseMove);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('disconnect', handleDisconnect);
    client.on('keydown', handleKeyDown);
    client.on('keyup', handleKeyUp);
    client.on('mousedown', handleMouseDown);

    function findPlayer() {
        try {
            const roomCode = clientRooms[client.id];
            return state[roomCode][client.id].player;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    function randomSpawn(player) {
        spawn = Math.floor(Math.random() * 4);
        if (spawn === 0) {
            player.x = 900;
            player.y = 250;
        } else if (spawn === 1) {
            player.x = 450;
            player.y = 600;
        } else if (spawn === 2) {
            player.x = 50;
            player.y = 250;
        } else {
            player.x = 450;
            player.y = 100;
        }
    }

    function handleNewGame(username) {
        let roomCode = makeid(4);
        clientRooms[client.id] = roomCode;
        client.emit('roomCode', roomCode)

        state[roomCode] = {};
        state[roomCode][client.id] = createPlayerState(username);
        randomSpawn(state[roomCode][client.id].player);

        maps[roomCode] = initWalls();

        client.join(roomCode);
        client.emit('init', maps[roomCode]);

        startGameInterval(roomCode);
    };

    function handleJoinGame(roomCode, username) {
        // determin if room is valid
        const room = io.sockets.adapter.rooms[roomCode];

        const allUsers = room ? room.sockets : undefined;

        const numClients = allUsers ? Object.keys(allUsers).length : 0;

        if (numClients == 0) {
            client.emit('unknownGame');
            return;
        }

        //check if user already in room
        const allUsername = Object.keys(state[roomCode]).map((k, i) => {
            return state[roomCode][k].player.id
        });
        if (allUsername.includes(username)) {
            client.emit('duplicatePlayer')
            return
        };

        // join room
        clientRooms[client.id] = roomCode;
        client.emit('roomCode', roomCode);

        state[roomCode][client.id] = createPlayerState(username);
        randomSpawn(state[roomCode][client.id].player);

        client.join(roomCode);
        client.emit('init', maps[roomCode])
    }

    //update player's mouse position and gun rotation accordingly
    function handleMouseMove(x, y) {
        let player = findPlayer();
        if (!player) return;

        //update player's mouse position
        player.mouseX = x;
        player.mouseY = y;
    }

    //takes key that's down from user input from index.js
    //pushes it into and array of player inputs
    //for the game loop to process 
    function handleKeyDown(key) {
        let player = findPlayer();
        if (!player) return;

        if (!player.keysdown.includes(key)) {
            player.keysdown.push(key);
        }
    }

    //removes the key from the array of keys that are currently down
    //the game loop no longer updates based on the removed key
    function handleKeyUp(key) {
        let player = findPlayer();
        if (!player) return;

        player.keysdown = player.keysdown.filter(k => k != key);
    }

    //update player's mouse position and gun rotation accordingly
    function handleMouseDown(x, y) {
        let player = findPlayer();
        if (!player) return;

        if ((Date.now() - player.lastShotTime) > COOLDOWN_TIME) {
            createBullet(x, y, player);
            player.lastShotTime = Date.now();
        }
    };

    function handleDisconnect() {
        const roomCode = clientRooms[client.id]
        if (state[roomCode]) {
            // TODO: Send this player stats to db
            fetch('https://demo-io.herokuapp.com/updateScores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(findPlayer())
            })
                .catch(error => { console.error('Error:', error) })

            delete state[roomCode][client.id]
            //delete room and map if this is the last player
            if (Object.keys(state[roomCode]).length == 0) {
                delete state[roomCode];
                delete maps[roomCode];
            }
        }
        // try {
        //     state[roomCode].splice([client.number - 1],1);
        // }catch(error){
        //     console.error(error);
        // }
    }
});


// Helper functions ======================
function startGameInterval(roomCode) {
    const intervalID = setInterval(() => {

        //clear interval if room not exist
        if (state[roomCode] == undefined) {
            clearInterval(intervalID)
        }

        // player out
        const endedPlayer = gameLoop(state[roomCode], maps[roomCode]);
        if (endedPlayer) {
            for (const p of endedPlayer) {
                delete state[roomCode][p.clientID];
                io.to(p.clientID).emit('gameover')
                //TODO: send endedplayer stats to db
            };
        };
        // send rest of player data to frontend
        emitGameState(roomCode, state[roomCode]);
    }, 1000 / FRAME_RATE)
}
function emitGameState(roomCode, state) {
    io.sockets.in(roomCode)
        .emit('gameState', JSON.stringify(state))
};
