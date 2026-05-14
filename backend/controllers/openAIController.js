const asyncHandler = require("express-async-handler");
const axios = require("axios");
const ContentHistory = require("../models/ContentHistory"); // ✅ missing import
const User = require("../models/User"); // ✅ missing import

//* == OPENAI Controller ==
const openAIController = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { prompt } = req.body;

  try {
    // ✅ validate prompt
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `generate a blog post for ${prompt}`,
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ fixed - extract content from response FIRST before using it
    const content = response?.data?.choices[0]?.message?.content?.trim();
    console.log("Generated content:", content);

    // ✅ fixed - create history with correct field (content not text)
    const newContent = await ContentHistory.create({
      user: req?.user?._id,
      content, // ✅ now content is defined
    });

    // ✅ fixed - push contentHistory._id not content._id
    const userFound = await User.findById(req?.user?._id);
    if (userFound) {
      userFound.history.push(newContent?._id);

      //* update the api request count
      userFound.apiRequestCount += 1;
      await userFound.save();
    }

    // ✅ send response
    res.status(200).json({
      status: "success",
      data: content,
    });

  } catch (error) {
    console.error("OpenAI Error:", error?.response?.data || error.message);
    res.status(500).json({
      message: error?.response?.data?.error?.message || error.message,
    });
  }
});

module.exports = { openAIController };