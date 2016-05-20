console.log("linked!");

// SET CANVAS SIZE AND APPEND TO BODY
var CANVAS_WIDTH = 1100;
var CANVAS_HEIGHT = 555;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');
var players = [];


// DRAW
function draw() {
  canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (var i=0; i<players.length; i++) {
    players[i].draw();
  }
  ball.draw();
}

// UPDATE
function update() {

  for(var i=0; i < players.length; i++) {
    players[i].xMid += (players[i].vel * Math.sin(players[i].rot*Math.PI/180));
    players[i].yMid += -(players[i].vel * Math.cos(players[i].rot*Math.PI/180));
  }

  if (ball.velX < -3) {
    ball.velX = -3;
    ball.x += ball.velX;
  } else {
    ball.x += ball.velX;
  }
  if (ball.velY < -3) {
    ball.velX = -3;
    ball.x += ball.velX;
  } else {
    ball.x += ball.velX;
  }

  if (ball.velX > 3) {
    ball.velX = 3;
    ball.x += ball.velX;
  } else {
    ball.x += ball.velX;
  }
  if (ball.velY > 3) {
    ball.velY = 3;
    ball.y += ball.velY;
  } else {
    ball.y += ball.velY;
  }

  ballWallCollisionDetect();
  carWallCollisionDetect();
  carFrontBallCollision(frontFaceToBallCalc(players));
  carRightBallCollision(rightFaceToBallCalc(players));
  carLeftBallCollision(leftFaceToBallCalc(players));
  carBottomBallCollision(bottomFaceToBallCalc(players));

  console.log("ballVelX = " + ball.velX + "   ballVelY = " + ball.velY);
}

/* PLAYER CONSTRUCTOR */

function Player(color, xInitial, yInitial, rotInitial) {
  this.color = color;
  this.x = xInitial;
  this.y = yInitial;
  this.rot = rotInitial;
  this.vel = 0;
  this.width = 45;
  this.height = 75;
  this.xMid = this.x + this.width/2;
  this.yMid = this.y + this.height/2;
  this.draw = function() {
    var drawing = new Image();
    drawing.src = "assets/Car.png";

    canvas.save();
    canvas.translate(this.xMid, this.yMid);
    canvas.rotate(this.rot*Math.PI/180);
    canvas.drawImage(drawing, -this.width/2, -this.height/2,this.width,this.height);
    canvas.restore();
  }
}

/* CREATE TWO PLAYERS */

player1 = new Player("dodgerblue", CANVAS_WIDTH/4-45/2, CANVAS_HEIGHT/2-75/2, 90);
player2 = new Player("orange", CANVAS_WIDTH/4*3-45/2, CANVAS_HEIGHT/2-75/2, -90);
players.push(player1, player2);

/* DEFINE BALL OBJECT */

var ball = {
  color: "black",
  x: CANVAS_WIDTH/2,
  y: CANVAS_HEIGHT/2,
  radius: 30,
  velX: 0,
  velY: 0,
  draw: function() {
    canvas.beginPath();
    canvas.arc(this.x, this.y, ball.radius, 0, 2*Math.PI);
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.stroke();
  }
}


function KeyboardController(keys, repeat) {
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
  // PLAYER 1 CONTROLS
  // left
    37: function() { players[0].rot -= 8; },
  // up
    38: function() { players[0].vel += .1; },
  // right
    39: function() { players[0].rot += 8; },
  // down
    40: function() { players[0].vel -= .1; },
  // PLAYER 2 CONTROLS
  // A
    65: function() { players[1].rot -= 8; },
  // W
    87: function() { players[1].vel += .1; },
  // D
    68: function() { players[1].rot += 8; },
  // S
    83: function() { players[1].vel -= .1; },
}, 50);

// Define CORNERS
  var northEastCorner, northWestCorner, southEastCorner, southWestCorner;
  var arrayX, arrayY;

function carWallCollisionDetect() {

  for (var i=0; i<players.length; i++) {
    var sinTheta = Math.sin(players[i].rot*Math.PI/180);
    var cosTheta = Math.cos(players[i].rot*Math.PI/180);


    //Actually SouthEast corner on canvas
    players[i].southEastCorner = [players[i].xMid + ((players[i].width/2)*cosTheta) - ((players[i].height/2)*sinTheta),
                       players[i].yMid + ((players[i].width/2)*sinTheta) + ((players[i].height/2)*cosTheta)
                       ];

    //Actually SouthWest corner on canvas
    players[i].southWestCorner = [players[i].xMid + ((-players[i].width/2)*cosTheta) - ((players[i].height/2)*sinTheta),
                       players[i].yMid + ((-players[i].width/2)*sinTheta) + ((players[i].height/2)*cosTheta)
                       ];

    //Actually NorthEast corner on canvas
    players[i].northEastCorner = [players[i].xMid + ((players[i].width/2)*cosTheta) - ((-players[i].height/2)*sinTheta),
                       players[i].yMid + ((players[i].width/2)*sinTheta) + ((-players[i].height/2)*cosTheta)
                       ];


    //Actually NorthWest corner on canvas
    players[i].northWestCorner = [players[i].xMid + ((-players[i].width/2)*cosTheta) - ((-players[i].height/2)*sinTheta),
                       players[i].yMid + ((- players[i].width/2)*sinTheta) + ((-players[i].height/2)*cosTheta)
                       ];

    players[i].arrayX = [players[i].northEastCorner[0],
                         players[i].northWestCorner[0],
                         players[i].southEastCorner[0],
                         players[i].southWestCorner[0]
                         ];
    players[i].arrayY = [players[i].northEastCorner[1],
                         players[i].northWestCorner[1],
                         players[i].southEastCorner[1],
                         players[i].southWestCorner[1]
                         ];

    // Check X values
    for (var j=0; j < players[i].arrayX.length; j++) {
      if (players[i].arrayX[j] >= CANVAS_WIDTH) {
        while (players[i].arrayX[j] >= CANVAS_WIDTH) {
          players[i].xMid -= 2;
          carWallCollisionDetect();
        }
      }
      if (players[i].arrayX[j] <= 0) {
        while (players[i].arrayX[j] <= 0) {
          players[i].xMid += 2;
          carWallCollisionDetect();
        }
      }
    }
    // Check Y values
    for (var j=0; j < players[i].arrayY.length; j++) {
      if (players[i].arrayY[j] >= CANVAS_HEIGHT) {
        while (players[i].arrayY[j] >= CANVAS_HEIGHT) {
          players[i].yMid -= 2;
          carWallCollisionDetect();
        }
      }
      if (players[i].arrayY[j] <= 0) {
        while (players[i].arrayY[j] <= 0) {
          players[i].yMid += 2;
          carWallCollisionDetect();
        }
      }
    }
  }
}

Math.roundTo = function(place, value) {
  return Math.round(value * place) / place;
}

// PASS IN players[], returns perpendicular distance of both players from face to ball center
function frontFaceToBallCalc(playerArray) {
  var distVect = [];
  var distMag = [];
  for (var i=0; i < playerArray.length; i++) {
    var frontFaceVector = [playerArray[i].arrayX[0] - playerArray[i].arrayX[1], playerArray[i].arrayY[0] - playerArray[i].arrayY[1]];
    var frontFaceMag = playerArray[i].width;
    var frontFacePtv = [ball.x - playerArray[i].arrayX[1], ball.y - playerArray[i].arrayY[1]];
    var unitFrontFaceVector=[];
    var projFrontVect=[];
    var closest=[];

    for (var j=0; j<2; j++) {
      unitFrontFaceVector[j] = frontFaceVector[j]/frontFaceMag;
    }

    var projFrontMag = math.dot(frontFacePtv, unitFrontFaceVector);

    if (projFrontMag < 0) {
      closest = [playerArray[i].arrayX[0], playerArray[i].arrayY[0]];
    } else if (projFrontMag > frontFaceMag) {
      closest = [playerArray[i].arrayX[1], playerArray[i].arrayY[1]];
    } else {
      for (var j=0; j<2; j++) {
        projFrontVect[j] = projFrontMag*unitFrontFaceVector[j];
      }
      closest = [playerArray[i].arrayX[1] + projFrontVect[0] , playerArray[i].arrayY[1] + projFrontVect[1]];
    }

    distVect[i] = [ball.x - closest[0], ball.y - closest[1]];
    distMag[i] = Math.hypot(distVect[i][0], distVect[i][1]);

  }
  return [distMag[0], distMag[1]];
}

// PASS IN output from frontFaceToBallCalc(), returns nothing, affects speed/direction of ball if impacted by a car
function carFrontBallCollision(outputFromFrontFaceToBallCalc) {
  for (var i=0; i < 2; i++) {
    var frontFaceResult = outputFromFrontFaceToBallCalc[i];

    // IF CONTACT OCCURS
    if (frontFaceResult < ball.radius) {
      // ball.color = "white";
      var velMag;
      var turnAngle = players[i].rot*Math.PI/180;
      var bounceAngle = Math.atan(ball.velY / (ball.velX + players[i].vel));

      velMag = Math.hypot(ball.velY, (ball.velX + players[i].vel));

      var resultAngle = turnAngle + bounceAngle  + Math.PI/2;

      ball.velX = -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.velY = -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      ball.x += -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.y += -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      // CHANGE PLAYER SPEED REDUCTION AFTER HIT */
      players[i].vel *= .50;
    }
  }
}

// PASS IN players[], returns perpendicular distance of both players from face to ball center
function rightFaceToBallCalc(playerArray) {
  var distVect = [];
  var distMag = [];
  for (var i=0; i < playerArray.length; i++) {
    var rightFaceVector = [playerArray[i].arrayX[2] - playerArray[i].arrayX[0], playerArray[i].arrayY[2] - playerArray[i].arrayY[0]];
    var rightFaceMag = playerArray[i].height;
    var rightFacePtv = [ball.x - playerArray[i].arrayX[0], ball.y - playerArray[i].arrayY[0]];
    var unitRightFaceVector=[];
    var projRightVect=[];
    var closest=[];

    for (var j=0; j<2; j++) {
      unitRightFaceVector[j] = rightFaceVector[j]/rightFaceMag;
    }

    var projRightMag = math.dot(rightFacePtv, unitRightFaceVector);

    if (projRightMag < 0) {
      closest = [playerArray[i].arrayX[2], playerArray[i].arrayY[2]];
    } else if (projRightMag > rightFaceMag) {
      closest = [playerArray[i].arrayX[0], playerArray[i].arrayY[0]];
    } else {
      for (var j=0; j<2; j++) {
        projRightVect[j] = projRightMag*unitRightFaceVector[j];
      }
      closest = [playerArray[i].arrayX[0] + projRightVect[0] , playerArray[i].arrayY[0] + projRightVect[1]];
    }

    distVect[i] = [ball.x - closest[0], ball.y - closest[1]];
    distMag[i] = Math.hypot(distVect[i][0], distVect[i][1]);

  }
  return [distMag[0], distMag[1]];
}

// PASS IN output from rightFaceToBallCalc(), returns nothing, affects speed/direction of ball if impacted by a car
function carRightBallCollision(outputFromRightFaceToBallCalc) {
  for (var i=0; i < 2; i++) {
    var rightFaceResult = outputFromRightFaceToBallCalc[i];

    // IF CONTACT OCCURS
    if (rightFaceResult < ball.radius) {
      // ball.color = "red";
      var velMag;
      var turnAngle = players[i].rot*Math.PI/180;
      var bounceAngle = Math.atan(ball.velY / (ball.velX + players[i].vel));

      velMag = Math.hypot(ball.velY, (ball.velX + players[i].vel));

      var resultAngle = turnAngle + bounceAngle  + Math.PI/2;

      ball.velX = -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.velY = -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      ball.x += -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.y += -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      // CHANGE PLAYER SPEED REDUCTION AFTER HIT */
      players[i].vel *= .8;
    }
  }
}

// PASS IN players[], returns perpendicular distance of both players from face to ball center
function leftFaceToBallCalc(playerArray) {
  var distVect = [];
  var distMag = [];
  for (var i=0; i < playerArray.length; i++) {
    var leftFaceVector = [playerArray[i].arrayX[1] - playerArray[i].arrayX[3], playerArray[i].arrayY[1] - playerArray[i].arrayY[3]];
    var leftFaceMag = playerArray[i].height;
    var leftFacePtv = [ball.x - playerArray[i].arrayX[3], ball.y - playerArray[i].arrayY[3]];
    var unitLeftFaceVector=[];
    var projLeftVect=[];
    var closest=[];

    for (var j=0; j<2; j++) {
      unitLeftFaceVector[j] = leftFaceVector[j]/leftFaceMag;
    }

    var projLeftMag = math.dot(leftFacePtv, unitLeftFaceVector);

    if (projLeftMag < 0) {
      closest = [playerArray[i].arrayX[1], playerArray[i].arrayY[1]];
    } else if (projLeftMag > leftFaceMag) {
      closest = [playerArray[i].arrayX[3], playerArray[i].arrayY[3]];
    } else {
      for (var j=0; j<2; j++) {
        projLeftVect[j] = projLeftMag*unitLeftFaceVector[j];
      }
      closest = [playerArray[i].arrayX[3] + projLeftVect[0] , playerArray[i].arrayY[3] + projLeftVect[1]];
    }

    distVect[i] = [ball.x - closest[0], ball.y - closest[1]];
    distMag[i] = Math.hypot(distVect[i][0], distVect[i][1]);

  }
  return [distMag[0], distMag[1]];
}

// PASS IN output from leftFaceToBallCalc(), returns nothing, affects speed/direction of ball if impacted by a car
function carLeftBallCollision(outputFromLeftFaceToBallCalc) {
  for (var i=0; i < 2; i++) {
    var leftFaceResult = outputFromLeftFaceToBallCalc[i];

    // IF CONTACT OCCURS
    if (leftFaceResult < ball.radius) {
      // ball.color = "lime";
      var velMag;
      var turnAngle = players[i].rot*Math.PI/180;
      var bounceAngle = Math.atan(ball.velY / (ball.velX + players[i].vel));

      velMag = Math.hypot(ball.velY, (ball.velX + players[i].vel));

      var resultAngle = turnAngle + bounceAngle  + Math.PI/2;

      ball.velX = -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.velY = -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      ball.x += -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.y += -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      // CHANGE PLAYER SPEED REDUCTION AFTER HIT */
      players[i].vel *= .8;
    }
  }
}

// PASS IN players[], returns perpendicular distance of both players from face to ball center
function bottomFaceToBallCalc(playerArray) {
  var distVect = [];
  var distMag = [];
  for (var i=0; i < playerArray.length; i++) {
    var bottomFaceVector = [playerArray[i].arrayX[2] - playerArray[i].arrayX[3], playerArray[i].arrayY[2] - playerArray[i].arrayY[3]];
    var bottomFaceMag = playerArray[i].width;
    var bottomFacePtv = [ball.x - playerArray[i].arrayX[3], ball.y - playerArray[i].arrayY[3]];
    var unitBottomFaceVector=[];
    var projBottomVect=[];
    var closest=[];

    for (var j=0; j<2; j++) {
      unitBottomFaceVector[j] = bottomFaceVector[j]/bottomFaceMag;
    }

    var projBottomMag = math.dot(bottomFacePtv, unitBottomFaceVector);

    if (projBottomMag < 0) {
      closest = [playerArray[i].arrayX[2], playerArray[i].arrayY[2]];
    } else if (projBottomMag > bottomFaceMag) {
      closest = [playerArray[i].arrayX[3], playerArray[i].arrayY[3]];
    } else {
      for (var j=0; j<2; j++) {
        projBottomVect[j] = projBottomMag*unitBottomFaceVector[j];
      }
      closest = [playerArray[i].arrayX[3] + projBottomVect[0] , playerArray[i].arrayY[3] + projBottomVect[1]];
    }

    distVect[i] = [ball.x - closest[0], ball.y - closest[1]];
    distMag[i] = Math.hypot(distVect[i][0], distVect[i][1]);

  }
  return [distMag[0], distMag[1]];
}

// PASS IN output from bottomFaceToBallCalc(), returns nothing, affects speed/direction of ball if impacted by a car
function carBottomBallCollision(outputFromBottomFaceToBallCalc) {
  for (var i=0; i < 2; i++) {
    var bottomFaceResult = outputFromBottomFaceToBallCalc[i];

    // IF CONTACT OCCURS
    if (bottomFaceResult < ball.radius) {
      // ball.color = "blue";
      var velMag;
      var turnAngle = players[i].rot*Math.PI/180;
      var bounceAngle = Math.atan(ball.velY / (ball.velX + players[i].vel));

      velMag = Math.hypot(ball.velY, (ball.velX + players[i].vel));

      var resultAngle = turnAngle + bounceAngle  + Math.PI/2;

      ball.velX = velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.velY = -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      ball.x += -velMag * Math.roundTo(100000, Math.cos(resultAngle));
      ball.y += -velMag * Math.roundTo(100000, Math.sin(resultAngle));

      // CHANGE PLAYER SPEED REDUCTION AFTER HIT */
      players[i].vel *= .8;
    }
  }
}

function ballWallCollisionDetect() {
  if (ball.x + ball.radius >= CANVAS_WIDTH) {
    ball.velX = -ball.velX;
    while (ball.x + ball.radius >= CANVAS_WIDTH) {
      ball.x -= 2;
    }
  }
  if (ball.x - ball.radius <= 0) {
    ball.velX = -ball.velX;
    while (ball.x - ball.radius <= 0) {
      ball.x += 2;
    }
  }
  if (ball.y + ball.radius >= CANVAS_HEIGHT) {
    ball.velY = -ball.velY;
    while (ball.y + ball.radius >= CANVAS_HEIGHT) {
      ball.y -= 2;
    }
  }
  if (ball.y - ball.radius <= 0) {
    ball.velY = -ball.velY;
    while (ball.y - ball.radius <= 0) {
      ball.y += 2;
    }
  }
}

/* BALL SPEED DECAY */
function ballFriction(friction) {
  if (Math.hypot(ball.velX, ball.velY) > .5) {
    ball.velX -= ball.velX*friction;
    ball.velY -= ball.velY*friction;
  }
}

// // SPEED DECAY FUNCTION CALL
setInterval(function() {
  ballFriction(.2)}, 600);

// FPS SETTING
var FPS = 60;
setInterval(function() {
  update();
  requestAnimationFrame(draw);
}, 1000/FPS);




/* CORNER HIT DETECTION */

// TAKES ARRAY corner AND TESTS IF IT IS WITHIN THE BALL
// function testCornerInBall(corner) {
//   // corner[0] = x
//   // corner[1] = y
//   // Uses equation of a circle to calculate if corner lies within the ball
//   if (Math.pow(corner[0] - ball.x, 2) + Math.pow(corner[1] - ball.y, 2) < Math.pow(ball.radius, 2)) {
//     console.log("cornerDETECTED");
//     return true;
//   } else {
//     return false;
//   }
// }

// /* CORNER HIT RESPONSE */

// function northEastCornerHit() {
//   if (testCornerInBall(southEastCorner)) {

//     ball.color = "orange";
//     ball.velY += -player1.vel*Math.cos(player1.rot*Math.PI/180);
//     ball.velX += player1.vel*Math.sin(player1.rot*Math.PI/180);
//   }
// }

// function northWestCornerHit() {
//   if (testCornerInBall(southWestCorner)) {

//     ball.color = "teal";
//     ball.velY += -player1.vel*Math.cos(player1.rot*Math.PI/180);
//     ball.velX += player1.vel*Math.sin(player1.rot*Math.PI/180);
//   }
// }

// function southEastCornerHit() {
//   if (testCornerInBall(northEastCorner)) {

//     ball.color = "chartreuse";
//     ball.velY += -player1.vel*Math.cos(player1.rot*Math.PI/180);
//     ball.velX += player1.vel*Math.sin(player1.rot*Math.PI/180);
//   }
// }

// function southWestCornerHit() {
//   if (testCornerInBall(northWestCorner)) {

//     ball.color = "pink";
//     ball.velY += -player1.vel*Math.cos(player1.rot*Math.PI/180);
//     ball.velX += player1.vel*Math.sin(player1.rot*Math.PI/180);
//   }
// }

