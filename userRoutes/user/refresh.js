const jwt = require("jsonwebtoken");
require("dotenv").config();
const { userType } = require("../../helpers/constants.js");

const refreshHandler = (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Invalid or expired refresh token" });
    }

    // Generate a new access token using the email from the decoded refresh token
    // This matches the payload structure in your login.js
    const { email, userType } = decoded;

    const accessToken = jwt.sign(
      { email, userType },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "60m" },
    );

    res.json({ accessToken, userType });
  });
};

module.exports = refreshHandler;
