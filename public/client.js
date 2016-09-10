(function () {

    var socket, sendBtn, message, playerName, buttons, playerSelect, online, tutorial;

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
                tutorial.className = "hidden";
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
        
        socket.on("syncronizeSunk", function (score) {
            receiveShipSunk(score);
        });  
        
        socket.on("launchCharge", function (pos) {
            launchCharge(pos);
        });  
        
        socket.on("launchSub", function (cfg) {
            console.log("my opponent had launched a sub", cfg.levels);
            launchSub(cfg);
        });    
                
        socket.on("silent", function () {
            console.log("my opponent had entered silent running");
            if (role == "ship" && silentRunning>0) {
                silentRunning--;
                silentCnt = 720;
                aa.play("f");
            }
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
        
        socket.on("glitch", function (gs) {
            receiveGlitch(gs);
        });        
        
        socket.on("rot", function (r, t) {
            receiveRot(r, t);
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
        tutorial = document.getElementById("tutorial");
        
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
    
    aa.add("f", 5, [
        [2,,0.3895,,0.4194,0.2692,,0.1371,,0.6871,0.3262,,,,,,,,1,,,,,0.5]
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

    var shipSpeed = 28, chargeSpeed = 14, numCharges = 5, subScores = [20, 30, 50, 60, 70, 80], subSpeed = 6, torpedoSpeed = 16, numTorpedoes = 3, demoMode = false, playerShipName = "PLAYER 1", playerSubName = "PLAYER 2", tutSeen = false;

    var ship, lastTime, gameTime, isGameOver, charges, chargeExplosions, lastFireCharge, subs, points, subsAvailable,  activeSubs, levels, indicators, indCnt, torpedoes, torpedoExplosions, lastFireTorpedo, scorePlayerShip, scorePlayerSub, timeLeft, timeInterval, bodyCount, role, timeout, netCnt, shipImmune, immuneCnt, movingLeft, movingRight, glitch = [], rot, tutCnt, tutoTxt1, tutoTxt2, silentRunning, silentCnt;

    start(true); // demo mode ON
    //start(); // demo mode OFF

    function initVars() {
        ship = {
            pos: [canvas.width/2 - 20, 32 - 13],
            sprite: new Sprite("img/s.png", [0, 0], [40, 13], 0, [0])
        };
        shipImmune = movingLeft = movingRight = false;
        tutoTxt1 = tutoTxt2 = "";
        if (!demoMode) tutSeen = true;
        lastTime = gameTime = lastFireCharge = indCnt = lastFireTorpedo = scorePlayerShip = scorePlayerSub = netCnt = immuneCnt = tutCnt = silentCnt = 0;
        isGameOver = false; 
        silentRunning = 1;
        rot = [0, 0, 0];
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
        timeLeft = 99;
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
        if (role == "sub" && !demoMode) {
            socket.emit("launchTorpedo", pos, updateSub);
        } else if (updateSub) {
            console.log("updating sub ", updateSub[0], "to:", updateSub[1][0]);
            subs[updateSub[0]].pos = updateSub[1];
        }

        var torp = {
            pos: pos,
            sprite: new Sprite("img/sut.png", [0, 0], [3, 3], 4, [0, 1, 0, 1, 0, 0])
        };
        torp.score = 100 + (torp.pos[1] - 40) * 2;
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

            if (role == "sub" || demoMode) {
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

        if ((!isGameOver && role == "sub") || demoMode) timeout = setTimeout(launchSub.bind(this), rand(3500, 9000));
    }

    function drawText(x, y, txt, color, size) {
        var sz = 9;
        if (size) sz = size;
        ctx.font = sz + "px Lucida Console, Monaco, monospace";
        ctx.fillStyle = color || "red";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText(txt, x, y); 
    }
    
    function drawFilter() {
        var i = 0,
            width = 3,
            separation = width + 1,
            count = canvas.height  / separation;
        netCnt ++;
        if (netCnt > separation) netCnt = 0;

        ctx.fillStyle = 'rgba(200, 200, 0, 0.12)';
        ctx.beginPath();
        while (++i < count) {
            ctx.rect(0, (i-1) * separation + netCnt, canvas.width, width);
        }
        ctx.fill();
    }
    
    function drawSquare(g) {
        var pos = g[0];
        var size = g[1];
        var col = g[2];
        ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + col[3] + ")";
        ctx.beginPath();
        ctx.rect(pos[0], pos[1], size[0], size[1], col);
        ctx.fill();
    }
    
    function receiveGlitch(gs) {
        console.log("glitch received", gs);
        if (gs.length) {
            var g = gs.pop();
            glitch = g[0];
            setTimeout(function() {
                receiveGlitch.call(this, gs);
            }, g[1]);
        } else {
            glitch = [];
        }
    }
    
    function drawGlitch() {
        for (var q=0; q<glitch.length; q++) {
            drawSquare(glitch[q]);
        }
    }
    
    function receiveRot(r, t) {
        rot = r;
        setTimeout(function() {
            rot = [0, 0, 0];
        }.bind(this), t);
    }

    /*
    function sendShipPosition() {
        if (netCnt++ == 1) {
            netCnt = 0;
            socket.emit("shipPosition", ship.pos[0]);
        }
    }
    */

    function receiveShipPosition(ev, pos) {
        switch (ev) {
            case "LU":
                movingLeft = false;
                break;
            case "LD":
                movingLeft = true;55
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
    
    function receiveShipSunk(score) {
        console.log("syncronizing ship sunk!");
        if (!ship.isSinking) {
            sunkShip();
            scorePlayerSub += score;
        }
    }

    // Update game objects
    function update(dt) {
        gameTime += dt;

        if (isGameOver) return; 
        handleInput(dt);
        if (demoMode && !tutSeen) updateTuto();
        updateEntities(dt);
    }  
    
    function updateTuto() {
        switch (tutCnt) {
            case 1:
                tutoTxt1 = "Ship player may use LEFT/RIGHT arrows to move.";
                break;
            case 60:
                movingLeft = true;
                break;
            case 120:
                movingRight = true;
                movingLeft = false;
                break;
            case 180:
                movingRight = false;
                break;
            case 240:
                tutoTxt1 = "May use 'A' and 'D' keys too.";
                movingRight = true;
                break;
            case 300:
                movingRight = false;
                movingLeft = true;
                break;
            case 360:
                movingLeft = false;
                break;
            case 400:
                tutoTxt1 = "'Z' and 'X' keys launch depth charges.";
                break;
            case 490:
                launchCharge(-8);
                break;
            case 550:
                launchCharge(+44);
                break;
            case 610:
                launchCharge(+44);
                tutoTxt1 = "Or use 'M' and 'N' keys if you prefer.";
                break;
            case 800:
                tutoTxt1 = "Ship has " + numCharges + " charges, reloaded when exploded.";
                break;
            case 980:
                tutoTxt1 = "Each submarine scores differently.";
                break;
            case 1100:
                tutoTxt1 = "";
                tutoTxt2 = "Submarine player does't control movement, but...";
                break;
            case 1280:
                tutoTxt2 = "may fire torpedoes from all available subs...";
                break;
            case 1460:
                tutoTxt2 = "by pressing numbers from 1 to 8.";
                break;
            case 1500:
                for (var i=0; i<3; i++) {
                    (function(i) {
                        setTimeout(function() {
                            if (subs[i]) {
                                var pos = subs[i].pos;
                                launchTorpedo([pos[0] + subs[i].sprite.size[0]/2, pos[1]]);
                            }
                        }.bind(this), i*750);
                    })(i);
                }
                break;
            case 1660:
                tutoTxt2 = "Deeper launched torpedoes score more points.";
                break;
            case 1890:
                tutoTxt1 = "There's a delay between each charge launch.";
                tutoTxt2 = "There's a delay between each torpedo launch.";
                break;
            case 2120:
                tutoTxt1 = "One more thing: Sub player may press 'SPACE'";
                tutoTxt2 = "to enter 'Silent running' mode.";
                break;
            case 2320:
                tutoTxt1 = "The subs remain invisible for a short time.";
                tutoTxt2 = "There's only 1 silent running per game.";
                silentCnt = 400;
                break;
            case 2720:
                tutoTxt1 = "When time ends, the best score wins.";
                tutoTxt2 = "";
                break;
            case 2900:
                tutoTxt1 = "Good luck, captain!";
                break;
            case 3200:
                tutoTxt1 = "";
                break;
        }
    }

    function handleInput(dt) {
        if ((!ship.isSinking && role == "sub") || demoMode) {
            if (movingLeft) ship.pos[0] -= shipSpeed * dt;
            if (movingRight) ship.pos[0] += shipSpeed * dt;
        }
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

        if (role == "sub" && silentRunning>0 && input.isDown("SPACE")) {
            socket.emit("silent");
            silentCnt = 720;
            silentRunning--;
            aa.play("f");
        }

        for (var i=0; i<indicators.length; i++) {
            if (role == "sub" && numTorpedoes > torpedoes.length && Date.now() - lastFireTorpedo > 1350 && input.isDown(indicators[i].value.toString())) {
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

        // Update subs
        for (i=0; i<subs.length; i++) {
            var s = subs[i];
            var ss = s.sprite;
            ss.update(dt);
            s.pos[0] += s.speed * dt;
            var p = points[i];
            p.pos[0] = s.pos[0] + ss.size[0]/2 - (ss.flip*7);
            p.pos[1] = s.pos[1] + ss.size[1]/2;
            p.sprite.update(dt);
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
                if (role == "sub" || demoMode) subsAvailable.push(indicators.splice(i, 1)[0].value);
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
                    socket.emit("syncronizeSunk", torp.score);
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
        
        // silent running
        if (silentCnt > 0) silentCnt--;
    }

    function updateTimer() {
        if (timeLeft-- <= 0) {
            timeLeft = 0;
            clearInterval(timeInterval);
            if (!demoMode) isGameOver = true;
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
        var renderSubs = false;
        if (role == "ship" && silentCnt<=0 && !demoMode) renderSubs = true;
        if ((role == "sub" || demoMode) && (silentCnt % 6 == 0)) renderSubs = true;
        if (renderSubs) renderEntities(subs);
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
            drawText(canvas.width/2, canvas.height/2 + 20, "Please reload (F5) to play again.", "white");
        }
        
        // print tutorial texts
        if (demoMode && tutCnt++ % 2 == 0) {
            drawText(128, 40, tutoTxt1, "yellow", 8);
            drawText(128, 150, tutoTxt2, "yellow", 8);
        }

        // render bodyCount
        for (i=0; i < bodyCount.length; i++) {
            ctx.drawImage(resources.get("img/i.png"),
                    0 + bodyCount[i]*14, 0,
                    14, 6,
                    i*14, 216,
                    14, 6);
        }

        // Draw glitch
        if (glitch.length) drawGlitch();
        
        // Draw retro arcade filter
        drawFilter();
        
        // Render to the main screen
        screenCtx.save();
        screenCtx.translate(256, 224);
        screenCtx.rotate(rot[0]);
        screenCtx.translate(-256, -224);
        screenCtx.drawImage(canvas, rot[1], rot[2], canvas.width, canvas.height, 0, 0, screen.width, screen.height);
        screenCtx.restore();
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
