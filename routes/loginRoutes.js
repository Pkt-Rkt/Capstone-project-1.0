const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel"); // Assuming you have a User model set up for MongoDB

const router = express.Router();

router.get("/login", (req, res) => {
    // Check if the user is already authenticated and redirect accordingly
    if (req.session.user) {
        // User is authenticated, redirect to a protected page (e.g., dashboard)
        res.redirect("/dashboard");
    } else {
        // User is not authenticated, serve the login page
        res.sendFile(path.join(__dirname, "../views", "login.html"));
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // For security, use a generic error message for both cases
            return res.status(401).send("Invalid username or password.");
        }

        req.session.user = { id: user._id, username: user.username }; // Store only the essential user info in the session
        res.redirect("/dashboard"); // Redirect to a protected page or dashboard after successful login
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
