// ! ONLY USE AFTER THE CLUBS HAVE BEEN ADDED TO THE DATABASE

const fs = require('fs');
const { sha256 } = require('js-sha256');
const { changeData } = require('../../db/main');

async function seedRealClubUsers() {
  try {
    // 1. Load YOUR actual clubs.json
    const rawData = fs.readFileSync('./clubs.json', 'utf8');
    const { clubs } = JSON.parse(rawData);

    console.log(`Generating users for ${clubs.length} official clubs...`);

    for (const club of clubs) {
      // Create a predictable email: "contact.nebula@utdallas.edu"
      const emailSafeName = club.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const email = `contact.${emailSafeName}@utdallas.edu`;
      
      // Default password: "Password123!" (hashed)
      const hashedPw = sha256("Password123!");

      const query = `
        INSERT INTO club_users (club_name, email, password)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING;
      `;

      await changeData(query, [club.name, email, hashedPw]);
    }

    console.log("Database synced! Every club in your JSON now has a corresponding login.");
  } catch (error) {
    console.error("Sync Error:", error);
  }
}

seedRealClubUsers();