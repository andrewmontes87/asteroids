// NOTES
// next steps:
// powerups - different weapons
// enemy paths
// level generator
// boss fight


// Create Game globals
var globals = {
  bulletSpeed: 2,
  canvasHeight: 500,
  canvasWidth: 900,
  canvasBgcolor: "#ddd",
  angleToVector: function(ang){
    return {
      x: Math.cos(ang * (Math.PI/180)), 
      y: Math.sin(ang * (Math.PI/180))
    };
  },
  dist: function(p, q) {
    return Math.sqrt(Math.pow((p.x - q.x), 2) + Math.pow((p.y - q.y), 2));
  },
    
  newGame: function(c) {

    while (c.entities.all().length) {
      c.entities.destroy(c.entities.all()[0]);
    }
    globals.score = 0;
    document.getElementById('score').innerHTML = globals.score;

    // Create Player instance
    c.entities.create(Player, {
      center: {
        x: 20,
        y: globals.canvasHeight/2
      }
    });
    // Create AsteroidGenerator intance 
    c.entities.create(AsteroidGenerator, {});

  }
};

// Game class
var Game = function() {
  // Create Game instance
  this.c = new Coquette(this, "canvas", globals.canvasWidth, globals.canvasHeight, globals.canvasBgcolor);
  globals.newGame(this.c);

};

// Player class
var Player = function(game, settings) {
  this.name = 'Player';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.size = { 
    x:20, 
    y:10 
  }; 
  this.vel = {
    x: 0,
    y: 0
  };
  this.color = "blue";
  this.angle = 0;
  this.mousePos = {};
  this.gun = {
    firing: false,
    age: 0,
    shoot: function(player) {
      var forward = globals.angleToVector(player.angle);
      var bulletCenter = {
        x: player.center.x + 15  * forward.x,
        y: player.center.y + 15 * forward.y
      };
      var bulletVel = {
        x: 6 * forward.x,
        y: 6 * forward.y
      }
      if (game.c.entities.all(Bullet).length < 40) {
         game.c.entities.create(Bullet, { 
          size : { x:3 , y:3 }, 
          angle: player.angle,
          center: bulletCenter,
          vel: bulletVel,
          type: "Player",
          color:"red"
        });     
      }
    }
  };

  this.update = function() {

    if (this.c.inputter.isDown(this.c.inputter.LEFT_MOUSE) && this.center !== this.mousePos) {
      this.mousePos = this.c.inputter.getMousePosition();
      var slope = (this.mousePos.y - this.center.y) / (this.mousePos.x - this.center.x);
      var arctan = Math.atan(slope) * (180/Math.PI);
      var forward = 0;
      if (this.mousePos.x <= this.center.x) {
        forward = globals.angleToVector(arctan + 180);
      } else {
        forward = globals.angleToVector(arctan);
      }
      this.vel.x = 5 * forward.x;
      this.vel.y = 5 * forward.y;
      this.center.x += this.vel.x;
      this.center.y += this.vel.y;
      if (this.center.y > 5) {
        this.center.y -= 5;
      } 
      if (this.center.y < globals.canvasHeight) {
        this.center.y += 5;
      }
      if (this.center.x > 5) {
        this.center.x -= 5;
      } 
      if (this.center.x < globals.canvasWidth) {
        this.center.x += 5;
      }
      console.log()
    };    
    // keyhandlers
    if (this.c.inputter.isDown(this.c.inputter.UP_ARROW)) {
      if (this.center.y > 5) {
        this.center.y -= 5;
      } 
    } 
    if (this.c.inputter.isDown(this.c.inputter.DOWN_ARROW)) {
      if (this.center.y < globals.canvasHeight) {
        this.center.y += 5;
      }
    } 
    if (this.c.inputter.isDown(this.c.inputter.LEFT_ARROW)) {
      if (this.center.x > 5) {
        this.center.x -= 5;
      } 
    } 
    if (this.c.inputter.isDown(this.c.inputter.RIGHT_ARROW)) {
      if (this.center.x < globals.canvasWidth) {
        this.center.x += 5;
      }
    } 
    // gun handler
    if (this.gun.firing) {
      this.gun.age++;
      if (this.c.inputter.isDown(this.c.inputter.SPACE) ||
        this.c.inputter.isDown(this.c.inputter.LEFT_MOUSE)) {
        if (!(this.gun.age % 10)) {
          this.gun.shoot(this);
        }
      } else {
        this.gun.firing = false;
        this.gun.age = 0;
      }
    } else if (this.c.inputter.isDown(this.c.inputter.SPACE) ||
      this.c.inputter.isDown(this.c.inputter.LEFT_MOUSE)) {
      this.gun.firing = true;
      this.gun.age = 0;
      this.gun.shoot(this);
    }

  };

  this.collision = function(other) {
    if (other.name === 'Asteroid' || other.name === 'Bullet' && other.type === 'Enemy'){
      this.c.entities.destroy(this);
      globals.newGame(this.c);
    }
  };

  this.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  };
};

// AsteroidGenerator class
var AsteroidGenerator = function(game, settings) {
  this.name = 'AsteroidGenerator';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.age = 0;
  this.update = function() {
    this.age++;
    if  (!(this.age % 100)) {
      this.asteroidCenter = {
        x: globals.canvasWidth - 20,
        y: globals.canvasHeight * Math.random()
      };
      this.asteroidVel = {
        x: -1,
        y: 0
      };
      this.asteroidAngle = 180;
      // Create Asteroid instance
      this.c.entities.create(Asteroid, { 
        center: this.asteroidCenter,
        vel: this.asteroidVel,
        angle: this.asteroidAngle,
        size : { x:20 , y:20 }, 
        color:'magenta'
      });
    }
  };
};

// Asteroid class
var Asteroid = function(game, settings) {
  this.name = 'Asteroid';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.health = 200;
  var dice = Math.random();
  this.angle_vel = Math.random();
  this.angle_vel = (dice > 0.5) ? this.angle_vel : -this.angle_vel;
  this.gun = {
    age: 0,
    shoot: function(shooter) {
      var forward = globals.angleToVector(shooter.angle);     
      var bulletCenter = {
        x: shooter.center.x + 15 * forward.x,
        y: shooter.center.y + 15 * forward.y
      };
      var bulletVel = {
        x: 6 * forward.x,
        y: 6 * forward.y
      };
      if (game.c.entities.all(Bullet).length < 40) {
         game.c.entities.create(Bullet, { 
          size : { x:3 , y:3 }, 
          angle: shooter.angle,
          center: bulletCenter,
          vel: bulletVel,
          type: "Enemy",
          color:"black"
        });     
      }
    }
  };

  this.update = function() { 
    this.center.x -=2
    this.angle += this.angle_vel;
    if (this.center.x <= 0) {
      globals.score -= 100;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
    }
    if (this.health <= 0) {
      globals.score += 90;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
    }
    this.gun.age++;
    if (!(this.gun.age % 20)) {
      this.gun.shoot(this);
    }
  };

  this.draw = function(ctx) {
    ctx.fillStyle = settings.color;
    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  };
};


// Bullet class
var Bullet = function(game, settings) {
  this.name = 'Bullet';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.lifespan = settings.lifespan;
  this.age = 0;

  this.update = function() {
    this.age++;
    this.center.x += this.vel.x;
    this.center.y += this.vel.y;
    if (this.center.x >= globals.canvasWidth || 
        this.center.x <= 0 ||
        this.center.y >= globals.canvasHeight ||
        this.center.y <= 0) {
      this.c.entities.destroy(this);
    }

  };

  this.collision = function(other) {
    if (other.name === 'Asteroid' && this.type !== 'Enemy'){
      other.health -= 100;
      globals.score += 10;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
    } else if (other.name === 'Player' && this.type === 'Enemy') {
      this.c.entities.destroy(this);
      this.c.entities.destroy(other);
    }

  };

  this.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.center.x - this.size.x / 2,
                 this.center.y - this.size.y / 2,
                 this.size.x,
                 this.size.y);
  };
};

// Start the game
window.addEventListener('load', function() {
  new Game();
});