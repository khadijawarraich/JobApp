const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const auth = require("../middleware/auth");

// Protect all application routes
router.use(auth);

// GET only this user's applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create application for this user
router.post("/", async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.user.userId,
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update only this user's application
router.put("/:id", async (req, res) => {
  try {
    const updatedApplication = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(updatedApplication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update only status for this user's application
router.patch("/:id/status", async (req, res) => {
  try {
    const updatedApplication = await Application.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(updatedApplication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE only this user's application
router.delete("/:id", async (req, res) => {
  try {
    const deletedApplication = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;