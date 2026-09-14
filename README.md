
# Task API — AI Support Triage

A Node.js/Express Task API extended with an AI-powered support message triage system.

The capstone adds an LLM-backed endpoint that classifies support messages by category and urgency while validating and controlling untrusted AI output.

## FlyRank AI — 10x Capstone

### Problem

Support teams often need to classify incoming messages before they can be routed to the correct person or team.

This project automates that first-pass classification through a single API request.

### AI Triage Endpoint

```text
POST /ai/triage