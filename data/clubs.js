const fs = require("node:fs/promises");

async function getStoredClubs() {
  const rawFileContent = await fs.readFile("clubs.json", { encoding: "utf-8" });
  const data = JSON.parse(rawFileContent);
  const storedClubs = data.clubs ?? [];
  return storedClubs;
}

function storeClubs(clubs) {
  return fs.writeFile("clubs.json", JSON.stringify({ clubs: clubs || [] }));
}

exports.getStoredClubs = getStoredClubs;
exports.storeClubs = storeClubs;
