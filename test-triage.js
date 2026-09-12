require("dotenv").config();

const client = require("./ai/client");
const triageSchema = require("./ai/schema");

function parseAIJson(raw) {
  let cleaned = raw.trim();

  // Remove Markdown code fences if the model adds them
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }
}

async function triage(text) {
  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL,
    messages: [
      {
        role: "system",
        content: `
You are a support ticket triage system.

Classify the ticket into exactly one category:
billing, bug, feature, other.

Classify urgency as:
low, normal, high.

Return ONLY valid JSON.
Do not use Markdown code fences.

The JSON must contain:
category
urgency
confidence
reason

confidence must be a number between 0 and 1.
reason must be concise.
        `.trim(),
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const raw = response.choices[0].message.content;

  console.log("RAW AI RESPONSE:");
  console.log(raw);

  const parsed = parseAIJson(raw);

  // Validate the AI response against our trusted schema
  const validated = triageSchema.parse(parsed);

  return validated;
}

async function main() {
  const result = await triage(
    "I was charged twice for my subscription this month."
  );

  console.log("\nVALIDATED RESULT:");
  console.log(result);
}

main().catch((err) => {
  console.error("\nTRIAGE FAILED:");
  console.error(err.message);
});