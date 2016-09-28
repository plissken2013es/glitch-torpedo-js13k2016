# Glitch torpedo
[![](https://img.shields.io/badge/js13kGames-2016-b12a34.svg)](http://js13kgames.com/) [![](https://img.shields.io/badge/desktop-%23-----yellow.svg)](http://2016.js13kgames.com/#winners)   [![](https://img.shields.io/badge/server-%234-yellow.svg)](http://2016.js13kgames.com/#winners-server)

[PLAY](https://glitch-torpedo.herokuapp.com/) (need a friend) – [entry](http://js13kgames.com/entries/glitch-torpedo)

## Context

"Glitch torpedo" is my 2016 [js13kGames](http://js13kgames.com/entries/2016) submission, a multiplayer sea battle online arcade game, based on Gremlin's "Depthcharge" arcade machine (1977). The goal of the compo is to make a game in less than 13k of zipped JavaScript. Theme was "glitch". 

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


