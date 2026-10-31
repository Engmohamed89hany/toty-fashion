const jwt = require("jsonwebtoken");
async function generateToken(payload) {
  const token = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
  return token;
}
async function refreshToken(payload) {
  const token = await jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return token;
}
module.exports = { generateToken, refreshToken };
