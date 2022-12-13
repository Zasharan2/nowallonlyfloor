// no wall only floor

var c = document.getElementById("gameCanvas");
var ctx = c.getContext("2d");

window.addEventListener("keydown", this.globalKeyPressed, false);
window.addEventListener("keyup", this.globalKeyReleased, false);

var keys = []

function globalKeyPressed(event){
    keys[event.keyCode] = true;
}
function globalKeyReleased(event){
    keys[event.keyCode] = false;
}

var mouseX;
var mouseY;

window.addEventListener("mousemove", function(evt) {
    mouseX = evt.clientX - c.getBoundingClientRect().left;
    mouseY = evt.clientY - c.getBoundingClientRect().top;
});

var mouseDown;
window.addEventListener("mousedown", function(){
    mouseDown = true;
});

window.addEventListener("mouseup", function(){
    mouseDown = false;
});

var screenLength = 600;
var screenNum = 0;

var tileWidth = screenLength / 30;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const TileType = {
    AIR: 0,
    WALL: 1, // no wall only floor
    PLAYER: 2,
    GOAL: 3,
    LAVA: 4,
    GRASS: 5,
    STONE: 6,
    WATER: 7,
    BLOCK: 8
}

const FloorTypes = [TileType.WALL, TileType.GRASS, TileType.STONE];

/* block ideas

    block that rotates the screen upon contact
    block that allows double jump when player is inside of it
    water block (slows down movement including falling when player inside of it)
    grass block (spreads to nearby blocks when player stands on it, turning them to grass (like mc moss block))
    stone block (only block that can resist grass block (except air ig :/))
    block block (can be pushed by player (maybe dissolves in lava? then there could be some interesting grass lava block block mechanics))

    level introducing grass name: The lava is floor (idea from The floor is lava)

*/

class Tile {
    constructor(x, y, type) {
        this.pos = new Vector(x, y)
        this.type = type;
    }
}

class Block {
    constructor(x, y, type) {
        this.tile = new Tile(x, y, type);
        this.vel = new Vector(0, 0);
        this.onGround = false;
        this.prev = new Vector(x, y);
    }
}

var prevTileList = [];
var TileList = [];

var player = new Block(2, 27, TileType.PLAYER);
var spawnPoint = new Vector(2, 27);

var gravity = 0.05;
var friction = 0.8;
var waterfriction = 0;

// inclusive
function pushLine(x1, y1, x2, y2, type) {
    if (x1 - x2 != 0) {
        for (var i = 0; i <= Math.abs(x1 - x2); i++) {
            if (x1 < x2) {
                TileList.push(new Tile(x1 + i, y1, type));
            } else {
                TileList.push(new Tile(x2 + i, y1, type));
            }
        }
    }
    if (y1 - y2 != 0) {
        for (var i = 0; i <= Math.abs(y1 - y2); i++) {
            if (y1 < y2) {
                TileList.push(new Tile(x1, y1 + i, type));
            } else {
                TileList.push(new Tile(x1, y2 + i, type));
            }
        }
    }
}

function pushPoint(x, y, type) {
    TileList.push(new Tile(x, y, type));
}

function setPoint(x, y, type) {
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].pos.x == x && TileList[i].pos.y == y) {
            TileList.splice(i, 1);
        }
    }
    TileList.push(new Tile(x, y, type));
}

function removePoint(x, y) {
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].pos.x == x && TileList[i].pos.y == y) {
            TileList.splice(i, 1);
        }
    }
}

function findSpawn() {
    j = []
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].type == TileType.PLAYER) {
            spawnPoint.x = TileList[i].pos.x;
            spawnPoint.y = TileList[i].pos.y;
            j.push(i - j.length);
        }
    }
    // remove spawnpoints from showing onscreen after play
    for (var i = 0; i < j.length; i++) {
        TileList.splice(j[i], 1);
    }

    findBlocks();
}

var blockList = [];
function findBlocks() {
    blockList = [];
    j = [];
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].type == TileType.BLOCK) {
            blockList.push(new Block(TileList[i].pos.x, TileList[i].pos.y, TileType.BLOCK));
            j.push(i - j.length);
        }
    }
    for (var i = 0; i < j.length; i++) {
        TileList.splice(j[i], 1);
    }
}

function loadMap(id) {
    TileList = [];
    switch (id) {
        case 0: {
            // border
            pushLine(0, 29, 29, 29, TileType.WALL);
            pushLine(29, 29, 29, 0, TileType.WALL);
            pushLine(29, 0, 0, 0, TileType.WALL);
            pushLine(0, 0, 0, 29, TileType.WALL);

            // level content
            pushLine(5, 28, 5, 25, TileType.WALL);
            pushLine(8, 25, 11, 25, TileType.WALL);
            pushLine(8, 24, 8, 21, TileType.WALL);

            // set player spawn
            spawnPoint.x = 2;
            spawnPoint.y = 27;
            player.tile.pos = spawnPoint;

            // remove any residual velocity
            player.vel.x = 0;
            player.vel.y = 0;

            break;
        }
        // 
        case 1: {
            codeToLevel("0.29.1,-1.18.1,-1.17.1,-1.16.1,-1.11.1,-1.12.1,-1.13.1,28.-1.1,30.7.1,30.8.1,30.9.1,30.11.1,10.29.1,9.30.1,8.30.1,7.30.1,9.29.1,3.29.1,2.29.1,1.29.1,0.28.4,0.27.4,0.26.4,0.25.4,0.24.4,0.23.4,0.22.4,0.21.4,-1.20.4,-1.19.4,0.20.4,0.19.4,0.18.4,0.17.4,0.16.4,0.15.4,0.14.4,0.13.4,0.12.4,0.11.4,0.10.4,0.9.4,0.8.4,0.7.4,-1.7.4,-1.6.4,-1.5.4,-1.4.4,-1.3.4,0.5.4,0.6.4,0.4.4,0.3.4,0.2.4,0.1.4,0.0.4,0.-1.4,1.-1.4,1.0.4,2.0.4,3.0.4,4.0.4,5.0.4,6.0.4,7.0.4,8.0.4,9.0.4,10.0.4,11.0.4,12.0.4,13.0.4,14.0.4,15.0.4,16.0.4,17.0.4,18.0.4,19.0.4,20.0.4,21.0.4,22.0.4,23.0.4,24.0.4,25.0.4,26.0.4,27.0.4,28.0.4,29.0.4,29.1.4,29.2.4,29.3.4,29.4.4,29.5.4,29.6.4,29.7.4,29.8.4,29.9.4,29.10.4,29.11.4,29.12.4,29.13.4,29.17.4,29.14.4,29.15.4,29.16.4,29.18.4,30.19.4,30.20.4,30.21.4,30.22.4,29.19.4,29.20.4,29.21.4,29.22.4,29.23.4,29.24.4,29.25.4,29.26.4,29.27.4,29.28.4,2.27.2,4.29.4,5.29.4,6.29.4,7.29.4,8.29.4,29.29.4,27.27.3,28.29.1,27.29.1,26.29.1,25.29.1,22.29.4,21.29.4,20.29.4,17.29.1,12.29.4,13.29.4,14.29.4,15.29.4,24.29.4,23.29.4,18.29.1,19.29.1,16.29.4,11.29.1");
            break;
        }
        // no wall only floor
        case 2: {
            codeToLevel("1.29.1,2.29.1,3.29.1,4.29.1,5.29.1,6.29.1,11.29.1,12.29.1,13.29.1,14.29.1,15.29.1,18.29.1,19.29.1,20.29.1,21.29.1,22.29.1,23.29.1,24.29.1,25.29.1,26.29.1,27.29.1,28.29.1,29.29.1,29.28.1,29.27.1,29.26.1,29.25.1,29.24.1,29.22.1,29.21.1,29.20.1,29.19.1,29.18.1,29.17.1,29.16.1,29.15.1,29.11.1,29.9.1,29.7.1,29.5.1,29.6.1,29.8.1,29.10.1,29.12.1,29.13.1,30.11.1,30.7.1,30.3.1,30.5.1,30.4.1,30.2.1,30.1.1,30.0.1,29.2.1,29.4.1,29.3.1,29.1.1,29.0.1,28.0.1,27.0.1,26.0.1,25.0.1,24.0.1,23.0.1,22.0.1,21.0.1,16.0.1,15.0.1,14.0.1,10.0.1,11.0.1,12.0.1,13.0.1,9.0.1,8.0.1,7.0.1,6.0.1,5.0.1,4.0.1,3.0.1,2.0.1,1.0.1,0.0.1,0.1.1,0.2.1,0.3.1,0.4.1,0.16.1,0.17.1,0.18.1,0.29.1,2.27.2,7.29.4,8.29.4,9.29.4,10.29.4,11.25.1,0.28.4,0.27.4,0.26.4,0.25.4,0.24.4,0.23.4,0.22.4,11.24.1,17.26.1,17.27.1,17.28.1,17.29.1,16.29.1,16.28.1,15.28.1,14.28.1,13.28.1,12.28.1,11.28.1,11.27.1,11.26.1,14.27.1,13.27.1,12.25.1,12.24.1,12.23.1,13.23.1,13.24.1,13.25.1,12.26.1,12.27.1,13.26.1,14.26.1,16.26.1,15.26.1,16.27.1,15.27.1,18.26.1,18.27.1,18.28.1,19.26.1,19.27.1,19.28.1,26.23.1,27.23.1,28.23.1,29.23.1,28.24.1,28.25.1,28.27.1,28.28.1,27.28.1,26.28.1,25.28.1,24.28.1,23.28.1,22.28.1,21.28.1,20.28.1,20.27.1,20.26.1,22.23.1,23.23.1,24.23.1,25.23.1,27.24.1,26.24.1,25.24.1,24.24.1,23.24.1,22.24.1,22.25.1,21.26.1,21.27.1,22.27.1,24.25.1,23.25.1,23.27.1,28.26.1,27.26.1,27.25.1,26.25.1,25.25.1,25.26.1,24.26.1,22.26.1,23.26.1,24.27.1,25.27.1,27.27.1,26.27.1,26.26.1,11.23.1,11.21.4,10.21.4,9.21.4,8.21.4,7.21.4,6.21.4,5.21.4,4.21.4,3.21.4,2.21.4,1.21.4,0.21.4,18.24.4,18.23.4,17.23.4,17.24.4,21.23.4,21.24.4,20.25.4,19.25.4,18.25.4,14.23.1,15.23.1,16.23.1,14.24.1,15.24.1,16.24.1,16.25.1,15.25.1,14.25.1,19.23.4,19.24.4,20.24.4,20.23.4,17.25.4,21.25.4,28.15.1,27.15.1,26.15.1,25.15.1,24.15.1,23.15.1,22.15.1,21.15.1,20.15.1,11.19.4,5.19.4,4.19.4,3.19.4,0.20.4,1.20.4,2.20.4,3.20.4,4.20.4,5.20.4,6.20.4,11.20.4,12.21.4,12.20.4,12.19.4,19.15.1,18.15.1,17.15.1,10.19.1,9.19.1,8.19.1,7.19.1,16.15.1,15.15.1,14.15.1,13.15.1,12.15.1,11.15.1,10.15.1,7.20.4,8.20.4,9.20.4,10.20.4,2.19.4,1.19.4,0.19.4,6.19.1,9.15.1,8.15.4,8.14.4,8.13.4,8.12.4,9.14.1,10.14.1,15.14.1,11.14.1,12.14.1,13.14.1,14.14.1,16.14.1,17.14.1,21.14.1,20.14.1,19.14.1,18.14.1,22.14.1,23.14.1,24.14.1,28.14.1,29.14.1,27.14.1,26.14.1,25.14.1,0.15.1,0.14.1,0.13.1,0.12.1,0.9.4,0.8.4,0.11.1,0.10.1,0.7.4,0.6.4,0.5.4,8.1.1,8.2.1,8.3.1,8.4.1,8.5.1,8.6.1,8.7.1,8.8.1,9.8.4,10.8.4,11.8.4,12.8.4,13.8.4,14.8.4,15.8.4,16.8.4,17.8.4,18.8.4,19.8.4,20.8.4,21.8.4,22.8.4,23.8.4,24.8.4,25.8.4,27.22.1,27.21.1,27.20.1,27.19.1,27.18.1,27.17.1,27.16.1,28.16.1,28.17.1,28.18.1,28.19.1,28.20.1,28.21.1,28.22.1,9.12.4,10.12.4,11.12.4,12.12.4,13.12.4,14.12.4,15.12.4,16.12.4,17.12.4,18.12.4,19.12.4,20.12.4,21.12.4,22.12.4,23.12.4,24.12.4,25.12.4,26.12.4,27.12.4,28.12.4,28.13.4,27.13.4,26.13.4,25.13.4,24.13.4,23.13.4,22.13.4,21.13.4,20.13.4,19.13.4,18.13.4,17.13.4,16.13.4,15.13.4,14.13.4,13.13.4,12.13.4,11.13.4,10.13.4,9.13.4,25.7.4,25.6.4,25.5.4,25.4.4,24.4.4,23.4.4,14.4.4,13.4.4,12.4.4,17.4.1,16.4.1,15.4.1,18.4.1,19.4.1,20.4.1,21.4.1,22.4.1,20.0.4,19.0.4,18.0.4,17.0.4,9.7.1,10.7.1,11.7.1,12.7.1,13.7.1,14.7.1,17.7.4,18.7.4,19.7.4,20.7.4,21.7.4,22.7.4,23.7.4,24.7.4,23.6.3,23.5.3,24.5.3,24.6.3,15.7.1,16.7.1,22.5.3,22.6.3,1.18.1,1.17.1,1.16.1,1.15.1,1.14.1,1.13.1,1.12.1,1.11.1,1.10.1,1.9.4,1.8.4,1.7.4,1.6.4,1.5.4,1.4.1,1.3.1,1.2.1,1.1.1,2.1.1,3.1.1,4.1.1,5.1.1,6.1.1,7.1.1,7.2.1,7.3.1,7.4.1,7.5.1,7.6.1,7.7.1,7.8.1,7.12.4,7.13.4,7.14.4,7.15.4");
            break;
        }/*
        // sun tzu - the art of rage
        case 3: {
            codeToLevel("2.0.1,3.0.1,4.0.1,5.0.1,11.0.1,12.0.1,13.0.1,14.0.1,29.17.1,29.18.1,29.19.1,29.20.1,29.21.1,29.22.1,29.23.1,29.24.1,29.25.1,29.26.1,29.27.1,29.28.1,29.29.1,0.29.1,1.29.1,3.30.1,2.30.1,2.29.1,3.29.1,9.29.1,10.29.1,11.29.1,12.29.1,13.29.1,19.29.1,20.29.1,21.29.1,22.29.1,23.29.1,4.29.4,5.29.4,6.29.4,7.29.4,8.29.4,0.28.4,0.27.4,0.26.4,0.25.4,14.29.4,15.29.4,16.29.4,17.29.4,18.29.4,24.29.4,25.29.4,26.29.4,27.29.4,28.29.4,28.23.1,27.23.1,26.23.1,23.23.4,22.23.4,8.23.1,7.23.1,6.23.1,5.23.1,4.23.1,4.18.4,0.23.1,0.22.1,0.21.1,0.20.1,0.19.1,0.18.1,0.17.1,0.16.1,0.15.1,0.14.1,4.17.1,5.17.1,6.17.1,7.17.1,8.17.1,9.17.1,5.18.4,5.19.4,6.19.4,6.18.4,7.18.4,8.18.4,9.18.4,10.18.4,12.18.4,13.18.4,13.19.4,13.20.4,13.21.4,13.22.4,12.22.4,11.22.4,10.22.4,6.20.4,7.19.4,9.19.4,8.19.4,7.20.4,7.21.4,8.21.4,8.20.4,10.19.4,9.20.4,8.22.4,9.22.4,10.21.4,9.21.4,10.20.4,11.18.4,11.19.4,12.20.4,12.21.4,11.21.4,11.20.4,12.19.4,4.19.4,4.20.4,4.21.4,4.22.4,5.22.4,5.21.4,5.20.4,6.21.4,6.22.4,7.22.4,10.17.1,11.17.1,12.17.1,13.17.1,14.17.1,14.18.1,14.19.1,14.20.1,14.21.1,14.22.1,15.23.4,16.23.4,17.23.1,18.23.1,19.23.1,17.20.4,17.19.4,17.18.4,17.17.4,17.16.4,17.15.4,17.14.4,17.13.4,11.23.1,10.23.1,9.23.1,14.23.1,13.23.1,12.23.1,20.23.1,24.23.4,21.23.1,25.23.4,18.20.4,19.20.4,19.19.4,19.18.4,19.17.4,19.16.4,19.15.4,19.14.4,19.13.4,18.13.4,18.14.4,18.15.4,18.16.4,18.17.4,18.18.4,18.19.4,28.17.1,27.17.1,26.17.1,25.17.1,24.17.1,23.17.1,22.17.1,20.13.1,21.13.1,22.13.1,23.13.1,24.13.1,29.8.4,29.7.4,29.6.4,29.5.4,29.4.4,29.3.4,29.2.4,29.1.4,16.13.1,15.13.1,14.13.1,13.13.1,12.13.1,11.13.1,10.13.1,9.13.1,8.13.1,7.13.1,0.13.4,1.13.4,2.13.4,3.13.4,4.13.4,5.13.4,6.13.1,0.12.1,0.11.1,0.10.1,0.9.1,0.8.1,0.7.1,0.6.1,1.7.1,2.7.1,3.7.1,4.7.1,5.7.1,6.7.4,7.7.4,8.7.4,9.7.4,10.7.4,11.7.1,12.7.1,13.7.1,14.7.1,15.7.4,16.7.4,17.7.4,18.7.4,19.7.4,20.7.1,29.0.4,0.4.4,0.3.4,0.2.4,29.9.4,29.10.4,29.16.1,29.15.1,29.14.1,29.13.1,29.12.1,25.13.1,29.11.1,27.13.4,26.13.1,22.7.1,20.2.4,19.2.4,0.5.1,0.1.4,0.0.4,1.0.4,6.0.4,7.0.4,8.0.4,9.0.4,10.0.4,19.0.1,17.-1.1,18.0.1,17.0.1,16.0.1,15.0.1,18.2.4,17.2.4,13.2.4,14.2.4,15.2.4,16.2.4,21.7.1,21.2.4,22.2.4,23.2.4,24.2.4,25.2.4,26.2.4,27.2.4,28.2.4,20.0.1,21.0.1,22.0.1,23.0.1,24.0.1,25.0.1,26.0.1,27.0.1,28.0.1,28.1.3,2.27.2,0.24.1,3.17.1,3.18.4,3.19.4");
            break;
        }*/
        // the lava is floor
        case 3: {
            codeToLevel("0.29.1,1.29.1,2.29.1,3.29.1,4.29.1,5.29.1,6.29.1,14.30.4,13.30.4,2.27.2,0.28.4,0.27.4,0.26.4,0.25.4,0.24.4,0.23.4,11.29.1,12.29.1,14.29.1,15.29.1,18.29.1,20.29.1,21.29.1,22.29.1,13.29.5,10.29.1,16.29.1,7.29.6,8.29.1,9.29.1,19.29.6,17.29.1,23.29.1,29.26.1,29.27.1,29.28.1,29.29.1,28.29.4,27.29.4,26.29.4,25.29.4,24.29.4,29.25.1,29.24.1,29.23.1,29.22.4,29.21.4,29.20.4,29.19.4,29.18.4,29.17.1,29.16.1,29.15.1,29.14.1,29.13.1,28.13.1,27.13.1,26.13.1,25.13.1,24.13.1,23.13.1,22.13.6,21.13.5,20.13.1,19.13.1,18.13.1,17.13.1,16.13.1,15.13.4,14.13.4,13.13.4,12.13.4,11.13.4,10.13.4,9.13.4,8.13.4,7.13.4,6.13.1,6.14.1,6.15.1,6.16.1,6.17.1,6.18.1,6.19.1,6.20.1,9.20.4,10.20.4,11.20.4,12.20.4,13.20.4,14.20.4,15.20.4,7.20.1,16.20.4,17.20.4,18.20.4,19.20.4,20.20.4,21.20.4,22.20.4,23.20.6,0.22.4,0.21.4,0.20.4,0.19.4,0.18.4,0.17.4,5.16.1,4.16.1,3.16.1,3.15.1,3.14.1,3.13.1,4.13.1,5.13.1,5.14.1,5.15.1,4.14.1,4.15.1,0.16.4,0.15.4,0.14.4,0.13.4,0.12.4,0.11.4,3.12.1,4.12.1,6.12.1,16.12.1,17.12.1,18.12.1,19.12.1,20.12.1,23.12.1,24.12.1,25.12.1,26.12.1,27.12.1,28.12.1,29.12.1,15.12.4,14.12.4,13.12.4,12.12.4,10.12.4,9.12.4,8.12.4,7.12.4,5.12.1,6.6.4,7.6.4,8.6.4,9.6.4,10.6.4,11.6.4,12.6.6,13.6.4,14.6.4,15.6.4,16.6.4,17.6.4,18.6.4,19.6.4,20.6.4,21.6.4,22.6.4,23.6.4,24.6.4,25.6.4,26.6.4,22.12.1,28.6.1,29.11.1,29.10.1,29.9.1,29.8.1,29.7.1,29.6.1,3.11.1,4.11.1,5.11.1,6.11.1,7.11.4,8.11.4,9.11.4,10.11.4,11.12.4,12.11.4,13.11.4,14.11.4,15.11.4,17.11.1,18.11.1,19.11.1,20.11.1,21.11.5,21.12.1,22.11.1,23.11.1,24.11.1,25.11.1,26.11.1,27.11.1,28.11.1,11.11.4,16.11.6,27.6.1,0.10.1,0.9.1,0.8.1,0.7.1,0.6.1,0.5.1,0.4.1,0.3.1,0.2.1,0.1.1,0.0.1,6.5.1,7.5.1,8.5.1,9.5.1,10.5.1,11.5.1,12.5.1,13.5.1,8.0.4,9.0.4,10.0.4,11.0.4,12.0.4,17.0.4,16.0.4,13.0.4,14.0.4,15.0.4,18.0.4,19.0.4,20.0.4,21.0.4,22.0.4,23.0.4,24.0.4,25.0.4,26.0.4,27.0.4,28.0.4,29.0.4,29.1.4,29.2.4,29.3.4,29.4.4,29.5.4,27.4.3,1.0.1,2.0.1,3.0.1,4.0.1,1.2.1,2.2.1,3.2.1,4.2.1,4.1.1,3.1.1,2.1.1,1.1.1,5.2.1,6.2.1,7.2.1,7.1.1,7.0.1,6.0.1,5.0.1,5.1.1,6.1.1,8.20.1");
            break;
        }
        default: {
            break;
        }
    }
}

function drawMap() {
    for (var i = 0; i < TileList.length; i++) {
        drawTile(TileList[i])
    }
}

// weird way of setting lists because otherwise references will remain the same within the lists (changing one will change the other)
function setPrevFromTileList() {
    prevTileList = [];
    for (var i = 0; i < TileList.length; i++) {
        prevTileList.push(new Tile(TileList[i].pos.x, TileList[i].pos.y, TileList[i].type));
    }
}

// weird way of setting lists because otherwise references will remain the same within the lists (changing one will change the other)
function setTileListFromPrev() {
    TileList = [];
    for (var i = 0; i < prevTileList.length; i++) {
        TileList.push(new Tile(prevTileList[i].pos.x, prevTileList[i].pos.y, prevTileList[i].type));
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x * tileWidth;
        this.y = y * tileWidth;
        this.w = w;
        this.h = h;
    }
}

// var error = 0;
var points = [];
function AABBMid(rect1, rect2) {
    
    if (rect1.x + (rect1.w / 2) >= rect2.x && rect1.x + (rect1.w / 2) <= rect2.x + rect2.w && rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.h) {
        points.push(0); // top
    }
    if (rect1.x + rect1.w >= rect2.x && rect1.x + rect1.w <= rect2.x + rect2.w && rect1.y + (rect1.h / 2) >= rect2.y && rect1.y + (rect1.h / 2) <= rect2.y + rect2.h) {
        points.push(1); // right
    }
    if (rect1.x + (rect1.w / 2) >= rect2.x && rect1.x + (rect1.w / 2) <= rect2.x + rect2.w && rect1.y + rect1.h >= rect2.y && rect1.y + rect1.h <= rect2.y + rect2.h) {
        points.push(2); // bottom
    }
    if (rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.w && rect1.y + (rect1.h / 2) >= rect2.y && rect1.y + (rect1.h / 2) <= rect2.y + rect2.h) {
        points.push(3); // left
    }
    /*
    if ((rect1.x > rect2.x + error && rect1.x < rect2.x + rect2.w - error && rect1.y > rect2.y + error && rect1.y < rect2.y + rect2.h - error) && (rect1.x + rect1.w > rect2.x + error && rect1.x + rect1.w < rect2.x + rect2.w - error && rect1.y > rect2.y + error && rect1.y < rect2.y + rect2.h - error)) {
        points.push(0); // top
    }
    if ((rect1.x + rect1.w > rect2.x + error && rect1.x + rect1.w < rect2.x + rect2.w - error && rect1.y > rect2.y + error && rect1.y < rect2.y + rect2.h - error) && (rect1.x + rect1.w > rect2.x + error && rect1.x + rect1.w < rect2.x + rect2.w - error && rect1.y + rect1.h > rect2.y + error && rect1.y + rect1.h < rect2.y + rect2.h - error)) {
        points.push(1); // right
    }
    if ((rect1.x + rect1.w > rect2.x + error && rect1.x + rect1.w < rect2.x + rect2.w - error && rect1.y + rect1.h > rect2.y + error && rect1.y + rect1.h < rect2.y + rect2.h - error) && (rect1.x > rect2.x + error && rect1.x < rect2.x + rect2.w - error && rect1.y + rect1.h > rect2.y + error && rect1.y + rect1.h < rect2.y + rect2.h - error)) {
        points.push(2); // bottom
    }
    if ((rect1.x > rect2.x + error && rect1.x < rect2.x + rect2.w - error && rect1.y + rect1.h > rect2.y + error && rect1.y + rect1.h < rect2.y + rect2.h - error) && (rect1.x > rect2.x + error && rect1.x < rect2.x + rect2.w - error && rect1.y > rect2.y + error && rect1.y < rect2.y + rect2.h - error)) {
        points.push(3); // left
    }
    return AABBCornLava(rect1, rect2);*/
    
    if ((rect1.x + (rect1.w / 2) >= rect2.x && rect1.x + (rect1.w / 2) <= rect2.x + rect2.w && rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.h) ||
        (rect1.x + (rect1.w / 2) >= rect2.x && rect1.x + (rect1.w / 2) <= rect2.x + rect2.w && rect1.y + rect1.h >= rect2.y && rect1.y + rect1.h <= rect2.y + rect2.h) ||
        (rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.w && rect1.y + (rect1.h / 2) >= rect2.y && rect1.y + (rect1.h / 2) <= rect2.y + rect2.h) ||
        (rect1.x + rect1.w >= rect2.x && rect1.x + rect1.w <= rect2.x + rect2.w && rect1.y + (rect1.h / 2) >= rect2.y && rect1.y + (rect1.h / 2) <= rect2.y + rect2.h)) {
            return true;
    }
    return false;
}

function AABBCornLava(rect1, rect2) {
    if ((rect1.x > rect2.x && rect1.x < rect2.x + rect2.w && rect1.y > rect2.y && rect1.y < rect2.y + rect2.h) ||
        (rect1.x + rect1.w > rect2.x && rect1.x + rect1.w < rect2.x + rect2.w && rect1.y > rect2.y && rect1.y < rect2.y + rect2.h) ||
        (rect1.x > rect2.x && rect1.x < rect2.x + rect2.w && rect1.y + rect1.h > rect2.y && rect1.y + rect1.h < rect2.y + rect2.h) ||
        (rect1.x + rect1.w > rect2.x && rect1.x + rect1.w < rect2.x + rect2.w && rect1.y + rect1.h > rect2.y && rect1.y + rect1.h < rect2.y + rect2.h)) {
            return true;
    }
    return false;
}

function AABBCorn(rect1, rect2) {
    if ((rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.w && rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.h) ||
        (rect1.x + rect1.w >= rect2.x && rect1.x + rect1.w <= rect2.x + rect2.w && rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.h) ||
        (rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.w && rect1.y + rect1.h >= rect2.y && rect1.y + rect1.h <= rect2.y + rect2.h) ||
        (rect1.x + rect1.w >= rect2.x && rect1.x + rect1.w <= rect2.x + rect2.w && rect1.y + rect1.h >= rect2.y && rect1.y + rect1.h <= rect2.y + rect2.h)) {
            return true;
    }
    return false;
}

var displayCode = document.getElementById("displayCode");
var codeForm = document.getElementById("codeForm");
var gameCode
codeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    gameCode = String(document.forms["codeForm"]["textInput"].value);

    codeToLevel(gameCode);

    codeForm.reset();
});

function levelToCode() {
    var code = "";
    for (var i = 0; i < TileList.length; i++) {
        code = code.concat("," + String(TileList[i].pos.x) + "." + String(TileList[i].pos.y) + "." + String(TileList[i].type));
    }
    displayCode.innerHTML = code.slice(1);
}
function codeToLevel(code) {
    TileList = [];
    code = code.split(",");
    for (var i = 0; i < code.length; i++) {
        code[i] = code[i].split(".");
        TileList.push(new Tile(Number(code[i][0]), Number(code[i][1]), Number(code[i][2])))
    }
    drawMap();
}

var collisionCheck = false;

var level = 1;

function gameLoop(playtesting) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, screenLength, screenLength);

    drawMap();

    if (keys[65] || keys[37]) {
        player.vel.x -= 0.14 * deltaTime * dtCoefficient;
    }
    if (keys[68] || keys[39]) {
        player.vel.x += 0.14 * deltaTime * dtCoefficient;
    }
    if ((keys[87] || keys[38]) && collisionCheck && checkButtonDelay(100)) {
        player.vel.y -= 0.55 * (1 - (waterfriction / 3.2))// * deltaTime * dtCoefficient;
        player.onGround = false;
    }
    if (keys[83] || keys[40]) {
        friction = 3.2;
    } else {
        friction = 0.8;
    }

    blockLoop();

    player.vel.x *= Math.pow(Math.E, deltaTime * -0.4 * friction);
    // player.vel.x *= friction// * deltaTime * 1/8;

    waterfriction = 0;
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].type == TileType.WATER) {
            if (AABBCorn(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                waterfriction = 3.2;
            }
        }
    }
    player.vel.x *= Math.pow(Math.E, deltaTime * -0.4 * waterfriction);
    player.vel.y *= Math.pow(Math.E, deltaTime * -0.4 * waterfriction);

    // don't mess with yvel if on ground
    if (!player.onGround) {
        player.vel.y += gravity * deltaTime * dtCoefficient;
        // clamp yvel
        if (player.vel.y > 1) {
            player.vel.y = 1;
        }
        // player.vel.y *= friction;
    } else {
        player.tile.pos.y += gravity;

        // collision
        collisionCheck = false;
        points = [];
        for (var i = 0; i < TileList.length; i++) {
            if (FloorTypes.indexOf(TileList[i].type) > -1) {
                if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                    collisionCheck = true;
                }
            }
        }

        if (!points.includes(2)) {
            player.onGround = false;
        }

        player.tile.pos.y -= gravity;
    }

    player.prev = player.tile.pos;

    player.tile.pos.x += player.vel.x * deltaTime * dtCoefficient;
    player.tile.pos.y += player.vel.y * deltaTime * dtCoefficient;

    // lava grass goal check
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].type == TileType.GRASS) {
            // adding 0.0000000000000003 to the y positions to correct float rounding
            if (AABBCorn(new Rect(player.tile.pos.x, player.tile.pos.y + 0.0000000000000003, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                for (var j = 0; j < TileList.length; j++) {
                    if (((TileList[j].pos.x == TileList[i].pos.x + 1) || (TileList[j].pos.x == TileList[i].pos.x - 1)) && ((TileList[j].pos.y == TileList[i].pos.y || TileList[j].pos.y == TileList[i].pos.y - 1) && AABBCorn(new Rect(player.tile.pos.x, player.tile.pos.y + 0.0000000000000003, tileWidth, tileWidth), new Rect(TileList[j].pos.x, TileList[j].pos.y, tileWidth, tileWidth)))) {
                        if (TileList[j].type != TileType.STONE) {
                            TileList[j].type = TileType.GRASS;
                        }
                    }
                }
            }
        }
        if (TileList[i].type == TileType.LAVA) {
            if (AABBCornLava(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                setTileListFromPrev();
                findSpawn();
                player.tile.pos.x = spawnPoint.x;
                player.tile.pos.y = spawnPoint.y;
                player.vel.x = 0;
                player.vel.y = 0;
                player.onGround = false;
            }
        }
        if (TileList[i].type == TileType.GOAL) {
            if (AABBCorn(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                player.onGround = false;
                if (playtesting) {
                    setTileListFromPrev();
                    screenNum = 3.2;
                } else {
                    screenNum = 1.4;
                }
            }
        }
    }

    // lava side check
    collisionCheck = false;
    points = [];
    for (var i = 0; i < TileList.length; i++) {
        if (TileList[i].type == TileType.LAVA) {
            AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth));
        }
    }

    if (points.includes(1) || points.includes(3)) {
        setTileListFromPrev();
        findSpawn();
        player.tile.pos.x = spawnPoint.x;
        player.tile.pos.y = spawnPoint.y;
        player.vel.x = 0;
        player.vel.y = 0;
        player.onGround = false;
    }

    // collision
    collisionCheck = false;
    points = [];
    for (var i = 0; i < TileList.length; i++) {
        if (FloorTypes.indexOf(TileList[i].type) > -1) {
            if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                collisionCheck = true;
            }
        }
    }

    if (collisionCheck) {
        player.tile.pos = player.prev;
        // if specifically touching on bottom (2) collision point
        // 
        if (points.includes(2) ){
            // repeatedly move player up until no longer colliding
            while (points.includes(2)) {
                player.tile.pos.y -= 0.01;
                collisionCheck = false;
                points = [];
                for (var i = 0; i < TileList.length; i++) {
                    if (FloorTypes.indexOf(TileList[i].type) > -1) {
                        if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                            collisionCheck = true;
                        }
                    }
                }
            }
            // move back so that we're still actually touching ground
            player.tile.pos.y += 0.01;
            collisionCheck = false;
            points = [];
            for (var i = 0; i < TileList.length; i++) {
                if (FloorTypes.indexOf(TileList[i].type) > -1) {
                    if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                        collisionCheck = true;
                    }
                }
            }
            player.onGround = true;
            player.tile.pos.y = Math.floor(player.tile.pos.y);
        }
        player.vel.y = 0;
    }

    if (points.includes(0) && !points.includes(2)) {
        var tx, ty;
        for (var i = 0; i < TileList.length; i++) {
            tx = TileList[i].pos.x;
            ty = TileList[i].pos.y;
            TileList[i].pos.x = 29 - tx;
            TileList[i].pos.y = 29 - ty;
        }
        for (var i = 0; i < blockList.length; i++) {
            tx = blockList[i].tile.pos.x;
            ty = blockList[i].tile.pos.y;
            blockList[i].tile.pos.x = 29 - tx;
            blockList[i].tile.pos.y = 29 - ty;
        }
        tx = player.tile.pos.x;
        ty = player.tile.pos.y;
        player.tile.pos.x = 29 - tx;
        player.tile.pos.y = 29 - ty;
        // repeatedly move player up until no longer colliding
        while (points.includes(2)) {
            player.tile.pos.y -= 0.01;
            collisionCheck = false;
            points = [];
            for (var i = 0; i < TileList.length; i++) {
                if (FloorTypes.indexOf(TileList[i].type) > -1) {
                    if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                        collisionCheck = true;
                    }
                }
            }
        }
        // move back so that we're still actually touching ground
        player.tile.pos.y += 0.01;
        collisionCheck = false;
        points = [];
        for (var i = 0; i < TileList.length; i++) {
            if (FloorTypes.indexOf(TileList[i].type) > -1) {
                if (AABBMid(new Rect(player.tile.pos.x, player.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                    collisionCheck = true;
                }
            }
        }
        player.onGround = true;
        player.tile.pos.y = Math.floor(player.tile.pos.y);
    }
    if (points.includes(1) && !(points.includes(0))) {
        var tx, ty;
        for (var i = 0; i < TileList.length; i++) {
            tx = TileList[i].pos.x;
            ty = TileList[i].pos.y;
            TileList[i].pos.x = 29 - ty;
            TileList[i].pos.y = tx;
        }
        for (var i = 0; i < blockList.length; i++) {
            tx = blockList[i].tile.pos.x;
            ty = blockList[i].tile.pos.y;
            blockList[i].tile.pos.x = 29 - ty;
            blockList[i].tile.pos.y = tx;
        }
        tx = player.tile.pos.x;
        ty = player.tile.pos.y;
        player.tile.pos.x = 29 - ty;
        player.tile.pos.y = tx;
    }
    if (points.includes(3) && !(points.includes(0))) {
        var tx, ty;
        for (var i = 0; i < TileList.length; i++) {
            tx = TileList[i].pos.x;
            ty = TileList[i].pos.y;
            TileList[i].pos.x = ty;
            TileList[i].pos.y = 29 - tx;
        }
        for (var i = 0; i < blockList.length; i++) {
            tx = blockList[i].tile.pos.x;
            ty = blockList[i].tile.pos.y;
            blockList[i].tile.pos.x = ty;
            blockList[i].tile.pos.y = 29 - tx;
        }
        tx = player.tile.pos.x;
        ty = player.tile.pos.y;
        player.tile.pos.x = ty;
        player.tile.pos.y = 29 - tx;
    }
    
    drawTile(player.tile);
}

var block;
function blockLoop() {
    for (var r = 0; r < blockList.length; r++) {
        block = blockList[r];
        // don't mess with yvel if on ground
        if (!block.onGround) {
            block.vel.y += gravity * deltaTime * dtCoefficient;
            // clamp yvel
            if (block.vel.y > 1) {
                block.vel.y = 1;
            }
            // block.vel.y *= friction;
        } else {
            block.tile.pos.y += gravity;

            // collision
            collisionCheck = false;
            points = [];
            for (var i = 0; i < TileList.length; i++) {
                if (FloorTypes.indexOf(TileList[i].type) > -1) {
                    if (AABBMid(new Rect(block.tile.pos.x, block.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                        collisionCheck = true;
                    }
                }
            }

            if (!points.includes(2)) {
                block.onGround = false;
            }

            block.tile.pos.y -= gravity;
        }

        block.prev = block.tile.pos;

        block.tile.pos.x += block.vel.x * deltaTime * dtCoefficient;
        block.tile.pos.y += block.vel.y * deltaTime * dtCoefficient;
        
        // lava side check
        collisionCheck = false;
        points = [];
        for (var i = 0; i < TileList.length; i++) {
            if (TileList[i].type == TileType.LAVA) {
                AABBMid(new Rect(block.tile.pos.x, block.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth));
            }
        }

        if (points.includes(1) || points.includes(3)) {
            blockList.splice(blockList.indexOf(block), 1);
        }

        // collision
        collisionCheck = false;
        points = [];
        for (var i = 0; i < TileList.length; i++) {
            if (FloorTypes.indexOf(TileList[i].type) > -1) {
                if (AABBMid(new Rect(block.tile.pos.x, block.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                    if (points.includes(2)) {
                        collisionCheck = true;
                    }
                }
            }
        }

        if (collisionCheck) {
            block.tile.pos = block.prev;
            // if specifically touching on bottom (2) collision point
            // 
            if (points.includes(2) ){
                // repeatedly move player up until no longer colliding
                while (points.includes(2)) {
                    block.tile.pos.y -= 0.01;
                    collisionCheck = false;
                    points = [];
                    for (var i = 0; i < TileList.length; i++) {
                        if (FloorTypes.indexOf(TileList[i].type) > -1) {
                            if (AABBMid(new Rect(block.tile.pos.x, block.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                                collisionCheck = true;
                            }
                        }
                    }
                }
                // move back so that we're still actually touching ground
                block.tile.pos.y += 0.01;
                collisionCheck = false;
                points = [];
                for (var i = 0; i < TileList.length; i++) {
                    if (FloorTypes.indexOf(TileList[i].type) > -1) {
                        if (AABBMid(new Rect(block.tile.pos.x, block.tile.pos.y, tileWidth, tileWidth), new Rect(TileList[i].pos.x, TileList[i].pos.y, tileWidth, tileWidth))) {
                            collisionCheck = true;
                        }
                    }
                }
                block.onGround = true;
                block.tile.pos.y = Math.floor(block.tile.pos.y);
            }
            block.vel.y = 0;
        }

        drawTile(block.tile);
    }
}

var buttonDelay = Date.now();

function checkButtonDelay(delay) {
    if (Date.now() - buttonDelay > delay) {
        buttonDelay = Date.now();
        return true;
    } else {
        return false;
    }
}

var time;
var prevTime = 0;
var perfectFrameTime = 1000 / 60;
var deltaTime = 1;
// var dtCoefficient = 1;
var dtCoefficient = 10 / 9;

function update(newTime) {
    // deltaTime = ((newTime - prevTime)) / perfectFrameTime;
    deltaTime = ((Date.now() - prevTime)) / perfectFrameTime;
    prevTime = Date.now();
    // console.log(deltaTime);
    switch (screenNum) {
        // title
        case 0: {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillRect(0, 0, screenLength, screenLength);
            drawTitle();

            if (keys[32]) {
                screenNum = 0.1;
            }
            if (keys[69]) {
                screenNum = 0.2;
            }
            break;
        }
        // title to game
        case 0.1: {
            loadMap(level);
            setPrevFromTileList();
            findSpawn();
            player.tile.pos.x = spawnPoint.x;
            player.tile.pos.y = spawnPoint.y;
            player.vel.x = 0;
            player.vel.y = 0;
            screenNum = 1;
            break;
        }
        // title to edit
        case 0.2: {
            screenNum = 2;
            break;
        }
        // game
        case 1: {
            gameLoop(false);
            break;
        }
        // game to level name
        case 1.4: {
            level++;
            time = Date.now();
            screenNum = 4;
            break;
        }
        // level build
        case 2: {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillRect(0, 0, screenLength, screenLength);

            drawMap();

            if (keys[48] && checkButtonDelay(25)) {
                removePoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20));
            }
            if (keys[49] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.WALL);
            }
            if (keys[50] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.LAVA);
            }
            if (keys[51] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.PLAYER);
            }
            if (keys[52] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.GOAL);
            }
            if (keys[53] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.GRASS);
            }
            if (keys[54] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.STONE);
            }
            if (keys[55] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.WATER);
            }
            if (keys[56] && checkButtonDelay(25)) {
                setPoint(Math.floor(mouseX / 20), Math.floor(mouseY / 20), TileType.BLOCK);
            }

            if (keys[67] && checkButtonDelay(150)) {
                levelToCode();
            }

            if (keys[32] && checkButtonDelay(150)) {
                screenNum = 2.3;
            }

            break;
        }
        // level build to level test
        case 2.3: {
            setPrevFromTileList();
            findSpawn();
            player.tile.pos.x = spawnPoint.x;
            player.tile.pos.y = spawnPoint.y;
            player.vel.x = 0;
            player.vel.y = 0;
            screenNum = 3;
            player.onGround = false;
            break;
        }
        // level test
        case 3: {
            gameLoop(true);

            if (keys[32] && checkButtonDelay(150)) {
                setTileListFromPrev();
                player.onGround = false;
                screenNum = 3.2;
            }
            break;
        } 
        // level test to level build
        case 3.2: {
            screenNum = 2;
            break;
        }
        // level name display
        case 4: {
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillRect(0, 0, screenLength, screenLength);

            if (Date.now() - time > 1500) {
                screenNum = 4.1;
            }
            break;
        }
        // level name to game
        case 4.1: {
            loadMap(level);
            setPrevFromTileList();
            findSpawn();
            player.tile.pos.x = spawnPoint.x;
            player.tile.pos.y = spawnPoint.y;
            player.vel.x = 0;
            player.vel.y = 0;
            screenNum = 1;
            break;
        }
        default: {
            break;
        }
    }
}

//function drawTile(x, y, type) {
function drawTile(tile) {
    ctx.beginPath();
    switch (tile.type) {
        case TileType.AIR: {
            ctx.fillStyle = "rgba(0, 0, 0)";
            break;
        }
        case TileType.WALL: {
            ctx.fillStyle = "rgba(255, 255, 255)";
            break;
        }
        case TileType.PLAYER: {
            ctx.fillStyle = "rgba(255, 0, 0)";
            break;
        }
        case TileType.GOAL: {
            ctx.fillStyle = "rgba(255, 255, 0)";
            break;
        }
        case TileType.LAVA: {
            ctx.fillStyle = "rgba(255, 127, 0)";
            break;
        }
        case TileType.GRASS: {
            ctx.fillStyle = "rgba(0, 255, 127)";
            break;
        }
        case TileType.STONE: {
            ctx.fillStyle = "rgba(127, 127, 127)";
            break;
        }
        case TileType.WATER: {
            ctx.fillStyle = "rgba(0, 0, 255)";
            break;
        }
        case TileType.BLOCK: {
            ctx.fillStyle = "rgba(190, 170, 110)";
            break;
        }
        default: {
            break;
        }
    }
    ctx.fillRect(tile.pos.x * tileWidth, tile.pos.y * tileWidth, tileWidth, tileWidth);
}

function drawTitle() {
    // orange
    ctx.fillStyle = "rgba(255, 127, 0)";

    // N
    drawTitleRect(12, 6, 1, 4);
    drawTitleRect(13, 7, 1, 1);
    drawTitleRect(14, 8, 1, 1);
    drawTitleRect(15, 6, 1, 4);

    // O
    drawTitleRect(18, 6, 1, 4);
    drawTitleRect(18, 6, 4, 1);
    drawTitleRect(18, 9, 4, 1);
    drawTitleRect(21, 6, 1, 4);

    // W
    drawTitleRect(6, 12, 1, 4);
    drawTitleRect(9, 12, 1, 4);
    drawTitleRect(7, 14, 2, 1);
    drawTitleRect(7, 15, 2, 1);

    // A
    drawTitleRect(12, 12, 1, 4);
    drawTitleRect(15, 12, 1, 4);
    drawTitleRect(13, 12, 2, 1);
    drawTitleRect(13, 13, 2, 1);

    // L
    drawTitleRect(18, 12, 1, 4);
    drawTitleRect(18, 15, 4, 1);

    // L
    drawTitleRect(24, 12, 1, 4);
    drawTitleRect(24, 15, 4, 1);

    // cyan
    ctx.fillStyle = "rgba(0, 255, 127)";

    // O
    drawTitleRect(6, 18, 1, 4);
    drawTitleRect(6, 18, 4, 1);
    drawTitleRect(6, 21, 4, 1);
    drawTitleRect(9, 18, 1, 4);

    // N
    drawTitleRect(12, 18, 1, 4);
    drawTitleRect(13, 19, 1, 1);
    drawTitleRect(14, 20, 1, 1);
    drawTitleRect(15, 18, 1, 4);

    // L
    drawTitleRect(18, 18, 1, 4);
    drawTitleRect(18, 21, 4, 1);

    // Y
    drawTitleRect(24, 18, 1, 2);
    drawTitleRect(27, 18, 1, 2);
    drawTitleRect(25, 20, 2, 2);

    // F
    drawTitleRect(3, 24, 4, 1);
    drawTitleRect(3, 24, 1, 4);
    drawTitleRect(4, 26, 2, 1); // :O

    // L
    drawTitleRect(9, 24, 1, 4);
    drawTitleRect(9, 27, 4, 1);

    // O
    drawTitleRect(15, 24, 1, 4);
    drawTitleRect(15, 24, 4, 1);
    drawTitleRect(15, 27, 4, 1);
    drawTitleRect(18, 24, 1, 4);

    // O
    drawTitleRect(21, 24, 1, 4);
    drawTitleRect(21, 24, 4, 1);
    drawTitleRect(21, 27, 4, 1);
    drawTitleRect(24, 24, 1, 4);

    // R
    drawTitleRect(27, 24, 3, 1);
    drawTitleRect(27, 24, 1, 4);
    drawTitleRect(28, 26, 2, 1);
    drawTitleRect(30, 25, 1, 1);
    drawTitleRect(30, 27, 1, 1);
}

function drawTitleRect(x, y, w, h) {
    ctx.beginPath();
    ctx.fillRect((x - 1) * 18.75, (y - 1) * 18.75, w * 18.75 + 1, h * 18.75 + 1);
}

function main(timestamp) {
    update(timestamp);
    requestAnimationFrame(main);
}
requestAnimationFrame(main);
