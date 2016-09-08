"use strict";

(function () {

    var socket, sendBtn, message, playerName, buttons;

    function setMessage(text) {
        message.innerHTML = text;
    }
    
    function displayScore(text) {
        score.innerHTML = text;
    }

    function bind() {
        socket.on("start", function (cfg) {
            cfg.socket = socket;
            initGame(false, cfg)
        });

        socket.on("shipPosition", function (pos) {
            receiveShipPosition(pos);
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
        
        socket.on("win", function () {
            points.win++;
            displayScore("You win!");
        });

        socket.on("lose", function () {
            points.lose++;
            displayScore("You lose!");
        });

        socket.on("draw", function () {
            points.draw++;
            displayScore("Draw!");
        });

        socket.on("end", function () {
            setMessage("Waiting for opponent...");
        });

        socket.on("connect", function () {
            setMessage("Welcome. Enter your name.");
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
        sendBtn = document.getElementById("sendName");
        message = document.getElementById("message");
        buttons = document.getElementById("buttons");
        
        bind();
    }

    window.addEventListener("load", initClient, false);
})();
