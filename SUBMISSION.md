# 🚀 Submission Writeup: EcoImpact Tracker

This document provides the submission text for Devpost or portfolio showcases.

---

## 💡 Inspiration
As global carbon levels reach new milestones, individual tracking has become increasingly important. However, existing carbon calculators are either too generic, static, or place the burden of complex data lookup entirely on the user. We set out to build an intelligent assistant that works like an autonomous sustainability consulting team: validating inputs, checking for security compliance, calculating exact impacts using real-time factors, and presenting a customized action plan—all with a seamless user approval flow.

---

## 🛠️ What it does
**EcoImpact Tracker** is an agentic sustainability workspace that turns raw, unstructured consumption logs into secure, verified, and approved sustainability action plans.
1.  **Audits Inputs**: Users provide raw text logs (e.g., travel miles, electricity usage, food intake). The system automatically redacts sensitive data (like contact emails) and checks for injection keywords.
2.  **Calculates Footprint**: A specialized analyst agent queries a local Model Context Protocol (MCP) server to retrieve carbon coefficients and calculate exact metrics.
3.  **Advises Alternatives**: A green living advisor agent recommends swaps (like smart appliances or vehicle offsets) and calculates the exact number of trees needed to balance the footprint.
4.  **Awaits Human Approval**: The Orchestrator halts execution via a Human-in-the-Loop checkpoint, letting users review and approve the strategy.
5.  **Interactive Interface**: A premium, glassmorphism dark-mode UI with live sliders allows users to play with inputs, visualize category ratios, and see the agent's timeline execution in real-time.

---

## 📐 Solution Architecture

EcoImpact Tracker uses a stateful, event-driven multi-agent graph architecture. By dividing the system into distinct nodes, we isolate the concerns of parsing, mathematical analysis, advice lookup, and compliance auditing:
1. **User Request / Webhook Entry**: Standard structured or unstructured log messages enter the pipeline.
2. **Security Checkpoint (Pre-processing)**: Acts as an input gatekeeper. It processes variables and performs checks before triggering the LLM, neutralizing risks early.
3. **Eco Orchestrator (Workforce Router)**: Acts as the parent agent. It maintains the global session state and delegates analytical queries to child agents sequentially, collecting their structured feedback into a shared session context.
4. **Footprint Analyst**: A specialized child agent linked to the MCP Server's emissions database.
5. **Green Living Advisor**: A specialized child agent linked to the MCP alternatives and offsets database.
6. **Approval Interruption Gate**: Halts processing, waiting for explicit user interaction before logging a completed session.

---

## 🔒 Security Design & Hardening

Security was designed from the ground up to prevent data leaks, prompt injection, and application abuse:
- **PII Scrubbing**: Regex filters run pre-execution to identify patterns matching email addresses and phone numbers. These are instantly replaced with placeholder markers (e.g. `[EMAIL_REDACTED]`), preventing LLM exposure to user secrets.
- **Prompt Injection Defense**: The checkpoint checks for instructions override phrases (like *"ignore previous instruction"* or *"system bypass"*). If flagged, it bypasses the agent chain entirely, triggers a security breach handler node, and terminates the session with an error payload.
- **Abuse Prevention Rules**: Limits payload string inputs to under 50k characters to prevent overflow and validates that there are no massive numeric digits to avoid memory consumption issues.
- **Structured Audit Trail**: Outputs compliance JSON audit records for every request to standard output:
  ```json
  {"timestamp": "2026-07-04T22:33:22Z", "node": "security_checkpoint", "severity": "INFO", "details": "PII scrubbed. Input validated."}
  ```

---

## 🤝 Human-in-the-Loop (HITL) Checkpoints

Automated recommendations are only half the battle; real-world sustainability changes require human buy-in.
- We integrated the **ADK 2.0 `request_input` interface** in the Orchestrator. 
- After the Analyst computes the footprint and the Advisor proposes swaps, the Orchestrator halts execution and requests user feedback: *"Do you approve this sustainability action plan or have any updates?"*
- In our frontend, this translates into interactive **Approve** and **Revise** action items. The user remains in control, authorizing offsets or rewriting input to re-run calculations seamlessly.

---

## 💡 Core Concepts Used

- **Agentic Workflow Graphs**: Modeling LLM steps as software nodes, managing loops, conditions, and custom routing logic.
- **Model Context Protocol (MCP)**: Leveraging a decoupled protocol layer running on stdio, allowing agents to execute exact lookup commands without packing large databases inside their LLM context window.
- **Session State Sharing**: Reading/writing shared session data between independent agents (`eco_orchestrator`, `footprint_analyst`, `green_advisor`) to construct a unified final action plan.

---

## 🏗️ How we built it
We constructed a modular, decoupled architecture using:
*   **Google ADK 2.0 Workflow API**: Used to design a stateful multi-agent execution graph with state sharing and custom entry points.
*   **Model Context Protocol (MCP)**: Implemented a FastMCP python server communicating over `stdio` to isolate calculations and alternative queries.
*   **FastAPI / EventSource (SSE)**: Built an asynchronous API backend supporting Server-Sent Events to stream step-by-step agent logs.
*   **Frontend**: Handcrafted a pure HTML5/CSS3/Vanilla JS single-page dashboard utilizing responsive grids, radial progress SVGs, and sliding variables.
*   **Gemini 2.5 Flash**: Orchestrates the reasoning and planning of all agent workflows.

---

## ⚠️ Challenges we ran into
*   **PII & Injection Handling**: Designing a robust validation step without sacrificing LLM context. We solved this by implementing a preceding Security Checkpoint node that filters inputs using pre-configured regexes and routes malicious prompt attempts directly to a specialized security breach handler.
*   **Agent State Isolation**: Sharing state context between independent agents without leaking credentials or cross-contaminating calculations. We solved this by using the ADK `shared_state` API, exposing secure read/write endpoints to agents.
*   **Cross-Platform Docker Contexts**: The Docker builder on Windows initially failed trying to index local `.venv` files. We resolved this by building a clean `.dockerignore` file, excluding virtual environments and build configurations.

---

## 🏆 Accomplishments that we're proud of
*   **Flawless Visual Interface**: Built a glowing, premium dark-mode dashboard that wows the user immediately.
*   **Decoupled MCP Architecture**: The core calculations and alternative lookups are entirely decoupled from the LLM, making it easy to swap in corporate carbon APIs or energy APIs in the future.
*   **Interactive Simulation Mode**: When the python agent server is offline, the web interface falls back to a high-fidelity visual simulator demonstrating the workflow.

---

## 🧠 What we learned
*   **Stateful Graphs**: Learned how state management works in complex agent chains.
*   **Model Context Protocol (MCP)**: Discovered how powerful stdio-based tool lookup is for scaling specialized agents without bloat.
*   **Security-First Design**: Validated that securing inputs *before* they reach the model is essential for production deployment.

---

## 🔮 What's next for EcoImpact Tracker
*   **Corporate API Connectors**: Connect the MCP server to live corporate offset networks (like Cloverly or Patch).
*   **IoT Smart-Meter Syncing**: Let the app ingest smart-meter metrics directly to update the dashboard autonomously.
*   **Dynamic Reforestation Logs**: Connect human approvals to local community tree-planting tracking systems.
