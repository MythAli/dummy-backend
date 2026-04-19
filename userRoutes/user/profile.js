const { fetchData } = require("../../db/main.js");
// Write a query to find events that fall within a student's free
// date range without worrying about whether the student's "start time" was 12:00 AM or 8:00 AM:

// `SELECT * FROM events
// WHERE start_time::date >= (SELECT calendar_start FROM student_users WHERE id = 1)
//   AND end_time::date <= (SELECT calendar_end FROM student_users WHERE id = 1);`

const profileHandler = async (req, res) => {
  const { id: studentId } = req.user;
  const clubsFull = req.query.clubsFull;
  const eventsFull = req.query.eventsFull;

  try {
    const studentQuery = `SELECT * FROM student_users WHERE id = $1`;
    const studentData = await fetchData(studentQuery, [studentId]);
    if (studentData.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const user = studentData.rows[0];

    // Fetch Favorite Club IDs
    const favoritesIDsRes = await fetchData(
      `SELECT club_id FROM student_favorite_clubs WHERE student_id = $1 ${clubsFull ? "" : "LIMIT 2"}`,
      [studentId],
    );
    const favoritesIDs = favoritesIDsRes.rows.map((row) => row.club_id);

    const favoritesClubsQuery = "SELECT * FROM clubs WHERE id = ANY($1)";

    const favoriteClubsRes = await fetchData(favoritesClubsQuery, [
      favoritesIDs,
    ]);

    // Fetch Attending Event IDs
    const eventsIDsRes = await fetchData(
      `SELECT event_id FROM student_event_attendance WHERE student_id = $1 ${eventsFull ? "" : "LIMIT 2"}`,
      [studentId],
    );
    const eventsIDs = eventsIDsRes.rows.map((row) => row.event_id);

    const eventsQuery = "SELECT * FROM events WHERE id = ANY($1)";

    const eventsRes = await fetchData(eventsQuery, [eventsIDs]);

    res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      calendarStart: user.calendar_start
        ? user.calendar_start.toISOString()
        : null,
      calendarEnd: user.calendar_end ? user.calendar_end.toISOString() : null,
      favorites: favoriteClubsRes.rows, // Array of Clubs
      attending: eventsRes.rows, // Array of Events});
    });
  } catch (err) {
    res.status(500).send("Error saving date");
  }
};

module.exports = profileHandler;
