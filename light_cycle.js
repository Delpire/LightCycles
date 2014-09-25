// Screen Size
var WIDTH = 800;
var HEIGHT = 480;

// Light Cycle class
//----------------------------------
var LightCycle = function(x, y, direction, color) {
  this.position = {x: x, y: y}
  this.velocity = 0.1;
  this.state = direction;  
  this.color = color;
};

LightCycle.prototype = {
	x: 0,
	y: 0,
	velocity: 0,

	turn: function(dir){

		switch(dir){
			case 0: // LEFT
				if(this.state != 'right'){
					this.state = 'left';
				}
				break;
			case 1: // UP
				if(this.state != 'down'){
					this.state = 'up';
				}
				break;
			case 2: // RIGHT
				if(this.state != 'left'){
					this.state = 'right';
				}
				break;
			case 3: // DOWN
				if(this.state != 'up'){
					this.state = 'down';
				}
				break;
		}

	},
	
	render: function(context) {
		context.save();
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.position.x, this.position.y, 5, 0, 2*Math.PI, false);
		context.fill();
		context.restore();
	},
	
	update: function(elapsedTime) {
	
		// Cycle state
		// http://gameprogrammingpatterns.com/state.html
		switch(this.state) {
			case 'left':
				this.position.x -= elapsedTime * this.velocity;
				break;
			case 'right': 
				this.position.x += elapsedTime * this.velocity;
				break;
			case 'up':
				this.position.y -= elapsedTime * this.velocity;
				break;
			case 'down':
				this.position.y += elapsedTime * this.velocity;
				break;
		}
	}	
	
};

// Game class
//----------------------------------
var Game = function (canvasId) {
  var myself = this;
  
  // Rendering variables
  this.screen = document.getElementById(canvasId);
  this.screenContext = this.screen.getContext('2d');
  
  // Game variables
  this.cycles = [
    new LightCycle(100, 240, 'right', 'red'),
	new LightCycle(700, 240, 'left', 'blue')
  ];
  
  // Timing variables
  this.startTime = 0;
  this.lastTime = 0;
  this.gameTime = 0;
  this.fps = 0;
  this.STARTING_FPS = 60;
}
	
Game.prototype = {

	// Update the game world.  See
	// http://gameprogrammingpatterns.com/update-method.html
	update: function(elapsedTime) {
		
		self.gameTime = self.gameTime + (elapsedTime / 1000);

		// update the cycles
		this.cycles.forEach( function(cycle) {
		  cycle.update(elapsedTime);
		});
		
		// check for collisions with walls
		
		// check for collisions between cycles
		
		// check for collisions between cycle and light path
		
	},
	
	render: function(elapsedTime) {
		self = this;
		
		// Render game objects
		this.cycles.forEach( function(cycle) {
			cycle.render(self.screenContext);
		});
		
		var expand = 0;

		if(self.gameTime >= 10){
			expand = 10;
		}
		
		if(self.gameTime >= 100){
			expand = 10;
		}

		self.screenContext.fillStyle = "black";
		self.screenContext.fillRect(5, 5, 18 + expand, 18);

		// Render GUI
		self.screenContext.fillStyle = "white";
  		self.screenContext.font = "bold 16px Arial";
  		self.screenContext.fillText(Math.floor(self.gameTime), 10, 20);
		
	},
	
	keyDown: function(e)
	{
		// If the keycode is an arrow key, turn cycle 1.
		// Otherwise, if it is w, a, s, or d, turn cycle 2.
		if(e.keyCode > 36 && e.keyCode < 41){
			this.cycles[0].turn(convertDirection(e.keyCode));
		}
		else if(e.keyCode == 87 | e.keyCode == 65 | e.keyCode == 83 | e.keyCode == 68){
			this.cycles[1].turn(convertDirection(e.keyCode));
		}

	},
	
	start: function() {
		var self = this;
    
		window.onkeydown = function (e) { self.keyDown(e); };
		
		this.startTime = Date.now();
		
		window.requestNextAnimationFrame(
			function(time) {
				self.loop.call(self, time);
			}
		);
	},
	
	// The game loop.  See
	// http://gameprogrammingpatterns.com/game-loop.html
	loop: function(time) {
		var self = this;
		
		if(this.paused || this.gameOver) this.lastTime = time;
		var elapsedTime = time - this.lastTime; 
		this.lastTime = time;
		
		self.update(elapsedTime);
		self.render(elapsedTime);
		
		window.requestNextAnimationFrame(
			function(time) {
				self.loop.call(self, time);
			}
		);
	},
}

function convertDirection(code){
			
	switch(code) {
		case 37: // LEFT
			return 0;
			break;
		case 38: // UP
			return 1;
			break;
		case 39: // RIGHT
			return 2;
			break;
		case 40: // DOWN
			return 3;
			break;
		case 87: // W
			return 1;
			break;
		case 65: // A
			return 0;
			break;
		case 83: // S
			return 3;
			break;
		case 68: // D
			return 2;
			break;
	}
}

var game = new Game('gameScreen');
console.log(game);
game.start();