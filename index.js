const cors = require('cors');
const express = require('express');
const app = express();
const port = 4000;
const fs = require('fs');

app.use(cors());
app.use(express.json());

app.post('/api/signup', (req, res) => {
    if (!req.body.name && !req.body.password) {
        res.status(400).json("Missing credentials")
    }
    const newUser = {
        name: req.body.name,
        password: req.body.password
    }
    fs.writeFileSync('users.json', JSON.stringify(newUser))
    res.sendStatus(200)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})