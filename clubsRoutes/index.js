const clubsRouts = require("express").Router();
const { getStoredClubs, storeClubs } = require("../data/clubs");

clubsRouts.get("/", async (_, res) => {
  const storedClubs = await getStoredClubs();
  // await new Promise((resolve, reject) => setTimeout(() => resolve(), 1500));
  res.json({ clubs: storedClubs });
});

clubsRouts.get("/:id", async (req, res) => {
  const storedClubs = await getStoredClubs();
  const club = storedClubs.find((club) => club.id === req.params.id);
  res.json({ club });
});

clubsRouts.post("/", async (req, res) => {
  const existingClubs = await getStoredClubs();
  const clubData = req.body;
  const newClub = {
    ...clubData,
    id: Math.random().toString(),
  };
  const updatedClubs = [newClub, ...existingClubs];
  await storeClubs(updatedClubs);
  res.status(201).json({ message: "Stored new club.", club: newClub });
});

module.exports = clubsRouts;
