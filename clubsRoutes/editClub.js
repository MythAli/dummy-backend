const { executeTransaction } = require("../db/main.js");

const editClubHandler = async (req, res) => {
  const clubId = req.params.id;
  const userId = req.user.id; // Comes from middleware

  const {
    name,
    about,
    logo_url,
    contact_email,
    instagram_url,
    website_url,
    twitter_url,
    officers,
    tags,
  } = req.body;

  try {
    await executeTransaction(async (client) => {
      // Ownership Check
      const checkRes = await client.query(
        `SELECT owner_id FROM clubs WHERE id = $1`,
        [clubId],
      );
      if (checkRes.rows.length === 0) throw new Error("404");
      if (checkRes.rows[0].owner_id !== userId) throw new Error("403");

      // Update Club Metadata
      const updateClubQuery = `
        UPDATE clubs 
        SET name = $1, about = $2, logo_url = $3, contact_email = $4, 
            instagram_url = $5, website_url = $6, twitter_url = $7, officers = $8
        WHERE id = $9
      `;
      const clubValues = [
        name,
        about,
        logo_url,
        contact_email,
        instagram_url,
        website_url,
        twitter_url,
        JSON.stringify(officers || []),
        clubId,
      ];
      await client.query(updateClubQuery, clubValues);

      // Update Tags
      if (tags && Array.isArray(tags)) {
        // First, clear existing tag mappings for this club
        await client.query(`DELETE FROM club_tags WHERE club_id = $1`, [
          clubId,
        ]);

        for (const tagName of tags) {
          // Ensure the tag exists in the main 'tags' table
          await client.query(
            "INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT (tag_name) DO NOTHING",
            [tagName],
          );

          // Re-map the new tag list to the club
          const mappingQuery = `
            INSERT INTO club_tags (club_id, tag_id)
            SELECT $1, id FROM tags WHERE tag_name = $2
            ON CONFLICT DO NOTHING;
          `;
          await client.query(mappingQuery, [clubId, tagName]);
        }
      }
    });

    res.status(200).json({ message: "Club and tags updated successfully!" });
  } catch (err) {
    if (err.message === "404")
      return res.status(404).json({ error: "Club not found." });
    if (err.message === "403")
      return res.status(403).json({ error: "Permission denied." });

    console.error("Edit Club Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = editClubHandler;
