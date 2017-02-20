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
      c.entities.destroy(c.entities.all()[0])
    }
    globals.score = 0;
    document.getElementById('score').innerHTML = globals.score;

    // Create Player instance
    c.entities.create(Player, {
      center: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      }
    });
    // Create AsteroidGenerator intance 
    c.entities.create(AsteroidGenerator, {});

    // Create Asteroid instance
    c.entities.create(Asteroid, { 
      center: {
        x: Math.random() * globals.canvasWidth,
        y: Math.random() * globals.canvasHeight
      },
        vel: {
        x: Math.random(),
        y: Math.random()
      },
      angle: 0,
      size : { x:20 , y:20 }, 
      color:'magenta'
    });
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
  this.angle_vel = 0;
  this.thrust = false;
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
        x: player.vel.x + 6  * forward.x,
        y: player.vel.y + 6 * forward.y
      };
      var bulletLifespan = 60;
      if (game.c.entities.all(Bullet).length < 20) {
         game.c.entities.create(Bullet, { 
          size : { x:3 , y:3 }, 
          angle: player.angle,
          center: bulletCenter,
          vel: bulletVel,
          lifespan: bulletLifespan,
          color:"red"
        });     
      }
    }
  };

  this.update = function() {
    // update angle
    this.angle += this.angle_vel;
    // update x
    if ((this.center.x + this.vel.x) >= globals.canvasWidth) {
      this.center.x = 0;
    } else if ((this.center.x + this.vel.x) <= 0) {
      this.center.x = globals.canvasWidth;
    } else {
      this.center.x = (this.center.x + this.vel.x);
    }
    // update y
    if ((this.center.y + this.vel.y) >= globals.canvasHeight) {
      this.center.y = 0;
    } else if ((this.center.y + this.vel.y) <= 0) {
      this.center.y = globals.canvasHeight;
    } else {
      this.center.y = (this.center.y + this.vel.y);
    }
    // update acceleration
    this.acc = globals.angleToVector(this.angle);
    // update vel
    if (this.thrust) {
      this.vel.x += this.acc.x * 0.1;
      this.vel.y += this.acc.y * 0.1;
    }
    // apply friction
    this.vel.x *= 0.99;
    this.vel.y *= 0.99;


    // keyhandlers
    // if (this.c.inputter.isDown(this.c.inputter.F)) {
    //   console.log('F');
    // }
    if (this.c.inputter.isDown(this.c.inputter.UP_ARROW)) {
      this.thrust = true;
    } else {
      this.thrust = false;
    }
    if (this.c.inputter.isDown(this.c.inputter.LEFT_ARROW)) {
      this.angle_vel -= 0.2;
    } else if (this.c.inputter.isDown(this.c.inputter.RIGHT_ARROW)) {
      this.angle_vel += 0.2;
    } else {
      this.angle_vel *= 0.95;
    }
    // gun handler
    if (this.gun.firing) {
      this.gun.age++;
      if (this.c.inputter.isDown(this.c.inputter.SPACE)) {
        if (!(this.gun.age % 20)) {
          this.gun.shoot(this);
        }
      } else {
        this.gun.firing = false;
        this.gun.age = 0;
      }
    } else if (this.c.inputter.isDown(this.c.inputter.SPACE)) {
      this.gun.firing = true;
      this.gun.age = 0;
      this.gun.shoot(this);
    }

  };

  this.collision = function(other) {
    if (other.name === 'Asteroid' || other.name === 'Wall'){
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
    if (!(this.age % 75)) {
      this.asteroidCenter = {
        x: Math.random() * globals.canvasWidth,
        y: Math.random() * globals.canvasHeight
      };
      while ((globals.dist(this.asteroidCenter, this.c.entities.all(Player)[0].center)) < 150) { 
        this.asteroidCenter = {
          x: Math.random() * globals.canvasWidth,
          y: Math.random() * globals.canvasHeight
        };
      };
      this.asteroidVel = {
        x: Math.random(),
        y: Math.random()
      };
      this.asteroidAngle = 0;
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
  var dice = Math.random();
  this.angle_vel = Math.random();
  this.angle_vel = (dice > 0.5) ? this.angle_vel : -this.angle_vel;
  this.health = 100;
  this.lifespan = 400;
  this.age = 0;

  this.update = function() { 
    this.angle += this.angle_vel;  
    if (this.health <= 0) {
      globals.score += 90;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
    }
    this.age++;
    if (this.age === this.lifespan) {
      this.c.entities.create(Wall, {
        center: this.center,
        size: this.size,
        angle: this.angle,
        angle_vel: this.angle_vel
      });
      this.c.entities.destroy(this);
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

// Asteroid class
var Wall = function(game, settings) {
  this.name = 'Wall';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.color = 'purple';
  this.health = 2000;

  this.update = function() {
    this.angle += this.angle_vel;
    if (this.health <= 0) {
      globals.score += 100;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
    }
    if (this.health <= 300) {
      this.color = 'black';
    } else {
      this.color = 'purple';
    }
    this.size.x += 0.05;
    this.size.y += 0.05;
    this.health += 5;
  };

  this.draw = function(ctx) {
    ctx.fillStyle = this.color;
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
    if ((this.center.x + this.vel.x) >= globals.canvasWidth) {
      this.center.x = 0;
    } else if ((this.center.x + this.vel.x) <= 0) {
      this.center.x = globals.canvasWidth;
    } else {
      this.center.x = (this.center.x + this.vel.x);
    }
    // update y
    if ((this.center.y + this.vel.y) >= globals.canvasHeight) {
      this.center.y = 0;
    } else if ((this.center.y + this.vel.y) <= 0) {
      this.center.y = globals.canvasHeight;
    } else {
      this.center.y = (this.center.y + this.vel.y);
    }
    if (this.age === this.lifespan) {
      this.c.entities.destroy(this);
    }

  };

  this.collision = function(other) {
    if (other.name === 'Player') {
      this.c.entities.destroy(this);
    } else if (other.name === 'Asteroid' || other.name === 'Wall'){
      other.health -= 100;
      globals.score += 10;
      document.getElementById('score').innerHTML = globals.score;
      this.c.entities.destroy(this);
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