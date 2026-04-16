const userRoutes = require("express").Router();

const fetchClubsHandler = require("./fetchClubs.js");
const addClubHandler = require("./addClub.js");
const fetchTagsHandler = require("./fetchTags.js");
const fetchClubHandler = require("./fetchClub:id.js");
const editClubHandler = require("./editClub.js");
const fetchClubEventsHandler = require("./fetchClubEvents.js");
const authenticateToken = require("../middleware/authenticateToken.js");
const { UserType } = require("../helpers/constants.js");

userRoutes.get("/", fetchClubsHandler);
userRoutes.post("/", addClubHandler);
userRoutes.get("/tags", fetchTagsHandler);
userRoutes.get("/:id", fetchClubHandler);
userRoutes.put("/:id", authenticateToken([UserType.CLUB]), editClubHandler);
userRoutes.get("/:id/events", fetchClubEventsHandler);

module.exports = userRoutes;
