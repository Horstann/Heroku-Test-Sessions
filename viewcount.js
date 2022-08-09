const express = require('express');
const session = require('express-session');
//const flash = require('connect-flash'); // not used here
const app = express(); 

const sessionOptions = {secret: 'thisisnotagoodsecret', resave: false, saveUninitialized: false}; 
app.use(session(sessionOptions));
//app.use(flash);

// viewcounts
app.get('/viewcount', (req, res) => {
    if (req.session.count){ // if count exists
        req.session.count += 1;
    }else{
        req.session.count = 1;
    }
    res.send(`You have viewed this page ${req.session.count} times!`)
})

app.get('/register', (req, res) => {
    const {username = 'Anonymous'} = req.query; // if username empty, default to 'Anonymous'
    req.session.username = username;
    res.redirect('/greet');
})

app.get('/greet', (req, res) => {
    const {username} = req.session;
    res.send(`Welcome back, ${username}!`);
})



app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000');
})