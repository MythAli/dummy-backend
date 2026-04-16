const { changeData } = require("../db/main.js");

const fetchClubHandler = async (req, res) => {
  const clubId = req.params.id;

  const query = `
        SELECT 
            c.*, 
            json_agg(t.tag_name) AS tags
        FROM clubs c
        LEFT JOIN club_tags ct ON c.id = ct.club_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = $1
        GROUP BY c.id;
    `;

  try {
    const result = await changeData(query, [clubId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Club not found" });
    }

    // Return the single club object instead of an array
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

module.exports = fetchClubHandler;
