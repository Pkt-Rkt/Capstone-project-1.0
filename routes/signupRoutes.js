// Import necessary modules
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// Create a new router object to handle routes
const router = express.Router();
const saltRounds = 10; // Cost factor for hashing

// Route to serve the signup page
router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "signup.html"));
});

// Route to handle signup form submission
router.post("/signup", async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    try {
        // Validate input: ensure all fields are provided
        if (!username || !password || !confirmPassword) {
            return res.status(400).send("Username, password, and confirm password are required.");
        }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).send("Password and confirm password do not match.");
        }

        // Check for an existing user with the same username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send("Username already exists.");
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Set user session after successful signup
        req.session.user = { id: newUser._id, username: newUser.username };

        // Redirect to the index page after successful signup
        res.redirect("/index.html");
    } catch (error) {
        // Log any errors and respond with a server error message
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Export the router
module.exports = router;