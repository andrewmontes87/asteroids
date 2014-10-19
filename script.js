// NOTES
// next steps:
// powerups - different weapons
// level generator
// boss fight


// Create Game globals
var globals = {
  message: {
    txt: "",
    pos: {
      x: 10,
      y: 25
    }
  },
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
    globals.message.txt = "Score: " + globals.score;

    // Create Player instance
    c.entities.create(Player, {
      center: {
        x: 20,
        y: globals.canvasHeight/2
      }
    });
    // Create EnemyGenerator intance 
    c.entities.create(EnemyGenerator, {});

  },
  winGame: function(c) {
    while (c.entities.all().length) {
      c.entities.destroy(c.entities.all()[0]);
    }
    globals.message.txt = "Winner! Score: " + globals.score;
    globals.message.pos.x = globals.canvasWidth/2;
    globals.message.pos.y = globals.canvasHeight/2;
  }
};

// Game class
var Game = function() {
  // Create Game instance
  this.c = new Coquette(this, "canvas", globals.canvasWidth, globals.canvasHeight, globals.canvasBgcolor);
  globals.newGame(this.c);

  this.draw = function (ctx) {
    ctx.fillStyle = "blue";
    ctx.font = "bold 16px Arial";
    ctx.fillText(globals.message.txt, globals.message.pos.x, globals.message.pos.y);
  };

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
      };
      game.c.entities.create(Bullet, { 
        size : { x:3 , y:3 }, 
        angle: player.angle,
        center: bulletCenter,
        vel: bulletVel,
        type: "Player",
        color:"red"
      });     
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
    }    
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
    if (other.name === 'Enemy' || other.name === 'Boss' || other.name === 'Bullet' && other.type === 'Enemy'){
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

// EnemyGenerator class
var EnemyGenerator = function(game, settings) {
  this.name = 'EnemyGenerator';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }
  this.age = 0;
  this.enemyModels = {
    basic: {
      name: 'Enemy',
      timestamp: 0,
      center: {
        x: globals.canvasWidth,
        y: globals.CanvasHeight/2
      },
      path: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      },
      vel: {
        x: -1,
        y: 0
      },
      angle: (Math.random() > 0.5) ? 215 : 145,
      angle_vel: 0.2,
      health: 100,
      size: { x:20 , y:20 },
      color: 'magenta',
      gun: {
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
      }
    },
    boss: {
      name: 'Boss',
      timestamp: 0,
      center: {
        x: globals.canvasWidth,
        y: globals.canvasHeight/2
      },
      vel: {
        x: -2,
        y: 0
      },
      angle: 180,
      angle_vel: 0.1,
      health: 3000,
      size: { x:150 , y:150 },
      color: 'red',
      gun: {
        age: 0,
        shoot: function(shooter) {
          var forward = globals.angleToVector(shooter.angle);     
          var forwardPlus = globals.angleToVector(shooter.angle+15);
          var forwardNeg = globals.angleToVector(shooter.angle-15);
          var bulletCenter = {
            x: shooter.center.x + (shooter.size.x/2 + 10) * forward.x,
            y: shooter.center.y + (shooter.size.y/2 + 10) * forward.y
          };
          var bulletCenterPlus = {
            x: shooter.center.x + (shooter.size.x/2 + 10) * forward.x,
            y: shooter.center.y + (shooter.size.y/2 + 8) * forward.y
          };
          var bulletCenterNeg = {
            x: shooter.center.x + (shooter.size.x/2 + 10) * forward.x,
            y: shooter.center.y + (shooter.size.y/2 + 12) * forward.y
          };
          var bulletVel = {
            x: 6 * forward.x,
            y: 6 * forward.y
          };
          var bulletVelPlus = {
            x: 6 * forwardPlus.x,
            y: 6 * forwardPlus.y
          };
          var bulletVelNeg = {
            x: 6 * forwardNeg.x,
            y: 6 * forwardNeg.y
          };
          game.c.entities.create(Bullet, { 
            size : { x:3 , y:3 }, 
            angle: shooter.angle,
            center: bulletCenter,
            vel: bulletVel,
            type: "Enemy",
            color:"black"
          }); 
          game.c.entities.create(Bullet, { 
            size : { x:3 , y:3 }, 
            angle: shooter.angle+15,
            center: bulletCenterPlus,
            vel: bulletVelPlus,
            type: "Enemy",
            color:"black"
          }); 
          game.c.entities.create(Bullet, { 
            size : { x:3 , y:3 }, 
            angle: shooter.angle-15,
            center: bulletCenterNeg,
            vel: bulletVelNeg,
            type: "Enemy",
            color:"black"
          });     
        }   
      }
    },
  };
  this.waves = [
    {
      times: [0, 200],
      center: { 
        x: globals.canvasWidth,
        y: globals.canvasHeight/4
      },
      path: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      }
    },
    {
      times: [500, 700],
      center: { 
        x: globals.canvasWidth,
        y: globals.canvasHeight - globals.canvasHeight/4
      },
      path: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      }
    },
    {
      times: [1000, 1200],
      center: { 
        x: globals.canvasWidth,
        y: globals.canvasHeight/4
      },
      path: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      }
    },
    {
      times: [1500, 1700],
      center: { 
        x: globals.canvasWidth,
        y: globals.canvasHeight - globals.canvasHeight/4
      },
      path: {
        x: globals.canvasWidth/2,
        y: globals.canvasHeight/2
      }
    }
  ];

  this.update = function() {
    this.age++;
    for (var i = 0; i < this.waves.length; i++) {
      if (this.age > this.waves[i].times[0] && this.age < this.waves[i].times[1]) {
        if (!(this.age % 30)) {
          this.spawnEnemy(this.enemyModels.basic, {
            center: {
              x: this.waves[i].center.x,
              y: this.waves[i].center.y,
            },
            path: {
              x: this.waves[i].path.x,
              y: this.waves[i].path.y,
            }
          });
        }
      }      
    }
    if (this.age > (this.waves[this.waves.length-1].times[1] + 200)) {
      if (!this.c.entities.all(Boss).length) {
        this.spawnBoss(this.enemyModels.boss, {});
      }
    }
  };

  this.spawnBoss = function (model, overrides) {
    var boss = jQuery.extend(true, {}, model);
    boss.timestamp = this.age;
    for (var i in overrides) {
      boss[i] = overrides[i];
    }
    // Create boss instance
    this.c.entities.create(Boss, { 
      center: boss.center,
      vel: boss.vel,
      angle: boss.angle,
      angle_vel: boss.angle_vel,
      health: boss.health,
      size : boss.size, 
      color: boss.color,
      gun: boss.gun
    }); 
  }

  this.spawnEnemy = function (model, overrides) {
    var enemy = jQuery.extend(true, {}, model);
    enemy.timestamp = this.age;
    for (var i in overrides) {
      enemy[i] = overrides[i];
    }
    // Create enemy instance
    this.c.entities.create(Enemy, { 
      center: enemy.center,
      vel: enemy.vel,
      angle: enemy.angle,
      angle_vel: enemy.angle_vel,
      path: enemy.path,
      health: enemy.health,
      size : enemy.size, 
      color: enemy.color,
      gun: enemy.gun
    });    
  };
};

// Boss class
var Boss = function(game, settings) {
  this.name = 'Boss';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }

  this.update = function() {
    this.angle += this.angle_vel;
    if (this.angle >= 190 || this.angle <= 170) {
      this.angle_vel = -this.angle_vel;
    }
    this.center.x += this.vel.x;
    this.center.y += this.vel.y;
    if (this.center.x <= 700) {
      this.vel.x = 0;
      if (this.vel.y === 0) {
        this.vel.y = (Math.random() >= 0.5) ? -1: 1;
      } else if (this.center.y >= (globals.canvasHeight - this.size.y)) {
        this.vel.y = -1;
      } else if (this.center.y <= this.size.y) {
        this.vel.y = 1;
      }
    }

    if (this.health <= 0) {
      globals.winGame(this.c);
    }
    this.gun.age++;
    if (!(this.gun.age % 20)) {
      this.gun.shoot(this);
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

// Enemy class
var Enemy = function(game, settings) {
  this.name = 'Enemy';
  this.c = game.c;
  for (var i in settings) {
    this[i] = settings[i];
  }

  this.update = function() {
    this.angle += this.angle_vel;
    if (this.angle >= 215 || this.angle <= 145) {
      this.angle_vel -= this.angle_vel * 2;
    } 
    if (this.center.x > this.path.x) {
      this.center.x -=2;
    } else if (this.center.y === this.path.y) {
      this.center.x -=2;
    } else if (this.center.y < this.path.y) {
      this.center.y +=1;
    } else if (this.center.y > this.path.y) {
      this.center.y -=1;
    } 
    
    this.angle += this.angle_vel;
    if (this.center.x <= 0) {
      globals.score -= 100;
      this.c.entities.destroy(this);
    }
    if (this.health <= 0) {
      globals.score += 90;
      this.c.entities.destroy(this);
    }
    this.gun.age++;
    if (!(this.gun.age % 20)) {
      this.gun.shoot(this);
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
    if ((other.name === 'Enemy' && this.type !== 'Enemy') || (other.name === 'Boss' && this.type !== 'Enemy')){
      other.health -= 100;
      globals.score += 10;
      globals.message.txt = "Score: " + globals.score;
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