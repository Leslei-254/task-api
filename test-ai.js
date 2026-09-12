require("dotenv").config();

const triage = require("./ai/triage");

const tests = [
  {
    name: "Billing issue",
    message: "I was charged twice for my subscription.",
    expected: "billing",
  },
  {
    name: "Bug report",
    message: "The app crashes every time I try to upload a photo.",
    expected: "bug",
  },
  {
    name: "Feature request",
    message: "Please add dark mode to the application.",
    expected: "feature",
  },
  {
    name: "Other request",
    message: "What are your customer support hours?",
    expected: "other",
  },
  {
    name: "Urgent billing",
    message: "My account was charged $500 incorrectly and I need this fixed immediately.",
    expected: "billing",
  },
  {
    name: "Technical bug",
    message: "The login button does nothing when I click it.",
    expected: "bug",
  },
  {
    name: "Feature request",
    message: "It would be useful if users could export their tasks as CSV.",
    expected: "feature",
  },
  {
    name: "General question",
    message: "Where can I find the documentation for the API?",
    expected: "other",
  },
  {
    name: "Ambiguous request",
    message: "I am not sure what happened to my account and I need someone to look into it.",
    expected: "other",
  },
];

async function main() {
  let passed = 0;

  console.log(`Running ${tests.length} AI triage tests...\n`);

  for (const test of tests) {
    try {
      const result = await triage(test.message);

      const categoryPassed = result.category === test.expected;
      const schemaPassed =
        ["billing", "bug", "feature", "other"].includes(result.category) &&
        ["low", "normal", "high"].includes(result.urgency) &&
        typeof result.confidence === "number" &&
        result.confidence >= 0 &&
        result.confidence <= 1 &&
        typeof result.reason === "string" &&
        result.reason.length > 0;

      if (categoryPassed && schemaPassed) {
        console.log(`PASS: ${test.name}`);
        console.log(`  category: ${result.category}`);
        console.log(`  urgency: ${result.urgency}`);
        console.log(`  confidence: ${result.confidence}`);
        passed++;
      } else {
        console.log(`FAIL: ${test.name}`);
        console.log("  Result:", result);
        console.log("  Expected category:", test.expected);
      }
    } catch (err) {
      console.log(`FAIL: ${test.name}`);
      console.log("  Error:", err.message);
    }

    console.log("");
  }

  console.log("==============================");
  console.log(`RESULT: ${passed}/${tests.length} tests passed`);
  console.log("==============================");

  if (passed !== tests.length) {
    process.exitCode = 1;
  }
}

main();
