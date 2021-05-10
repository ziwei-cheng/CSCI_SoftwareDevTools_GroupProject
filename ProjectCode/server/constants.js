const FRAME_RATE = 60;
const MAP_HEIGHT = 700;
const MAP_WIDTH = 1000;
const SPEED = 2.5;
const ROTATION_SPEED = 2.5;
const BULLET_SPEED = 7.0;
const COOLDOWN_TIME = 500; // 500ms = .5s
const WALLS = [
    [// wall #1 default
        [200, 15, 230, 420, 40],
        [175, 20, 730, 170, 10],
        [250, 20, 200, 100, -10],
        [200, 15, 450, 270, -50],
        [150, 15, 670, 480, 60]
    ],
    [// wall #2, center wall longer
        [200, 15, 230, 420, 40],
        [175, 20, 730, 170, 10],
        [250, 20, 200, 100, -10],
        [300, 15, 450, 270, -50],
        [150, 15, 670, 480, 60]
    ],
    // ...
]

module.exports = {
    FRAME_RATE,
    MAP_HEIGHT,
	MAP_WIDTH,
    SPEED,
    ROTATION_SPEED,
    BULLET_SPEED,
    COOLDOWN_TIME,
    WALLS,
}
