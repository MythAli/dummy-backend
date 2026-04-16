const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided." });

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;

      // Check if the user's type is in the allowed list
      if (allowedRoles.length && !allowedRoles.includes(decoded.userType)) {
        return res.status(403).json({
          error: `Access Denied: ${decoded.userType}s cannot perform this action.`,
        });
      }

      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token." });
    }
  };
};

module.exports = authenticateToken;
