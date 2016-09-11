# subs-multiplayer
"Glitch torpedo", my 2016 js13k submission, is a multiplayer sea battle online arcade game, 
based on Gremlin's "Depthcharge" arcade machine (1977).

INSTRUCTIONS:
Ship commander may use LEFT/RIGHT arrows (or A and D keys) to move destroyer. 
Z and X keys launch depth charges (M and N does the same).
The ship has 5 charges available, reloaded on explosiones.
Each submarine sunk scores differently.

Submarine commander does not control movement of subs, but may launch torpedoes from
any of them by using number keys (1 to 8). The deepest torpedo launches score more points.
Moreover, Sub player may enter "Silent running" mode by pressing SPACE once per game: 
the subs will become invisible to the Ship player for a few seconds.

Any time toggle MUSIC on/off by pressing M key.

When time is over, the best score wins.

Important note: remember that this is and old arcade machine and some undesired bugs or
"glitches" may appear occasionally.

Good luck, Captain!


TO-DOs:
(done) Limit the number of characters for the player names
(done) Hide the info screen
(done) Solve the sub score issues
(done) Solve the disconnection issues
(done) Check if server supports multiple connections and disconnections
(done) Number of online players
(done) Latency time for ship after being sunk
(done) Syncronize sinking
(done) Improve ship movement network traffic
(done) Add glitchs, rotations and screen magic to add fun
(done) Add small tutorial
(done) Paint a nice? cover for this game
(done) Add ninja mode for subs (optional)
(done) Add music (optional)
(done) Remove console.logs & join JS in one file
- Review disconnection issues with 2 players
- Give replay option to players at game end