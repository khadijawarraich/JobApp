const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({ username });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

module.exports = router;