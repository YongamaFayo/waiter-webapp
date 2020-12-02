module.exports = (pool) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const week_days = async () => {
        for (const day of days) {
            await pool.query('INSERT INTO weekdays (dayName) VALUES ($1)', [day]);
        }
    }

    const findUser = async (username, job_Type) => {
        if (username != undefined || username != ""
            && job_Type !== undefined || job_Type !== '') {
            let found = await pool.query('SELECT * FROM waiterDB WHERE username=$1 And  position=$2 ', [username, job_Type]);
            if (found.rowCount === 1) {

                return found.rows[0].position;
            }
            else {
                return true;
            }
        }
    }

    const findusername = async (username) => {
        let found = await pool.query('SELECT full_name FROM waiterDB WHERE username=$1', [username]);
        return found.rows[0];
    }

    const getWeekdays = async (username) => {
        let storedDays = await pool.query('SELECT dayName FROM weekdays');
        let selectedShift = await findSelectedDays(username);
        for (let i = 0; i < storedDays.rowCount; i++) {
            let current = storedDays.rows[i];
            selectedShift.forEach(days => {
                let found = days.dayname;
                if (current.dayname === found) {
                    current.checked = "checked";
                }
            })
        }

        return storedDays.rows;
    }

    const addWaiter = async (username, full_name, job_Type) => {
        
        if (username !== "" && full_name !== "" && job_Type !== "") {
            await pool.query('INSERT INTO waiterDB (full_name,username,position) VALUES ($1,$2,$3)', [full_name, username, job_Type]);
            return true;
        } else {
            false;
        }
    }

    const selectShift = async (shift) => {
        //  console.log(shift.days + " Shift")
        const weekdays = shift.days;
        // console.log(weekdays + " weekdays");
        const findUsernameID = await pool.query('SELECT id From waiterDB WHERE username=$1', [shift.username]);
        // console.log()
        if (findUsernameID.rowCount > 0) {
            let userID = findUsernameID.rows[0].id;
            await pool.query('DELETE FROM dayShifts WHERE waiter_id =$1', [userID]);
            for (let day of weekdays) {
                let findDayID = await pool.query('SELECT id From weekdays WHERE dayName=$1', [day]);
                // console.log(findDayID)
                await pool.query('INSERT INTO dayShifts (waiter_id,weekday_id) VALUES($1,$2)', [userID, findDayID.rows[0].id]);
            }
            return true;
        } else {
            return false;
        }

    }

    const allShifts = async () => {
        let storedShifts = await pool.query(
            `SELECT full_name, dayName FROM dayShifts 
            JOIN waiterDB ON waiterDB.id = dayShifts.waiter_id 
            JOIN weekdays ON weekdays.id = dayShifts.weekday_id`
        )
        return storedShifts.rows;
    }

    const groupByDay = async () => {
        let storedShifts = await allShifts();

        let shiftArray = [{
            id: 0,
            day: 'Sunday',
            Waiters: []
        }, {
            id: 1,
            day: 'Monday',
            Waiters: []
        }, {
            id: 2,
            day: 'Tuesday',
            Waiters: []
        }, {
            id: 3,
            day: 'Wednesday',
            Waiters: []
        }, {
            id: 4,
            day: 'Thursday',
            Waiters: []
        }, {
            id: 5,
            day: 'Friday',
            Waiters: []
        }, {
            id: 7,
            day: 'Saturday',
            Waiters: []
        }]

        if (storedShifts.length > 0) {

            shiftArray.forEach(current => {
                for (let i = 0; i < storedShifts.length; i++) {
                    if (current.day === storedShifts[i].dayname) {
                        current.Waiters.push(storedShifts[i].full_name);
                    }
                }
            })

            shiftArray.forEach(current => {
                for (let i = 0; i < storedShifts.length; i++) {
                    if (current.Waiters.length > 3) {
                        current.color = "red";
                    }
                    if (current.Waiters.length === 3) {
                        current.color = "green";
                    }
                    if (current.Waiters.length < 3) {
                        current.color = "orange";
                    }
                }
            })

        }
        console.log(shiftArray);
        return shiftArray;
    }



    const deleteShifts = async () => {
        let clear = await pool.query('DELETE FROM dayShifts');
        return clear.rows;
    }
    const findSelectedDays = async (username) => {
        console.log(username)
        let foundDays = await pool.query('SELECT dayName FROM dayShifts JOIN waiterDB ON waiterDB.id = dayShifts.waiter_id JOIN weekdays ON weekdays.id = dayShifts.weekday_id WHERE username=$1', [username]);
        return foundDays.rows;
    }

    return {
        addWaiter,
        findUser,
        findusername,
        weekDays: week_days,
        getWeekdays,
        dayShift: selectShift,
        clearShifts: deleteShifts,
        allShifts,
        groupByDay,



    }

}






