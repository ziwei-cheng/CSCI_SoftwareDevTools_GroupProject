function paintGame(gameState, ctx, canvas, BG_COLOR) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let clientID in gameState) {
        paintPlayer(gameState[clientID].player, ctx)
        if (gameState[clientID].player.shoot == -1) {
            paintBullet(gameState[clientID].player, ctx)
            //            0 => gameState[clientID].player.shoot
        }
    }
};

//paints the base rotating rectangle according to its location on the server
//supposed to look like a tank?
function paintPlayer(player, ctx) {
    const cX = player.x + (0.5 * player.width);
    const cY = player.y + (0.5 * player.height);

    ctx.translate(cX, cY);
    ctx.rotate(player.rotation * Math.PI / 180);
    ctx.translate(-cX, -cY);

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    paintPlayerGun(player, ctx);
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

function paintBullet(player, ctx) {
    ctx.fillStyle = 'black';
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(player.bulletX, player.bulletY, player.bulletRadius, 0.0, 2.0 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// function preLoad(){
//     game.load.image('bullet', '3308SP21_section013_1/ProjectCode/server/img/bullet.png', 15, 15);

// }