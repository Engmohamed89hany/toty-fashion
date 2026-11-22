const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jesnd = require("jsend");
const cookieParser = require("cookie-parser");
const userRouters = require("./Routes/Users.route");
const CategoryRouters = require("./Routes/Category.route");
const ProductRouters = require("./Routes/Products");
const ReviewRouters = require("./Routes/Reviews");
const app = express();
const port = process.env.PORT || 4000;
const { db } = require("./config/ConnectDB");

const { getImageDirectory } = require("./utilites/imageStorage");
const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  "http://localhost:3000",
  "https://toty-fashion.vercel.app",
  ...configuredOrigins,
]);

app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(getImageDirectory()));
app.get("/api/health", async (req, res) => {
  try {
    await db.promise().query("SELECT 1");
    return res.status(200).send(
      jesnd.success({
        status: "ok",
        database: "connected",
      }),
    );
  } catch (error) {
    console.error("Database health check failed:", error);
    return res
      .status(503)
      .send(jesnd.error({ message: "Database unavailable" }));
  }
});
// routes
app.use("/api/users", userRouters);
app.use("/api/categories", CategoryRouters);
app.use("/api/products", ProductRouters);
app.use("/api/reviews", ReviewRouters);
// handel route if not exit
app.use((req, res, next) => {
  res.status(404).send(jesnd.error({ message: "Route not found" }));
});
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Unhandled API error:", error);
  const errorStatus = error.statusCode ?? error.status;
  const statusCode =
    Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus <= 599
      ? errorStatus
      : error.code === "LIMIT_FILE_SIZE"
        ? 413
        : 500;
  const message = statusCode < 500 ? error.message : "Internal server error";

  return res.status(statusCode).send(jesnd.error({ message }));
});

if (require.main === module) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
