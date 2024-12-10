const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv = require("dotenv");

const errorMiddleware = require("./middleware/error");

// config
dotenv.config({ path: "./backend/config/config.env" });

// Middleware
app.use(express.json({ limit: "50mb" })); // Avoid duplicate express.json calls
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use("/public", express.static(path.join(__dirname, "public")));

// app.use(express.static(path.join(__dirname, "../frontend/build")));

// app.get("*" , (req,res)=>{
//     res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
// })

// Route Imports
const product = require("./routes/productRoutes");
const user = require("./routes/userRoutes");
const Order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", Order);
app.use("/api/v1", payment);

// test
app.use("/homi", (req, res) => {
  res.send("home!");
});

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
