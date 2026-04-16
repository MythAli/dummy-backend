const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.generateLogInData = (id, email, userType) => {
  const payload = { id, email, userType }; // Bake the role into the token
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken, userType };
};
