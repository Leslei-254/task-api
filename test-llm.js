require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: "user",
          content: "Reply with exactly: AI connection works",
        },
      ],
    });

    console.log("AI RESPONSE:");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("AI REQUEST FAILED:");
    console.error(error.message);
  }
}

test();