# Glitch torpedo
[![](https://img.shields.io/badge/js13kGames-2016-green.svg)](http://js13kgames.com/) [![](https://img.shields.io/badge/server-%234-blue.svg)](http://2016.js13kgames.com/#winners-server)

[PLAY](https://glitch-torpedo.herokuapp.com/) (need a friend) – [entry](http://js13kgames.com/entries/glitch-torpedo)

## Context

"Glitch torpedo" is my 2016 [js13kGames](http://js13kgames.com/entries/2016) submission, a multiplayer sea battle online arcade game, based on Gremlin's "Depthcharge" arcade machine (1977). 
The goal of the compo is to make a game in less than 13k of zipped JavaScript. Theme was "glitch". 

## Instructions:

Ship commander may use LEFT/RIGHT arrows (or A and D keys) to move destroyer. 
Z and X keys launch depth charges (M and N does the same).
The ship has 5 charges available, reloaded on explosiones.
Each submarine sunk scores differently.

Submarine commander does not control movement of subs, but may launch torpedoes from
any of them by using number keys (1 to 8). The deepest torpedo launches score more points.
Moreover, Sub player may enter "Silent running" mode by pressing SPACE once per game: 
the subs will become invisible to the Ship player for a few seconds.

When time is over, the best score wins.

Important note: remember that this is and old arcade machine and some undesired bugs or
"glitches" may appear occasionally.

Good luck, Captain!

# Tech overview

- Canvas2D is used for all the drawing
- [jsfxr.js](https://github.com/mneubrand/jsfxr) for the audio (5 sounds)
- Socket.io server logic based on [js13kgames server](https://github.com/js13kGames/js13kserver)

## Making the server logic

> A non exhaustive summary about the server and the client doing their thing

Last year, I spent a lot of time creating a [brand new game featuring "shiny" mechanics](http://js13kgames.com/entries/battle-of-mages-in-the-unireverse) and couldn't add the server logic at the very end.
This time, I wanted to do differently. So I started by creating the working local 2-player version of the game in a few days, and then direct all my efforts to do the server magic (one thing I had never did before). 

### Only two players per room

Basically, when a player arrives to the server and enters his/her name, looks for any non-paired player that arrived before. If found, the player that was waiting will take the "destroyer" role and the incoming player will be the "sub commander".

If there's no available player, the incoming user will add to the queue and wait for a new player to come. He/she will play as "destroyer captain" when this happens. [Code is here](public/server_noCompress.js).

### The 'glitch effect' is generated on the server side

The 'glitch effect' is generated on the server side

When a game is created on the server, a limit number between 5 and 10 is chosen and a counter is set to 0. The torpedo and deep charge signals, coming from the clients, increment this counter one unit each. If the chosen limit is exceeded, the server script generates a unique glitch object that is sent to the two players, so they suffer the same effects. [Code is here again](public/server_noCompress.js).

A main canvas draws everything in its correct position while a second canvas is used to the the scale and rotation tricks.

### Moving the ship

The first approach that I used was to send the ship position to the server every 34 milliseconds. And all the way back to the submarine player. Undesirable effects appeared.

A simplier solution was to send the "destroyer player" keyDown and keyUp events only, so the ship movement was smoother. And add the ship position to the keyUp event message, so the final ship position were accurate.

### Moving the subs

The subs are generated pseudo-randomly by the client part when its role is "submarine player", then their position and potential score are sent to the server and all the way back to the "ship player".

When a torpedo is launched by the sub player, that submarine position is sent to the server too. This way the ship player client can create the torpedo in his/her screen and update the sub position to prevent small differences. And the network traffic is kept to a minimum.

### Synchronizing sunk event

However, I found a case in that the destroyer sometimes was sunk in one screen and not in the other. So I added a kind of watchdog or "sunk-syncro-system" that tells the server to inform the other player when the ship is hit. The score is synced, too.

## Some final tips

That's pretty much it, but I'd like to give some tips on developing a JS13k game.

- I don't recommend to do any JavaScript tricks to save bytes until I was forced to, at the very last days of the compo. 

- I tried to make sure that my game was running first, and then I improved it and added the server logic. Having readable and maintainable code was very important throughout this process.

- Finally: don't even think on starting to work before studying all the precious resources, tutorials and postmostems available at the [js13kgames website](http://js13kgames.github.io/resources/).
