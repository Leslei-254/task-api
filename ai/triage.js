const client = require("./client");
const triageSchema = require("./schema");
const logLLMUsage = require("./logger");
const fs = require("fs");
const path = require("path");

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const PROMPT_VERSION = "triage-v1";

const TRIAGE_PROMPT = fs.readFileSync(
  path.join(__dirname, "..", "prompts", "triage-v1.txt"),
  "utf8"
);

function parseAIJson(raw) {
  let cleaned = raw.trim();

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function isRetryableError(err) {
  const status = err.status || err.code;
  const message = String(err.message || "").toLowerCase();

  const isTimeout =
    err.name === "TimeoutError" ||
    status === "ETIMEDOUT" ||
    status === "ECONNABORTED" ||
    message.includes("timeout");

  const isRateLimit = status === 429;

  const isServerError =
    typeof status === "number" && status >= 500 && status < 600;

  return isTimeout || isRateLimit || isServerError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUsage(response) {
  const usage = response.usage || {};

  return {
    input_tokens: usage.prompt_tokens ?? usage.input_tokens ?? null,
    output_tokens:
      usage.completion_tokens ?? usage.output_tokens ?? null,
  };
}

function logUsage(response, startedAt, repair) {
  const usage = getUsage(response);

  logLLMUsage({
    prompt_version: PROMPT_VERSION,
    model: process.env.LLM_MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    duration_ms: Date.now() - startedAt,
    repair,
  });
}

function quarantineAIOutput(originalText, rawOutput, repairError) {
  const filename = `triage-${Date.now()}.json`;
  const filepath = path.join(__dirname, "quarantine", filename);

  fs.mkdirSync(path.dirname(filepath), { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    original_text: originalText,
    raw_output: rawOutput,
    repair_error: repairError?.message || String(repairError),
  };

  fs.writeFileSync(filepath, JSON.stringify(record, null, 2));

  console.error(`AI output quarantined: ${filepath}`);
}

async function repairAIOutput(rawOutput, originalText) {
  const startedAt = Date.now();

  const response = await client.chat.completions.create(
    {
      model: process.env.LLM_MODEL,
      messages: [
        {
          role: "system",
          content: `
You are repairing the output of a support ticket triage system.

Return ONLY valid JSON.

The JSON must contain:
{
  "category": "billing | bug | feature | other",
  "urgency": "low | normal | high",
  "confidence": 0.0,
  "reason": "one short sentence"
}

Do not add Markdown.
Do not add explanations.
Do not invent information.
          `.trim(),
        },
        {
          role: "user",
          content: JSON.stringify({
            original_ticket: originalText,
            invalid_output: rawOutput,
          }),
        },
      ],
    },
    {
      timeout: TIMEOUT_MS,
    }
  );

  logUsage(response, startedAt, true);

  return response.choices[0].message.content;
}

async function triage(text) {
  // Kill switch / deterministic stub mode.
  if (process.env.LLM_ENABLED === "false") {
    return {
      category: "other",
      urgency: "normal",
      confidence: 0,
      reason: "LLM disabled; returning deterministic stub response.",
    };
  }

  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const startedAt = Date.now();

      const response = await client.chat.completions.create(
        {
          model: process.env.LLM_MODEL,
          messages: [
            {
              role: "system",
              content: TRIAGE_PROMPT,
            },
            {
              role: "user",
              content: text,
            },
          ],
        },
        {
          timeout: TIMEOUT_MS,
        }
      );

      logUsage(response, startedAt, false);

      const raw = response.choices[0].message.content;

      // First attempt: parse and validate original output.
      try {
        const parsed = parseAIJson(raw);
        return triageSchema.parse(parsed);
      } catch (validationError) {
        console.warn(
          "Initial AI output failed validation. Attempting one repair."
        );

        // Exactly one repair attempt.
        try {
          const repairedRaw = await repairAIOutput(raw, text);
          const repairedParsed = parseAIJson(repairedRaw);

          return triageSchema.parse(repairedParsed);
        } catch (repairError) {
          console.error(
            "AI repair failed:",
            repairError.message || repairError
          );

          quarantineAIOutput(text, raw, repairError);

          throw new Error(
            `AI output quarantined after repair failure: ${
              repairError.message || "unknown error"
            }`
          );
        }
      }
    } catch (err) {
      lastError = err;

      console.error(
        `AI attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        err.status || err.code || err.message
      );

      // Only retry timeout/429/5xx failures.
      if (!isRetryableError(err)) {
        throw err;
      }

      if (attempt === MAX_RETRIES) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s with jitter.
      const baseDelay = 1000 * Math.pow(2, attempt);
      const jitter = Math.floor(Math.random() * 250);
      const delay = baseDelay + jitter;

      console.log(`Retrying AI request in ${delay}ms...`);

      await sleep(delay);
    }
  }

  throw new Error(
    `AI request failed after ${MAX_RETRIES + 1} attempts: ${
      lastError?.message || "unknown error"
    }`
  );
}

module.exports = triage;
