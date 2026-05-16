import axios from "axios";

//=======Generate Content=====

export const generateContentAPI = async (userPrompt) => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/openai/generate",
    {
      prompt: userPrompt,
    },
    {
      withCredentials: true,
    }
  );
  // Return the actual generated string (response.data.data) instead of the whole {status, data} object
  return response?.data?.data || "";
};