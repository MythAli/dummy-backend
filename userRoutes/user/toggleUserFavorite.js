const { fetchData, changeData } = require("../../db/main.js");

const toggleUserFavoriteHandler = async (req, res) => {
  const { studentId, clubId } = req.body;

  // Basic Validation
  if (!studentId || !clubId) {
    return res.status(400).json({ error: "Missing Student or Event ID" });
  }

  try {
    // Check if it already exists
    const exists = await fetchData(
      "SELECT * FROM student_favorite_clubs WHERE student_id = $1 AND club_id = $2",
      [studentId, clubId],
    );

    if (exists.rows.length > 0) {
      // Remove it (un-favorite)
      await changeData(
        "DELETE FROM student_favorite_clubs WHERE student_id = $1 AND club_id = $2",
        [studentId, clubId],
      );
      return res.json({ status: "removed" });
    } else {
      // Add it (favorite)
      await changeData(
        "INSERT INTO student_favorite_clubs (student_id, club_id) VALUES ($1, $2)",
        [studentId, clubId],
      );
      return res.json({ status: "added" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = toggleUserFavoriteHandler;
