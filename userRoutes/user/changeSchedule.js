const { changeData } = require("../../db/main.js");
// Write a query to find events that fall within a student's free
// date range without worrying about whether the student's "start time" was 12:00 AM or 8:00 AM:

// `SELECT * FROM events
// WHERE start_time::date >= (SELECT calendar_start FROM student_users WHERE id = 1)
//   AND end_time::date <= (SELECT calendar_end FROM student_users WHERE id = 1);`

const changeScheduleHandler = async (req, res) => {
  const { calendar_start, calendar_end } = req.body;
  // If the frontend sends new Date(), this will be an ISO string

  const query = `
        UPDATE student_users 
        SET calendar_start = $1, calendar_end = $2 
        WHERE id = $3
    `;

  try {
    await changeData(query, [calendar_start, calendar_end, req.params.id]);
    res.send("Schedule updated!");
  } catch (err) {
    res.status(500).send("Error saving date");
  }
};

module.exports = changeScheduleHandler;
