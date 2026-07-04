# 🎤 EcoImpact Tracker Presentation & Demo Script

This script can be used for a 3-to-5 minute video demo or presentation explaining the EcoImpact Tracker project.

---

## 🎬 Act 1: The Problem & The Vision
**[Visual: Show the website landing page at http://localhost:3000/ with sliders and clean dark mode UI]**

*   **Speaker:** "Hello everyone. Every day, our choices—what we eat, how we travel, and how we power our homes—leave a mark on the planet. But tracking this carbon footprint is tedious, static, and often feels disconnected from real-world action."
*   **Speaker:** "Welcome to **EcoImpact Tracker**—an intelligent, multi-agent sustainability platform designed to automate footprint calculations, ensure data security, and guide you with personalized green action plans, all in real-time."

---

## 🛠️ Act 2: Under the Hood (Architecture & Security)
**[Visual: Show the Architecture Diagram in README.md or zoom in on the slide showing the diagram]**

*   **Speaker:** "What makes EcoImpact Tracker unique is its advanced agentic architecture powered by the Google ADK 2.0 and Model Context Protocol (MCP) standards."
*   **Speaker:** "Let's walk through how a single user log flows through our system:"
    1.  **Security Checkpoint Node**: "First, the user's input enters our security checkpoint. It automatically scrubs sensitive PII like emails or phone numbers, detects prompt injection bypasses, logs JSON audits for corporate compliance, and rejects spams."
    2.  **Orchestrator Agent**: "Once cleared, the Orchestrator takes over, acting as the brain to coordinate between our specialized sub-agents."
    3.  **Carbon Footprint Analyst**: "The Analyst calls our custom stdio **MCP Server** to retrieve precise, localized emissions factors for travel, diet, and electricity, returning a verified carbon footprint summation."
    4.  **Green Living Advisor**: "The Advisor queries our alternative databases to suggest action items—like switching to a heat pump, buying clean electricity offsets, or planting a specific number of trees to offset the damage."

---

## 📊 Act 3: Live Interactive Demo
**[Visual: Go to the interactive website, drag some sliders—e.g., flight to 3,400 miles, meat to 15 kg—and click "Analyze Log with AI". Show the timeline logs scrolling on screen]**

*   **Speaker:** "Let's see this in action. I'm adjusting my sliders to reflect last month's consumption: a long-distance flight, high meat consumption, and standard home energy use."
*   **Speaker:** "When I click 'Analyze Log with AI', our agents kick off. In the terminal view on the right, you can see the **Security Checkpoint** immediately scrubbing my email address and emitting a secure JSON audit trace."
*   **Speaker:** "Next, the **Footprint Analyst** connects to our Model Context Protocol server, calculates the emissions for each category, and gives us a total carbon breakdown of around 1,300 kg of CO2."
*   **Speaker:** "Finally, our **Green Living Advisor** suggests swaps—like energy efficient heat pumps—and tells us we need to plant 50 trees this year to balance our footprint."

---

## 🤝 Act 4: Human-in-the-Loop & Offsets
**[Visual: Point cursor to the "Approve Plan" and "Revise Input" buttons appearing at the bottom of the timeline]**

*   **Speaker:** "Before anything is finalized, the system uses ADK's Human-in-the-Loop interruption. The Orchestrator asks: *'Do you approve this sustainability action plan or have any updates?'*"
*   **Speaker:** "I can click **Approve Plan**, which logs my approval to the secure state database, completes the workflow, and initiates my carbon offset options."

---

## 🌟 Act 5: Impact & Wrap-up
**[Visual: Scroll down to show the project footer / final stats ring]**

*   **Speaker:** "EcoImpact Tracker bridges the gap between raw data and sustainability. It is scalable for individuals wanting to trace their daily footprint, and extensible for corporate consultants needing secure, audited carbon accounting APIs."
*   **Speaker:** "By combining multi-agent collaboration with secure, protocol-based tool execution, we make green choices simple, verified, and actionable."
*   **Speaker:** "Thank you!"
