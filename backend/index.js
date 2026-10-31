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

const path = require("path");
db.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("Connected to MySQL");
  }
});
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.6:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));
// routes
app.use("/api/users", userRouters);
app.use("/api/categories", CategoryRouters);
app.use("/api/products", ProductRouters);
app.use("/api/reviews", ReviewRouters);
// handel route if not exit
app.use((req, res, next) => {
  res.status(404).send(jesnd.error({ message: "Route not found" }));
});
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
