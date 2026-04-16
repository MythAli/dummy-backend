const { fetchData } = require("../db/main.js");

const fetchTagsHandler = async (_, res) => {
  try {
    // 1. Fetch all tags from the tags table
    // Ordering by name makes it much easier for users to navigate the list
    const query = "SELECT tag_name FROM tags ORDER BY tag_name ASC;";
    const dbData = await fetchData(query);

    // 2. Convert rows from [{tag_name: 'Tech'}, {tag_name: 'Art'}]
    // to a flat array: ['Art', 'Tech']
    const tagsArray = dbData.rows.map((row) => row.tag_name);

    // 3. Send the clean array back to the frontend
    res.status(200).json(tagsArray);
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: "Could not retrieve tags." });
  }
};

module.exports = fetchTagsHandler;
