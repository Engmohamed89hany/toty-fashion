const jwt = require("jsonwebtoken");
const jsend = require("jsend");
require("dotenv").config();
const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"] || req.headers["Authorization"];
  const token = header && header.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .send(jsend.error({ message: "Access denied. No token provided." }));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send(jsend.error({ message: "Invalid token." }));
  }
};
module.exports = verifyToken;
