const jsend = require("jsend");
const allowTo = (req, res, next) => {
  const userRole = req.user.role;
  if (userRole !== "admin") {
    return res
      .status(403)
      .send(
        jsend.error({
          message:
            "Access denied. You do not have permission to perform this action.",
        }),
      );
  }
  next();
};
module.exports = allowTo;
