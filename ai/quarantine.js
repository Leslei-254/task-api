const fs = require("fs");
const path = require("path");

const QUARANTINE_DIR = path.join(__dirname, "..", "quarantine");

function quarantineAIOutput({
  originalText,
  rawOutput,
  repairedOutput,
  error,
}) {
  fs.mkdirSync(QUARANTINE_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");

  const filePath = path.join(
    QUARANTINE_DIR,
    `triage-${safeTimestamp}.json`
  );

  const record = {
    timestamp,
    originalText,
    rawOutput,
    repairedOutput: repairedOutput ?? null,
    error: error?.message || String(error),
  };

  fs.writeFileSync(
    filePath,
    JSON.stringify(record, null, 2),
    "utf8"
  );

  console.warn(`AI output quarantined: ${filePath}`);

  return filePath;
}

module.exports = {
  quarantineAIOutput,
};
