const { changeData, fetchData } = require("../db/main.js");

const fetchClubHandler = async (req, res) => {
  const clubId = req.params.id;

  const clubQuery = `
        SELECT 
            c.*, 
            json_agg(t.tag_name) AS tags
        FROM clubs c
        LEFT JOIN club_tags ct ON c.id = ct.club_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = $1
        GROUP BY c.id;
    `;

  const eventsQuery = `
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

  try {
    const result = await changeData(clubQuery, [clubId]);

    const dbData = await fetchData(eventsQuery, [clubId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Club not found" });
    }

    const club = { ...result.rows[0], events: dbData.rows };

    // Return the single club object instead of an array
    res.json(club);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = fetchClubHandler;
