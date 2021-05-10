const express = require('express');
const jwt = require('jsonwebtoken');
const { ColumnSet } = require('pg-promise');
const db = require('../db_related/db_config');

// console.log(process.env.DATABASE_URL)
// set up router through express, export at the end
const router = express.Router();

// Routes below=================================================================

// Test/Example endpoint
router.get('/', (req, res) => {
    res.render("index");
});


//The login endpoint
router.post('/login', (req, res) => {
    const getUserQuery = `SELECT * FROM users WHERE username='${req.body.username}';`;

    db.any(getUserQuery)
        .then(rows => {
            const user = rows[0];

            if (user == undefined) {
                return res.status(400).json('Cant find user');
            };
            if (req.body.password != user.pw) {
                return res.status(400).json('Wrong password');
            };

            //login success, send back jwt
            const token = jwt.sign(
                {//Note may want to send more stuff eg. score later on
                    username: user.username
                },
                "JWT_KEY_DEMO_IO",
                {
                    expiresIn: '1h',
                }
            );
            res.status(200).json({ token: token });
        })
        .catch(err => {
            console.log('Error running query: ', err);
        });
});


//The register endpoint
router.post('/register', (req, res) => {
    const checkUserNameQuery = `SELECT * FROM users WHERE username='${req.body.username}';`;

    db.any(checkUserNameQuery)
        .then(rows => {
            if (rows[0] != undefined) {
                return res.status(400).json('Username taken');
            };

            const insertQuery = `INSERT INTO users (username, pw) 
                                 VALUES ('${req.body.username}',
                                         '${req.body.password}');`;
            db.any(insertQuery)
                .then(() => {
                    return res.send({ msg: "Account created!" });
                })
                .catch(error => {
                    console.log('Error', error);
                    return res.status(400).json('Something went wrong');
                });
        })
        .catch(err => {
            return res.status(400).json('Something went wrong');
        });
});


//The check if login endpoint
router.post('/checkLogin', (req, res) => {
    try {
        const token = req.body.token;
        const decoded = jwt.verify(token, "JWT_KEY_DEMO_IO");
        req.userData = decoded;
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(401).json({
            success: false,
            msg: "Auth failed"
        });
    }
});

router.get('/leaderboard', (req, res) => {
    // get all the users who have scores in the scores table
    const usersQuery = `select * from users where user_id in(select user_id from scores order by score desc limit 10);`;
    // get all the scores and sort them by descending order
    const scoresQuery = `select * from scores order by score desc limit 10;`;
    var userScoreArr = [];
    db.task('get-everything', task => {
        return task.batch([
            task.any(usersQuery),
            task.any(scoresQuery)
        ]);
    })
        .then(data => {
            for (var i in data[1]) {
                var index = data[0].findIndex((user) => user.user_id == data[1][i].user_id)
                userScoreArr.push({
                    name: data[0][index].username,
                    score: data[1][i].score,
                    kills: data[0][index].elims,
                    deaths: data[0][index].deaths,
                    acc: data[1][i].game_accuracy
                })
            }
            res.send(userScoreArr)
        })
        .catch(error => {
            console.log(error)
        })
})

router.post('/updateScores', (req, res) => {
    var userQuery = `update users set elims=elims+${req.body.eliminations}, deaths=deaths+1, accuracy=(accuracy+${req.body.shotsFired == 0 ? 0.000 : (req.body.shotsLanded / req.body.shotsFired).toFixed(3)})/2 where username='${req.body.id}' returning *;`
    console.log(userQuery)
    db.any(userQuery)
        .then(dbUser => {
            if (req.body.eliminations > 0) {
                var scoresQuery = `insert into scores(score, user_id, game_accuracy) values(${req.body.eliminations}, ${dbUser[0].user_id}, ${req.body.shotsFired == 0 ? 0.000 : (req.body.shotsLanded / req.body.shotsFired).toFixed(3)});`;
                db.any(scoresQuery)
                    .then(() => {
                        console.log("updated scores")
                    })
                    .catch(err => {
                        console.error('Error while updating scores', err)
                    })
            }
        })
        .catch(error => {
            console.error("Error while updating users: ", error)
        })

})
module.exports = router;