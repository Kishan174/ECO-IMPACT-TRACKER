// Constants and Emission Factors
const EMISSION_FACTORS = {
    electricity: 0.38, // kg CO2 per kWh
    flights: 0.25,     // kg CO2 per mile
    meat: 27.0,        // kg CO2 per kg (using beef factor as benchmark)
    veggies: 2.0       // kg CO2 per kg
};

// DOM Elements
const sliders = {
    electricity: document.getElementById('electricity'),
    flights: document.getElementById('flights'),
    meat: document.getElementById('meat'),
    veggies: document.getElementById('veggies')
};

const displays = {
    electricity: document.getElementById('electricityVal'),
    flights: document.getElementById('flightsVal'),
    meat: document.getElementById('meatVal'),
    veggies: document.getElementById('veggiesVal'),
    totalFootprint: document.getElementById('totalFootprint'),
    offsetTrees: document.getElementById('offsetTrees'),
    progressText: document.getElementById('progressText'),
    progressRing: document.getElementById('progressRing'),
    apiIndicator: document.getElementById('apiIndicator'),
    apiStatusText: document.getElementById('apiStatusText')
};

const apiEndpointInput = document.getElementById('apiEndpoint');
const testConnectionBtn = document.getElementById('testConnectionBtn');
const runSimulationBtn = document.getElementById('runSimulationBtn');
const emailInput = document.getElementById('emailInput');
const barChart = document.getElementById('barChart');

// Terminal/Timeline Steps
const timelineSteps = {
    security: document.getElementById('stepSecurity'),
    analyst: document.getElementById('stepAnalyst'),
    advisor: document.getElementById('stepAdvisor'),
    approval: document.getElementById('stepApproval')
};

const logs = {
    security: document.getElementById('logSecurity'),
    analyst: document.getElementById('logAnalyst'),
    advisor: document.getElementById('logAdvisor'),
    approval: document.getElementById('logApproval')
};

const approvalActions = document.getElementById('approvalActions');
const btnApprove = document.getElementById('btnApprove');
const btnRevise = document.getElementById('btnRevise');
const flowStatus = document.getElementById('flowStatus');

// State
let isConnected = false;
let currentSessionId = null;

// Progress Ring Configuration
const circleRadius = 40;
const circumference = 2 * Math.PI * circleRadius;
displays.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    displays.progressRing.style.strokeDashoffset = offset;
    displays.progressText.textContent = `${Math.round(percent)}%`;
}

// Calculate Carbon Footprint locally
function calculateFootprint() {
    const vals = {
        electricity: parseFloat(sliders.electricity.value),
        flights: parseFloat(sliders.flights.value),
        meat: parseFloat(sliders.meat.value),
        veggies: parseFloat(sliders.veggies.value)
    };

    // Update value labels
    displays.electricity.textContent = `${vals.electricity} kWh`;
    displays.flights.textContent = `${vals.flights} miles`;
    displays.meat.textContent = `${vals.meat} kg`;
    displays.veggies.textContent = `${vals.veggies} kg`;

    // Calculations
    const emissions = {
        electricity: vals.electricity * EMISSION_FACTORS.electricity,
        flights: vals.flights * EMISSION_FACTORS.flights,
        meat: vals.meat * EMISSION_FACTORS.meat,
        veggies: vals.veggies * EMISSION_FACTORS.veggies
    };

    const total = Object.values(emissions).reduce((a, b) => a + b, 0);
    const trees = Math.max(1, Math.round(total / 22));

    // Update UI Stats
    displays.totalFootprint.innerHTML = `${total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})} <span class="unit">kg CO2</span>`;
    displays.offsetTrees.innerHTML = `${trees} <span class="unit">trees / year</span>`;

    // Progress target: standard household average of 2500kg per month
    const targetBenchmark = 2500;
    const progressPercent = Math.min(100, (total / targetBenchmark) * 100);
    setProgress(progressPercent);

    // Color gradient indicator based on footprint level
    if (progressPercent > 70) {
        displays.progressRing.style.stroke = '#f50057'; // High: Red
    } else if (progressPercent > 35) {
        displays.progressRing.style.stroke = '#ff9100'; // Mid: Orange
    } else {
        displays.progressRing.style.stroke = '#00e676'; // Low: Green
    }

    renderCharts(emissions, total);
}

// Render SVG/CSS dynamic bar charts
function renderCharts(emissions, total) {
    barChart.innerHTML = '';
    const categories = [
        { name: 'Energy', key: 'electricity', val: emissions.electricity, color: 'var(--energy-color)' },
        { name: 'Travel', key: 'flights', val: emissions.flights, color: 'var(--transport-color)' },
        { name: 'Meat Diet', key: 'meat', val: emissions.meat, color: 'var(--diet-color)' },
        { name: 'Veg Diet', key: 'veggies', val: emissions.veggies, color: 'var(--veggies-color)' }
    ];

    categories.forEach(cat => {
        const percent = total > 0 ? (cat.val / total) * 100 : 0;
        const row = document.createElement('div');
        row.className = 'chart-row';
        row.innerHTML = `
            <div class="chart-label">${cat.name}</div>
            <div class="chart-bar-bg">
                <div class="chart-bar-fill" style="width: ${percent}%; background-color: ${cat.color};"></div>
            </div>
            <div class="chart-value">${cat.val.toFixed(1)} kg</div>
        `;
        barChart.appendChild(row);
    });
}

// Slider listeners
Object.values(sliders).forEach(slider => {
    slider.addEventListener('input', calculateFootprint);
});

// Check API Connection status
async function checkApiConnection() {
    const endpoint = apiEndpointInput.value.trim();
    try {
        const response = await fetch(`${endpoint}/health`);
        if (response.ok) {
            isConnected = true;
            displays.apiIndicator.className = 'pulse-indicator connected';
            displays.apiStatusText.textContent = 'Local Agent API: Connected';
            testConnectionBtn.textContent = 'Connected';
            testConnectionBtn.className = 'btn btn-secondary';
        } else {
            throw new Error('Not OK response');
        }
    } catch (err) {
        isConnected = false;
        displays.apiIndicator.className = 'pulse-indicator disconnected';
        displays.apiStatusText.textContent = 'Local Agent API: Offline (Simulation Mode)';
        testConnectionBtn.textContent = 'Reconnect';
        testConnectionBtn.className = 'btn btn-secondary';
    }
}

// Simulation Pipeline (Fallback when API is offline)
function runSimulation() {
    // Reset timeline
    Object.values(timelineSteps).forEach(step => step.className = 'timeline-step');
    Object.values(logs).forEach(log => {
        log.className = 'step-log';
        log.innerHTML = '';
    });
    approvalActions.classList.add('hidden');
    flowStatus.textContent = 'Running';
    flowStatus.style.borderColor = 'rgba(0, 230, 118, 0.2)';
    flowStatus.style.color = 'var(--accent)';
    flowStatus.style.backgroundColor = 'rgba(0, 230, 118, 0.1)';

    const email = emailInput.value.trim();
    const electricity = sliders.electricity.value;
    const flights = sliders.flights.value;
    const meat = sliders.meat.value;
    const veggies = sliders.veggies.value;

    // Step 1: Security checkpoint
    setTimeout(() => {
        timelineSteps.security.className = 'timeline-step active';
        logs.security.classList.add('show');
        logs.security.innerHTML = `[SECURITY_CHECK] Auditing input data...<br>`;
        
        setTimeout(() => {
            const hasPII = email.length > 0;
            const scrubbedEmail = hasPII ? '[EMAIL_REDACTED]' : '';
            const auditLog = {
                timestamp: new Date().toISOString(),
                node: "security_checkpoint",
                severity: "INFO",
                details: `PII Audited: ${hasPII ? "Email redacted" : "No PII"}. Payload checks passed.`
            };
            logs.security.innerHTML += `<span style="color: #60a5fa;">&gt; JSON AUDIT: ${JSON.stringify(auditLog)}</span><br>`;
            if (hasPII) {
                logs.security.innerHTML += `&gt; Scrubbed Input Contact: ${scrubbedEmail}<br>`;
            }
            logs.security.innerHTML += `&gt; Route set to APPROVED.<br>`;
            timelineSteps.security.className = 'timeline-step completed';
            
            // Step 2: Analyst sub-agent
            runAnalystStep(electricity, flights, meat, veggies);
        }, 1200);
    }, 400);
}

function runAnalystStep(electricity, flights, meat, veggies) {
    timelineSteps.analyst.className = 'timeline-step active';
    logs.analyst.classList.add('show');
    logs.analyst.innerHTML = `[footprint_analyst] Starting carbon analysis...<br>`;

    setTimeout(() => {
        const factorElectricity = EMISSION_FACTORS.electricity;
        const factorFlights = EMISSION_FACTORS.flights;
        const factorMeat = EMISSION_FACTORS.meat;
        const factorVeggies = EMISSION_FACTORS.veggies;

        logs.analyst.innerHTML += `&gt; Calling MCP calculate_emissions_factor()...<br>`;
        setTimeout(() => {
            const emissionsElectricity = electricity * factorElectricity;
            const emissionsFlights = flights * factorFlights;
            const emissionsMeat = meat * factorMeat;
            const emissionsVeggies = veggies * factorVeggies;
            const total = emissionsElectricity + emissionsFlights + emissionsMeat + emissionsVeggies;

            logs.analyst.innerHTML += `&gt; Electricity: ${electricity} kWh * ${factorElectricity} = ${emissionsElectricity.toFixed(1)} kg CO2<br>`;
            logs.analyst.innerHTML += `&gt; Flights: ${flights} miles * ${factorFlights} = ${emissionsFlights.toFixed(1)} kg CO2<br>`;
            logs.analyst.innerHTML += `&gt; Meat: ${meat} kg * ${factorMeat} = ${emissionsMeat.toFixed(1)} kg CO2<br>`;
            logs.analyst.innerHTML += `&gt; Veggies: ${veggies} kg * ${factorVeggies} = ${emissionsVeggies.toFixed(1)} kg CO2<br>`;
            logs.analyst.innerHTML += `<span style="color: #38bdf8;">&gt; Total Calculated: ${total.toFixed(1)} kg CO2</span><br>`;
            logs.analyst.innerHTML += `&gt; set_shared_state('emission_summary') successful.<br>`;
            timelineSteps.analyst.className = 'timeline-step completed';

            // Step 3: Advisor sub-agent
            runAdvisorStep(total);
        }, 1200);
    }, 400);
}

function runAdvisorStep(total) {
    timelineSteps.advisor.className = 'timeline-step active';
    logs.advisor.classList.add('show');
    logs.advisor.innerHTML = `[green_advisor] Fetching localized alternatives...<br>`;

    setTimeout(() => {
        logs.advisor.innerHTML += `&gt; Querying MCP get_green_alternatives(category='energy')...<br>`;
        setTimeout(() => {
            logs.advisor.innerHTML += `<span style="color: #a7f3d0;">&gt; Alternative found: "Consider upgrading to LED bulbs or switching to a smart thermostat. Shifting to heat pumps can reduce heating emission footprint by 80%."</span><br>`;
            logs.advisor.innerHTML += `&gt; Querying MCP get_offset_options(emissions_kg=${total.toFixed(1)})...<br>`;
            
            setTimeout(() => {
                const treesNeeded = Math.round(total / 22);
                logs.advisor.innerHTML += `<span style="color: #a7f3d0;">&gt; Offsetting: To balance your ${total.toFixed(1)} kg CO2 footprint, you should plant approximately ${treesNeeded} mature trees to absorb this carbon over the next year. Support VCS-certified local wind/solar farms.</span><br>`;
                logs.advisor.innerHTML += `&gt; set_shared_state('green_plan') successful.<br>`;
                timelineSteps.advisor.className = 'timeline-step completed';

                // Step 4: Human Approval (HITL)
                runApprovalStep();
            }, 1000);
        }, 1000);
    }, 400);
}

function runApprovalStep() {
    timelineSteps.approval.className = 'timeline-step active';
    logs.approval.classList.add('show');
    logs.approval.innerHTML = `[HITL_ORCHESTRATOR] Pausing workflow context.<br>`;
    logs.approval.innerHTML += `&gt; Interrupt prompt raised: "Do you approve this sustainability action plan or have any updates?"<br>`;
    
    flowStatus.textContent = 'Interrupted';
    flowStatus.style.borderColor = 'rgba(255, 145, 0, 0.2)';
    flowStatus.style.color = 'var(--energy-color)';
    flowStatus.style.backgroundColor = 'rgba(255, 145, 0, 0.1)';

    approvalActions.classList.remove('hidden');
}

// Live ADK Server Integration
async function startLiveSession() {
    const endpoint = apiEndpointInput.value.trim();
    const email = emailInput.value.trim();
    const inputPayload = `Here is my consumption log for last month:
- Contact Email: ${email}
- Travel: I took a flight of ${sliders.flights.value} miles.
- Diet: I consumed ${sliders.meat.value} kg of meat and ${sliders.veggies.value} kg of vegetables.
- Home Energy: Used ${sliders.electricity.value} kWh of grid electricity.`;

    flowStatus.textContent = 'Connecting';
    Object.values(timelineSteps).forEach(step => step.className = 'timeline-step');
    Object.values(logs).forEach(log => {
        log.className = 'step-log';
        log.innerHTML = '';
    });
    approvalActions.classList.add('hidden');

    try {
        // 1. Create a session
        const sessionRes = await fetch(`${endpoint}/apps/app/users/user/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: {} })
        });
        
        if (!sessionRes.ok) throw new Error("Failed to create session");
        const sessionData = await sessionRes.json();
        currentSessionId = sessionData.id;

        logs.security.classList.add('show');
        timelineSteps.security.className = 'timeline-step active';
        logs.security.innerHTML = `[LIVE] Session created: ${currentSessionId}<br>`;
        logs.security.innerHTML += `[LIVE] Sending payload to Security Checkpoint...<br>`;
        flowStatus.textContent = 'Running';

        // 2. Stream event stream (SSE)
        const sseUrl = `${endpoint}/run_sse?app_name=app&user_id=user&session_id=${currentSessionId}`;
        const eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleLiveEvent(data, eventSource);
        };

        eventSource.onerror = (err) => {
            logs.security.innerHTML += `<span style="color: #ef4444;">[ERROR] SSE Stream closed unexpectedly or failed.</span><br>`;
            eventSource.close();
            flowStatus.textContent = 'Offline';
        };

        // 3. Post user query to run the agent
        await fetch(`${endpoint}/apps/app/users/user/sessions/${currentSessionId}/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                new_message: {
                    role: 'user',
                    parts: [{ text: inputPayload }]
                }
            })
        });

    } catch (err) {
        flowStatus.textContent = 'Failed';
        logs.security.innerHTML += `<span style="color: #ef4444;">[ERROR] Connection failed: ${err.message}. Falling back to simulation.</span><br>`;
        setTimeout(runSimulation, 2000);
    }
}

// Handle real-time stream events from ADK web server
function handleLiveEvent(data, eventSource) {
    if (data.node_info) {
        const node = data.node_info.node_name;
        if (node === 'security_checkpoint') {
            logs.security.innerHTML += `&gt; ${data.content?.parts?.[0]?.text || 'Processing checkpoint'}<br>`;
            if (!data.partial) {
                timelineSteps.security.className = 'timeline-step completed';
            }
        } else if (node === 'footprint_analyst') {
            timelineSteps.analyst.className = 'timeline-step active';
            logs.analyst.classList.add('show');
            if (data.content?.parts?.[0]?.text) {
                logs.analyst.innerHTML += `&gt; ${data.content.parts[0].text}<br>`;
            }
            if (!data.partial) {
                timelineSteps.analyst.className = 'timeline-step completed';
            }
        } else if (node === 'green_advisor') {
            timelineSteps.advisor.className = 'timeline-step active';
            logs.advisor.classList.add('show');
            if (data.content?.parts?.[0]?.text) {
                logs.advisor.innerHTML += `&gt; ${data.content.parts[0].text}<br>`;
            }
            if (!data.partial) {
                timelineSteps.advisor.className = 'timeline-step completed';
            }
        } else if (node === 'eco_orchestrator') {
            timelineSteps.approval.className = 'timeline-step active';
            logs.approval.classList.add('show');
            
            // Check for interruption/request_input
            if (data.status === 'interrupted' || (data.content?.parts?.[0]?.text && data.content.parts[0].text.includes('approve'))) {
                logs.approval.innerHTML += `&gt; ${data.content.parts[0].text}<br>`;
                flowStatus.textContent = 'Interrupted';
                approvalActions.classList.remove('hidden');
            } else if (data.content?.parts?.[0]?.text) {
                logs.approval.innerHTML += `&gt; ${data.content.parts[0].text}<br>`;
            }
        }
    }
}

// Button actions
testConnectionBtn.addEventListener('click', checkApiConnection);

runSimulationBtn.addEventListener('click', () => {
    if (isConnected) {
        startLiveSession();
    } else {
        runSimulation();
    }
});

btnApprove.addEventListener('click', () => {
    timelineSteps.approval.className = 'timeline-step completed';
    logs.approval.innerHTML += `<span style="color: #00e676;">&gt; Action plan approved! Initiating offsets...</span><br>`;
    approvalActions.classList.add('hidden');
    flowStatus.textContent = 'Completed';
    flowStatus.style.borderColor = 'rgba(0, 230, 118, 0.2)';
    flowStatus.style.color = 'var(--accent)';
    flowStatus.style.backgroundColor = 'rgba(0, 230, 118, 0.1)';
});

btnRevise.addEventListener('click', () => {
    approvalActions.classList.add('hidden');
    logs.approval.innerHTML += `&gt; Revision requested. Please adjust inputs above and run again.<br>`;
    flowStatus.textContent = 'Idle';
    flowStatus.style.borderColor = 'var(--border-color)';
    flowStatus.style.color = 'var(--text-secondary)';
    flowStatus.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
});

// Initial Setup
calculateFootprint();
checkApiConnection();
