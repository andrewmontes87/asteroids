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
      if (game.c.entities.all(Bullet).length < 40) {
         game.c.entities.create(Bullet, { 
          size : { x:3 , y:3 }, 
          angle: player.angle,
          center: bulletCenter,
          vel: bulletVel,
          color:"red"
        });     
      }
    }
  };

  this.update = function() {
    // keyhandlers
    if (this.center.y < 0) {
      this.center.y = 5;
    } else if (this.center.y > globals.canvasHeight) {
      this.center.y = globals.canvasHeight - 5;
    }


    if (this.c.inputter.isDown(this.c.inputter.UP_ARROW)) {
      if (this.center.y > 5) {
        this.center.y -= 7.5;
      } 
    } 
    if (this.c.inputter.isDown(this.c.inputter.DOWN_ARROW)) {
      if (this.center.y < globals.canvasHeight) {
        this.center.y += 7.5;
      }
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
    if (other.name === 'Asteroid'){
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
  this.health = 100;

  this.update = function() { 
    this.center.x -= 2;

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
    this.center.x += 6;
    if (this.center.x >= globals.canvasWidth) {
      this.c.entities.destroy(this);
    }

  };

  this.collision = function(other) {
    if (other.name === 'Player') {
      this.c.entities.destroy(this);
    } else if (other.name === 'Asteroid'){
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