// ! ONLY USE AFTER THE CLUBS HAVE BEEN ADDED TO THE DATABASE

const fs = require("fs");
const { changeData } = require("../../db/main");

async function seedTagsAndMappings() {
  try {
    // Load your clubs.json file
    const clubsData = JSON.parse(fs.readFileSync("./clubs.json", "utf8"));

    // 1. Extract all unique tags from the file
    const uniqueTags = [...new Set(clubsData.clubs.flatMap((c) => c.tags))];

    console.log(
      `Found ${uniqueTags.length} unique tags in clubs.json. Seeding now...`,
    );

    // 2. Insert into the 'tags' table using 'tag_name'
    for (const tagName of uniqueTags) {
      const tagQuery =
        "INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT (tag_name) DO NOTHING";
      await changeData(tagQuery, [tagName]);
    }

    // 3. Map clubs to tags in the 'club_tags' junction table
    console.log("Creating junction mappings...");
    for (const club of clubsData.clubs) {
      for (const tagName of club.tags) {
        // This query finds the ID of the tag we just inserted and links it to the club ID
        const mappingQuery = `
                    INSERT INTO club_tags (club_id, tag_id)
                    SELECT $1, id FROM tags WHERE tag_name = $2
                    ON CONFLICT DO NOTHING
                `;
        await changeData(mappingQuery, [club.id, tagName]);
      }
      console.log(`Successfully mapped tags for: ${club.name}`);
    }

    console.log("Tag and junction seeding complete!");
  } catch (error) {
    console.error("Error seeding tags:", error);
  }
}

seedTagsAndMappings();
