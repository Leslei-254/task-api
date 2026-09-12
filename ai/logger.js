const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "llm-usage.jsonl");

function logLLMUsage(data) {
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    prompt_version: data.prompt_version || "v1",
    model: data.model || process.env.LLM_MODEL,
    input_tokens: data.input_tokens ?? null,
    output_tokens: data.output_tokens ?? null,
    duration_ms: data.duration_ms ?? null,
    repair: Boolean(data.repair),
  };

  fs.appendFileSync(
    LOG_FILE,
    JSON.stringify(record) + "\n"
  );
}

module.exports = logLLMUsage;
