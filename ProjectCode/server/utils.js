module.exports = {
    makeid,
    generateRandomColor,
    getAngle,
    getUnitVector,
    getRandomInt
}

function makeid(length) {
    // always start with number
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nums = '0123456789';

    let result = nums.charAt(Math.floor(Math.random() * 10));
    for (let i = 0; i < length-1; i++) {
        result += characters.charAt(Math.floor(Math.random() * 62));
    }
    return result;
}

function generateRandomColor() {
    return  `hsl(${60 + 220 * Math.random()},
                 ${(90 + 10 * Math.random())}%,
                 ${(30 + 30 * Math.random())}%)`;
};

function getAngle(x0, y0, x1, y1) {
    const a = (x0 - x1 > 0) ? Math.PI / 2 : -Math.PI / 2;
    return Math.atan((y0 - y1) / (x0 - x1)) + a;
};

function getUnitVector(x0, y0, x1, y1) {
    const dx = x0 - x1;
    const dy = y0 - y1;
    const l = Math.sqrt(dx * dx + dy * dy);
    return [dx/l, dy/l];
};

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
};