const { fetchData } = require("../db/main.js");

const fetchClubsHandler = async (req, res) => {
  try {
    const query = `
            SELECT 
                c.id, 
                c.name, 
                c.about, 
                c.logo_url,
                c.officers,
                json_agg(t.tag_name) AS tags
            FROM clubs c
            LEFT JOIN club_tags ct ON c.id = ct.club_id
            LEFT JOIN tags t ON ct.tag_id = t.id
            GROUP BY c.id, c.name, c.about, c.logo_url
            ORDER BY c.id ASC;
        `;

    const result = await fetchData(query);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Database error");
  }
};

module.exports = fetchClubsHandler;
