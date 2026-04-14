const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessTokens = (userData) => {
  return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

module.exports.generateLogInData = (email) => {
  const accessToken = generateAccessTokens({ email });
  const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET);

  return { accessToken, refreshToken };
};
