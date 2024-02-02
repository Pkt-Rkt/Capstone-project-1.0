// Load required modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Create a new router
const router = express.Router();

// Route for serving the login page
router.get("/login", (req, res) => {
    // Check if the user is already authenticated and redirect accordingly
    if (req.session.user) {
        // User is authenticated, redirect to a protected page
        res.redirect("/index.html");
    } else {
        res.sendFile(path.join(__dirname, "../public", "login.html"));
    }
});

// Route for handling login attempts
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for username and password in the request
    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username or password.");
    }

    // Check if the provided password matches the stored password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid username or password.");
    }

    // Set user session after successful login
    req.session.user = { id: user._id, username: user.username };
    res.redirect("/index.html");
  } catch (error) {
    // Log any errors and respond with a server error message
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Export the router
module.exports = router;