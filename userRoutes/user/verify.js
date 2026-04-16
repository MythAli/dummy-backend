const { fetchData } = require("../../db/main.js");
const { UserType } = require("../../helpers/constants.js");

const verifyHandler = async (req, res) => {
  try {
    const { email, userType } = req.user;

    // Determine which table to query and what data to get
    let query;
    let displayName;

    if (userType === UserType.STUDENT) {
      // Query for Student names
      query = `SELECT * FROM student_users WHERE email = $1`;
      const dbData = await fetchData(query, [email]);

      if (dbData.rows.length === 0)
        return res.status(404).json({ message: "Student not found" });

      const user = dbData.rows[0];
      const studentId = user.id;

      const first =
        user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
      const last =
        user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1);
      displayName = `${first} ${last}`;

      // Fetch Favorite Club IDs
      const favoritesIDsRes = await fetchData(
        `SELECT club_id FROM student_favorite_clubs WHERE student_id = $1`,
        [studentId],
      );
      const favoritesIDs = favoritesIDsRes.rows.map((row) => row.club_id);

      const favoritesClubsQuery = "SELECT * FROM clubs WHERE id = ANY($1)";

      const favoriteClubsRes = await fetchData(favoritesClubsQuery, [
        favoritesIDs,
      ]);

      // Fetch Attending Event IDs
      const eventsIDsRes = await fetchData(
        `SELECT event_id FROM student_event_attendance WHERE student_id = $1`,
        [studentId],
      );
      const eventsIDs = eventsIDsRes.rows.map((row) => row.event_id);

      const eventsQuery = "SELECT * FROM events WHERE id = ANY($1)";

      const eventsRes = await fetchData(eventsQuery, [eventsIDs]);

      res.status(200).json({
        authenticated: true,
        name: displayName,
        email,
        userType,
        calendarStart: user.calendar_start
          ? user.calendar_start.toISOString()
          : null,
        calendarEnd: user.calendar_end ? user.calendar_end.toISOString() : null,
        favorites: favoriteClubsRes.rows, // Array of Clubs
        attending: eventsRes.rows, // Array of Events
      });
    } else if (userType === UserType.CLUB) {
      // Query for Club name
      query = `SELECT club_name FROM club_users WHERE email = $1`;
      const dbData = await fetchData(query, [email]);

      if (dbData.rows.length === 0)
        return res.status(404).json({ message: "Club user not found" });

      displayName = dbData.rows[0].club_name;

      res.status(200).json({
        authenticated: true,
        name: displayName,
        email,
        userType,
      });
    }
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = verifyHandler;
