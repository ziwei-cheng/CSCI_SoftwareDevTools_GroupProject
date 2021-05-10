const MAP_HEIGHT = 700;
const MAP_WIDTH = 1000;
const COOLDOWN_TIME = 500;
const BG_COLOR = "#ffdd99";

let canvas, ctx;


// get HTML element ===========================
const gameScreen = document.getElementById('gameScreen');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const numPlayerDisplay = document.getElementById('numPlayerDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const elimiationDisplay = document.getElementById('elimiationDisplay');
const gameCanvas = document.getElementById('gcanvas');

const initialScreen = document.getElementById('initialScreen');
const usernameDisplay = document.getElementById('usernameDisplay');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const roomCodeInput = document.getElementById('roomCodeInput');
const logoutButton = document.getElementById('logoutButton')

let wallsTest;

// handle login logout related stuff======================================
logoutButton.addEventListener('click', onClickLogout);

// load page only if login, otherwise, redirect to login page
window.onload = () => {
    if (sessionStorage.token){
        fetch('https://demo-io.herokuapp.com/checkLogin', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: sessionStorage.token })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {//check login success, load page
                initialScreen.style.display = 'block';
                usernameDisplay.innerText = sessionStorage.username;
            } else { // authentication failed
                console.log(result.msg)
                window.location.replace("../pages/login.html");
            }
        })
        .catch(error => {
            console.error('Error:', error)
        });
    }else{
        window.location.replace("../pages/login.html");
    };
};

function onClickLogout(){
    console.log('Logout...')
    sessionStorage.clear();
    window.location.replace("../pages/login.html");
}

function paintGame(gameState, ctx, canvas, BG_COLOR) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

	paintWalls(wallsTest, ctx);

    let playerCount = 0
    for (let clientID in gameState) {
        paintPlayer(gameState[clientID].player, ctx);
        playerCount++;
    };

    numPlayerDisplay.innerText = playerCount;
};

function paintCornersWall(wall, ctx){
	for(j = 0; j < 4; j++){
			ctx.fillStyle = 'green';
			ctx.fillRect(wall.collider.corners[j].x, wall.collider.corners[j].y, 10, 10);
		}
}

function paintCornersPlayer(player, ctx){
	for(j = 0; j < 4; j++){
			ctx.fillStyle = 'green';
			ctx.fillRect(player.collider.corners[j].x, player.collider.corners[j].y, 10, 10);
		}
}

function paintWalls(walls, ctx){
	
	numWalls = walls.length;
	for(var i = 0; i < numWalls; i++){
		const cX = walls[i].x + (0.5 * walls[i].width);
		const cY = walls[i].y + (0.5 * walls[i].height);

		ctx.translate(cX, cY);
		ctx.rotate(walls[i].rotation * Math.PI / 180);
		ctx.translate(-cX, -cY);

		ctx.fillStyle = "#795A2E";
		ctx.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		
		//paintCornersWall(walls[i], ctx);
	}
	
}

//paints the base rotating rectangle according to its location on the server
//supposed to look like a tank?
function paintPlayer(player, ctx) {
	const numBullets = player.bullets.length;
	for(let i = 0; i < numBullets; i++){
		paintBullet(player.bullets[i]);
	}
	
    const cX = player.x + (0.5 * player.width);
    const cY = player.y + (0.5 * player.height);

    ctx.translate(cX, cY);
    ctx.rotate(player.rotation * Math.PI / 180);
    ctx.translate(-cX, -cY);

    //paint body with reload animation
    const relTime = Date.now() - player.lastShotTime;
    const p = relTime > COOLDOWN_TIME ? 1 : relTime/COOLDOWN_TIME;
    const w1 = player.width * p;
    const w2 = player.width * (1-p);
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, w1, player.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x+w1, player.y, w2, player.height);

    // indicate head
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = 'black';
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width/2, player.y + player.height);
    ctx.stroke();

    // indicate invincible
    if (player.invincibleUntil > Date.now()) {
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = 'red';
        ctx.rect(player.x, player.y, player.width, player.height)
        ctx.stroke();
    };

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // paint player name
    ctx.textAlign = "center";
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "black";
    ctx.fillText(player.id, cX, cY-50);

    for (let i=0; i < player.health; i++){
        ctx.strokeStyle = 'white';
        ctx.fillStyle =  'red';
        ctx.beginPath();
        ctx.arc(player.x + i*10 +13, cY-40, 4, 0, 2*Math.PI, false);
        ctx.fill();
        ctx.stroke();
    }

    paintPlayerGun(player, ctx);

    // paint accuracy and eliminations
    if (player.id == sessionStorage.username){
        const acc = player.shotsLanded/player.shotsFired;
        accuracyDisplay.innerText = parseFloat(acc*100).toFixed(2);
        elimiationDisplay.innerText = player.eliminations;
    }
}


//paints the rotating rectangle on top of the other rotating rectangle
//supposed to look like a gun 
function paintPlayerGun(player, ctx) {
    const cX = player.x + (0.5 * player.width);
    const cY = player.y + (0.5 * player.height);

    ctx.translate(cX, cY);
    ctx.rotate(player.gunRotation);
    ctx.translate(-cX, -cY);

    ctx.fillStyle = 'red';
    ctx.fillRect(cX - 5, cY - 5, 10, 50);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function paintBullet(bullet) {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0.0, 2.0 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// socket handle =================
const socket = io('https://demo-io.herokuapp.com');
socket.on('init', (walls)=>{
    wallsTest = walls;
});
socket.on('gameState', (gameState)=>{
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState, ctx, canvas, BG_COLOR))
});
socket.on('roomCode', (code)=>{
    roomCodeDisplay.innerText = code
});
socket.on('unknownGame', ()=>{
    roomCodeInput.value = "";
    roomCodeDisplay.innerText = "";
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none'
    alert('Unknown Room Code.')
});
socket.on('duplicatePlayer', ()=>{
    roomCodeInput.value = "";
    roomCodeDisplay.innerText = "";
    initialScreen.style.display = 'block';
    gameScreen.style.display = 'none'
    alert('You are already in this room')
});
socket.on('gameover', ()=>{
    alert('ur out!!');
    location.reload();
})



// initial screen new/join game handle===============
newGameBtn.addEventListener('click', () => {
    socket.emit('newGame', sessionStorage.username);
    init();
});
joinGameBtn.addEventListener('click', () => {
    socket.emit('joinGame', roomCodeInput.value, sessionStorage.username);
    init();
});



// canvas init, mousemove==========================
function init(){
    //switch to game canvas
    initialScreen.style.display = "none";
    gameScreen.style.display = "block"

    canvas = document.getElementById('gcanvas');
    ctx = canvas.getContext('2d');

    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    canvas.addEventListener('mousemove', onMousemove);
	document.addEventListener('keydown', onKeydown);
	document.addEventListener('keyup', onKeyup);
	canvas.addEventListener('mousedown', onMousedown);
}
function onMousemove(event){
    /*transform to canvas coordiantes 
      (use canvas postion defined at top)*/
    const canvasPosition = gameCanvas.getBoundingClientRect();
    const x = event.x - canvasPosition.x;
    const y = event.y - canvasPosition.y;
    socket.emit('mousemove', x, y)
}

function onKeydown(event){
	socket.emit('keydown', event.key);
}

function onKeyup(event){
	socket.emit('keyup', event.key);
}

//click event
function onMousedown(event){
    /*transform to canvas coordiantes
      (use canvas postion defined at top)*/
    const canvasPosition = gameCanvas.getBoundingClientRect();
    const x = event.x - canvasPosition.x;
    const y = event.y - canvasPosition.y;
    socket.emit('mousedown', x, y)
};