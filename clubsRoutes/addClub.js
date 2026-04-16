const { executeTransaction } = require("../db/main.js");

const addClubHandler = async (req, res) => {
  const {
    name,
    about,
    logo_url,
    contact_email,
    officers,
    instagram_url,
    website_url,
    twitter_url,
    tags,
  } = req.body;

  // Basic validation
  if (!name || !about) {
    return res
      .status(400)
      .json({ error: "Name and About fields are required." });
  }

  try {
    const result = await executeTransaction(async (client) => {
      // 1. Insert the club metadata
      const clubInsertQuery = `
                INSERT INTO clubs (
                    name, about, logo_url, contact_email, 
                    officers, instagram_url, website_url, twitter_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id;
            `;

      const clubValues = [
        name,
        about,
        logo_url,
        contact_email,
        JSON.stringify(officers || []), // Ensure JSONB compatibility
        instagram_url,
        website_url,
        twitter_url,
      ];

      const clubRes = await client.query(clubInsertQuery, clubValues);
      const newClubId = clubRes.rows[0].id;

      // 2. Handle Tags (if provided)
      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          // Insert tag if it doesn't exist (using your schema's tag_name column)
          await client.query(
            "INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT (tag_name) DO NOTHING",
            [tagName],
          );

          // Map the tag to the club in the junction table
          const mappingQuery = `
                        INSERT INTO club_tags (club_id, tag_id)
                        SELECT $1, id FROM tags WHERE tag_name = $2
                        ON CONFLICT DO NOTHING;
                    `;
          await client.query(mappingQuery, [newClubId, tagName]);
        }
      }

      return newClubId;
    });

    res.status(201).json({
      message: "Club successfully created!",
      clubId: result,
    });
  } catch (err) {
    console.error("POST /clubs error:", err);
    res
      .status(500)
      .json({ error: "Internal server error while creating club." });
  }
};

module.exports = addClubHandler;
