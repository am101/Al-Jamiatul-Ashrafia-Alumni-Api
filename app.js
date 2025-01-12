const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:admin123@cluster0.3wpti.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define Alumni Schema
const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  isMisbahi: { type: Boolean, required: true },
  batchYear: { type: Number, required: true },
  profession: { type: String, required: true },
  institute: { type: String },
});

// Model
const Alumni = mongoose.model("Alumni", alumniSchema);

app.get("/", (req, res) => {
  res.send("Welcome to Alumni API");
});

// API to submit alumni form
app.post("/submit-form", async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      isMisbahi,
      batchYear,
      profession,
      institute,
    } = req.body;

    // Validate required fields
    if (!name || !mobile || !email || isMisbahi === undefined || !batchYear || !profession) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Additional validation for non-Misbahi
    if (!isMisbahi && !institute) {
      return res
        .status(400)
        .json({ error: "Institute name is required for non-Misbahis" });
    }

    const alumni = new Alumni({
      name,
      mobile,
      email,
      isMisbahi,
      batchYear,
      profession,
      institute: isMisbahi ? null : institute, // Set institute to null if Misbahi
    });

    const savedAlumni = await alumni.save();
    res.status(201).json({ message: "Form submitted successfully", data: savedAlumni });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
