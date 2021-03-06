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
  this.score = 0;
};

LightCycle.prototype = {
	x: 0,
	y: 0,
	velocity: 0,

  // Turns the bike in the direction
  // passed into the function if the
  // bike is capable of turning that way.
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
	
	// Renders the bike to the screen.
	render: function(context) {
		context.save();
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(this.position.x, this.position.y, 5, 0, 2*Math.PI, false);
		context.fill();
		context.restore();
	},
	
	// Updates the position of the bike based
	// on the direction the bike is facing and
	// the time that has elapsed since the last update.
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
  this.canvas = document.getElementById(canvasId);
  this.canvasContext = this.canvas.getContext('2d');
  
  this.width = this.canvas.width;
  this.height = this.canvas.height;

  // Game variables
  this.cycles = [
    new LightCycle(100, 240, 'right', 'red'),
	new LightCycle(700, 240, 'left', 'blue')
  ];
  this.gameOver = false;
  this.isPlaying = false;
  this.winner = "None";
  this.stay = true;
  
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
		self = this;

		self.gameTime = self.gameTime + (elapsedTime / 1000);

		// update the cycles
		this.cycles.forEach( function(cycle) {
		  cycle.update(elapsedTime);
		});
		
		// check for collisions with walls
		this.cycles.forEach( function(cycle) {

		  if(cycle.position.x - 5 <= 0){
		  	self.endGame.call(self, cycle)
		  }
		  else if(cycle.position.x + 5 >= self.width){
		  	self.endGame.call(self, cycle)
		  }
		  else if(cycle.position.y - 5 <= 0){
		  	self.endGame.call(self, cycle)
		  }
		  else if(cycle.position.y + 5 >= self.height){
		  	self.endGame.call(self, cycle)
		  }
		  
		});
		
		if(self.isPlaying){
  		// check for collisions between cycles
  		if(Math.pow(this.cycles[0].position.x - this.cycles[1].position.x, 2) + Math.pow(this.cycles[0].position.y - this.cycles[1].position.y, 2) <= 4 * 5 * 5){
  		  self.endGame.call("both")
  		}
	  }


    if(self.isPlaying){
  		// check for collisions between cycle and light path
  		this.cycles.forEach( function(cycle) {
  
  			// Collision constants
    			collisionPoints = { right:{x: 5, y: 0}, left:{x: -5, y: 0}, down:{x: 0, y: 5}, up:{x: 0, y: -5} };
  
    			var pixelData = self.canvasContext.getImageData(cycle.position.x + collisionPoints[cycle.state].x, cycle.position.y + collisionPoints[cycle.state].y, 1, 1).data;
  
    			if(pixelData[0] != 255 || pixelData[1] != 255 || pixelData[2] != 255)
    			{
    				if(pixelData[0] !== 0 || pixelData[1] !== 0 || pixelData[2] !== 0)
    				{
    					self.endGame.call(self, cycle);
    				}
    			}
  		});
    }
		
	},
	
	// Renders each of the bikes, the game time,
	// and the scores.
	render: function(elapsedTime) {
		self = this;
		
		// Render game objects
		this.cycles.forEach( function(cycle) {
			cycle.render(self.canvasContext);
		});
		
		var expand = 0;

		if(self.gameTime >= 10){
			expand = 10;
		}
		
		if(self.gameTime >= 100){
			expand = 20;
		}

		self.canvasContext.fillStyle = "black";
		self.canvasContext.fillRect(5, 5, 18 + expand, 18);

		// Render GUI

		// Render Timer
		self.canvasContext.fillStyle = "white";
    self.canvasContext.font = "bold 16px Arial";
  	self.canvasContext.fillText(Math.floor(self.gameTime), 10, 20);

  	self.canvasContext.fillStyle = "black";
		self.canvasContext.fillRect(2, 460, 17, 19);

		// Render player 1 score.
		self.canvasContext.fillStyle = "red";
  	self.canvasContext.font = "20px Arial";
  	self.canvasContext.fillText(this.cycles[0].score, 5, 477);

  	self.canvasContext.fillStyle = "black";
		self.canvasContext.fillRect(782, 460, 17, 19);

		// Render player 2 score.
		self.canvasContext.fillStyle = "cyan";
  	self.canvasContext.font = "20px Arial";
  	self.canvasContext.fillText(this.cycles[1].score, 785, 477);
		
	},
	
	// Event handler for when a key is pressed.
	// Either starts the game, restarts a round,
	// or changes the direction of a bike.
	keyDown: function(e)
	{
	  if(e.keyCode == 32 || e.keyCode == 13){
	    
	    if(!this.isPlaying){
	      this.stay = false;
	      this.resetGame(this);
	    }
	    
	  }
	  
		// If the keycode is an arrow key, turn cycle 1.
		// Otherwise, if it is w, a, s, or d, turn cycle 2.
		if(e.keyCode > 36 && e.keyCode < 41){
			this.cycles[0].turn(convertDirection(e.keyCode));
		}
		else if(e.keyCode == 87 | e.keyCode == 65 | e.keyCode == 83 | e.keyCode == 68){
			this.cycles[1].turn(convertDirection(e.keyCode));
		}

	},
	
	// Starts the game.
	start: function() {
		var self = this;
    
		window.onkeydown = function (e) { self.keyDown(e); };
		
		this.startTime = Date.now();
		
		window.requestNextAnimationFrame(
			function(time) {
			  self.startLoop.call(self, time);
			}
		);
	},
	
	// Loop before game starts
	startLoop: function(time){
	  var self = this;
	
	  this.lastTime = time;
	
	  self.renderTitle();
	
	  window.requestNextAnimationFrame(
			function(time) {
				if(self.stay){
				  self.startLoop.call(self, time);
				}
			  else{
			    self.stay = true;
			    self.isPlaying = true;
			    self.clearCanvas(this);
			    self.playLoop.call(self, time);
			  }
			}
		);
	},
	
	// The game loop.  See
	// http://gameprogrammingpatterns.com/game-loop.html
	playLoop: function(time) {
		var self = this;
		
		if(this.paused || this.gameOver) this.lastTime = time;
		var elapsedTime = time - this.lastTime;
		this.lastTime = time;
		
	  self.update(elapsedTime);
	  self.render(elapsedTime);

		window.requestNextAnimationFrame(
			function(time) {
				if(self.stay){
				  self.playLoop.call(self, time);
				}
			  else{
			    self.stay = true;
			    self.endLoop.call(self, time);
			  }
			}
		);
	},
	
	// Loops when a round ends.
	endLoop: function(time){
	  var self = this;
	  
	  this.lastTime = time;
	  
	  self.renderEnd();
	  
	  window.requestNextAnimationFrame(
			function(time) {
				if(self.stay){
				  self.endLoop.call(self, time);
				}
			  else{
			    self.stay = true;
			    self.isPlaying = true;
			    self.playLoop.call(self, time);
			  }
			}
		);
	},

	// Ends the current game.
	endGame: function(loser){
	  	
	  	self.winner = "Nobody wins! Hit space or enter for next round."
	  	
	  	//Check to see who lost. Adding one to the winner's score.
	  	if(loser == self.cycles[0]){
	  		self.cycles[1].score++;
	  		self.winner = "Blue bike wins! Hit space or enter for next round."
	  	}
	  	else if(loser == self.cycles[1]){
	  		self.cycles[0].score++;
	  		self.winner = "Red bike wins! Hit space or enter for next round."
	  	}
	  	
	  	
	  	self.isPlaying = false;
	  	self.stay = false;
	},

  // Restarts the game.
	resetGame: function(){
	  
		this.clearCanvas(this);
    this.gameTime = 0;
		
		//Reset the cycles' positions and states.
		this.cycles[0].position.x = 100;
		this.cycles[0].position.y = 240;
		this.cycles[0].state = 'right';
		this.cycles[1].position.x = 700;
		this.cycles[1].position.y = 240;
		this.cycles[1].state = 'left';
	},
	
	// Renders the title screen.
	renderTitle: function(){
	  
    this.clearCanvas.call(this);
	  
	  // Render Title.
		this.canvasContext.fillStyle = "black";
  	this.canvasContext.font = "20px Arial";
  	this.canvasContext.fillText("Press space or enter to Play", 250, 250);
	},
	
	// Render's the winner at the end
	// of the game.
	renderEnd: function(){
	  
    // Render winner square.
	  this.canvasContext.fillStyle = "black";
		this.canvasContext.fillRect(190, 6, 440, 25);
		
	  // Render winner text.
		this.canvasContext.fillStyle = "white";
  	this.canvasContext.font = "20px Arial";
  	this.canvasContext.fillText(this.winner, 200, 25);
	},
	
	// Clears the canvas.
	clearCanvas: function(){
	  
	  //Clear the canvas.
	  this.canvasContext.fillStyle = "white";
		this.canvasContext.fillRect(0, 0, 800, 480);
	}
}

function convertDirection(code){
			
	switch(code) {
		case 37: // LEFT
			return 0;
		case 38: // UP
			return 1;
		case 39: // RIGHT
			return 2;
		case 40: // DOWN
			return 3;
		case 87: // W
			return 1;
		case 65: // A
			return 0;
		case 83: // S
			return 3;
		case 68: // D
			return 2;
	}
}

var game = new Game('gameScreen');
console.log(game);
game.start();