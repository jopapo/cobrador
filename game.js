// Constructor
function Game() {
	this.metadata = {
		width: 32
		,players: {}
		,height: 52
		,food: { 
			color: "red"
		}
	};

	this.metadata.food.position = this.randomFreePosition();
	
	var moving = function (self) {
		self.moving();
	}
	
	this.movingInterval = setInterval(moving, 60, this);

};

//var util = require('util');
//util.inherits(Radio, EventEmitter);
//var EventEmitter = require('events').EventEmitter;
Game.prototype = Object.create(require('events').EventEmitter.prototype);

Game.prototype.changePlayerDirection = function (playerId, direction) {
	var oldDirection = this.metadata.players[playerId].direction;
	if ((oldDirection == "right" || oldDirection == "left") && (direction == "right" || direction == "left"))
		return;
	if ((oldDirection == "up" || oldDirection == "down") && (direction == "up" || direction == "down"))
		return;
	this.metadata.players[playerId].direction = direction;
}

Game.prototype.movePlayer = function (player) {
	var nx = player.position[0][0];
	var ny = player.position[0][1];

	if(player.direction == "right") nx++;
	else if(player.direction == "left") nx--;
	else if(player.direction == "up") ny--;
	else if(player.direction == "down") ny++;
	
	if (ny < 0)
		ny = this.metadata.height - 1;
	else if (ny >= this.metadata.height)
		ny = 0;
	
	if (nx < 0) 
		nx = this.metadata.width - 1;
	else if (nx >= this.metadata.width)
		nx = 0;
		
	var head = [nx, ny];
	var collidedWith = this.collision(head, player);
	
	if (collidedWith) {
		if (collidedWith.type == 'food') {
			this.metadata.food.position = this.randomFreePosition();
			this.emit('refood', this.metadata.food);
		} else {
			if (collidedWith.type == 'foe' && collidedWith.isHeadToHead) {
				if (player.position.length > collidedWith.object.position.length)
					collidedWith = null;
			} 
			if (collidedWith) {
				return false;
			}
		}
	} 
	
	if (!collidedWith) {
		player.position.pop(); // Remove a última.
	}

	player.position.unshift(head);
	
	return true;
}

Game.prototype.movePlayers = function () {
	for (var p in this.metadata.players) {
		var player = this.metadata.players[p];
		if (!this.movePlayer(player)) {
			console.log('player died: ' + p);
			player.position = [this.randomFreePosition()];
		}
	}
}

Game.prototype.moving = function () {
	this.movePlayers();
	this.emit('moved', this.metadata.players);
};

Game.prototype.collision = function (position, player) {
	var samePosition = function(pos1, pos2) {
		return pos1 && pos2 && pos1[0] == pos2[0] && pos1[1] == pos2[1];
	}
	for (var p in this.metadata.players) {
		for (var i in this.metadata.players[p].position) {
			if (i == 0 && this.metadata.players[p] == player)
				continue;
			if (samePosition(this.metadata.players[p].position[i], position)) {
				console.log("foe!");
				return {type: 'foe', object: this.metadata.players[p], isHeadToHead: i == 0};
			}
		}
	}

	if (samePosition(this.metadata.food.position,  position)) {
		console.log("food!");
		return {type: 'food', object: this.metadata.food};
	}
	
	return null;
};

Game.prototype.randomFreePosition = function() {
	var position = [Math.round(Math.random()*(this.metadata.width-1)), Math.round(Math.random()*(this.metadata.height-1))]; 
	var collidedObject = this.collision(position);
	if (collidedObject) {
		return this.randomFreePosition();
	}
	return position;
}

Game.prototype.newPlayer = function(id) {
	var color = (function(h){return '#000000'.substr(0,7-h.length)+h})((~~(Math.random()*(1<<24))).toString(16));
	var pos = this.randomFreePosition();
	var player = { color: color, direction: "right", position: [pos, [pos[0] - 1, pos[1]], [pos[0] - 2, pos[1]]] };
	this.metadata.players[id] = player;
}

Game.prototype.removePlayer = function(id) {
	delete this.metadata.players[id];
}

// export the class
module.exports = Game;
