import axios from "axios";
//=======Generate Content=====

export const generateContentAPI = async (userPrompt) => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/openai/generate-content", // ✅ changed 8090 to 5000
    {
      prompt: userPrompt,
    },
    {
      withCredentials: true,
    },
  );
  return response?.data;
};
