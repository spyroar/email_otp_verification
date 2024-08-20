const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const auth = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Failed to authenticate token" });
    }
    req.userId = decoded.id; // Attach the user ID to the request
    next();
  });
};

module.exports = auth;
