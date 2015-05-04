// server.js

// set up ========================
var express  = require('express');
var app      = express();                   		// create our app w/ express
var morgan 	 = require('morgan');             		// log requests to the console (express4)
var Game 	 = require('./game.js');

// Realtime comunication, both ways...
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 8081));

var game = new Game();

io.on('connection', function (socket) {
	
	var socketId = socket.id
    var clientIp = socket.request.connection.remoteAddress
	console.log("IO " + socketId + "/" + clientIp);
	
	game.newPlayer(socketId);
	socket.on('disconnect', function() {
		game.removePlayer(socketId);
	});
	socket.on('control', function(direction) {
		game.changePlayerDirection(socketId, direction);
	});
	
	socket.emit('init', game.metadata);
});

game.on('refood', function(food) {
	io.emit('food', food);
});

game.on('moved', function(players){
	io.emit('plyr', players);
});

// CORS (Necessário para teste do host... :P)
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}

// configuration =================
app.use(morgan('dev'));                                         // log every request to the console
app.use(allowCrossDomain);
app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users

// routes ======================================================================

// application -------------------------------------------------------------
app.get('*', function(req, res) {
	res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================

//app.listen(8080);
server.listen(app.get('port'), function() {
  console.log("Node app is running on port:" + app.get('port'))
});
