### Current `state` object structure (the state obj in `server.js` line 61)

```javascript
state = {
    roomcode:{
        clientID:  {player: {Player Property Object}},
        clientID2: {player: {Player Property Object}},
        ...
    },
    roomcode2:{
    	clientID3: {player: {Player Property Object}},
        ...
	},
    ...
}
```

<hr>



Previous structure use array for each room (flawed)

```js
state = {
    roomcode:[
        {player: {Player Property Object}},
        {player: {Player Property Object}},
        ...
    ],
    roomcode2:[
    	{player: {Player Property Object}},
        ...
	],
    ...  
}
```

