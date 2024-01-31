const express = require("express");
const path = require("path");
const User = require("../models/userModel"); // Import your user model here

const router = express.Router();

// Display the signup page
router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "signup.html"));
});

// Handle signup form submission
router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate the username and password
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // Check if the username already exists in the database
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ error: "Username already exists. Please choose a different one." });
        }

        // If validation is successful, create a new user in the database
        const newUser = new User({ username, password });
        await newUser.save();

        // Redirect to the login page after successful signup
        res.redirect("/login");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
