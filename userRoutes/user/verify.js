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
      const favsRes = await fetchData(
        `SELECT club_id FROM student_favorite_clubs WHERE student_id = $1`,
        [studentId],
      );
      const favoriteClubs = favsRes.rows.map((row) => row.club_id);

      // Fetch Attending Event IDs
      const eventsRes = await fetchData(
        `SELECT event_id FROM student_event_attendance WHERE student_id = $1`,
        [studentId],
      );
      const attendingEvents = eventsRes.rows.map((row) => row.event_id);

      res.status(200).json({
        authenticated: true,
        name: displayName,
        email,
        userType,
        favorites: favoriteClubs, // Array of IDs: [1, 5, 12]
        attending: attendingEvents, // Array of IDs: [101, 105]
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
