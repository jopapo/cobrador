$(document).ready(function(){
	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var game = {};
	var text = "";
	
	//Lets save the cell width in a variable for easy control
	var cw = 10;
	
	//Lets first create a generic function to paint cells
	function paint_cell(x, y, color)
	{
		ctx.fillStyle = color;
		ctx.fillRect(x*cw, y*cw, cw, cw);
		ctx.strokeStyle = "silver";
		ctx.strokeRect(x*cw, y*cw, cw, cw);
	}
	
	//Lets paint the snake now
	function paint()
	{
		var w = canvas.width;
		var h = canvas.height;
		
		//To avoid the snake trail we need to paint the BG on every frame
		//Lets paint the canvas now
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "black";
		ctx.strokeRect(0, 0, w, h);

		for(var p in game.players)
		{
			var player = game.players[p];
			for(var i = 0; i < player.position.length; i++)
			{
				var c = player.position[i];
				//Lets paint 10px wide cells
				paint_cell(c[0], c[1], player.color);
			}
		}
		
		//Lets paint the food
		paint_cell(game.food.position[0], game.food.position[1], game.food.color);
		
		//Lets paint the score
		//var score_text = "Score: " + score;
		
		if (text)
		{
			ctx.fillText(text, 5, h-5);
		}
	}

	function init(game_data) {
		game = game_data;
		canvas.width = game.width * cw;
		canvas.height = game.height * cw;
		
		//Lets move the snake now using a timer which will trigger the paint function
		//every 60ms
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 20);
	}
	
	function move(direction) {
		if ( direction != game.players[socket.id].direction ) {
			socket.emit("control", direction);
		}
	}
	
	//Lets add the keyboard controls now
	$(document).keydown(function(e){
		var key = e.which;
		//We will add another clause to prevent reverse gear
		if(key == "37") move("left");
		else if(key == "38") move("up");
		else if(key == "39") move("right");
		else if(key == "40") move("down");
	})
	
	function devOrientHandler(eventData) {
		// gamma is the left-to-right tilt in degrees, where right is positive
		var tiltLR = eventData.gamma;
		// beta is the front-to-back tilt in degrees, where front is positive
		var tiltFB = eventData.beta;
		// alpha is the compass direction the device is facing in degrees
		var dir = eventData.alpha
		// call our orientation event handler
		
		var threashold = 5;
		var viewAngle = 30;
		
		if (!tiltLR && !tiltFB && !dir) 
			return;
		
		text = "Esq/Dir: " + Math.round(tiltLR) + ", Cima/Baixo: " + Math.round(tiltFB - viewAngle);

		tiltFB = tiltFB - viewAngle; // Posição de conforto.
		if (Math.abs(tiltLR) > Math.abs(tiltFB)) {
			if (tiltLR > threashold) move('right');
			if (tiltLR < -threashold) move('left');
		} else {
			if (tiltFB > threashold) move('down');
			if (tiltFB < -threashold) move('up');
		}
	}
	
	if (window.DeviceOrientationEvent) {
	  // Listen for the event and handle DeviceOrientationEvent object
	  window.addEventListener('deviceorientation', devOrientHandler, false);
	}
	
	function fullscreen(){
		var el = document.getElementById('canvas');

		if(el.webkitRequestFullScreen) {
		   el.webkitRequestFullScreen();
		}
		else {
		 el.mozRequestFullScreen();
		}            
	}

	canvas.addEventListener("click",fullscreen);
	
    //Sistema de recepção de broadcast
	var socket = io.connect();
	socket.on('init', init);
	socket.on('plyr', function (players) {
		game.players = players;
	});
	socket.on('food', function (food) {
		game.food = food;
	});
		
});
