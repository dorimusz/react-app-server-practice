const cors = require('cors');
const express = require('express');
const app = express();
const port = 4000;
const fs = require('fs');
const { setInterval } = require('timers/promises');
app.use(cors());
app.use(express.json());

const users = require('./users.json');
const mySessionStorage = {};

app.post('/api/signup', (req, res) => {
    if (!req.body.name || !req.body.password) {
        return res.status(400).json("Missing credentials")
    }
    const userExists = users.some((user) => user.name === req.body.name)
    if (userExists) {
        return res.sendStatus(409)
    }
    const newUser = {
        name: req.body.name,
        password: req.body.password,
        todos: []
    }
    users.push(newUser)

    fs.writeFileSync('users.json', JSON.stringify(users, null, 4))
    res.sendStatus(200)
})

app.post('/api/todo', (req, res) => {
    const sessionId = req.header('authorization');
    if (!sessionId) return res.sendStatus(401);

    /* //Már nincs a headerben username meg jelszó
    const username = autoHead.split(':::')[0];
    const password = autoHead.split(':::')[1];
    */

    const user = mySessionStorage[sessionId]

    //const user = users.find((user) => user.name === username && user.password === password);
    if (!user) return res.sendStatus(401);

    const todoMess = req.body.todo
    if (!todoMess) return res.sendStatus(400)

    user.todos.push(todoMess)
    fs.writeFileSync('users.json', JSON.stringify(users, null, 4))
    res.sendStatus(200)
})

app.get('/api/todo', (req, res) => {
    const sessionId = req.header('authorization');
    if (!sessionId) return res.sendStatus(401);
    const user = mySessionStorage[sessionId]
    if (!user) return res.sendStatus(401);

    res.json(user.todos);
    // console.log(autoHead)
})

app.post('/api/login', (req, res) => {
    const autoHead = req.header('authorization')
    if (!autoHead) return res.sendStatus(401);

    const username = autoHead.split(':::')[0];
    const password = autoHead.split(':::')[1];

    const user = users.find((user) => user.name === username && user.password === password);
    if (!user) return res.sendStatus(401);
    //res.sendStatus(200)

    const sessionId = Math.random().toString(); //random string
    mySessionStorage[sessionId] = user;
    console.log(mySessionStorage);

    setTimeout(() => {
        console.log('Session ended');
        delete mySessionStorage[sessionId];
    }, 10 * 60 * 1000)

    res.json(sessionId) //ez lesz ebben az esetben a response.data
})

app.delete("/api/logout", (req, res) => {
    console.log(req.headers)
    const sessionId = req.header('authorization');
    console.log(sessionId)
    if (!sessionId) return res.sendStatus(401);
    delete mySessionStorage[sessionId];
    console.log(mySessionStorage)
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})