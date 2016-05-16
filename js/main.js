console.log("linked!");

// SET CANVAS SIZE AND APPEND TO BODY
var CANVAS_WIDTH = 1000;
var CANVAS_HEIGHT = 500;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

// FPS SETTING
var FPS = 60;
setInterval(function() {
  update();
  draw();
}, 1000/FPS);

// DRAW
function draw() {
  canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  player1.draw();
  player2.draw();
}

// UPDATE
function update() {
  player1.xMid += (player1.vel * Math.sin(player1.rot*Math.PI/180));
  player1.yMid += -(player1.vel * Math.cos(player1.rot*Math.PI/180));
}

// INITIALIZERS
var initialPositionX = 0 ;
var initialPositionY = 0;
var initialRotation = 0;

var player1 = {
  color: "dodgerblue",
  x: initialPositionX,
  y: initialPositionY,
  rot: initialRotation,
  vel: 0,
  width: 25,
  height: 50,
  init: function() {
    this.xMid = this.x + this.width/2;
    this.yMid = this.y + this.height/2;
    return this;
  },
  draw: function() {
    var drawing = new Image();
    drawing.src = "assets/Car.png";

    canvas.save();
    canvas.translate(this.xMid, this.yMid);
    canvas.rotate(this.rot*Math.PI/180);
    canvas.drawImage(drawing, -this.width/2, -this.height/2,this.width,this.height);
    canvas.restore();
  }
}.init();

// Car 2

var player2 = {
  color: "orange",
  x: initialPositionX,
  y: initialPositionY,
  width: 32,
  height: 32,
  draw: function() {
    canvas.fillStyle = this.color;
    canvas.fillRect(this.x, this.y, this.width, this.height);
  }
}

function KeyboardController(keys, repeat) {
    // Lookup of key codes to timer ID, or null for no repeat
    //
    var timers= {};

    // When key is pressed and we don't already think it's pressed, call the
    // key action callback and set a timer to generate another one after a delay
    //
    document.onkeydown= function(event) {
        var key= (event || window.event).keyCode;
        if (!(key in keys))
            return true;
        if (!(key in timers)) {
            timers[key]= null;
            keys[key]();
            if (repeat!==0)
                timers[key]= setInterval(keys[key], repeat);
        }
        return false;
    };

    // Cancel timeout and mark key as released on keyup
    //
    document.onkeyup= function(event) {
        var key= (event || window.event).keyCode;
        if (key in timers) {
            if (timers[key]!==null)
                clearInterval(timers[key]);
            delete timers[key];
        }
    };

    // When window is unfocused we may not get key events. To prevent this
    // causing a key to 'get stuck down', cancel all held keys
    //
    window.onblur= function() {
        for (key in timers)
            if (timers[key]!==null)
                clearInterval(timers[key]);
        timers= {};
    };
};

KeyboardController({
  // left
    37: function() { player1.rot -= 5; },
  // up
    38: function() { player1.vel += .1; },
  // right
    39: function() { player1.rot += 5; },
  // down
    40: function() { player1.vel -= .1; }
}, 50);






