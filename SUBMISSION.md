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
