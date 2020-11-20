const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')



const app = express();
const pg = require("pg");
const Pool = pg.Pool;
const connectionString = process.env.DATABASE_URL || 'postgresql://yongama:pg123@localhost:5432/waiterz';
const pool = new Pool({
    connectionString
});

const WaitersApp = require("./waiter")
const waiter = WaitersApp(pool)

const session = require('express-session')
const flash = require('express-flash')

app.use(session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.engine('handlebars', exphbs({ layoutsDir: "views/layouts/" }));
app.set('view engine', 'handlebars');

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post("/", async function (req, res) {
    var newWaiter = req.body.name
    await waitersApp.waiter(newWaiter)
    res.render("index")
})

app.get("/", async function (req, res) {
    res.render("signin")
})

app.get('/logout', (req, res) => {
    res.render('signin');
});

app.post('/signin', async (req, res, next) => {
    const { job_Type, signinUsername } = req.body;
    let username = signinUsername;
    try {
        await logIn(username, job_Type, req, res);
    } catch (error) {
        next(error);
    }
});

const logIn = async (username, job_Type, req, res) => {
    let found = await waiter.findUser(username, job_Type);

    if (found === 'waiter') {
        req.session.user_name = username;
        res.redirect('/waiters/' + username);
    } else if (found === 'Admin') {
        res.redirect('days');
    } else {
        req.flash('error', 'incorrect! please enter correct details');
        res.redirect('/');
    }
}

app.get('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let findUser = await waiter.findusername(username);
        let weekdays = await waiter.getWeekdays(username);
        res.render('home', {
            daynames: weekdays,
            username,
            findUser
        });
    } catch (error) {
        next(error);
    }
})


app.post('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let weekdays = await waiter.getWeekdays(username);
        if (weekdays != undefined || weekdays != [] &&
            username != undefined || username != "") {
            let shift = {
                username: username,
                days: Array.isArray(req.body.dayname) ? req.body.dayname : [req.body.dayname]
            }
            req.flash('info', 'Shift(s) succesfully added');
            await waiter.dayShift(shift);
            res.redirect(`/waiters/${username}`);
        }

    } catch (error) {
        next(error);
    }
})

app.get('/days', async (req, res, next) => {
    try {
        await waiter.getWeekdays();
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
        req.flash('info', 'Shift succesfully deleted');
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
            if (await waiter.addWaiter(full_name, username, job_Type)) {
                req.flash('info', 'Succesfully registered');
            } else {
                req.flash('error', 'incorrect details');
            }
        } else {
            req.flash('error', 'Fill in the required information');
        }

        await logIn(username, job_Type, req, res);
    } catch (e) {
        next(e);
    }
});


app.get("/waiters", async function (req, res) {
    const waiters = await waitersApp.getWaiters()
    res.render("waiters", {
        list: waiters
    })
})

app.post("/waiters/:user", async function (req, res) {
    var user = req.params.user
    var days = req.body.day

    if (days === undefined) {
        req.flash('error', 'select day')
    } else {

        await waitersApp.selectedDay(user, days)
    }

    const daysList = await waitersApp.waitersDays(user)
    res.render("waiter", {
        waiter: user,
        daysList
    })
})

app.get("/waiters/:user", async function (req, res) {
    var user = req.params.user
    const daysList = await waitersApp.waitersDays(user)
    res.render("waiter", {
        waiter: user,
        daysList
    })
})

app.get("/days", async function (req, res) {
    var days = await waitersApp.schedule()
    res.render("days", {
        list: days,
    })
})

app.get("/reset", async function (req, res) {
    await waitersApp.reset()
    res.render("days")
})

const PORT = process.env.PORT || 3008;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
})