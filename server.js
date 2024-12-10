const express = require("express");
const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");



// Handiling uncaugth Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server sue to uncaught Exceptiion`);
  process.exit(1);
});

// config
dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT;

// Connection to data base
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const server = app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});

// unhandled Promise Rejection

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
