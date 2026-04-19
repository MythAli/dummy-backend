const userRoutes = require("express").Router();

const loginHandler = require("./login.js");
const registerHandler = require("./register.js");
const refreshHandler = require("./refresh.js");
const verifyHandler = require("./verify.js");
const profileHandler = require("./profile.js");
const changeScheduleHandler = require("./changeSchedule.js");
const toggleUserFavoriteHandler = require("./toggleUserFavorite.js");
const toggleEventAttendanceHandler = require("./toggleEventAttendance.js");
const authenticateToken = require("../../middleware/authenticateToken.js");
const { UserType } = require("../../helpers/constants.js");

userRoutes.post("/login", loginHandler);
userRoutes.post("/register", registerHandler);
userRoutes.post("/refresh", refreshHandler);
userRoutes.get(
  "/verify",
  authenticateToken([UserType.STUDENT, UserType.CLUB]),
  verifyHandler,
);
userRoutes.post(
  "/toggleFavorite",
  authenticateToken([UserType.STUDENT]),
  toggleUserFavoriteHandler,
);
userRoutes.post(
  "/toggleEvent",
  authenticateToken([UserType.STUDENT]),
  toggleEventAttendanceHandler,
);
userRoutes.get(
  "/:id/profile",
  authenticateToken([UserType.STUDENT]),
  profileHandler,
);
userRoutes.put(
  "/:id/schedule",
  authenticateToken([UserType.STUDENT]),
  changeScheduleHandler,
);

module.exports = userRoutes;
