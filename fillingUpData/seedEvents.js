const fs = require("fs");
const { changeData } = require("../db/main");

async function seedEvents() {
  try {
    const eventsData = JSON.parse(
      fs.readFileSync("./club_events_full.json", "utf8"),
    );

    for (const event of eventsData.events) {
      const query = `
                INSERT INTO events (club_id, title, start_time, end_time, description) 
                VALUES ($1, $2, $3, $4, $5)
            `;
      const values = [
        event.club_id,
        event.title,
        event.start_time,
        event.end_time,
        event.description,
      ];
      await changeData(query, values);
    }
    console.log("Events seeded successfully!");
  } catch (error) {
    console.error("Error seeding events:", error);
  }
}

seedEvents();
