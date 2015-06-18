var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var Chance = require('chance');
// Instantiate Chance so it can be used
var chance = new Chance();

//Enable cors
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var personNum = 3;
var users = {};
var sessions = {};

app.post('/api/login', function (req, res) {
    if (req.body.username && typeof req.body.username === 'string' &&
        req.body.password && typeof req.body.password === 'string') {

        if (users[req.body.username] && users[req.body.username].password === req.body.password) {
            var authToken = chance.natural().toString();
            users[req.body.username].authToken = authToken;
            sessions[authToken] = req.body.username;

            res.send({authToken: authToken});
        } else {
            res.status(401).send({error: 'Invalid username or password'});
        }

    } else {
        res.status(400).send({error: 'Post body must contain a username and a password and they must be strings'});
    }
});

app.post('/api/logout', function (req, res) {
    var username = sessions[req.headers.authorization];
    delete sessions[req.headers.authorization];
    if (users[username]) {
        delete users[username].authToken;
    }

    res.sendStatus(200);
});

app.post('/api/createAccount', function (req, res) {
    if (req.body.username && typeof req.body.username === 'string' &&
        req.body.password && typeof req.body.password === 'string') {

        if (!users[req.body.username]) {
            users[req.body.username] = {
                id: chance.natural(),
                username: req.body.username,
                password: req.body.password,
                authToken: undefined,
                age: chance.age(),
                name: chance.name(),
                favouriteColor: chance.color(),
                profilePic: 'http://lorempixel.com/200/300/people/' + personNum,
                email: chance.email({domain: "brainstation.io"})
            };
            personNum++;
            res.sendStatus(200);
        } else {
            res.status(400).send({error: 'User already exists'});
        }

    } else {
        res.status(400).send({error: 'Post body must contain a username and a password and they must be strings'});
    }
});

app.get('/api/user', function (req, res) {
    var authToken = req.headers.authorization;
    if (authToken) {
        var username = sessions[authToken];

        if(username && users[username] && users[username].authToken === authToken) {
            var user = users[username];
            res.send({
                id: user.id,
                username: user.username,
                age: user.age,
                name: user.name,
                favouriteColor: user.favouriteColor,
                profilePic: user.profilePic,
                email: user.email
            });
            return;
        }

    }

    res.status(401).send({error: 'User not logged in'});
});

var server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening');
});