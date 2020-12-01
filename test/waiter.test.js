const assert = require('assert');
const waiter = require("../waiter");

describe("waiter web-app", function () {
    const waiterFunction = waiter()
    const pg = require("pg");
    const Pool = pg.Pool;
    const connectionString = process.env.DATABASE_URL || 'postgresql://yongama:pg123@localhost:5432/waiterz';
    const pool = new Pool({
        connectionString
    });

    beforeEach(async function () {
        await pool.query("delete from dayshifts");
        await pool.query("delete from waiterdb");
        await pool.query("delete from weekdays");
        
    });

    it("should be able to add a name to the waiters table", async function () {
        await waiter.waiter("General")
        const result = await pool.query(`select count(*) from waiters`)
        const results = result.rows[0].count

        let funResults = await waiter.getWaiters()
        funResults = funResults.length

        assert.equal(funResults, results)
    })

    it("should be able to add a name to the waiters table and return it", async function () {
        await waiter.waiter("general")

        const result = await waiter.getWaiters()
        const results = result[0].waiters

        assert.deepEqual("general", results)
    })

    it("should be able to assign a waiter to a specific day", async function () {
        await waiterFunction.waiter("charl")
        await waiterFunction.selectedDay("charl", ["monday", "tuesday", "friday"])

        const result = await pool.query("select count(*) from shifts");
        const results = result.rows[0].count

        assert.equal(3, results)
    })

    it("should be able to return all waiters assigned to specific days", async function () {
        await waiterFunction.waiter("charl")
        await waiterFunction.selectedDay("charl", ["monday"])
        await waiterFunction.waiter("charles")
        await waiterFunction.selectedDay("charles", ["sunday"])

        const results = await waiterFunction.schedule()

        assert.deepEqual(results, [
            { "color": 'orange', days: 'sunday', waiters: [{ "waiters_name": "charles" }] },
            { "color": 'orange', days: 'monday', waiters: [{ "waiters_name": "charl" }] },
            { "color": 'orange', days: 'tuesday', waiters: [] },
            { "color": 'orange', days: 'wednsday', waiters: [] },
            { "color": 'orange', days: 'thursday', waiters: [] },
            { "color": 'orange', days: 'friday', waiters: [] },
            { "color": 'orange', days: 'saturday', waiters: [] }
        ])
    })

    it("should be able to reset the database", async () => {
        await waiterFunction.waiter("charl")
        await waiterFunction.selectedDay("charl", ["monday", "tuesday", "saturday"])
        await waiterFunction.waiter("charles")
        await waiterFunction.selectedDay("charles", ["sunday", "tuesday", "friday"])
        await waiterFunction.waiter("charly")
        await waiterFunction.selectedDay("charly", ["sunday", "saturday", "friday"])
        await waiterFunction.waiter("chark")
        await waiterFunction.selectedDay("chark", ["monday", "wednsday", "thursday"])

        await waiterFunction.reset()
        const result = await pool.query("select count(*) from shifts");
        const results = result.rows[0].count

        assert.equal(results, 0)
    })

    it("should be able to remove waiters from the database", async () => {
        // await waiter.waiter("charl")
        await waiter.selectShift("General", ["monday", "tuesday", "saturday"])
        // await waiter.waiter("General")
        await waiter.selectedDay("General", ["sunday", "tuesday", "friday"])
        // await waiter.waiter("Sheriff")
        await waiter.selectedDay("Sheriff", ["sunday", "saturday", "friday"])
        // await waiter.waiter("Ngamla")
        await waiter.selectedDay("Don", ["monday", "wednsday", "thursday"])

        await waiter.clearWaiters()
        const result = await pool.query("select count(*) from shifts");
        const results = result.rows[0].count

        assert.equal(results, 0)
    })
})
