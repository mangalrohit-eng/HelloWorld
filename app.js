// Application State
let rules = [];
let circuits = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    createDefaultRules();
    initializeTabs();
    initializeRuleForm();
    renderRules();
    generateSampleCircuits();
    updateStats();
    renderDecommissionList();
    updateDecommissionStats();
    updateAnalytics();
    updateFeedbackCount();
});

// Create Default Rules
function createDefaultRules() {
    // Only create default rules if no rules exist
    if (rules.length === 0) {
        const defaultRules = [
            {
                id: Date.now() + 1,
                name: 'Low Utilization - Under 20%',
                type: 'include',
                condition: 'utilization',
                operator: '<',
                value: 20,
                description: 'Circuits with utilization below 20% may indicate unused or underutilized bandwidth'
            },
            {
                id: Date.now() + 2,
                name: 'Very Old Circuit - Over 48 Months',
                type: 'include',
                condition: 'age',
                operator: '>',
                value: 48,
                description: 'Circuits older than 4 years may be part of legacy network requiring modernization'
            },
            {
                id: Date.now() + 3,
                name: 'High Cost per Mbps',
                type: 'include',
                condition: 'cost',
                operator: '>',
                value: 15,
                description: 'High cost circuits may be candidates for cost optimization or provider migration'
            },
            {
                id: Date.now() + 4,
                name: 'Minimal Traffic Volume',
                type: 'include',
                condition: 'traffic',
                operator: '<',
                value: 50,
                description: 'Very low traffic volume suggests circuit is redundant or unused'
            },
            {
                id: Date.now() + 5,
                name: 'Extremely Low Utilization - Under 10%',
                type: 'include',
                condition: 'utilization',
                operator: '<',
                value: 10,
                description: 'Critical: Circuits under 10% utilization are strong candidates for immediate decommission'
            }
        ];
        
        rules = defaultRules;
        saveData();
    }
}

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Rule Form Handling
function initializeRuleForm() {
    const form = document.getElementById('ruleForm');
    const conditionSelect = document.getElementById('ruleCondition');
    const operatorSelect = document.getElementById('ruleOperator');
    const valueInputGroup = document.getElementById('valueInputGroup');
    
    // Define condition types and their options
    const conditionConfig = {
        // Numeric conditions
        'utilization': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'bandwidth': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'age': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'traffic': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'cost': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        // Text-based conditions
        'contract_status': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expired' },
                { value: 'expiring_soon', label: 'Expiring Soon' }
            ]
        },
        'service_type': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'legacy', label: 'Legacy' },
                { value: 'modern', label: 'Modern' }
            ]
        },
        'redundancy': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
            ]
        },
        'site_status': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'active', label: 'Active' },
                { value: 'closed', label: 'Closed' },
                { value: 'relocated', label: 'Relocated' },
                { value: 'consolidated', label: 'Consolidated' }
            ]
        },
        'hardware_eol': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'yes', label: 'Yes (End of Life)' },
                { value: 'no', label: 'No (Supported)' }
            ]
        },
        'provider_status': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'current', label: 'Current Provider' },
                { value: 'migrated', label: 'Migrated' },
                { value: 'pending_migration', label: 'Pending Migration' }
            ]
        }
    };
    
    // Handle condition change
    conditionSelect.addEventListener('change', function() {
        const condition = this.value;
        const config = conditionConfig[condition];
        
        if (!config) return;
        
        // Update operators
        operatorSelect.innerHTML = '';
        const operatorLabels = {
            '<': 'Less than',
            '<=': 'Less than or equal',
            '>': 'Greater than',
            '>=': 'Greater than or equal',
            '==': 'Equal to',
            '!=': 'Not equal to'
        };
        
        config.operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = operatorLabels[op];
            operatorSelect.appendChild(option);
        });
        
        // Update value input
        if (config.type === 'numeric') {
            valueInputGroup.innerHTML = `
                <label for="ruleValue">Threshold Value *</label>
                <input type="number" id="ruleValue" required placeholder="e.g., 20">
            `;
        } else if (config.type === 'select') {
            const optionsHTML = config.options.map(opt => 
                `<option value="${opt.value}">${opt.label}</option>`
            ).join('');
            valueInputGroup.innerHTML = `
                <label for="ruleValue">Select Value *</label>
                <select id="ruleValue" required>
                    ${optionsHTML}
                </select>
            `;
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const ruleType = document.querySelector('input[name="ruleType"]:checked').value;
        const condition = document.getElementById('ruleCondition').value;
        const config = conditionConfig[condition];
        const valueElement = document.getElementById('ruleValue');
        
        // Get value based on type
        let value;
        if (config && config.type === 'select') {
            value = valueElement.value; // String value
        } else {
            value = parseFloat(valueElement.value); // Numeric value
        }
        
        const rule = {
            id: Date.now(),
            name: document.getElementById('ruleName').value,
            type: ruleType, // 'include' or 'exclude'
            condition: condition,
            operator: document.getElementById('ruleOperator').value,
            value: value,
            description: document.getElementById('ruleDescription').value
        };
        
        rules.push(rule);
        saveData();
        renderRules();
        updateAnalytics();
        form.reset();
        
        // Reset to default operators after form reset
        operatorSelect.innerHTML = `
            <option value="<">Less than</option>
            <option value="<=">Less than or equal</option>
            <option value=">">Greater than</option>
            <option value=">=">Greater than or equal</option>
            <option value="==">Equal to</option>
            <option value="!=">Not equal to</option>
        `;
        
        valueInputGroup.innerHTML = `
            <label for="ruleValue">Threshold Value *</label>
            <input type="number" id="ruleValue" required placeholder="e.g., 20">
        `;
        
        showNotification('Rule added successfully!');
    });
}

// Render Rules
function renderRules() {
    const rulesList = document.getElementById('rulesList');
    
    if (rules.length === 0) {
        rulesList.innerHTML = '<div class="empty-state">No rules defined yet. Add your first rule above.</div>';
        return;
    }
    
    rulesList.innerHTML = rules.map(rule => {
        const ruleType = rule.type || 'include'; // Default to 'include' for legacy rules
        const typeLabel = ruleType === 'include' ? 'Include for Decommission' : 'Exclude from Decommission';
        const typeClass = ruleType === 'include' ? 'rule-type-include' : 'rule-type-exclude';
        const typeIcon = ruleType === 'include' ? '✓' : '✗';
        
        return `
            <div class="rule-item">
                <div class="rule-header">
                    <div>
                        <div class="rule-name">${rule.name}</div>
                        <span class="rule-type-badge ${typeClass}">${typeIcon} ${typeLabel}</span>
                    </div>
                    <button class="btn btn-danger" onclick="deleteRule(${rule.id})">Delete</button>
                </div>
                <div class="rule-condition">
                    <strong>Condition:</strong> ${getConditionLabel(rule.condition)} ${rule.operator} ${rule.value}
                </div>
                ${rule.description ? `<div class="rule-description">${rule.description}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Delete Rule
function deleteRule(ruleId) {
    if (confirm('Are you sure you want to delete this rule?')) {
        rules = rules.filter(rule => rule.id !== ruleId);
        saveData();
        renderRules();
        updateAnalytics();
        showNotification('Rule deleted successfully!');
    }
}

// Get Condition Label
function getConditionLabel(condition) {
    const labels = {
        'utilization': 'Utilization %',
        'bandwidth': 'Bandwidth (Mbps)',
        'age': 'Age (months)',
        'traffic': 'Traffic Volume (GB)',
        'cost': 'Cost per Mbps ($)',
        'contract_status': 'Contract Status',
        'service_type': 'Service Type',
        'redundancy': 'Redundancy Status',
        'site_status': 'Site Status',
        'hardware_eol': 'Hardware EOL/EOS',
        'provider_status': 'Provider Status'
    };
    return labels[condition] || condition;
}

// Generate Sample Circuits
function generateSampleCircuits() {
    if (circuits.length > 0) return; // Don't regenerate if data exists
    
    const cities = [
        'New York - Manhattan', 'Los Angeles - Downtown', 'Chicago - Loop', 'Houston - Energy Corridor',
        'Phoenix - Downtown', 'Philadelphia - Center City', 'San Antonio - Medical Center', 'San Diego - Mission Valley',
        'Dallas - Uptown', 'Austin - Domain', 'Jacksonville - Riverside', 'San Jose - Silicon Valley',
        'Fort Worth - Downtown', 'Columbus - Short North', 'Charlotte - Uptown', 'Indianapolis - Downtown',
        'Seattle - Capitol Hill', 'Denver - LoDo', 'Boston - Back Bay', 'Portland - Pearl District',
        'Nashville - Midtown', 'Detroit - Downtown', 'Memphis - Medical District', 'Louisville - Downtown',
        'Baltimore - Harbor East', 'Milwaukee - Third Ward', 'Albuquerque - Downtown', 'Tucson - University',
        'Fresno - Tower District', 'Sacramento - Midtown', 'Kansas City - Crossroads', 'Mesa - Downtown',
        'Atlanta - Midtown', 'Omaha - Old Market', 'Raleigh - Downtown', 'Miami - Brickell',
        'Cleveland - Downtown', 'Tulsa - Downtown', 'Oakland - Jack London Square', 'Minneapolis - Downtown',
        'Wichita - Old Town', 'Arlington - Downtown', 'Tampa - Channelside', 'Aurora - Downtown',
        'Anaheim - Platinum Triangle', 'Santa Ana - Downtown', 'St. Louis - Downtown', 'Pittsburgh - Downtown',
        'Cincinnati - Over-the-Rhine', 'Bakersfield - Downtown', 'Toledo - Downtown', 'Riverside - Downtown',
        'Stockton - Downtown', 'Corpus Christi - Downtown', 'Lexington - Downtown', 'Henderson - Downtown',
        'Anchorage - Downtown', 'Plano - Legacy West', 'Newark - Downtown', 'Lincoln - Haymarket',
        'Orlando - Downtown', 'Irvine - Spectrum Center', 'Chula Vista - Downtown', 'Durham - Downtown',
        'Buffalo - Downtown', 'Chandler - Downtown', 'Reno - Downtown', 'Norfolk - Downtown',
        'Gilbert - Downtown', 'Irving - Las Colinas', 'Scottsdale - Old Town', 'Baton Rouge - Downtown',
        'Spokane - Downtown', 'Richmond - Downtown', 'Des Moines - Downtown', 'Boise - Downtown',
        'Tacoma - Downtown', 'Fremont - Downtown', 'San Bernardino - Downtown', 'Modesto - Downtown',
        'Birmingham - Downtown', 'Rochester - Downtown', 'Oxnard - Downtown', 'Fontana - Downtown',
        'Fayetteville - Downtown', 'Moreno Valley - Downtown', 'Huntington Beach - Downtown', 'Glendale - Downtown',
        'Yonkers - Downtown', 'Salt Lake City - Downtown', 'Grand Rapids - Downtown', 'Amarillo - Downtown',
        'Worcester - Downtown', 'Little Rock - Downtown', 'Augusta - Downtown', 'Port St. Lucie - Downtown',
        'Cape Coral - Downtown', 'Sioux Falls - Downtown', 'Peoria - Downtown', 'Springfield - Downtown',
        'Vancouver - Downtown', 'Knoxville - Downtown', 'Brownsville - Downtown', 'Fort Lauderdale - Downtown'
    ];
    
    const bandwidths = [50, 100, 250, 500, 1000, 10000];
    const contractStatuses = ['active', 'expired', 'expiring_soon'];
    const serviceTypes = ['legacy', 'modern'];
    const redundancyStatuses = ['yes', 'no'];
    const siteStatuses = ['active', 'closed', 'relocated', 'consolidated'];
    const hardwareEolStatuses = ['yes', 'no'];
    const providerStatuses = ['current', 'migrated', 'pending_migration'];
    
    circuits = [];
    
    for (let i = 1; i <= 100; i++) {
        const bandwidth = bandwidths[Math.floor(Math.random() * bandwidths.length)];
        const utilization = Math.floor(Math.random() * 100);
        const age = Math.floor(Math.random() * 84) + 1; // 1-84 months (7 years)
        const trafficPercent = utilization / 100;
        const traffic = Math.floor(bandwidth * trafficPercent * 0.9); // Traffic in GB
        const cost = (Math.random() * 20 + 5).toFixed(2); // $5-$25 per Mbps
        
        const circuitId = `CKT-2024-${String(i).padStart(3, '0')}`;
        const comments = [];
        let status = 'active';
        
        // Mark 5 specific circuits as rejected with 911 traffic reason
        if ([1, 3, 5, 7, 9].includes(i)) {
            status = 'rejected';
            comments.push({
                text: 'Keep active - this circuit carries 911 emergency traffic and cannot be decommissioned',
                author: 'Network Engineer',
                timestamp: new Date().toISOString()
            });
        }
        
        // Mark all circuits ending with 2 as rejected
        if (circuitId.endsWith('2')) {
            status = 'rejected';
            comments.push({
                text: 'Keep active - all circuits ending with 2 are part of critical infrastructure and cannot be decommissioned per company policy',
                author: 'Network Engineer',
                timestamp: new Date().toISOString()
            });
        }
        
        circuits.push({
            id: circuitId,
            location: cities[i - 1] || `Location ${i}`,
            bandwidth: bandwidth,
            utilization: utilization,
            age: age,
            traffic: traffic,
            cost: parseFloat(cost),
            contract_status: contractStatuses[Math.floor(Math.random() * contractStatuses.length)],
            service_type: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
            redundancy: redundancyStatuses[Math.floor(Math.random() * redundancyStatuses.length)],
            site_status: siteStatuses[Math.floor(Math.random() * siteStatuses.length)],
            hardware_eol: hardwareEolStatuses[Math.floor(Math.random() * hardwareEolStatuses.length)],
            provider_status: providerStatuses[Math.floor(Math.random() * providerStatuses.length)],
            status: status,
            comments: comments
        });
    }
    
    saveData();
}

// Run Analysis with AI Agents using Footer Bar
function runAnalysis() {
    if (rules.length === 0) {
        alert('Please add at least one rule before running analysis.');
        return;
    }
    
    // Start analysis workflow using footer bar
    startAnalysisWorkflow();
}

// Analysis Workflow using Footer Bar
function startAnalysisWorkflow() {
    const footer = document.getElementById('learningFooter');
    footer.classList.add('active');
    
    // Reset all agents
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`learningAgent${i}`).classList.remove('working', 'completed');
        document.getElementById(`learningStatus${i}`).textContent = 'Waiting...';
    }
    document.getElementById('learningProgressBar').style.width = '0%';
    
    // Start agent sequence
    setTimeout(() => runAnalysisAgent1(), 300);
}

function runAnalysisAgent1() {
    const agent = document.getElementById('learningAgent1');
    const status = document.getElementById('learningStatus1');
    
    agent.classList.add('working');
    status.textContent = 'Data Retrieval Agent fetching circuits...';
    document.getElementById('learningProgressBar').style.width = '10%';
    
    setTimeout(() => {
        status.textContent = `AI Agent loaded ${circuits.length} circuits`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '25%';
        setTimeout(() => runAnalysisAgent2(), 400);
    }, 1200);
}

function runAnalysisAgent2() {
    const agent = document.getElementById('learningAgent2');
    const status = document.getElementById('learningStatus2');
    
    agent.classList.add('working');
    status.textContent = 'Rules Engine Agent applying criteria...';
    document.getElementById('learningProgressBar').style.width = '35%';
    
    // Reset all circuits
    circuits.forEach(circuit => {
        circuit.flagged = false;
        circuit.matchedRules = [];
    });
    
    // Actually apply rules
    circuits.forEach(circuit => {
        // First apply include rules
        const includeRules = rules.filter(r => (r.type || 'include') === 'include');
        includeRules.forEach(rule => {
            if (evaluateRule(circuit, rule)) {
                circuit.flagged = true;
                circuit.matchedRules.push(rule.name);
            }
        });
        
        // Then apply exclude rules (these override include rules)
        const excludeRules = rules.filter(r => r.type === 'exclude');
        excludeRules.forEach(rule => {
            if (evaluateRule(circuit, rule)) {
                circuit.flagged = false; // Unflag if it matches an exclude rule
                circuit.matchedRules = circuit.matchedRules.filter(r => r !== rule.name);
                circuit.matchedRules.push(`[EXCLUDED] ${rule.name}`);
            }
        });
    });
    
    const flaggedCount = circuits.filter(c => c.flagged).length;
    
    setTimeout(() => {
        status.textContent = `AI Agent flagged ${flaggedCount} circuits`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '50%';
        setTimeout(() => runAnalysisAgent3(), 400);
    }, 1500);
}

function runAnalysisAgent3() {
    const agent = document.getElementById('learningAgent3');
    const status = document.getElementById('learningStatus3');
    
    agent.classList.add('working');
    status.textContent = 'Validation Agent checking results...';
    document.getElementById('learningProgressBar').style.width = '60%';
    
    const flaggedCircuits = circuits.filter(c => c.flagged);
    
    setTimeout(() => {
        status.textContent = `AI Agent validated ${flaggedCircuits.length} circuits`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '75%';
        setTimeout(() => runAnalysisAgent4(), 400);
    }, 1300);
}

function runAnalysisAgent4() {
    const agent = document.getElementById('learningAgent4');
    const status = document.getElementById('learningStatus4');
    
    agent.classList.add('working');
    status.textContent = 'Output Agent preparing dashboard...';
    document.getElementById('learningProgressBar').style.width = '85%';
    
    // Save and update
    saveData();
    renderCircuits();
    updateStats();
    updateAnalytics();
    
    setTimeout(() => {
        status.textContent = 'AI Agent completed analysis';
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '100%';
        
        const flaggedCount = circuits.filter(c => c.flagged).length;
        showNotification(`Analysis completed! ${flaggedCount} circuits flagged for review`);
        
        // Hide footer after a delay
        setTimeout(() => {
            document.getElementById('learningFooter').classList.remove('active');
        }, 2000);
    }, 1200);
}

// Update Feedback Count
function updateFeedbackCount() {
    const rejectedCircuits = circuits.filter(c => c.status === 'rejected' && c.comments.length > 0);
    const count = rejectedCircuits.length;
    document.getElementById('feedbackCount').textContent = `${count} rejection comment${count !== 1 ? 's' : ''} available`;
}

// Learn from Feedback - AI-Powered Rule Generation
function learnFromFeedback() {
    const rejectedCircuits = circuits.filter(c => c.status === 'rejected' && c.comments.length > 0);
    
    if (rejectedCircuits.length === 0) {
        alert('No rejection feedback available. Please review and reject some circuits first.');
        return;
    }
    
    // Start AI learning workflow
    startLearningWorkflow(rejectedCircuits);
}

// AI Learning Workflow
function startLearningWorkflow(rejectedCircuits) {
    const footer = document.getElementById('learningFooter');
    footer.classList.add('active');
    
    // Reset all agents
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`learningAgent${i}`).classList.remove('working', 'completed');
        document.getElementById(`learningStatus${i}`).textContent = 'Waiting...';
    }
    document.getElementById('learningProgressBar').style.width = '0%';
    
    // Start agent sequence
    setTimeout(() => runLearningAgent1(rejectedCircuits), 300);
}

function runLearningAgent1(rejectedCircuits) {
    const agent = document.getElementById('learningAgent1');
    const status = document.getElementById('learningStatus1');
    
    agent.classList.add('working');
    status.textContent = 'Data Collection Agent gathering feedback...';
    document.getElementById('learningProgressBar').style.width = '10%';
    
    setTimeout(() => {
        status.textContent = `AI Agent collected ${rejectedCircuits.length} rejections`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '25%';
        setTimeout(() => runLearningAgent2(rejectedCircuits), 400);
    }, 1200);
}

function runLearningAgent2(rejectedCircuits) {
    const agent = document.getElementById('learningAgent2');
    const status = document.getElementById('learningStatus2');
    
    agent.classList.add('working');
    status.textContent = 'Pattern Analysis Agent analyzing feedback...';
    document.getElementById('learningProgressBar').style.width = '35%';
    
    setTimeout(() => {
        status.textContent = 'AI Agent identified patterns';
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '50%';
        setTimeout(() => runLearningAgent3(rejectedCircuits), 400);
    }, 1500);
}

function runLearningAgent3(rejectedCircuits) {
    const agent = document.getElementById('learningAgent3');
    const status = document.getElementById('learningStatus3');
    
    agent.classList.add('working');
    status.textContent = 'Rule Generation Agent creating exclusions...';
    document.getElementById('learningProgressBar').style.width = '60%';
    
    // Actually analyze and generate rules
    const suggestedRules = analyzeRejectionReasons(rejectedCircuits);
    
    setTimeout(() => {
        status.textContent = `AI Agent created ${suggestedRules.length} rules`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '75%';
        setTimeout(() => runLearningAgent4(suggestedRules), 400);
    }, 1300);
}

function runLearningAgent4(suggestedRules) {
    const agent = document.getElementById('learningAgent4');
    const status = document.getElementById('learningStatus4');
    
    agent.classList.add('working');
    status.textContent = 'Validation Agent verifying rules...';
    document.getElementById('learningProgressBar').style.width = '85%';
    
    setTimeout(() => {
        status.textContent = 'AI Agent completed validation';
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '100%';
        
        // Display results and hide footer
        setTimeout(() => {
            displaySuggestedRules(suggestedRules);
            showNotification(`AI generated ${suggestedRules.length} exclusion rule suggestions!`);
            
            // Hide footer after a delay
            setTimeout(() => {
                document.getElementById('learningFooter').classList.remove('active');
            }, 2000);
        }, 800);
    }, 1200);
}

// Analyze Rejection Reasons with AI
function analyzeRejectionReasons(rejectedCircuits) {
    const suggestedRules = [];
    const patterns = {
        '911': {
            keywords: ['911', 'emergency', 'e911'],
            ruleName: '911/Emergency Services Exclusion',
            description: 'Exclude circuits handling emergency services'
        },
        'critical': {
            keywords: ['critical', 'mission critical', 'essential', 'vital', 'crucial'],
            ruleName: 'Critical Infrastructure Exclusion',
            description: 'Exclude circuits marked as critical infrastructure'
        },
        'backup': {
            keywords: ['backup', 'redundancy', 'failover', 'secondary'],
            ruleName: 'Backup Circuit Exclusion',
            description: 'Exclude backup and redundancy circuits'
        },
        'customer': {
            keywords: ['customer', 'client', 'contract', 'sla'],
            ruleName: 'Active Customer Circuit Exclusion',
            description: 'Exclude circuits with active customer contracts'
        },
        'high priority': {
            keywords: ['high priority', 'priority', 'important', 'vip'],
            ruleName: 'High Priority Circuit Exclusion',
            description: 'Exclude high priority circuits'
        },
        'recent': {
            keywords: ['new', 'recent', 'recently installed', 'just added', 'just installed'],
            ruleName: 'Recently Installed Exclusion',
            description: 'Exclude circuits installed within last 6 months'
        },
        'government': {
            keywords: ['government', 'federal', 'state', 'military', 'defense'],
            ruleName: 'Government Services Exclusion',
            description: 'Exclude government and military circuits'
        },
        'hospital': {
            keywords: ['hospital', 'healthcare', 'medical', 'health'],
            ruleName: 'Healthcare Services Exclusion',
            description: 'Exclude circuits serving healthcare facilities'
        }
    };
    
    // Analyze each rejection comment
    const foundPatterns = new Set();
    rejectedCircuits.forEach(circuit => {
        circuit.comments.forEach(comment => {
            const commentLower = comment.text.toLowerCase();
            
            Object.entries(patterns).forEach(([key, pattern]) => {
                const matchFound = pattern.keywords.some(keyword => 
                    commentLower.includes(keyword.toLowerCase())
                );
                
                if (matchFound && !foundPatterns.has(key)) {
                    foundPatterns.add(key);
                    suggestedRules.push({
                        id: Date.now() + Math.random(),
                        patternKey: key,
                        name: pattern.ruleName,
                        description: pattern.description,
                        matchedComments: 1,
                        example: comment.text.substring(0, 100) + (comment.text.length > 100 ? '...' : '')
                    });
                }
            });
        });
    });
    
    return suggestedRules;
}

// Display Suggested Rules
function displaySuggestedRules(suggestedRules) {
    const container = document.getElementById('learnedRules');
    const list = document.getElementById('suggestedRulesList');
    
    if (suggestedRules.length === 0) {
        list.innerHTML = '<p style="color: #666666;">No patterns detected. Try adding more specific rejection comments.</p>';
        container.style.display = 'block';
        return;
    }
    
    list.innerHTML = suggestedRules.map(rule => `
        <div style="background: white; padding: 20px; margin-bottom: 15px; border: 2px solid #CCCCCC; border-left: 4px solid #CD040B;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div style="flex: 1;">
                    <h5 style="color: #000000; font-size: 1.1rem; margin-bottom: 8px; font-weight: 700;">
                        ${rule.name}
                    </h5>
                    <p style="color: #666666; font-size: 0.9rem; margin-bottom: 10px;">
                        ${rule.description}
                    </p>
                    <div style="background: #F6F6F6; padding: 10px; border-left: 3px solid #000000; font-size: 0.85rem; color: #333333; font-style: italic;">
                        <strong>Example feedback:</strong> "${rule.example}"
                    </div>
                </div>
                <button class="btn btn-primary" onclick="addLearnedRule('${rule.patternKey}', '${rule.name.replace(/'/g, "\\'")}', '${rule.description.replace(/'/g, "\\'")}')">
                    Add Rule
                </button>
            </div>
        </div>
    `).join('');
    
    container.style.display = 'block';
}

// Add Learned Rule
function addLearnedRule(patternKey, name, description) {
    // Create exclusion rule based on pattern
    const rule = {
        id: Date.now(),
        name: name,
        type: 'exclude', // Exclusion rule - prevents circuits from being flagged
        condition: 'tags', // Special condition for tag-based rules
        operator: 'excludes',
        value: patternKey,
        description: description,
        aiGenerated: true
    };
    
    rules.push(rule);
    saveData();
    renderRules();
    updateAnalytics();
    
    showNotification(`Exclusion rule "${name}" added successfully!`);
}

// Evaluate Rule
function evaluateRule(circuit, rule) {
    const circuitValue = circuit[rule.condition];
    const ruleValue = rule.value;
    
    // Handle text-based conditions
    const textBasedConditions = ['contract_status', 'service_type', 'redundancy', 'site_status', 'hardware_eol', 'provider_status'];
    if (textBasedConditions.includes(rule.condition)) {
        // For text conditions, only use equality/inequality
        if (rule.operator === '==' || rule.operator === '=') {
            return circuitValue === ruleValue;
        } else if (rule.operator === '!=') {
            return circuitValue !== ruleValue;
        }
        return false;
    }
    
    // Handle numeric conditions
    switch (rule.operator) {
        case '<':
            return circuitValue < ruleValue;
        case '<=':
            return circuitValue <= ruleValue;
        case '>':
            return circuitValue > ruleValue;
        case '>=':
            return circuitValue >= ruleValue;
        case '==':
            return circuitValue == ruleValue;
        case '!=':
            return circuitValue != ruleValue;
        default:
            return false;
    }
}

// Render Circuits
function renderCircuits() {
    const circuitsList = document.getElementById('circuitsList');
    
    if (circuits.length === 0) {
        circuitsList.innerHTML = '<div class="card"><div class="empty-state">No circuits available.</div></div>';
        return;
    }
    
    // Show flagged circuits first
    const sortedCircuits = [...circuits].sort((a, b) => {
        if (a.flagged && !b.flagged) return -1;
        if (!a.flagged && b.flagged) return 1;
        return 0;
    });
    
    circuitsList.innerHTML = sortedCircuits.map(circuit => `
        <div class="circuit-card ${circuit.flagged ? 'flagged' : ''} ${circuit.status !== 'active' ? circuit.status : ''}">
            <div class="circuit-header">
                <div class="circuit-info">
                    <h4>${circuit.id}</h4>
                    <p style="color: #718096; font-size: 0.95rem;">${circuit.location}</p>
                </div>
                <span class="circuit-status ${circuit.flagged ? 'flagged' : circuit.status}">
                    ${circuit.status === 'approved' ? '✓ Approved for Decommission' : 
                      circuit.status === 'rejected' ? '✗ Keep Active' :
                      circuit.flagged ? '⚠ Flagged for Review' : '● Active'}
                </span>
            </div>
            
            <div class="circuit-details">
                <div class="detail-item">
                    <span class="detail-label">Bandwidth</span>
                    <span class="detail-value">${circuit.bandwidth} Mbps</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Utilization</span>
                    <span class="detail-value">${circuit.utilization}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Age</span>
                    <span class="detail-value">${circuit.age} months</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Traffic</span>
                    <span class="detail-value">${circuit.traffic} GB</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cost/Mbps</span>
                    <span class="detail-value">$${circuit.cost}</span>
                </div>
            </div>
            
            ${circuit.flagged && circuit.matchedRules.length > 0 ? `
                <div class="matched-rules">
                    <strong>⚠ Matched Rules:</strong>
                    <ul>
                        ${circuit.matchedRules.map(ruleName => `<li>${ruleName}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${circuit.comments.length > 0 ? `
                <div class="existing-comments">
                    <h5>Engineer Comments:</h5>
                    ${circuit.comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-meta">${comment.date} - ${comment.decision}</div>
                            <div class="comment-text">${comment.text}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${circuit.status === 'active' ? `
                <div class="comment-section">
                    <label>Engineer Comments:</label>
                    <textarea id="comment-${circuit.id}" placeholder="Add your comments about this circuit's decommission status..." rows="3"></textarea>
                    <div class="circuit-actions">
                        <button class="btn btn-approve" onclick="approveDecommission('${circuit.id}')">
                            ✓ Approve Decommission
                        </button>
                        <button class="btn btn-reject" onclick="rejectDecommission('${circuit.id}')">
                            ✗ Keep Active
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Approve Decommission
function approveDecommission(circuitId) {
    const circuit = circuits.find(c => c.id === circuitId);
    const commentText = document.getElementById(`comment-${circuitId}`).value;
    
    if (!commentText.trim()) {
        alert('Please add a comment before approving.');
        return;
    }
    
    circuit.status = 'approved';
    circuit.comments.push({
        date: new Date().toLocaleString(),
        decision: 'Approved for Decommission',
        text: commentText
    });
    
    saveData();
    renderCircuits();
    updateStats();
    renderDecommissionList();
    updateDecommissionStats();
    updateAnalytics();
    showNotification(`Circuit ${circuitId} approved for decommission.`);
}

// Reject Decommission
function rejectDecommission(circuitId) {
    const circuit = circuits.find(c => c.id === circuitId);
    const commentText = document.getElementById(`comment-${circuitId}`).value;
    
    if (!commentText.trim()) {
        alert('Please add a comment explaining why this circuit should remain active.');
        return;
    }
    
    circuit.status = 'rejected';
    circuit.comments.push({
        date: new Date().toLocaleString(),
        decision: 'Keep Active',
        text: commentText
    });
    
    saveData();
    renderCircuits();
    updateStats();
    renderDecommissionList();
    updateDecommissionStats();
    updateAnalytics();
    updateFeedbackCount();
    showNotification(`Circuit ${circuitId} will remain active.`);
}

// Update Stats
function updateStats() {
    const totalCircuits = circuits.length;
    const flaggedCircuits = circuits.filter(c => c.flagged).length;
    
    document.getElementById('totalCircuits').textContent = `${totalCircuits} Circuits`;
    document.getElementById('flaggedCircuits').textContent = `${flaggedCircuits} Flagged`;
}

// Render Decommission List
function renderDecommissionList() {
    const decommissionList = document.getElementById('decommissionList');
    const approvedCircuits = circuits.filter(c => c.status === 'approved' || c.decommissionStatus === 'in_process');
    
    if (approvedCircuits.length === 0) {
        decommissionList.innerHTML = '<div class="card"><div class="empty-state">No circuits approved for decommission yet.</div></div>';
        return;
    }
    
    decommissionList.innerHTML = approvedCircuits.map(circuit => `
        <div class="decommission-card ${circuit.decommissionStatus === 'in_process' ? 'in-process' : ''}">
            ${circuit.decommissionStatus !== 'in_process' ? `
                <div class="decommission-checkbox">
                    <input type="checkbox" 
                           id="check-${circuit.id}" 
                           data-circuit-id="${circuit.id}"
                           ${circuit.decommissionStatus === 'in_process' ? 'disabled' : ''}>
                </div>
            ` : ''}
            <div class="decommission-content">
                <div class="decommission-header">
                    <div class="decommission-info">
                        <h4>${circuit.id}</h4>
                        <p style="color: #666666; font-size: 0.95rem;">${circuit.location}</p>
                    </div>
                    <span class="decommission-status ${circuit.decommissionStatus === 'in_process' ? 'in-process' : 'pending'}">
                        ${circuit.decommissionStatus === 'in_process' ? '🔄 In Process' : '✓ Pending'}
                    </span>
                </div>
                
                <div class="decommission-details">
                    <div class="detail-item">
                        <span class="detail-label">Bandwidth</span>
                        <span class="detail-value">${circuit.bandwidth} Mbps</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Utilization</span>
                        <span class="detail-value">${circuit.utilization}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Age</span>
                        <span class="detail-value">${circuit.age} months</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Cost/Mbps</span>
                        <span class="detail-value">$${circuit.cost}</span>
                    </div>
                </div>
                
                ${circuit.comments.length > 0 ? `
                    <div class="decommission-comments">
                        <strong>Last Engineer Comment:</strong>
                        <p>${circuit.comments[circuit.comments.length - 1].text}</p>
                    </div>
                ` : ''}
                
                ${circuit.decommissionStatus === 'in_process' ? `
                    <div style="margin-top: 10px; padding: 10px; background: #FFF5F5; border-left: 4px solid #CD040B;">
                        <strong style="color: #CD040B;">⚙️ Decommission initiated on ${circuit.decommissionDate}</strong>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    updateDecommissionStats();
}

// Send for Decommission
function sendForDecommission() {
    console.log('sendForDecommission called');
    const checkboxes = document.querySelectorAll('#decommissionList input[type="checkbox"]:checked');
    console.log('Selected checkboxes:', checkboxes.length);
    
    if (checkboxes.length === 0) {
        alert('Please select at least one circuit to send for decommission. Make sure you have approved some circuits in the Circuit Review tab first.');
        return;
    }
    
    const circuitIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-circuit-id'));
    console.log('Circuit IDs:', circuitIds);
    
    // Start decommission workflow using footer bar
    startDecommissionWorkflow(circuitIds);
}

// Decommission Workflow using Footer Bar
function startDecommissionWorkflow(circuitIds) {
    const footer = document.getElementById('learningFooter');
    footer.classList.add('active');
    
    // Reset all agents
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`learningAgent${i}`).classList.remove('working', 'completed');
        document.getElementById(`learningStatus${i}`).textContent = 'Waiting...';
    }
    document.getElementById('learningProgressBar').style.width = '0%';
    
    // Start agent sequence
    setTimeout(() => runDecommissionAgent1(circuitIds), 300);
}

function runDecommissionAgent1(circuitIds) {
    const agent = document.getElementById('learningAgent1');
    const status = document.getElementById('learningStatus1');
    
    agent.classList.add('working');
    status.textContent = 'Collection Agent gathering circuits...';
    document.getElementById('learningProgressBar').style.width = '10%';
    
    setTimeout(() => {
        status.textContent = `AI Agent collected ${circuitIds.length} circuits`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '25%';
        setTimeout(() => runDecommissionAgent2(circuitIds), 400);
    }, 1200);
}

function runDecommissionAgent2(circuitIds) {
    const agent = document.getElementById('learningAgent2');
    const status = document.getElementById('learningStatus2');
    
    agent.classList.add('working');
    status.textContent = 'Validation Agent verifying circuits...';
    document.getElementById('learningProgressBar').style.width = '35%';
    
    setTimeout(() => {
        status.textContent = `AI Agent validated ${circuitIds.length} circuits`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '50%';
        setTimeout(() => runDecommissionAgent3(circuitIds), 400);
    }, 1500);
}

function runDecommissionAgent3(circuitIds) {
    const agent = document.getElementById('learningAgent3');
    const status = document.getElementById('learningStatus3');
    
    agent.classList.add('working');
    status.textContent = 'API Agent sending to decommission API...';
    document.getElementById('learningProgressBar').style.width = '60%';
    
    // Actually update circuit statuses
    circuitIds.forEach(id => {
        const circuit = circuits.find(c => c.id === id);
        if (circuit) {
            circuit.decommissionStatus = 'in_process';
            circuit.decommissionDate = new Date().toLocaleString();
        }
    });
    
    saveData();
    
    setTimeout(() => {
        status.textContent = `AI Agent sent ${circuitIds.length} to API`;
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '75%';
        setTimeout(() => runDecommissionAgent4(circuitIds), 400);
    }, 1800);
}

function runDecommissionAgent4(circuitIds) {
    const agent = document.getElementById('learningAgent4');
    const status = document.getElementById('learningStatus4');
    
    agent.classList.add('working');
    status.textContent = 'Confirmation Agent verifying status...';
    document.getElementById('learningProgressBar').style.width = '85%';
    
    // Update UI
    renderDecommissionList();
    updateAnalytics();
    
    setTimeout(() => {
        status.textContent = 'AI Agent confirmed circuits in process';
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '100%';
        
        showNotification(`${circuitIds.length} circuit(s) successfully sent for decommission!`);
        
        // Hide footer after a delay
        setTimeout(() => {
            document.getElementById('learningFooter').classList.remove('active');
        }, 2000);
    }, 1200);
}

// Update Decommission Stats
function updateDecommissionStats() {
    const pendingCircuits = circuits.filter(c => c.status === 'approved' && c.decommissionStatus !== 'in_process').length;
    const inProcessCircuits = circuits.filter(c => c.decommissionStatus === 'in_process').length;
    
    document.getElementById('pendingDecommission').textContent = `${pendingCircuits} Pending`;
    document.getElementById('processedDecommission').textContent = `${inProcessCircuits} In Process`;
}

// Update Analytics Dashboard
function updateAnalytics() {
    // Key Metrics
    const total = circuits.length;
    const flagged = circuits.filter(c => c.flagged && c.status === 'active').length;
    const approved = circuits.filter(c => c.status === 'approved' && c.decommissionStatus !== 'in_process').length;
    const rejected = circuits.filter(c => c.status === 'rejected').length;
    const inProcess = circuits.filter(c => c.decommissionStatus === 'in_process').length;
    const pending = circuits.filter(c => c.status === 'active' && !c.flagged).length;
    
    document.getElementById('analytics-total').textContent = total;
    document.getElementById('analytics-flagged').textContent = flagged;
    document.getElementById('analytics-approved').textContent = approved;
    document.getElementById('analytics-rejected').textContent = rejected;
    document.getElementById('analytics-in-process').textContent = inProcess;
    document.getElementById('analytics-pending').textContent = pending;
    
    // Pipeline Stages
    const activeCircuits = circuits.filter(c => c.status === 'active' || c.status === undefined).length;
    const underReview = circuits.filter(c => c.flagged && c.status === 'active').length;
    const approvedForDecom = circuits.filter(c => c.status === 'approved' && c.decommissionStatus !== 'in_process').length;
    const inProcessDecom = circuits.filter(c => c.decommissionStatus === 'in_process').length;
    
    document.getElementById('stage-analysis').textContent = `${activeCircuits} circuits`;
    document.getElementById('stage-review').textContent = `${underReview} circuits`;
    document.getElementById('stage-approved').textContent = `${approvedForDecom} circuits`;
    document.getElementById('stage-in-process').textContent = `${inProcessDecom} circuits`;
    
    // Rules Summary
    document.getElementById('analytics-rules').textContent = rules.length;
    
    // Find most matched rule
    const ruleMatches = {};
    circuits.forEach(circuit => {
        if (circuit.matchedRules) {
            circuit.matchedRules.forEach(ruleName => {
                ruleMatches[ruleName] = (ruleMatches[ruleName] || 0) + 1;
            });
        }
    });
    
    let topRule = 'N/A';
    let maxMatches = 0;
    for (const [ruleName, count] of Object.entries(ruleMatches)) {
        if (count > maxMatches) {
            maxMatches = count;
            topRule = `${ruleName} (${count} matches)`;
        }
    }
    document.getElementById('analytics-top-rule').textContent = topRule;
    
    // Cost Savings (for approved + in-process circuits)
    const decomCircuits = circuits.filter(c => c.status === 'approved' || c.decommissionStatus === 'in_process');
    const totalDecomCircuits = decomCircuits.length;
    
    if (totalDecomCircuits > 0) {
        const totalBandwidth = decomCircuits.reduce((sum, c) => sum + c.bandwidth, 0);
        const avgUtilization = (decomCircuits.reduce((sum, c) => sum + c.utilization, 0) / totalDecomCircuits).toFixed(1);
        const avgAge = Math.round(decomCircuits.reduce((sum, c) => sum + c.age, 0) / totalDecomCircuits);
        
        document.getElementById('savings-circuits').textContent = totalDecomCircuits;
        document.getElementById('savings-bandwidth').textContent = totalBandwidth;
        document.getElementById('savings-utilization').textContent = `${avgUtilization}%`;
        document.getElementById('savings-age').textContent = avgAge;
    } else {
        document.getElementById('savings-circuits').textContent = '0';
        document.getElementById('savings-bandwidth').textContent = '0';
        document.getElementById('savings-utilization').textContent = '0%';
        document.getElementById('savings-age').textContent = '0';
    }
}

// Data Persistence
function saveData() {
    localStorage.setItem('telecom_rules', JSON.stringify(rules));
    localStorage.setItem('telecom_circuits', JSON.stringify(circuits));
}

function loadData() {
    const savedRules = localStorage.getItem('telecom_rules');
    const savedCircuits = localStorage.getItem('telecom_circuits');
    
    if (savedRules) {
        rules = JSON.parse(savedRules);
    }
    
    if (savedCircuits) {
        circuits = JSON.parse(savedCircuits);
    }
}

// Notification System
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #000000;
        color: white;
        padding: 15px 25px;
        border-radius: 0;
        border-left: 4px solid #CD040B;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        z-index: 1000;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

