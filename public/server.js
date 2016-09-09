"use strict";

/**
 * User sessions
 * @param {array} users
 */
var users = [];

/**
 * Find opponent for a user
 * @param {User} user
 */
function findOpponent(user) {
	for (var i = 0; i < users.length; i++) {
		if (user !== users[i] && users[i].opponent === null) {
			new Game(user, users[i]).start();
		}
	}
}

/**
 * Remove user session
 * @param {User} user
 */
function removeUser(user) {
	users.splice(users.indexOf(user), 1);
}

/**
 * Game class
 * @param {User} user1
 * @param {User} user2
 */
function Game(user1, user2) {
    user1.role = "sub";
    user2.role = "ship";
	this.user1 = user1;
	this.user2 = user2;
}

/**
 * Start new game
 */
Game.prototype.start = function () {
	this.user1.start(this, this.user2);
	this.user2.start(this, this.user1);
}

/**
 * User session class
 * @param {Socket} socket
 */
function User(socket) {
	this.socket = socket;
	this.game = null;
	this.opponent = null;
}

User.prototype.start = function (game, opponent) {
	this.game = game;
	this.opponent = opponent;
	var cfg = {
        p1: this.name,
        p2: this.opponent.name,
        role: this.role
    };
	this.socket.emit("start", cfg);		
};

User.prototype.end = function () {
	this.socket.emit("end");
    this.game = null;
    this.opponent = null;
};

module.exports = function (socket) {
	var user = new User(socket);
	
	socket.on("disconnect", function () {
		console.log("Disconnected: " + socket.id);
        removeUser(user);
		if (user.opponent) {
            user.opponent.end();
            findOpponent(user.opponent);
		}
	});
/*
    socket.on("shipPosition", function (pos) {
		//console.log("Ship position: " + socket.id + " -> " + pos);
        user.opponent.socket.emit("shipPosition", pos);
	});
*/  
    socket.on("controls", function (ev, pos) {
		//console.log("Ship controls: " + socket.id + " -> " + ev);
        user.opponent.socket.emit("controls", ev, pos);
	});
    
    socket.on("syncronizeSunk", function () {
		console.log("Ship is sunk! " + socket.id);
        user.opponent.socket.emit("syncronizeSunk");
	});
    
    socket.on("launchCharge", function (pos) {
		//console.log("LaunchCharge: " + socket.id + " -> " + pos);
        user.opponent.socket.emit("launchCharge", pos);
	});
    
    socket.on("launchSub", function (cfg) {
		//console.log("LaunchSub: " + socket.id + " -> " + cfg.levels);
        user.opponent.socket.emit("launchSub", cfg);
	});  
    
    socket.on("launchTorpedo", function (pos, updateSub) {
		//console.log("launchTorpedo: " + socket.id + " -> " + pos);
        user.opponent.socket.emit("launchTorpedo", pos, updateSub);
	});
    
	socket.on("name", function (name) {
		console.log("Name for: " + socket.id + " -> " + name);
		user.name = name;
        users.push(user);
        findOpponent(user);
        console.log("Current users: " + users.length);
	});
    
    user.socket.emit("welcome", users.length+1);
    
	console.log("Connected: " + socket.id);
    console.log("Current users: " + users.length);
};