const { fetchData } = require("../db/main.js");

const fetchClubEventsHandler = async (req, res) => {
  const { id } = req.params;

  try {
    // Query the events table for this club
    // Order by start_time so the frontend gets a proper timeline
    const query = `
      SELECT 
        id, 
        title, 
        start_time, 
        end_time, 
        description 
      FROM events 
      WHERE club_id = $1 
      ORDER BY start_time ASC;
    `;
    
    const dbData = await fetchData(query, [id]);

    // 3. Return the array of events
    // This returns the exact structure you showed: [{title, start_time, ...}, ...]
    res.status(200).json(dbData.rows);

  } catch (err) {
    console.error("Error fetching club events:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = fetchClubEventsHandler;