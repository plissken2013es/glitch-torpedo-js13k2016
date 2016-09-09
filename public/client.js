"use strict";

(function () {

    var socket, sendBtn, message, playerName, buttons, playerSelect, online;

    function setMessage(text) {
        message.innerHTML = text;
    }
    
    function displayScore(text) {
        online.innerHTML = text;
    }

    function bindClient() {
        socket.on("welcome", function (num) {
             displayScore("Current players online: " + num);
        });
        
        socket.on("start", function (cfg) {
            cfg.socket = socket;
            initGame(false, cfg);
            setTimeout(function() {
                playerSelect.className = "hidden";
            }, 1000);
        });
/*
        socket.on("shipPosition", function (pos) {
            receiveShipPosition(pos);
        });  
*/
        socket.on("controls", function(ev, pos) {
            receiveShipPosition(ev, pos);
        });
        
        socket.on("syncronizeSunk", function () {
            receiveShipSunk();
        });  
        
        socket.on("launchCharge", function (pos) {
            launchCharge(pos);
        });  
        
        socket.on("launchSub", function (cfg) {
            console.log("my opponent had launched a sub", cfg.levels);
            launchSub(cfg);
        });    
        
        socket.on("launchTorpedo", function (pos, updateSub) {
            launchTorpedo(pos, updateSub);
        });        
        
        socket.on("end", function () {
            console.log("received end signal");
            setMessage("Opponent has left!<br/>Waiting for opponent...");
            playerSelect.className = "";
            initGame(true);
        });

        socket.on("connect", function () {
            setMessage("Welcome. Please enter your name.");
        });

        socket.on("disconnect", function () {
            setMessage("Connection lost!");
        });

        socket.on("error", function () {
            setMessage("Connection error!");
        });
        
        sendBtn.addEventListener("click", function (e) {
            socket.emit("name", playerName.value);
            buttons.className = "hidden";
            setMessage("Waiting for opponent...");
        }, false);
    }

    /**
     * Client module init
     */
    function initClient() {
        socket = io({ upgrade: false, transports: ["websocket"] });
        
        playerName = document.getElementById("playerName");
        playerSelect = document.getElementById("playerSelect");
        sendBtn = document.getElementById("sendName");
        message = document.getElementById("message");
        buttons = document.getElementById("buttons");
        online = document.getElementById("online");
        
        bindClient();
    }

    window.addEventListener("load", initClient, false);
    
    // ----------------------------------------------------------------------------------------
    // ------------------------------------- M I  G M  ----------------------------------------
    // -------------------------------------  A N  A E ----------------------------------------
    // ----------------------------------------------------------------------------------------
    var requestAnimFrame = (function(){
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    // Arcade Audio ----------------------------------
    function ArcadeAudio() {
      this.sounds = {};
    }
    ArcadeAudio.prototype.add = function( key, count, settings ) {
      this.sounds[ key ] = [];
      settings.forEach( function( elem, index ) {
        this.sounds[ key ].push( {
          tick: 0,
          count: count,
          pool: []
        } );
        for( var i = 0; i < count; i++ ) {
          var audio = new Audio();
          audio.src = jsfxr( elem );
          this.sounds[ key ][ index ].pool.push( audio );
        }
      }, this );
    };
    ArcadeAudio.prototype.play = function( key ) {
      var sound = this.sounds[ key ];
      var soundData = sound.length > 1 ? sound[ Math.floor( Math.random() * sound.length ) ] : sound[ 0 ];
      soundData.pool[ soundData.tick ].play();
      soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
    };
    var aa = new ArcadeAudio();
    aa.add("a", 5, [
        [3,,0.3527,0.2102,0.4498,0.149,,-0.0138,0.0177,0.0536,,0.0003,,,,0.2985,0.0878,-0.1867,0.9976,-0.0193,,,0.036,0.31]
    ]);

    aa.add("b", 5, [
        [3,0.0135,0.3705,0.1714,0.4132,0.0472,,0.1456,-0.0176,0.16,0.89,-0.28,,,,,0.3,0.08,0.9996,-0.16,0.0136,,0.0019,0.31],
        [3,0.0135,0.3705,0.1714,0.4132,0.0472,,0.1456,-0.0176,0.16,0.89,-0.28,,,,0.89,0.62,0.08,0.9996,-0.16,0.0136,,0.0019,0.31]
    ]);

    aa.add("c", 5, [
        [3,,0.1945,0.3182,0.4554,0.3556,,-0.0189,-0.0208,,0.0254,0.0694,,,-0.0212,0.0022,0.0051,0.0078,1,0.0057,,0.0362,-0.0353,0.24]
    ]);

    aa.add("d", 5, [
        [3,,0.2018,,0.4471,0.4448,,0.4382,,,,,,,,0.52,,,1,,,,,0.31]
    ]);

    aa.add("e", 5, [
        [2,,0.1926,,0.1814,0.209,,0.3425,,,,,,,,0.5793,,,1,,,,,0.31]
    ]);
    // Arcade Audio ----------------------------------

    // Create the canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 256;
    canvas.height = 224;
    //document.body.appendChild(canvas);

    var screen = document.createElement("canvas");
    var screenCtx = screen.getContext("2d");
    screen.width = canvas.width * 2;
    screen.height = canvas.height * 2;
    screenCtx.webkitImageSmoothingEnabled = false;
    screenCtx.mozImageSmoothingEnabled = false;
    screenCtx.imageSmoothingEnabled = false; /// future
    document.body.appendChild(screen);

    var shipSpeed = 28, chargeSpeed = 14, numCharges = 6, subScores = [20, 30, 50, 60, 70, 80], subSpeed = 6, torpedoSpeed = 14, numTorpedoes = 4, demoMode = false, playerShipName = "PLAYER 1", playerSubName = "PLAYER 2";

    var ship, lastTime, gameTime, isGameOver, charges, chargeExplosions, lastFireCharge, subs, points, subsAvailable,  activeSubs, levels, indicators, indCnt, torpedoes, torpedoExplosions, lastFireTorpedo, scorePlayerShip, scorePlayerSub, timeLeft, timeInterval, bodyCount, role, timeout, netCnt, shipImmune, immuneCnt, movingLeft, movingRight;

    start(true); // demo mode ON
    //start(); // demo mode OFF

    function initVars() {
        ship = {
            pos: [canvas.width/2 - 20, 32 - 13],
            sprite: new Sprite("img/s.png", [0, 0], [40, 13], 0, [0])
        };
        shipImmune = movingLeft = movingRight = false;
        lastTime = gameTime = lastFireCharge = indCnt = lastFireTorpedo = scorePlayerShip = scorePlayerSub = netCnt = immuneCnt = 0;
        isGameOver = false; 
        charges = [];
        chargeExplosions = [];
        subs = [];
        points = [];
        subsAvailable = [1,2,3,4,5,6,7,8];
        activeSubs = [];
        levels = [];
        indicators = [];
        torpedoes = [];
        torpedoExplosions = [];
        timeLeft = 199;
        bodyCount = [];
        clearTimeout(timeout);
        clearInterval(timeInterval);
    }

    // The main game loop
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;
        requestAnimFrame(main);
    }

    function initGame(demoOn, cfg) {
        console.log("initGame", demoOn, cfg);
        if (demoOn != undefined) demoMode = demoOn;
        lastTime = Date.now();
        initVars();

        if (cfg) {
            role = cfg.role;
            if (role == "ship") {
                playerShipName = cfg.p1;
                playerSubName = cfg.p2;
            } else {
                playerShipName = cfg.p2;
                playerSubName = cfg.p1;
            }
        } else {
            role = null;
            playerShipName = "PLAYER 1";
            playerSubName = "PLAYER 2";
        }

        initLevels();
        console.log(role, demoMode);
        if (role === "sub" || demoMode) {
            console.log(role === "sub", demoMode);
            setTimeout(launchSub.bind(this), 500);
        }
        initTime();
        main();
    }

    function start(demoOn) {
        if (demoOn != undefined) demoMode = demoOn;
        resources.load([
            "img/s.png",
            "img/sc.png",
            "img/sce.png",
            "img/scb.png",
            "img/i.png",
            "img/su.png",
            "img/sup.png",
            "img/sut.png",
            "img/te.png"
        ]);
        resources.onReady(initGame);    
    }

    function initLevels() {
        for (var i=0; i<8; i++) {
            levels.push(40 + i*20);
        }
        levels = shuffleArr(levels);
        console.log(levels);
    }

    function initTime() {
        timeInterval = setInterval(updateTimer.bind(this), 1000);
    }

    function launchCharge(pos) {
        if (role == "ship") socket.emit("launchCharge", pos);

        var charge = {
            pos: [ship.pos[0] + pos, ship.pos[1] - 2],
            sprite: new Sprite("img/scb.png", [0, 0], [4, 3], 4, [0, 1, 2], null, "v")
        };
        charges.push(charge);

        lastFireCharge = Date.now();
        aa.play("d");
        console.log("num charges:", numCharges);
        console.log("charges active:", charges.length);
    }    

    function launchTorpedo(pos, updateSub) {
        if (role == "sub") {
            socket.emit("launchTorpedo", pos, updateSub);
        } else if (updateSub) {
            console.log("updating sub ", updateSub[0], "to:", updateSub[1][0]);
            subs[updateSub[0]].pos = updateSub[1];
        }

        var torp = {
            pos: pos,
            sprite: new Sprite("img/sut.png", [0, 0], [3, 3], 4, [0, 1, 0, 1, 0, 0])
        };
        torp.score = 100 + (torp.pos[1] - 40) * 5;
        console.log("Launched torpedo. " + torp.score + " potential points.");
        torpedoes.push(torp);
        aa.play("e");
        lastFireTorpedo = Date.now();
    }

    function launchShip() {
        shipImmune = true;
        immuneCnt = 0;
        ship.isSinking = false;
        ship.sprite.speed = 0;
        ship.sprite.frames = [0];
        ship.sprite.once = false;
        ship.sprite.reset();
    }

    function launchSub(cfg) {
        if (subsAvailable.length) {
            var dir = rand(0, 1);
            if (cfg) dir = cfg.dir;
            var off = dir ? 288 : 0;
            var saveLevels;
            if (cfg) levels = cfg.levels;
            if (cfg) console.log("and my levels are", levels);
            var sub = {
                pos: [-32 + off, levels.shift()],
                sprite: new Sprite("img/su.png", [0, 0], [32, 16], 0, [0], dir)
            };
            sub.dir = dir;
            sub.speed = subSpeed + mapLinear(sub.pos[1], 40, 200, 18, 0);
            if (dir) sub.speed *= -1;
            sub.score = rand(0, 5);
            if (cfg) sub.score = cfg.score;
            subs.push(sub);

            var score = {
                pos: [-99, 0],
                sprite: new Sprite("img/sup.png", [sub.score * 7, 0], [7, 5], 0, [0])
            };
            points.push(score);

            if (role == "sub") {
                var indicator = {
                    pos: sub.pos[1] + 8,
                    value: subsAvailable.shift()
                };
                indicators.push(indicator);
            }

            var config = {
                dir: dir,
                score: sub.score,
                levels: [sub.pos[1]].concat(levels)
            };
            if (role == "sub" && !cfg) {
                socket.emit("launchSub", config);
                console.log("sending launchSub", config.levels);
            }
        }

        if (!isGameOver && role == "sub") timeout = setTimeout(launchSub.bind(this), rand(3500, 9000));
    }

    function drawText(x, y, txt, color) {
        ctx.font = "9px Lucida Console, Monaco, monospace";
        ctx.fillStyle = color || "red";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText(txt, x, y); 
    }

    function sendShipPosition() {
        if (netCnt++ == 1) {
            netCnt = 0;
            socket.emit("shipPosition", ship.pos[0]);
        }
    }

    function receiveShipPosition(ev, pos) {
        switch (ev) {
            case "LU":
                movingLeft = false;
                break;
            case "LD":
                movingLeft = true;
                break;
            case "RU":
                movingRight = false;
                break;
            case "RD":
                movingRight = true;
                break;
            default:
                movingLeft = movingRight = false;
        }
        ship.pos[0] = pos;
    }
    
    function receiveShipSunk() {
        console.log("syncronizing ship sunk!");
        if (!ship.isSinking) {
            sunkShip();
        }
    }

    // Update game objects
    function update(dt) {
        gameTime += dt;

        if (isGameOver) return; 
        handleInput(dt);
        updateEntities(dt);
    }  

    function handleInput(dt) {
        if (demoMode) return;

        if (!ship.isSinking && role == "ship") {
            var p = ship.pos[0];
            if (input.isDown("LEFT") || input.isDown("a")) {
                ship.pos[0] -= shipSpeed * dt;
                if (!movingLeft) socket.emit("controls", "LD", p);
                if (movingRight) socket.emit("controls", "RU", p);
                movingLeft = true;
                movingRight = false;
            } else if (input.isDown("RIGHT") || input.isDown("d")) {
                ship.pos[0] += shipSpeed * dt;
                if (!movingRight) socket.emit("controls", "RD", p);
                if (movingLeft) socket.emit("controls", "LU", p);
                movingRight = true;
                movingLeft = false;
            } else {
                if (movingLeft) socket.emit("controls", "LU", p);
                if (movingRight) socket.emit("controls", "RU", p);
                movingLeft = movingRight = false;
            }

            if ((input.isDown("z") || input.isDown("n")) && numCharges > charges.length && Date.now() - lastFireCharge > 750) {
                launchCharge(-8);
            }
            if ((input.isDown("x") || input.isDown("m")) && numCharges > charges.length && Date.now() - lastFireCharge > 750) {
                launchCharge(+44);
            }
        }
        if (!ship.isSinking && role == "sub") {
            if (movingLeft) ship.pos[0] -= shipSpeed * dt;
            if (movingRight) ship.pos[0] += shipSpeed * dt;
        }

        // debug option, remember to delete this
        if (input.isDown("i")) {
            shipImmune = true;
            immuneCnt = 0;
        }

        for (var i=0; i<indicators.length; i++) {
            if (role == "sub" && numTorpedoes > torpedoes.length && Date.now() - lastFireTorpedo > 1250 && input.isDown(indicators[i].value.toString())) {
                var pos = subs[i].pos;
                var updateSub = [i, subs[i].pos];
                launchTorpedo([pos[0] + subs[i].sprite.size[0]/2, pos[1]], updateSub);
            }
        }
    }

    function updateEntities(dt) {
        // Update the player sprite animation
        ship.sprite.update(dt);
        checkShipBounds();
        //if (role == "ship") sendShipPosition();

        // Update subs
        for (i=0; i<subs.length; i++) {
            var s = subs[i];
            var ss = s.sprite;
            ss.update(dt);
            s.pos[0] += s.speed * dt;
            var p = points[i];
            //if (!ss.isSinking && p) { 
                p.pos[0] = s.pos[0] + ss.size[0]/2 - (ss.flip*7);
                p.pos[1] = s.pos[1] + ss.size[1]/2;
                p.sprite.update(dt);
            //}
            if (ss.done) {
                subs.splice(i, 1);
                points.splice(i, 1);
            }

            var killSub = false;
            if (ss.flip && s.pos[0]<-ss.size[0]) {
                killSub = true;
            } else if (s.pos[0]>256) {
                killSub = true;
            }
            if (killSub) {
                subs.splice(i, 1);
                points.splice(i, 1);
                if (role == "sub") subsAvailable.push(indicators.splice(i, 1)[0].value);
                levels.push(s.pos[1]);
            }
        }

        // Update all the charges
        for (var i=0; i<charges.length; i++) {
            var charge = charges[i];
            charge.pos[1] += chargeSpeed * dt;
            charge.sprite.update(dt);

            if (charge.pos[1] > 32 && !charge.onWater) {
                charge.onWater = true;
                charge.sprite.url = "img/sc.png";
            }

            var killCharge = false;
            killCharge = checkNearField(charge);
            if (charge.pos[1] >= 200) {
                killCharge = true;
            }

            if (killCharge) {
                charges.splice(i, 1);
                var explosion = {
                    pos: [charge.pos[0], charge.pos[1]],
                    sprite: new Sprite("img/sce.png", [0, 0], [4, 6], 4, [0, 1, 2, 3], null, "h", true)
                };
                chargeExplosions.push(explosion);
                aa.play("b");
            }
        }

        // Update all the chargeExplosions
        for (i=0; i<chargeExplosions.length; i++) {
            var e = chargeExplosions[i].sprite;
            if (e.done) chargeExplosions.splice(i, 1);
            e.update(dt);
        }

        // Update all the torpedoes
        for (i=0; i<torpedoes.length; i++) {
            var torp = torpedoes[i];
            torp.pos[1] -= torpedoSpeed * dt;
            torp.sprite.update(dt);

            if (torp.pos[1] <= 32) {
                torpedoes.splice(i, 1);
                if (!ship.isSinking && !shipImmune && !(torp.pos[0]+4<ship.pos[0] || torp.pos[0]>ship.pos[0]+40)) {
                    scorePlayerSub += torp.score;
                    sunkShip();
                    socket.emit("syncronizeSunk");
                    console.log("ship sunk! scored " + torp.score + " points!");
                }
                var explosion = {
                    pos: [torp.pos[0], 20],
                    sprite: new Sprite("img/te.png", [0, 0], [8, 12], 4, [0, 1, 2, 0], null, "h", true)
                };
                torpedoExplosions.push(explosion);
                aa.play("c");
            }
        }

        // Update all the torpedoExplosions
        for (i=0; i<torpedoExplosions.length; i++) {
            var t = torpedoExplosions[i];
            var e = t.sprite;
            if (e.done) torpedoExplosions.splice(i, 1);
            e.update(dt);
        }
    }

    function updateTimer() {
        if (timeLeft-- <= 0) {
            timeLeft = 0;
            clearInterval(timeInterval);
            isGameOver = true;
        }
    }

    function checkNearField(c) {
        var subDestroyed = false;
        for (var i=0; i<subs.length; i++) {
            var s = subs[i];
            if (s.isSinking) continue;
            var sp = s.pos;
            var cp = c.pos;
            if (sp[0] > cp[0] + 4 || sp[0] + 32 < cp[0]) continue;
            if (sp[1] > cp[1] + 3 || sp[1] + 16 < cp[1]) continue;
            subDestroyed = true;
            destroySub(i);
            break;
        }
        return subDestroyed;
    }

    function checkShipBounds() {
        if (ship.pos[0] < 0) {
            ship.pos[0] = 0;
        } else if (ship.pos[0] > canvas.width - ship.sprite.size[0]) {
            ship.pos[0] = canvas.width - ship.sprite.size[0];
        }

        if (ship.pos[1] < 0) {
            ship.pos[1] = 0;
        } else if (ship.pos[1] > canvas.height - ship.sprite.size[1]) {
            ship.pos[1] = canvas.height - ship.sprite.size[1];
        }
    }

    function destroySub(i) {
        var s = subs[i];
        s.isSinking = true;
        var ss = s.sprite;
        ss.speed = 2;
        ss.frames = [0, 1, 2];
        ss.once = true;
        ss.reset();
        scorePlayerShip += subScores[s.score];
        var i = indicators.splice(i, 1)[0];
        if (i) subsAvailable.push(i.value);
        levels.push(s.pos[1]);
        bodyCount.push(0);
        console.log(points);
    }

    function sunkShip() {
        ship.isSinking = true;
        ship.sprite.frames = [0, 1, 2, 3];
        ship.sprite.once = true;
        ship.sprite.speed = 2;
        setTimeout(launchShip.bind(this), 2500);
        aa.play("a");
        bodyCount.push(1);
    }
    
    // Draw everything
    function render() {
        ctx.fillStyle = "#4487c9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 32, canvas.width, 184);

        // render ship player
        var renderShip = false;
        if (shipImmune) {
            if (immuneCnt++ % 3 == 0) renderShip = true;
            if (immuneCnt > 150) {
                shipImmune = false;
                immuneCnt = 0;
            }
        } else {
            renderShip = true;
        }
        if (renderShip) {
            renderEntity(ship);
        }

        // print indicator lines
        for (var i=0; i < indicators.length; i++) {
            for (var q=0; q<28; q++) {
                drawText(-10 + indCnt + q*10, indicators[i].pos, "-", "rgba(255, 0, 0, 0.25)");
            }
        }
        if (indCnt++ > 10) indCnt = 0;

        renderEntities(charges);
        renderEntities(chargeExplosions);
        renderEntities(torpedoes);
        renderEntities(torpedoExplosions);
        renderEntities(subs);
        renderEntities(points);

        // print available charges
        for (var i=0; i < numCharges - charges.length; i++) {
            ctx.drawImage(resources.get("img/scb.png"),
                    0, 6,
                    4, 3,
                    100 + (i*5), 4,
                    4, 3);
        }

        // print available torpedoes
        for (var i=0; i < numTorpedoes - torpedoes.length; i++) {
            ctx.drawImage(resources.get("img/sut.png"),
                    0, 0,
                    3, 3,
                    100 + (i*6), 204,
                    4, 3);
        }

        // print indicator texts
        for (var i=0; i < indicators.length; i++) {
            var ind = indicators[i];
            drawText(5, ind.pos, ind.value);
        }

        // print player scores
        drawText(30, 5, "TIME - " + timeLeft, "black");
        drawText(210, 5, playerShipName + " - " + scorePlayerShip, "black");
        drawText(210, 204, playerSubName + " - " + scorePlayerSub, "#4487c9");
        if (isGameOver) {
            var txt = scorePlayerShip > scorePlayerSub ? playerShipName + " WINS!" : scorePlayerShip == scorePlayerSub ? "DRAW!" : playerSubName + " WINS!";
            drawText(canvas.width/2, canvas.height/2, txt, "white");
        }

        // render bodyCount
        for (i=0; i < bodyCount.length; i++) {
            ctx.drawImage(resources.get("img/i.png"),
                    0 + bodyCount[i]*14, 0,
                    14, 6,
                    i*14, 216,
                    14, 6);
        }

        // Render to the main screen
        screenCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, screen.width, screen.height);
    }

    function renderEntity(entity) {
        ctx.save();
        ctx.translate(entity.pos[0], entity.pos[1]);
        if (entity.sprite.flip) {
            ctx.translate(entity.sprite.size[0], 0);
            ctx.scale(-1, 1);
        }
        entity.sprite.render(ctx);
        ctx.restore();
    }

    function renderEntities(list) {
        for (var i=0; i<list.length; i++) {
            renderEntity(list[i]);
        }
    }

    function rand(a, b) {
        return Math.floor(Math.random() * (b-a+1)) + a;
    }

    function mapLinear(x, a1, a2, b1, b2) {
        return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
    }

    function snapToFloor(input, gap, start) {
        if (start === undefined) start = 0;
        if (gap === 0) return input;
        input -= start;
        input = gap * Math.floor(input / gap);
        return start + input;
    }

    function shuffleArr(array) {
        for (var i = array.length - 1; i > 0; i--)         {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
})();
