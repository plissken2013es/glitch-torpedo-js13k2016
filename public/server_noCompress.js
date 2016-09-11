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
    this.lG = Math.floor(Math.random()*5) + 5;
    this.cnt = 0;
}

function generateGlitch() {
    var glitch = [];
    var q = rand(30, 60);
    for (var j=0; j<q; j++) {
        var pos = [rand(0, 256), rand(0, 216)];
        var size = [rand(10, 30), rand(15, 40)];
        var color = [rand(0, 255), rand(0, 255), rand(0, 255), Math.random()*0.5 + 0.5];
        glitch.push([pos, size, color]);
    }
    return glitch;
}

function rand(a, b) {
    return Math.floor(Math.random() * (b-a+1)) + a;
}

function checkG(u) {
    if (u.game.cnt++ > u.game.lG) {
        u.game.cnt = 0;
        u.game.lG = Math.floor(Math.random()*5) + 5;
        
        var q = rand(2, 7);
        var gs = [];
        for (var i=0; i<q; i++) {
            var g = generateGlitch();
            var t = rand(75, 500);
            gs.push([g, t]);
        }
        u.socket.emit("glitch", gs);
        u.opponent.socket.emit("glitch", gs);
        
        if (rand(0, 1)) {
            var p = Math.PI;
            var r = [];
            r[0] = rand(0, 1) ? p/2 : rand(0,1) ? -p/2 : p;
            r[1] = rand(-25, 25);
            r[2] = rand(-25, 25);
            var t = rand(1500, 3500);
            u.socket.emit("rot", r, t);
            u.opponent.socket.emit("rot", r, t);
        }
    } 
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
        removeUser(user);
		if (user.opponent) {
            user.opponent.end();
            findOpponent(user.opponent);
		}
	});
    socket.on("controls", function (ev, pos) {
        user.opponent.socket.emit("controls", ev, pos);
	});
    
    socket.on("syncronizeSunk", function (score) {
        user.opponent.socket.emit("syncronizeSunk", score);
	});
    
    socket.on("launchCharge", function (pos) {
        user.opponent.socket.emit("launchCharge", pos);
        checkG(user);
	});
    
    socket.on("launchSub", function (cfg) {
        user.opponent.socket.emit("launchSub", cfg);
	});    
    
    socket.on("silent", function () {
        user.opponent.socket.emit("silent");
	});  
    
    socket.on("launchTorpedo", function (pos, updateSub) {
        user.opponent.socket.emit("launchTorpedo", pos, updateSub);
        checkG(user);
	});
    
	socket.on("name", function (name) {
		user.name = name;
        users.push(user);
        findOpponent(user);
	});
    
    user.socket.emit("welcome", users.length+1);
};