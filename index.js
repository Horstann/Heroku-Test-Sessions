if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const bcrypt = require('bcrypt');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;
const User = require('./models/user.js');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/authDemo';

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({extended: true})); // so that req.body isn't undefined
app.use(session({secret: 'notagoodsecret'}));

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MONGO CONNECTION ERROR"));
db.once("open", () => {
    console.log("DATABASE CONNECTED");
})

// Bcrypt Demo
/*
const hashPassword = async(pw) => {
    const salt = await bcrypt.genSalt(12); // salt rounds
    const hash = await bcrypt.hash(pw, salt);
    console.log(salt);
    console.log(hash);
}
hashPassword('monkey');

const login = async(pw, hashedPw) => {
    const res = await bcrypt.compare(pw, hashedPw);
    if (res){
        console.log('LOGGGED IN! SUCCESSFUL MATCH!');
    }else{
        console.log('INCORRECT MATCH!');
    }
}
login('monkey', '$2b$12$NdvvPsDBw9WXqlhDAXGoLu97FKkF2CJNBU6gJeeSIFytFeDeTMoiy');
*/

const requireLogin = (req, res, next) => {
    if (!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}

app.get('/', async(req, res) => {
    const id = req.session.user_id;
    if (id){
        const user = await User.findById(id);
        const username = user.username;
        res.render('home.ejs', {username});
    }else{
        res.render('home.ejs', {username: null});
    }
})

app.get('/register', (req, res) => {
    res.render('register.ejs');
})

app.post('/register', async(req, res) => {
    const {password, username} = req.body;

    var foundUser = null;
    foundUser = await User.find({username: username});

    if (foundUser.length > 0){
        res.send(`There's already a registered account with username "${username}". Please use another username.`);
    }else if (username && password){
        const hash = await bcrypt.hash(password, 12);
        const user = new User({
            username,
            password: hash
        })
        await user.save();

        req.session.user_id = user._id;
        res.redirect('/secret');
    }else{
        res.send("Password and username cannot be empty!")
    }
})

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', async(req, res) => {
    const {username, password} = req.body;

    const foundUser = await User.findAndValidate(username, password);
    if (foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }else{
        res.send('Invalid username or password. Try again.');
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    //req.session.destroy();
    res.redirect('/');
})

// secret routes
app.get('/secret', requireLogin, async(req, res) => {
    const id = req.session.user_id;
    const user = await User.findById(id);
    const username = user.username;

    res.render('secret.ejs', {username});
})



app.listen(port, () => {
    console.log(`SERVING ON PORT ${port}`);
})
