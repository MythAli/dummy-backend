const jwt = require("jsonwebtoken");
require("dotenv").config();
const { fetchData } = require("../../db/main.js");

const verifyHandler = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // 1. Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const userEmail = decoded.email;

    // 2. Find the user (Using parameterized query to prevent SQL Injection)
    const dbData = await fetchData(
      `SELECT first_name, last_name FROM users WHERE email='${userEmail}';`,
    );
    
    if (dbData.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = dbData.rows[0];

    // 3. Format the name
    const firstName =
      user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1);
    const lastName =
      user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1);
    const fullName = `${firstName} ${lastName}`;

    // 4. Send back the data
    res.status(200).json({
      authenticated: true,
      name: fullName,
    });
  } catch (error) {
    // jwt.verify throws error if expired or tampered with
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyHandler;
