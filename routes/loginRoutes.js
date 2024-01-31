//routes/loginRoutes.js
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel"); // Assuming you have a User model set up for MongoDB

const router = express.Router();

router.get("/login", (req, res) => {
    // Check if the user is already authenticated and redirect accordingly
    if (req.session.user) {
        // User is authenticated, redirect to a protected page (e.g., dashboard)
        res.redirect("/index.html");
    } else {
        // User is not authenticated, serve the login page
        res.sendFile(path.join(__dirname, "../public", "login.html"));
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
  
    try {
      if (!username || !password) {
        return res.status(400).send("Username and password are required.");
      }
  
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).send("Invalid username or password.");
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send("Invalid username or password.");
      }
  
      req.session.user = { id: user._id, username: user.username };
      res.redirect("/index.html"); // Redirect to a protected page after successful login
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = router;
