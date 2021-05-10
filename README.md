# DEMO IO

The project will be a browser based .IO game. It will have multiplayer functionallity for friends to play together real time. PLayers will be able to decide their in game names and jump into a server with others. The value of this project is in how entertaining it is for players. 

As for the mechanics of the game, players will load into a 2D top down view of a map. The camera will be centered on their ingame character which will be a vehicle. The player will be able to manuver their vehicle to collect powerups and coins to increase in size or strength. They will be competing against each other for superiority and greatest strength, and their name on a leaderboard. The players highest scores will be tracked and posted on a seperate leaderboard for others to see.

## Project Website

Live website [here on heroku](https://demo-io.herokuapp.com)

## Directory Stucture

```
MILESTONES (all the milestene pdfs)
Team Meeting Logs (logs with TA)
ProjectCode
|--- frontend
     |--- assets (contain imgs etc.)
     |--- css (contain css files)
     |--- js (contain js files)
     |--- pages (contain html files)
|--- server
     |--- server.js
     |--- routes
          |--- routes.js
     |--- game.js
     |--- constants.js
     |--- utils.js
     |--- packages.json
     |--- package-lock.json
     |--- node_modules
     |--- db_realated
          |--- db_config.js
          |--- create.sql
|--- docs
     |--- directory structure.md
     |--- gamestate Structure.md
```

## To Run the Code

```
npm start
```


## Architecture

**Frontend**

* Use HTML5 canvas (with CSS) as the game board on the webpage.
* Use JavaScript to implement game rules etc.

**Middle layer**

* Use Express (framework based on Node.js) to power the web server
* Use socket.io (websocket library) to accomplish real-time multiplayer connection.

**Backend**

* Use postgresql to store data (eg. player's highest score).


## Authors

* Aiden Colley
* Benny Sakiewicz
* Junyu Chen
* Sam Harris
* Ziwei Cheng
* Zoe Roy
