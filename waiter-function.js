
module.exports = function () {

    const pg = require("pg");
    const Pool = pg.Pool;
    const connectionString = process.env.DATABASE_URL || 'postgresql://yongama:pg123@localhost:5432/waiters';
    const pool = new Pool({
        connectionString
    });

    async function waiter(x) {

        var name = x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()
        const item = await pool.query(`select id from waiters where waiters = $1`, [name])
        if (item.rowCount === 0) {
            await pool.query(`insert into waiters (waiters) values ($1)`, [name]);
        }

    }

    async function getWaiters() {
        const waiterList = await pool.query(`select waiters from waiters`)
        return waiterList.rows
    }

    async function selectedDay(x, y) {
        await pool.query(`delete from shifts where waiters_name =$1`, [x])
        for (let i = 0; i < y.length; i++) {
            let day = y[i]
            await pool.query(`insert into shifts (weekdays_name, waiters_name) values ($1, $2)`, [day, x])
        }
    }

    async function waitersDays(x) {
        const lists = await pool.query(`select weekdays_name from shifts where waiters_name = $1`, [x])
        var lst = lists.rows

        var dai = await pool.query(`select * from weekdays`)
        var day = dai.rows;

        day.forEach(allDays => {
            lst.forEach(WaiterDays => {
                if (WaiterDays.weekdays_name === allDays.weekdays) {
                    allDays.state = "checked"
                }
            })
        })
        return day
    }

    async function schedule() {
        var days = await pool.query(`select count(*) from weekdays`)
        const daysId = days.rows[0].count

        var dai = await pool.query(`select weekdays from weekdays`)
        var day = dai.rows
        let list = []

        for (var i = 0; i < daysId; i++) {
            var dei = day[i].weekdays
            var lists = await pool.query(`select waiters_name from shifts where weekdays_name = $1`, [dei])
            let names = []
            let colors = ""
            for (var j = 0; j < lists.rows.length; j++) {
                name = lists.rows[j].waiters_name
                //console.log(name)
                names.push(name)
            }

            if (names.length > 3) {
                colors = 'red'
            } else if (names.length === 3) {
                colors = 'green'
            } else {
                colors = 'orange'
            }

            list.push({
                days: dei,
                waiters: names,
                color: colors,
            })
        }
        return list
    }

    async function reset() {
        const clear = await pool.query('delete from shifts');
        return clear.rows
    }

    return {
        waiter,
        getWaiters,
        selectedDay,
        waitersDays,
        schedule,
        reset

    }
}