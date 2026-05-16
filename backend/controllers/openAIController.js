const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory");
const User = require("../models/User");

// Content Generation Controller (Free Pollinations AI)
const openAIController = asyncHandler(async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // --- REAL FREE AI GENERATOR (Pollinations.ai) ---
    // No API key needed, completely free, actual LLM generation.
    
    // We encode the prompt so it's safe for a URL
    const encodedPrompt = encodeURIComponent(`Write a professional blog post about: ${prompt}. Include a Title, Introduction, Main Content, and Conclusion.`);
    
    // Call the free text generation API
    const response = await axios.get(`https://text.pollinations.ai/${encodedPrompt}`);
    
    const content = response.data;

    console.log("Generated Content:", content);

    // Save content history if user is logged in
    if (req.user?._id) {
      const newContent = await ContentHistory.create({
        user: req.user._id,
        content,
      });

      const userFound = await User.findById(req.user._id);
      if (userFound) {
        userFound.history.push(newContent._id);
        userFound.apiRequestCount += 1;
        await userFound.save();
      }
    }

    res.status(200).json({
      status: "success",
      data: content,
    });

  } catch (error) {
    console.error("POLLINATIONS AI ERROR:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Something went wrong generating content",
    });
  }
});

module.exports = {
  openAIController,
};


