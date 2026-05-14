const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://mohak682005:Mohak682005@ai-chatbot.nwn3zut.mongodb.net/AI-CHATBOT?retryWrites=true&w=majority&appName=AI-CHATBOT"
    );
    console.log(`mongoDB connected ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to mongoDB ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 