# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import re
import logging
import json
import datetime
from typing import Any, Optional

from google.adk.agents import Agent, Context
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools import AgentTool, ToolContext, request_input, McpToolset
from google.adk.workflow import Workflow, node, Edge, START
from mcp import StdioServerParameters
from app.config import config

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eco_impact_tracker")

# Model configuration
model = Gemini(model=config.model)

# 1. Setup MCP Toolset to connect to our local MCP Server
mcp_toolset = McpToolset(
    connection_params=StdioServerParameters(
        command="python",
        args=["-m", "app.mcp_server"],
    )
)

# 2. Specialized LlmAgent sub-agents (configured as single-turn for delegation)
footprint_analyst = Agent(
    name="footprint_analyst",
    model=model,
    mode="chat",
    tools=[mcp_toolset],  # Analyst uses MCP tools (e.g. calculate_emissions_factor)
    instruction="""You are a Carbon Footprint Analyst.
Analyze the user's consumption logs (e.g. food diet, transport/flights, home electricity/heating, waste) and calculate their carbon footprint in kg CO2 equivalent.
Use the calculate_emissions_factor tool from your MCP toolset to fetch exact emission factors whenever available.
Be quantitative and show the calculations for each category.
Summarize the total emissions and highlight the largest drivers.
Always return a structured breakdown of the carbon footprint in your final response.""",
)

green_advisor = Agent(
    name="green_advisor",
    model=model,
    mode="chat",
    tools=[mcp_toolset],  # Advisor uses MCP tools (e.g. get_green_alternatives, get_offset_options)
    instruction="""You are a Green Living Advisor.
Review the carbon footprint breakdown provided by the analyst and suggest concrete, actionable green alternatives (e.g., smart thermostats, electric vehicle alternatives, public transit, low-impact diets).
Use the get_green_alternatives and get_offset_options tools from your MCP toolset to retrieve localized alternatives and offset plans.
Provide tips on how the user can reduce their emissions in the highest category.""",
)

# Agent tools to wrap sub-agents for the orchestrator
analyst_tool = AgentTool(agent=footprint_analyst)
advisor_tool = AgentTool(agent=green_advisor)

# 3. State-sharing tools for ctx.state data sharing
def get_shared_state(key: str, tool_context: ToolContext) -> str:
    """Gets a value from the shared session state by key. Useful for retrieving footprint details or advisor recommendations.
    
    Args:
        key: The key of the state to retrieve (e.g., 'emission_summary', 'green_plan').
    """
    val = tool_context.state.get(key, "")
    logger.info(f"get_shared_state: key='{key}', value='{val}'")
    return str(val)

def set_shared_state(key: str, value: str, tool_context: ToolContext) -> str:
    """Saves a value to the shared session state. Useful for recording analysis summaries or green plans.
    
    Args:
        key: The key to save (e.g., 'emission_summary', 'green_plan').
        value: The string value to store.
    """
    tool_context.state[key] = value
    logger.info(f"set_shared_state: key='{key}', value='{value}'")
    return f"Saved key '{key}' to shared state."

# 4. Main Eco Impact Orchestrator Agent
eco_orchestrator = Agent(
    name="eco_orchestrator",
    model=model,
    mode="single_turn",
    tools=[
        analyst_tool,
        advisor_tool,
        get_shared_state,
        set_shared_state,
        request_input
    ],
    instruction="""You are the Eco Impact Orchestrator. Your goal is to guide the user to calculate, analyze, and reduce their carbon footprint.

Workflow:
1. When you receive the user's consumption logs (input), call the footprint_analyst tool to compute the carbon footprint.
2. Save the footprint analyst's output to the shared state using `set_shared_state(key='emission_summary', value=...)`.
3. Then, call the green_advisor tool to generate sustainability action plans based on the carbon footprint.
4. Save the advisor's plan to the shared state using `set_shared_state(key='green_plan', value=...)`.
5. Present the emission summary and proposed plan to the user.
6. Check if the user approves the plan or has any modifications. Call `request_input` to ask the user: "Do you approve this sustainability action plan or have any updates?"
7. Once they respond, summarize the final approved sustainability action plan in a friendly, motivational closing message.
""",
)

# 5. Security Checkpoint Function Node (Workflow Function Node)
@node(name="security_checkpoint")
async def security_checkpoint(ctx: Context, node_input: str) -> str:
    """Audits the input log for security policies (PII and prompt injection)."""
    # Initialize audit log in state
    if "audit_log" not in ctx.state:
        ctx.state["audit_log"] = []

    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "node": "security_checkpoint",
        "severity": "INFO",
        "details": "Checking input for security violations."
    }

    # PII Scrubbing (Regex)
    # Email scrubbing
    scrubbed = re.sub(r"[\w\.-]+@[\w\.-]+\.\w+", "[EMAIL_REDACTED]", node_input)
    # Phone number scrubbing
    scrubbed = re.sub(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[PHONE_REDACTED]", scrubbed)

    # Prompt Injection keyword check
    injection_keywords = ["ignore previous instruction", "override system", "system prompt", "ignore instruction", "bypass check"]
    input_lower = node_input.lower()
    if any(kw in input_lower for kw in injection_keywords):
        log_entry["severity"] = "CRITICAL"
        log_entry["details"] = "Prompt injection attempt detected!"
        ctx.state["audit_log"].append(log_entry)
        logger.critical(json.dumps(log_entry))
        ctx.route = "SECURITY_EVENT"
        return "Prompt injection violation detected. Input contains prohibited instruction keywords."

    # Domain specific rule: range checks or length limits
    # Prevent massive logs over 50,000 characters
    if len(node_input) > 50000:
        log_entry["severity"] = "WARNING"
        log_entry["details"] = "Input log size exceeded safe limit."
        ctx.state["audit_log"].append(log_entry)
        logger.warning(json.dumps(log_entry))
        ctx.route = "SECURITY_EVENT"
        return "Input log size exceeds the allowed limit of 50,000 characters."

    # Domain specific rule: suspicious numerical values (protection against float overflow/spam)
    huge_numbers = re.findall(r"\b\d{8,}\b", node_input)
    if huge_numbers:
        log_entry["severity"] = "WARNING"
        log_entry["details"] = f"Suspiciously large numerical values found: {huge_numbers}"
        ctx.state["audit_log"].append(log_entry)
        logger.warning(json.dumps(log_entry))
        ctx.route = "SECURITY_EVENT"
        return f"Suspiciously large numerical values detected: {huge_numbers}."

    # Approved path
    ctx.state["audit_log"].append(log_entry)
    logger.info(json.dumps(log_entry))
    ctx.route = "APPROVED"
    return scrubbed

# 6. Security Breach Handler Node
@node(name="security_breach_handler")
async def security_breach_handler(ctx: Context, node_input: str) -> str:
    """Handles prompt injections and other security policy violations by terminating flow."""
    return f"Security Violation: {node_input}"

# 7. Workflow definition
edges = [
    (START, security_checkpoint),
    (security_checkpoint, {
        "APPROVED": eco_orchestrator,
        "SECURITY_EVENT": security_breach_handler
    }),
]

eco_workflow = Workflow(
    name="eco_workflow",
    edges=edges,
)

app = App(
    root_agent=eco_workflow,
    name="app",
)
