const fs = require("fs");
const { changeData } = require("../db/main"); // Adjust path to your db/main.js

async function seedDatabase() {
  try {
    // 1. Load the JSON files (You can combine your batches into one array)
    const clubsData = JSON.parse(fs.readFileSync("./clubs_full.json", "utf8"));

    console.log(`Starting seed: ${clubsData.clubs.length} clubs found.`);

    for (const club of clubsData.clubs) {
      const query = `
                INSERT INTO clubs (
                    name, about, logo_url, contact_email, 
                    officers, instagram_url, website_url, twitter_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;

      const values = [
        club.name,
        club.about,
        club.logo_url,
        club.contact_email,
        JSON.stringify(club.officers), // Convert array to JSON string for JSONB
        club.instagram_url,
        club.website_url,
        club.twitter_url,
      ];

      await changeData(query, values);
      console.log(`Inserted: ${club.name}`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
