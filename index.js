const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')



const app = express();
const pg = require("pg");
const Pool = pg.Pool;
const connectionString = process.env.DATABASE_URL || 'postgresql://yongama:pg123@localhost:5432/waiters';
const pool = new Pool({
    connectionString
});

const WaitersApp = require("./waiter-function")
const waitersApp = WaitersApp()

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
    res.render("index")
})

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

const PORT = process.env.PORT || 3021;

app.listen(PORT, function () {
    console.log("App started at port:", PORT)
})