// Load mongoose library
const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create User model
const User = mongoose.model("User", userSchema);

// Export User model
module.exports = User;
