const express = require("express");
const bodyParser = require("body-parser");
const TherapistController = require("./controllers/therapist");

const app = express();
const therapistController = new TherapistController();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// Routes
app.get("/", (req, res) => {
  res.render("index", { response: null });
});

app.post("/", async (req, res) => {
  const userInput = req.body.userInput;
  const therapistResponse = await therapistController.getTherapistResponse(userInput);

  res.render("index", { response: therapistResponse });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
