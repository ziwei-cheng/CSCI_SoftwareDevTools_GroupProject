module.exports = {
	createPlayerState,
	gameLoop,
	createBullet,
	initWalls
}

const { MAP_HEIGHT, MAP_WIDTH } = require('./constants');
const { generateRandomColor, getAngle, getUnitVector, getRandomInt } = require('./utils');
const { SPEED, ROTATION_SPEED, BULLET_SPEED, COOLDOWN_TIME, WALLS } = require('./constants');
const fetch = require('node-fetch')

function initWalls(random = true) {
	let walls = [];
	if (random) {
		const randNum = getRandomInt(0, WALLS.length);
		for (let i = 0; i < WALLS[randNum].length; i++) {
			const [h, w, x, y, r] = WALLS[randNum][i];
			walls.push(new Wall(h, w, x, y, r));
		};
	} else { // load default
		for (let i = 0; i < WALLS[0].length; i++) {
			const [h, w, x, y, r] = WALLS[0][i];
			walls.push(new Wall(h, w, x, y, r));
		};
	};
	return walls;
}

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	findDistance(p2) {
		return Math.sqrt(Math.pow((p2.x - this.x), 2) + Math.pow((p2.y - this.y), 2));
	}
}

class Line {
	constructor(m, b) {
		this.m = m;
		this.b = b;
	}

	updateLine(p1, p2) {
		this.m = (p2.y - p1.y) / (p2.x - p1.x);
		this.b = p1.y + (-this.m * p1.x);
	}

	findPerpLine(p3) {
		var perpM = -(1 / this.m);
		var perpB = p3.y + (-perpM * p3.x);

		return new Line(perpM, perpB);
	}

	findIntercept(l2) {
		var m1 = this.m;
		var b1 = this.b;
		var m2 = l2.m;
		var b2 = l2.b;

		b1 = -b1 / m1;
		b2 = -b2 / m2;

		m1 = 1 / m1;
		m2 = 1 / m2;

		var bf = b2 - b1;
		var mf = m1 - m2;

		var y = bf / mf;

		bf = l2.b - this.b;
		mf = this.m - l2.m;

		var x = bf / mf;

		return new Point(x, y);
	}
}

class BoxCollider {
	constructor() {
		this.corners = [];
		this.lines = [];

		this.corners.push(new Point(0, 0));
		this.corners.push(new Point(0, 0));
		this.corners.push(new Point(0, 0));
		this.corners.push(new Point(0, 0));

		this.lines.push(new Line(0, 0));
		this.lines.push(new Line(0, 0));
		this.lines.push(new Line(0, 0));
		this.lines.push(new Line(0, 0));
	}

	updateCorners() {
		const cX = this.x + (0.5 * this.width);
		const cY = this.y + (0.5 * this.height);

		const toRad = Math.PI / 180;

		var cornerVec = Math.atan(this.height / this.width) / toRad;
		var h = Math.sqrt(Math.pow(this.height / 2, 2) + Math.pow(this.width / 2, 2));

		this.corners[0].x = cX + (Math.cos((this.rotation + cornerVec) * toRad) * h);
		this.corners[0].y = cY + (Math.sin((this.rotation + cornerVec) * toRad) * h);

		this.corners[1].x = cX + (Math.cos((this.rotation - cornerVec) * toRad) * h);
		this.corners[1].y = cY + (Math.sin((this.rotation - cornerVec) * toRad) * h);

		this.corners[2].x = cX + (Math.cos((this.rotation + cornerVec + 180) * toRad) * h);
		this.corners[2].y = cY + (Math.sin((this.rotation + cornerVec + 180) * toRad) * h);

		this.corners[3].x = cX + (Math.cos((this.rotation - cornerVec + 180) * toRad) * h);
		this.corners[3].y = cY + (Math.sin((this.rotation - cornerVec + 180) * toRad) * h);

		this.lines[0].updateLine(this.corners[0], this.corners[1]);
		this.lines[1].updateLine(this.corners[1], this.corners[2]);
		this.lines[2].updateLine(this.corners[2], this.corners[3]);
		this.lines[3].updateLine(this.corners[3], this.corners[0]);
	}

	updateCollider(x, y, height, width, rotation) {
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
		this.rotation = rotation;

		this.updateCorners();
	}

	checkCollision(point) {
		const perpLine1 = this.lines[0].findPerpLine(point);
		const perpLine2 = this.lines[1].findPerpLine(point);
		const perpLine3 = this.lines[2].findPerpLine(point);
		const perpLine4 = this.lines[3].findPerpLine(point);

		const intercept1 = this.lines[0].findIntercept(perpLine1);
		const intercept2 = this.lines[1].findIntercept(perpLine2);
		const intercept3 = this.lines[2].findIntercept(perpLine3);
		const intercept4 = this.lines[3].findIntercept(perpLine4);

		const distance1 = point.findDistance(intercept1);
		const distance2 = point.findDistance(intercept2);
		const distance3 = point.findDistance(intercept3);
		const distance4 = point.findDistance(intercept4);

		if ((distance1 + distance3 - 0.1 < this.width) && (distance2 + distance4 - 0.1 < this.height)) {
			//console.log("Collision");
			return true;
		} else {
			//console.log("No Collision");
			return false;
		}
	}
}

class Bullet {
	constructor(x, y, dx, dy, id) {
		this.x = x;
		this.y = y;

		this.p = new Point(x, y);

		this.dx = dx;
		this.dy = dy;
		this.radius = 5.0;
		this.id = id;
	}

	updateBullet() {
		this.x += this.dx;
		this.y += this.dy;

		this.p.x = this.x;
		this.p.y = this.y;
	}
}

class Wall {
	constructor(height, width, x, y, rotation) {
		this.height = height;
		this.width = width;
		this.x = x;
		this.y = y;
		this.rotation = rotation;
		this.collider = new BoxCollider();

		this.collider.updateCollider(this.x, this.y, this.height, this.width, this.rotation);
	}

	isValid(others) {
		// check if out of bounds
		for (let i = 0; i < 4; i++) {
			if (this.collider.corners[i].x > MAP_WIDTH
				|| this.collider.corners[i].x < 0
				|| this.collider.corners[i].y > MAP_HEIGHT
				|| this.collider.corners[i].y < 0) {
				return false;
			};
		};
		for (let i = 0; i < others.length; i++) {
			for (let j = 0; j < 4; j++) {
				if (others[i].collider.checkCollision(this.collider.corners[j])
					|| this.collider.checkCollision(others[i].collider.corners[j])) {
					return false
				};
			};
		};
		return true;
	}
}

function createPlayerState(username) {
	const randomColor = generateRandomColor();
	const boxCollider = new BoxCollider();
	return {
		player: {
			invincibleUntil: Date.now() + 5000, //5s form now 
			id: username,

			width: 70,
			height: 40,

			x: 400,
			y: 200,

			dx: 0,
			dy: 0,

			mouseX: MAP_WIDTH / 2,
			mouseY: MAP_HEIGHT / 2,

			color: randomColor,

			rotationSpeed: 0,
			rotation: 0.1,
			gunRotation: 0,

			collider: boxCollider,

			bullets: [],
			lastShotTime: Date.now() - COOLDOWN_TIME,

			keysdown: [],

			shotsFired: 0,
			shotsLanded: 0,
			eliminations: 0,
			health: 5,
		}
	}
}

function createBullet(mouseX, mouseY, player) {
	const cX = player.x + (0.5 * player.width);
	const cY = player.y + (0.5 * player.height);

	const [a, b] = getUnitVector(mouseX, mouseY, cX, cY);

	const dx = a * BULLET_SPEED;
	const dy = b * BULLET_SPEED;

	const x = cX + dx * 7;
	const y = cY + dy * 7;

	const bullet = new Bullet(x, y, dx, dy, player.id);
	player.bullets.push(bullet);
	player.shotsFired++;
}

function gameLoop(gameState, walls) {
	if (!gameState) {
		return;
	}

	let endedPlayer = [];

	// update each player's state
	for (let clientID in gameState) {
		const player = gameState[clientID].player;

		updateSpeed(player);
		updateGunRotation(player);

		//updates the player's postion and rotation based on their speeds
		updatePositionRotation(player);

		player.collider.updateCollider(player.x, player.y, player.height, player.width, player.rotation);
		checkOutOfBounds(player);
		checkHitWall(player, walls);

		//really gross and needs improvement
		//asks if this players bullet has collided with any other player
		//or if it leaves the map
		let numBullets = player.bullets.length;
		for (let i = 0; i < numBullets; i++) {
			const bullet = player.bullets[i];
			bullet.updateBullet();
			//check if bullet out of bounds
			if (bullet.x > MAP_WIDTH || bullet.x < 0
				|| bullet.y > MAP_HEIGHT || bullet.y < 0) {
				player.bullets.splice(i, 1);
				numBullets--;
			};

			// check if bullet hit player
			for (let clientID2 in gameState) {
				const player2 = gameState[clientID2].player;
				if (clientID != clientID2
					&& player2.invincibleUntil < Date.now()
					&& player2.collider.checkCollision(bullet.p)) {
					console.log(bullet.id + " shot " + player2.id);
					player.bullets.splice(i, 1);
					numBullets--;
					player.shotsLanded++;
					//console.log(player2.id + " lost a life");
					player2.health--;
					if (player2.health == 0) {
						player.eliminations++;
						player.health += 1;
						//console.log(player.health);
						console.log(player2.id + " died!");
						endedPlayer.push({
							clientID: clientID2,
							player: player2,
						});
						fetch('https://demo-io.herokuapp.com/updateScores', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(player2)
						})
							.catch(error => { console.error('Error:', error) })
					}
				};
			};
		};
	};
	return endedPlayer;
};

function checkHitWall(player, walls) {
	let numBullets = player.bullets.length;
	for (let i = 0; i < walls.length; i++) {
		for (let j = 0; j < 4; j++) {
			if (walls[i].collider.checkCollision(player.collider.corners[j])
				|| player.collider.checkCollision(walls[i].collider.corners[j])) {
				player.x += -player.dx;
				player.y += -player.dy;
				player.rotation += -player.rotationSpeed;
			}
		}

		for (let j = 0; j < numBullets; j++) {
			if (walls[i].collider.checkCollision(player.bullets[j].p)) {
				player.bullets.splice(j, 1);
				numBullets--;
			}
		}
	}
}

function checkOutOfBounds(player) {
	//makes it so the player can no longer leave the map
	for (var i = 0; i < 4; i++) {
		if (player.collider.corners[i].x > MAP_WIDTH) {
			player.x -= Math.abs(player.dx);
			player.rotation -= player.rotationSpeed;
		}
		if (player.collider.corners[i].x < 0) {
			player.x += Math.abs(player.dx);
			player.rotation -= player.rotationSpeed;
		}
		if (player.collider.corners[i].y > MAP_HEIGHT) {
			player.y -= Math.abs(player.dy);
			player.rotation -= player.rotationSpeed;
		}
		if (player.collider.corners[i].y < 0) {
			player.y += Math.abs(player.dy);
			player.rotation -= player.rotationSpeed;
		}
	}
}

// update dx, dy, rotationSpeed according to key inputs
function updateSpeed(player) {
	const keys = ['w', 'a', 's', 'd'];
	const [w, a, s, d] = keys.map(k => player.keysdown.includes(k))

	const x = Math.cos(player.rotation * Math.PI / 180);
	const y = Math.sin(player.rotation * Math.PI / 180);

	player.rotationSpeed = a && d ? 0
		: a ? -ROTATION_SPEED
			: d ? ROTATION_SPEED
				: 0;

	[player.dx, player.dy] = w && s ? [0, 0]
		: w ? [x * SPEED, y * SPEED]
			: s ? [-x * SPEED, -y * SPEED]
				: [0, 0];
}

function updateGunRotation(player) {
	cX = player.x + (0.5 * player.width);
	cY = player.y + (0.5 * player.height);

	player.gunRotation = getAngle(cX, cY, player.mouseX, player.mouseY);
};

function updatePositionRotation(player) {
	cX = player.x + (0.5 * player.width);
	cY = player.y + (0.5 * player.height);

	player.x += (player.dx != 0) ? player.dx : 0;
	player.y += (player.dy != 0) ? player.dy : 0;
	player.rotation += (player.rotationSpeed != 0) ? player.rotationSpeed : 0;
};
