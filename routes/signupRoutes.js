const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/userModel"); // Import your user model here

const router = express.Router();
const saltRounds = 10; // Cost factor for hashing

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "signup.html"));
});

router.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).send("Username already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        // Store user information in the session
        req.session.user = { id: newUser._id, username: newUser.username };

        res.redirect("/login"); // Redirect user to the login page after successful signup
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
