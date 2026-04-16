const { fetchData, changeData } = require("../../db/main.js");

const toggleEventAttendanceHandler = async (req, res) => {
  const { studentId, eventId } = req.body;

  // 1. Basic Validation
  if (!studentId || !eventId) {
    return res.status(400).json({ error: "Missing Student or Event ID" });
  }

  try {
    // Check if the student is already marked as "attending"
    const existsQuery = `
            SELECT * FROM student_event_attendance 
            WHERE student_id = $1 AND event_id = $2
        `;
    const exists = await fetchData(existsQuery, [studentId, eventId]);

    if (exists.rows.length > 0) {
      // If they exist, REMOVE them (Un-attend)
      await changeData(
        "DELETE FROM student_event_attendance WHERE student_id = $1 AND event_id = $2",
        [studentId, eventId],
      );
      return res
        .status(200)
        .json({ status: "removed", message: "No longer attending." });
    } else {
      // If they don't exist, ADD them (Attend)
      await changeData(
        "INSERT INTO student_event_attendance (student_id, event_id) VALUES ($1, $2)",
        [studentId, eventId],
      );
      return res
        .status(201)
        .json({ status: "added", message: "Marked as attending!" });
    }
  } catch (err) {
    console.error("Toggle Attendance Error:", err);
    // This will catch the Foreign Key error if eventId or studentId is invalid
    res.status(500).json({ error: "Failed to update attendance status." });
  }
};

module.exports = toggleEventAttendanceHandler;
