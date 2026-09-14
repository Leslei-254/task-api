# My 10x Solution - Leslei Makori



## 1. The Problem



Support teams often receive messages that need to be classified before they can be routed to the correct person or team. A message may concern billing, a software bug, a feature request, or a general question, and the urgency can also vary.



My solution extends my existing Task API with an AI-powered support message triage endpoint. Instead of manually performing the first classification step, a client sends one support message to the API and receives a consistent structured result containing the category, urgency, confidence, and a short reason.



The 10x goal is to make the first-pass triage process dramatically faster and easier by turning a manual classification step into a single API request.



## 2. Who Has This Problem?



Small support teams, developers building customer-support systems, and internal service teams can benefit from automated first-pass classification before a human reviews or routes a request.



## 3. The Solution



The application exposes:



`POST /ai/triage`



Example input:



```json

{

&#x20; "message": "I was charged twice for my subscription."

}

