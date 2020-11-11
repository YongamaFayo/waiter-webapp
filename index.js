"use strict";
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const Waiter = require('./waiter.js');

const app = express();

app.use(express.static('public'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

//database connection 
const pg = require('pg');
const Pool = pg.Pool;

let useSSL = false;
if (process.env.DATABASE_URL) {
    useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://yongama:pg123@localhost:5432/'

const pool = new Pool({
    connectionString,
 
});
let waiter = Waiter(pool);

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        checkedDays: function () {
            if (this.checked) {
                return 'checked';
            }
        }
    }

}));

app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
    res.render('sigin');
});

app.get('/logout', (req, res) => {
    res.render('sigin');
});

const checkAccess = async (req, res, next) => {
    console.log(req.session.user_name, req.params.username);
    if (req.session.user_name !== req.params.username) {
        req.flash('access', "access denied");
        res.redirect('/');
    } else {
        next();
    }
}

app.post('/sigin', checkAccess, async (req, res, next) => {
    const { job_Type, siginUsername } = req.body;
    let username = siginUsername;
    try {
        await logIn(username, job_Type,req,res);
    } catch (error) {
        next(error);
    }
});

const logIn = async (username, job_Type ,req,res) => {
    let found = await waiter.foundUser(username, job_Type);
    if (found === 'waiter') {
        req.session.user_name = username;
        res.redirect('/waiters/' + username);
    } else if (found === 'Admin') {
        res.redirect('days');
    } else {
        req.flash('error', 'oops! Unable login please provide correct details');
        res.redirect('/');
    }
}

app.get('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let foundUser = await waiter.getUsername(username);
        let weekdays = await waiter.getdays(username);
        res.render('home', {
            daynames: weekdays,
            username,
            foundUser
        });
    } catch (error) {
        next(error);
    }
})

app.post('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let weekdays = await waiter.getdays(username);
        if (weekdays != undefined || weekdays != [] &&
            username != undefined || username != "") {
            let shift = {
                username: username,
                days: Array.isArray(req.body.dayname) ? req.body.dayname : [req.body.dayname]
            }
            req.flash('info', 'Succesfully added shift(s)');
            await waiter.dayShift(shift);
            res.redirect('/waiters/' + username);
        }

    } catch (error) {
        next(error);
    }
})

app.get('/days', async (req, res, next) => {
    try {
        await waiter.getdays();
        let storedShifts = await waiter.groupByDay();
        res.render('days', {
            storedShifts
        });
    } catch (error) {
        next(error);
    }
})

app.get('/clear', async (req, res, next) => {
    try {
        await waiter.clearShifts();
        req.flash('info', 'You have Succesfully deleted shift');
        res.redirect('days');
    } catch (error) {
        next(error)
    }
})

app.get('/signup', async (req, res, next) => {
    try {
        res.render('signup');
    } catch (e) {
        next(e);
    }
})

app.post('/signup', async (req, res, next) => {
    try {
        const { full_name, username, job_Type } = req.body;
        if (full_name !== undefined && username !== undefined
            && job_Type !== undefined && job_Type !== '') {
            if (await waiter.add_waiter(username, full_name, job_Type)) {
                req.flash('info', 'user is succesfully registered');
            } else {
                req.flash('error', 'wrong details');
            }
        } else {
            req.flash('error', 'please make sure you fill all the input fields');
        }
        // auto login
        await logIn(username, job_Type,req,res);
    } catch (e) {
        next(e);
    }
});


let PORT = process.env.PORT || 3012;
app.listen(PORT, (err) => {
    console.log('App starting on port', PORT)
});