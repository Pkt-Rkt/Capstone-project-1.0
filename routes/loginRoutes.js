const express = require("express");
const path = require("path");
const User = require("../models/userModel"); // Import your user model here

const router = express.Router();

// Display the login page
router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "login.html"));
});

// Handle login form submission
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate the username and password
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // Check if the user exists in the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        // Verify the password
        if (password !== user.password) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        // If authentication is successful, create a session for the user
        req.session.user = { username }; // Store user data in the session

        // Redirect to a protected page or dashboard
        res.redirect("/dashboard"); // Replace with the desired protected route
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
