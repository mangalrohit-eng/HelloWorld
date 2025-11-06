// Application State
let rules = [];
let circuits = [];

// Loading State Management
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    text.textContent = message;
    overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    createDefaultRules();
    initializeTabs();
    initializeSubTabs();
    initializeRuleForm();
    renderRules();
    generateSampleCircuits();
    initializeCircuitHistory();
    initializeNotificationSystem();
    renderCircuits();
    updateStats();
    renderDecommissionList();
    updateDecommissionStats();
    updateAnalytics();
    updateFeedbackCount();
    updateSelectionUI();
    
    // Initialize charts when Analytics tab is viewed
    setTimeout(() => {
        updateAnalyticsDashboard();
    }, 500);
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
                description: 'Critical: Circuits under 10% utilization are strong candidates for immediate decommission',
                aiGenerated: true
            },
            {
                id: Date.now() + 6,
                name: 'Old Legacy Circuits',
                type: 'include',
                conditions: [
                    { condition: 'age', operator: '>', value: 48 },
                    { condition: 'service_type', operator: '==', value: 'legacy' }
                ],
                logic: 'AND',
                description: 'Complex Rule: Legacy circuits older than 4 years are prime candidates for technology refresh and decommission'
            },
            {
                id: Date.now() + 7,
                name: 'Infrastructure or Hardware Issues',
                type: 'include',
                conditions: [
                    { condition: 'site_status', operator: '==', value: 'closed' },
                    { condition: 'hardware_eol', operator: '==', value: 'yes' }
                ],
                logic: 'OR',
                description: 'Complex Rule: Circuits at closed sites or with end-of-life hardware should be decommissioned',
                aiGenerated: true
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

// Sub-tab Navigation
function initializeSubTabs() {
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSubTab = this.getAttribute('data-subtab');
            
            // Remove active class from all sub-tabs and content
            document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.sub-tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(targetSubTab).classList.add('active');
        });
    });
}

// Temporary storage for additional conditions
let additionalConditions = [];

// Rule Form Handling
function initializeRuleForm() {
    const form = document.getElementById('ruleForm');
    const conditionSelect = document.getElementById('ruleCondition');
    const operatorSelect = document.getElementById('ruleOperator');
    const valueInputGroup = document.getElementById('valueInputGroup');
    const logicRadios = document.querySelectorAll('input[name="ruleLogic"]');
    const compoundSection = document.getElementById('compoundConditions');
    
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
    
    // Handle logic radio change
    logicRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'single') {
                compoundSection.style.display = 'none';
                additionalConditions = [];
                renderAdditionalConditions();
            } else {
                compoundSection.style.display = 'block';
            }
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const ruleType = document.querySelector('input[name="ruleType"]:checked').value;
        const ruleLogic = document.querySelector('input[name="ruleLogic"]:checked').value;
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
            description: document.getElementById('ruleDescription').value
        };
        
        // Handle single vs compound rules
        if (ruleLogic === 'single') {
            rule.condition = condition;
            rule.operator = document.getElementById('ruleOperator').value;
            rule.value = value;
        } else {
            // Compound rule
            const primaryCondition = {
                condition: condition,
                operator: document.getElementById('ruleOperator').value,
                value: value
            };
            rule.conditions = [primaryCondition, ...additionalConditions];
            rule.logic = ruleLogic; // 'AND' or 'OR'
        }
        
        rules.push(rule);
        saveData();
        renderRules();
        updateAnalytics();
        form.reset();
        
        // Reset additional conditions
        additionalConditions = [];
        renderAdditionalConditions();
        compoundSection.style.display = 'none';
        
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
        
        showNotification('Pattern added successfully!');
    });
}

// Add condition to compound rule
function addConditionToRule() {
    const list = document.getElementById('conditionsList');
    
    // Create inline form
    const formHTML = `
        <div id="newConditionForm" style="padding: 16px; background: #FFF5F5; border: 2px solid #CD040B; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="margin: 0 0 12px 0; color: #000000;">Add Condition</h4>
            <div style="display: grid; gap: 12px;">
                <div>
                    <label style="display: block; margin-bottom: 6px; font-weight: 500;">Condition Type:</label>
                    <select id="newConditionType" style="width: 100%; padding: 8px; border: 1px solid #E0E0E0; border-radius: 4px;">
                        <optgroup label="Performance Metrics">
                            <option value="utilization">Utilization Percentage</option>
                            <option value="bandwidth">Bandwidth Threshold</option>
                            <option value="traffic">Traffic Volume</option>
                        </optgroup>
                        <optgroup label="Cost & Age">
                            <option value="age">Circuit Age</option>
                            <option value="cost">Cost per Mbps</option>
                        </optgroup>
                        <optgroup label="Service Status">
                            <option value="contract_status">Contract Status</option>
                            <option value="service_type">Service Type</option>
                            <option value="redundancy">Redundancy Status</option>
                        </optgroup>
                        <optgroup label="Business & Technical">
                            <option value="site_status">Site/Facility Status</option>
                            <option value="hardware_eol">Hardware EOL/EOS</option>
                            <option value="provider_status">Provider/Carrier Status</option>
                        </optgroup>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Operator:</label>
                        <select id="newConditionOperator" style="width: 100%; padding: 8px; border: 1px solid #E0E0E0; border-radius: 4px;">
                            <option value="<">Less than</option>
                            <option value="<=">Less than or equal</option>
                            <option value=">">Greater than</option>
                            <option value=">=">Greater than or equal</option>
                            <option value="==">Equal to</option>
                            <option value="!=">Not equal to</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 6px; font-weight: 500;">Value:</label>
                        <input type="text" id="newConditionValue" placeholder="Enter value" style="width: 100%; padding: 8px; border: 1px solid #E0E0E0; border-radius: 4px;">
                    </div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="cancelAddCondition()" class="btn btn-secondary" style="padding: 8px 16px;">Cancel</button>
                    <button type="button" onclick="saveNewCondition()" class="btn btn-primary" style="padding: 8px 16px;">Add</button>
                </div>
            </div>
        </div>
    `;
    
    // Check if form already exists
    if (document.getElementById('newConditionForm')) {
        return; // Form already open
    }
    
    // Insert form at the beginning
    list.insertAdjacentHTML('afterbegin', formHTML);
    
    // Add dynamic behavior to the new form
    const newConditionType = document.getElementById('newConditionType');
    const newConditionOperator = document.getElementById('newConditionOperator');
    const newConditionValue = document.getElementById('newConditionValue');
    
    const conditionConfig = {
        // Numeric conditions
        'utilization': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'bandwidth': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'traffic': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
        'age': { type: 'numeric', operators: ['<', '<=', '>', '>=', '==', '!='] },
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
                { value: 'modern', label: 'Modern' },
                { value: 'fiber', label: 'Fiber' },
                { value: 'copper', label: 'Copper' }
            ]
        },
        'redundancy': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'partial', label: 'Partial' }
            ]
        },
        'site_status': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'active', label: 'Active' },
                { value: 'closed', label: 'Closed' },
                { value: 'relocated', label: 'Relocated' }
            ]
        },
        'hardware_eol': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
                { value: 'approaching', label: 'Approaching' }
            ]
        },
        'provider_status': { 
            type: 'select', 
            operators: ['==', '!='],
            options: [
                { value: 'active', label: 'Active' },
                { value: 'migrated', label: 'Migrated' },
                { value: 'terminated', label: 'Terminated' }
            ]
        }
    };
    
    newConditionType.addEventListener('change', function() {
        const condition = this.value;
        const config = conditionConfig[condition];
        
        if (!config) return;
        
        // Update operators
        const operatorLabels = {
            '<': 'Less than',
            '<=': 'Less than or equal',
            '>': 'Greater than',
            '>=': 'Greater than or equal',
            '==': 'Equal to',
            '!=': 'Not equal to'
        };
        
        newConditionOperator.innerHTML = '';
        config.operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op;
            option.textContent = operatorLabels[op] || op;
            newConditionOperator.appendChild(option);
        });
        
        // Update value input
        const valueContainer = newConditionValue.parentElement;
        if (config.type === 'numeric') {
            valueContainer.innerHTML = `
                <label style="display: block; margin-bottom: 6px; font-weight: 500;">Value:</label>
                <input type="number" id="newConditionValue" placeholder="Enter value" style="width: 100%; padding: 8px; border: 1px solid #E0E0E0; border-radius: 4px;">
            `;
        } else if (config.type === 'select') {
            const optionsHTML = config.options.map(opt => 
                `<option value="${opt.value}">${opt.label}</option>`
            ).join('');
            valueContainer.innerHTML = `
                <label style="display: block; margin-bottom: 6px; font-weight: 500;">Value:</label>
                <select id="newConditionValue" style="width: 100%; padding: 8px; border: 1px solid #E0E0E0; border-radius: 4px;">
                    ${optionsHTML}
                </select>
            `;
        }
    });
}

// Save new condition from inline form
function saveNewCondition() {
    const conditionType = document.getElementById('newConditionType').value;
    const operator = document.getElementById('newConditionOperator').value;
    const valueInput = document.getElementById('newConditionValue').value;
    
    if (!valueInput) {
        alert('Please enter a value');
        return;
    }
    
    const value = isNaN(valueInput) ? valueInput : parseFloat(valueInput);
    
    const condition = {
        condition: conditionType,
        operator: operator,
        value: value
    };
    
    additionalConditions.push(condition);
    
    // Remove form
    document.getElementById('newConditionForm').remove();
    
    // Re-render conditions
    renderAdditionalConditions();
}

// Cancel adding new condition
function cancelAddCondition() {
    document.getElementById('newConditionForm').remove();
    renderAdditionalConditions();
}

// Render additional conditions list
function renderAdditionalConditions() {
    const list = document.getElementById('conditionsList');
    if (!list) return;
    
    if (additionalConditions.length === 0) {
        list.innerHTML = '<div style="color: #666666; font-style: italic;">No additional conditions yet</div>';
        return;
    }
    
    list.innerHTML = additionalConditions.map((cond, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F6F6F6; border-radius: 6px; border-left: 3px solid #CD040B;">
            <span style="color: #000000; font-weight: 500;">
                ${getConditionLabel(cond.condition)} ${cond.operator} ${cond.value}
            </span>
            <button type="button" onclick="removeCondition(${index})" style="background: none; border: none; color: #CD040B; cursor: pointer; font-size: 1.2rem;">✕</button>
        </div>
    `).join('');
}

// Remove condition from compound rule
function removeCondition(index) {
    additionalConditions.splice(index, 1);
    renderAdditionalConditions();
}

// Render Rules
function renderRules() {
    const rulesList = document.getElementById('rulesList');
    
    if (rules.length === 0) {
        rulesList.innerHTML = '<div class="empty-state">No patterns defined yet. Add your first pattern above.</div>';
        return;
    }
    
    rulesList.innerHTML = rules.map(rule => {
        const ruleType = rule.type || 'include'; // Default to 'include' for legacy rules
        const typeLabel = ruleType === 'include' ? 'Include for Decommission' : 'Exclude from Decommission';
        const typeClass = ruleType === 'include' ? 'rule-type-include' : 'rule-type-exclude';
        const typeIcon = ruleType === 'include' ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
        
        // Build condition display
        let conditionHTML = '';
        if (rule.conditions && rule.conditions.length > 0) {
            // Compound rule
            const logicLabel = rule.logic === 'AND' ? '<strong style="color: #CD040B;">AND</strong>' : '<strong style="color: #CD040B;">OR</strong>';
            conditionHTML = '<strong>Conditions:</strong><div style="margin-top: 8px; padding-left: 12px; border-left: 3px solid #CD040B;">';
            conditionHTML += rule.conditions.map((cond, idx) => {
                const condLabel = getConditionLabel(cond.condition);
                return `<div style="margin: 4px 0;">${idx > 0 ? logicLabel + ' ' : ''}${condLabel} ${cond.operator} ${cond.value}</div>`;
            }).join('');
            conditionHTML += '</div>';
        } else {
            // Single condition
            conditionHTML = `<strong>Condition:</strong> ${getConditionLabel(rule.condition)} ${rule.operator} ${rule.value}`;
        }
        
        const aiIndicator = rule.aiGenerated ? '<span class="ai-generated-badge" title="AI Generated Pattern"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Generated</span>' : '';
        
        return `
            <div class="rule-item">
                <div class="rule-header">
                    <div>
                        <div class="rule-name">
                            ${rule.name}
                            ${aiIndicator}
                        </div>
                        <span class="rule-type-badge ${typeClass}">${typeIcon} ${typeLabel}</span>
                    </div>
                    <button class="btn btn-danger" onclick="deleteRule(${rule.id})">Delete</button>
                </div>
                <div class="rule-condition">
                    ${conditionHTML}
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
        
        // Mark 5 specific circuits as approved for decommissioning
        if ([4, 6, 8, 11, 13].includes(i)) {
            status = 'approved';
            comments.push({
                text: 'Approved for decommission - Low utilization and redundant capacity available at nearby site',
                author: 'Senior Network Engineer',
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
        alert('Please add at least one pattern before running analysis.');
        return;
    }
    
    showLoading('Running circuit analysis...');
    
    // Small delay to show loading state
    setTimeout(() => {
        hideLoading();
        // Start analysis workflow using footer bar
        startAnalysisWorkflow();
    }, 800);
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
    status.textContent = 'Pattern Engine Agent applying criteria...';
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
    updateSelectionUI();
    
    setTimeout(() => {
        status.textContent = 'AI Agent completed analysis';
        agent.classList.remove('working');
        agent.classList.add('completed');
        document.getElementById('learningProgressBar').style.width = '100%';
        
        const flaggedCount = circuits.filter(c => c.flagged).length;
        showNotification(`Analysis completed! ${flaggedCount} circuits flagged for review`);
        
        // Add notification
        addNotification('warning', `Analysis complete: ${flaggedCount} circuits flagged and pending your review`, null);
        
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
                    Add Pattern
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
    
    showNotification(`Exclusion pattern "${name}" added successfully!`);
}

// Evaluate Rule
function evaluateRule(circuit, rule) {
    // Check if this is a compound rule
    if (rule.conditions && rule.conditions.length > 0) {
        return evaluateCompoundRule(circuit, rule);
    }
    
    // Single condition rule
    return evaluateSingleCondition(circuit, rule.condition, rule.operator, rule.value);
}

// Evaluate compound rule with AND/OR logic
function evaluateCompoundRule(circuit, rule) {
    const results = rule.conditions.map(cond => 
        evaluateSingleCondition(circuit, cond.condition, cond.operator, cond.value)
    );
    
    if (rule.logic === 'AND') {
        return results.every(result => result === true);
    } else if (rule.logic === 'OR') {
        return results.some(result => result === true);
    }
    
    return false;
}

// Evaluate a single condition
function evaluateSingleCondition(circuit, condition, operator, value) {
    const circuitValue = circuit[condition];
    
    // Handle text-based conditions
    const textBasedConditions = ['contract_status', 'service_type', 'redundancy', 'site_status', 'hardware_eol', 'provider_status'];
    if (textBasedConditions.includes(condition)) {
        // For text conditions, only use equality/inequality
        if (operator === '==' || operator === '=') {
            return circuitValue === value;
        } else if (operator === '!=') {
            return circuitValue !== value;
        }
        return false;
    }
    
    // Handle numeric conditions
    switch (operator) {
        case '<':
            return circuitValue < value;
        case '<=':
            return circuitValue <= value;
        case '>':
            return circuitValue > value;
        case '>=':
            return circuitValue >= value;
        case '==':
            return circuitValue == value;
        case '!=':
            return circuitValue != value;
        default:
            return false;
    }
}

// Global variable for filtered circuits
let filteredCircuits = [];

// Initialize filtered circuits with all circuits
function initializeFilteredCircuits() {
    filteredCircuits = circuits;
}

// Render Circuits
function renderCircuits(circuitsToRender = null) {
    const circuitsList = document.getElementById('circuitsList');
    
    // Use provided circuits or all circuits
    const displayCircuits = circuitsToRender !== null ? circuitsToRender : circuits;
    filteredCircuits = [...displayCircuits];
    
    if (displayCircuits.length === 0) {
        circuitsList.innerHTML = '<div class="card"><div class="empty-state">No circuits match your filters.</div></div>';
        updateFilterCount(0, circuits.length);
        return;
    }
    
    // Update filter count
    updateFilterCount(displayCircuits.length, circuits.length);
    
    // Show flagged circuits first
    const sortedCircuits = [...displayCircuits].sort((a, b) => {
        if (a.flagged && !b.flagged) return -1;
        if (!a.flagged && b.flagged) return 1;
        return 0;
    });
    
    circuitsList.innerHTML = sortedCircuits.map(circuit => `
        <div class="circuit-card ${circuit.flagged ? 'flagged' : ''} ${circuit.status !== 'active' ? circuit.status : ''} ${circuit.selected ? 'selected' : ''}" id="circuit-${circuit.id}" data-circuit-id="${circuit.id}">
            <input type="checkbox" class="circuit-checkbox" data-circuit-id="${circuit.id}" onchange="toggleCircuitSelection('${circuit.id}')" ${circuit.selected ? 'checked' : ''}>
            <div class="circuit-header" style="margin-left: 40px;">
                <div class="circuit-info">
                    <h4>${circuit.id}</h4>
                    <p style="color: #718096; font-size: 0.95rem;">${circuit.location}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.85rem;" onclick="viewCircuitHistory('${circuit.id}')">
                        <i class="fa-solid fa-clock-rotate-left"></i> View History
                    </button>
                    <span class="circuit-status ${circuit.flagged ? 'flagged' : circuit.status}">
                        ${circuit.status === 'approved' ? '<i class="fa-solid fa-check"></i> Approved for Decommission' : 
                          circuit.status === 'rejected' ? '<i class="fa-solid fa-xmark"></i> Keep Active' :
                          circuit.flagged ? '<i class="fa-solid fa-triangle-exclamation"></i> Flagged for Review' : '<i class="fa-solid fa-circle"></i> Active'}
                    </span>
                </div>
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
                    <strong><i class="fa-solid fa-triangle-exclamation"></i> Matched Patterns:</strong>
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
                            <i class="fa-solid fa-check"></i> Approve Decommission
                        </button>
                        <button class="btn btn-reject" onclick="rejectDecommission('${circuit.id}')">
                            <i class="fa-solid fa-xmark"></i> Keep Active
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
        text: commentText,
        author: 'Jane Doe',
        timestamp: new Date().toISOString()
    });
    
    // Add history event
    addHistoryEvent(circuitId, 'approved', commentText, 'Jane Doe');
    
    // Add notification
    addNotification('success', `Circuit ${circuitId} approved for decommission`, circuitId);
    
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
        text: commentText,
        author: 'Jane Doe',
        timestamp: new Date().toISOString()
    });
    
    // Add history event
    addHistoryEvent(circuitId, 'rejected', commentText, 'Jane Doe');
    
    // Add notification
    addNotification('info', `Circuit ${circuitId} marked to keep active`, circuitId);
    
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
                        ${circuit.decommissionStatus === 'in_process' ? '<i class="fa-solid fa-arrows-spin"></i> In Process' : '<i class="fa-solid fa-check"></i> Pending'}
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
    
    // Update charts if on analytics tab
    if (document.getElementById('analytics').classList.contains('active')) {
        updateAnalyticsDashboard();
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

// ========== PHASE 1: SEARCH, FILTER, BULK OPERATIONS & EXPORT/IMPORT ==========

// Update filter count display
function updateFilterCount(filtered, total) {
    const countElement = document.getElementById('filteredCount');
    if (countElement) {
        countElement.textContent = `Showing ${filtered} of ${total} circuits`;
    }
}

// Apply filters and search
function applyFilters() {
    const searchTerm = document.getElementById('circuitSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const utilizationFilter = document.getElementById('utilizationFilter')?.value || 'all';
    const ageFilter = document.getElementById('ageFilter')?.value || 'all';
    const serviceTypeFilter = document.getElementById('serviceTypeFilter')?.value || 'all';
    
    let filtered = circuits.filter(circuit => {
        // Search filter
        const matchesSearch = !searchTerm || 
            circuit.id.toLowerCase().includes(searchTerm) ||
            circuit.location.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || circuit.status === statusFilter;
        
        // Utilization filter
        let matchesUtilization = true;
        if (utilizationFilter !== 'all') {
            const [min, max] = utilizationFilter.split('-').map(Number);
            if (max) {
                matchesUtilization = circuit.utilization >= min && circuit.utilization < max;
            } else {
                matchesUtilization = circuit.utilization >= min;
            }
        }
        
        // Age filter
        let matchesAge = true;
        if (ageFilter !== 'all') {
            if (ageFilter === '60+') {
                matchesAge = circuit.age >= 60;
            } else {
                const [min, max] = ageFilter.split('-').map(Number);
                matchesAge = circuit.age >= min && circuit.age < max;
            }
        }
        
        // Service type filter
        const matchesServiceType = serviceTypeFilter === 'all' || circuit.service_type === serviceTypeFilter;
        
        return matchesSearch && matchesStatus && matchesUtilization && matchesAge && matchesServiceType;
    });
    
    renderCircuits(filtered);
    updateSelectionUI();
}

// Clear all filters
function clearFilters() {
    if (document.getElementById('circuitSearch')) document.getElementById('circuitSearch').value = '';
    if (document.getElementById('statusFilter')) document.getElementById('statusFilter').value = 'all';
    if (document.getElementById('utilizationFilter')) document.getElementById('utilizationFilter').value = 'all';
    if (document.getElementById('ageFilter')) document.getElementById('ageFilter').value = 'all';
    if (document.getElementById('serviceTypeFilter')) document.getElementById('serviceTypeFilter').value = 'all';
    
    renderCircuits();
    updateSelectionUI();
    showNotification('Filters cleared');
}

// Toggle individual circuit selection
function toggleCircuitSelection(circuitId) {
    const circuit = circuits.find(c => c.id === circuitId);
    if (circuit) {
        circuit.selected = !circuit.selected;
        const card = document.getElementById(`circuit-${circuitId}`);
        if (card) {
            card.classList.toggle('selected', circuit.selected);
        }
        saveData();
        updateSelectionUI();
    }
}

// Toggle select all circuits
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCircuits');
    const isChecked = selectAllCheckbox.checked;
    
    // Apply to filtered circuits only
    filteredCircuits.forEach(circuit => {
        circuit.selected = isChecked;
        const checkbox = document.querySelector(`.circuit-checkbox[data-circuit-id="${circuit.id}"]`);
        if (checkbox) checkbox.checked = isChecked;
        const card = document.getElementById(`circuit-${circuit.id}`);
        if (card) card.classList.toggle('selected', isChecked);
    });
    
    saveData();
    updateSelectionUI();
}

// Update selection UI
function updateSelectionUI() {
    const selectedCircuits = circuits.filter(c => c.selected);
    const selectedCount = selectedCircuits.length;
    
    const countElement = document.getElementById('selectedCount');
    const bulkActionButtons = document.getElementById('bulkActionButtons');
    const selectAllCheckbox = document.getElementById('selectAllCircuits');
    
    if (countElement) {
        countElement.textContent = selectedCount > 0 ? `(${selectedCount} selected)` : '(0 selected)';
    }
    
    if (bulkActionButtons) {
        bulkActionButtons.style.display = selectedCount > 0 ? 'flex' : 'none';
    }
    
    if (selectAllCheckbox) {
        const visibleSelected = filteredCircuits.filter(c => c.selected).length;
        selectAllCheckbox.checked = visibleSelected === filteredCircuits.length && filteredCircuits.length > 0;
        selectAllCheckbox.indeterminate = visibleSelected > 0 && visibleSelected < filteredCircuits.length;
    }
}

// Clear selection
function clearSelection() {
    circuits.forEach(circuit => {
        circuit.selected = false;
        const checkbox = document.querySelector(`.circuit-checkbox[data-circuit-id="${circuit.id}"]`);
        if (checkbox) checkbox.checked = false;
        const card = document.getElementById(`circuit-${circuit.id}`);
        if (card) card.classList.remove('selected');
    });
    
    saveData();
    updateSelectionUI();
    showNotification('Selection cleared');
}

// Bulk approve circuits
function bulkApprove() {
    const selectedCircuits = circuits.filter(c => c.selected && c.status === 'active');
    
    if (selectedCircuits.length === 0) {
        alert('No active circuits selected. Please select circuits that are flagged for review.');
        return;
    }
    
    const comment = prompt(`Approve ${selectedCircuits.length} circuit(s) for decommission?\n\nEnter approval comment:`);
    if (!comment) return;
    
    showLoading(`Approving ${selectedCircuits.length} circuits...`);
    
    selectedCircuits.forEach(circuit => {
        circuit.status = 'approved';
        circuit.comments.push({
            text: comment,
            author: 'Jane Doe',
            timestamp: new Date().toISOString(),
            decision: 'Approved',
            date: new Date().toLocaleDateString()
        });
        circuit.selected = false;
        
        // Add history event
        addHistoryEvent(circuit.id, 'approved', `Bulk approval: ${comment}`, 'Jane Doe');
    });
    
    // Add notification
    addNotification('success', `${selectedCircuits.length} circuits bulk approved for decommission`, null);
    
    saveData();
    renderCircuits(filteredCircuits);
    updateStats();
    updateDecommissionStats();
    updateAnalytics();
    renderDecommissionList();
    updateSelectionUI();
    
    setTimeout(() => {
        hideLoading();
        showNotification(`${selectedCircuits.length} circuit(s) approved for decommission`);
    }, 600);
}

// Bulk reject circuits
function bulkReject() {
    const selectedCircuits = circuits.filter(c => c.selected && c.status === 'active');
    
    if (selectedCircuits.length === 0) {
        alert('No active circuits selected. Please select circuits that are flagged for review.');
        return;
    }
    
    const comment = prompt(`Reject ${selectedCircuits.length} circuit(s) from decommission?\n\nEnter reason for keeping active:`);
    if (!comment) return;
    
    showLoading(`Updating ${selectedCircuits.length} circuits...`);
    
    selectedCircuits.forEach(circuit => {
        circuit.status = 'rejected';
        circuit.comments.push({
            text: comment,
            author: 'Jane Doe',
            timestamp: new Date().toISOString(),
            decision: 'Rejected',
            date: new Date().toLocaleDateString()
        });
        circuit.selected = false;
        
        // Add history event
        addHistoryEvent(circuit.id, 'rejected', `Bulk rejection: ${comment}`, 'Jane Doe');
        
        updateFeedbackCount();
    });
    
    // Add notification
    addNotification('info', `${selectedCircuits.length} circuits bulk marked to keep active`, null);
    
    saveData();
    renderCircuits(filteredCircuits);
    updateStats();
    updateAnalytics();
    updateSelectionUI();
    
    setTimeout(() => {
        hideLoading();
        showNotification(`${selectedCircuits.length} circuit(s) marked to keep active`);
    }, 600);
}

// Export circuits to CSV
function exportCircuits() {
    const circuitsToExport = filteredCircuits.length > 0 ? filteredCircuits : circuits;
    
    if (circuitsToExport.length === 0) {
        alert('No circuits to export');
        return;
    }
    
    showLoading('Preparing export...');
    
    // CSV headers
    const headers = [
        'Circuit ID', 'Location', 'Bandwidth (Mbps)', 'Utilization (%)', 
        'Age (months)', 'Traffic (GB)', 'Cost/Mbps ($)', 'Contract Status',
        'Service Type', 'Redundancy', 'Site Status', 'Hardware EOL', 
        'Provider Status', 'Status', 'Flagged', 'Comments'
    ];
    
    // Convert circuits to CSV rows
    const rows = circuitsToExport.map(circuit => [
        circuit.id,
        circuit.location,
        circuit.bandwidth,
        circuit.utilization,
        circuit.age,
        circuit.traffic,
        circuit.cost,
        circuit.contract_status,
        circuit.service_type,
        circuit.redundancy,
        circuit.site_status,
        circuit.hardware_eol,
        circuit.provider_status,
        circuit.status,
        circuit.flagged ? 'Yes' : 'No',
        circuit.comments.map(c => `${c.decision}: ${c.text}`).join('; ')
    ]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `circuits_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
        hideLoading();
        showNotification(`Exported ${circuitsToExport.length} circuits to CSV`);
    }, 400);
}

// Import circuits from CSV
function importCircuits(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading('Importing circuits...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('CSV file is empty or invalid');
                return;
            }
            
            // Skip header row
            const dataLines = lines.slice(1);
            let importCount = 0;
            
            dataLines.forEach(line => {
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!values || values.length < 7) return;
                
                // Clean quotes from values
                const cleanValues = values.map(v => v.replace(/^"|"$/g, ''));
                
                const [id, location, bandwidth, utilization, age, traffic, cost] = cleanValues;
                
                // Check if circuit already exists
                if (circuits.find(c => c.id === id)) {
                    return; // Skip duplicates
                }
                
                circuits.push({
                    id: id,
                    location: location,
                    bandwidth: parseInt(bandwidth) || 0,
                    utilization: parseInt(utilization) || 0,
                    age: parseInt(age) || 0,
                    traffic: parseInt(traffic) || 0,
                    cost: parseFloat(cost) || 0,
                    contract_status: cleanValues[7] || 'active',
                    service_type: cleanValues[8] || 'modern',
                    redundancy: cleanValues[9] || 'no',
                    site_status: cleanValues[10] || 'active',
                    hardware_eol: cleanValues[11] || 'no',
                    provider_status: cleanValues[12] || 'current',
                    status: 'active',
                    flagged: false,
                    matchedRules: [],
                    comments: [],
                    selected: false
                });
                importCount++;
            });
            
            if (importCount > 0) {
                saveData();
                renderCircuits();
                updateStats();
                updateAnalytics();
                showNotification(`Imported ${importCount} new circuits`);
            } else {
                alert('No new circuits to import (all circuits already exist)');
            }
            
        } catch (error) {
            hideLoading();
            alert('Error importing CSV file: ' + error.message);
        }
        
        setTimeout(() => {
            hideLoading();
        }, 500);
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// ========== PHASE 2: ENHANCED ANALYTICS WITH CHARTS ==========

// Store chart instances globally to destroy before recreating
let chartInstances = {
    status: null,
    utilization: null,
    age: null,
    serviceType: null,
    trend: null,
    rules: null
};

// Initialize analytics dashboard with charts
function updateAnalyticsDashboard() {
    calculateCostSavings();
    createStatusChart();
    createUtilizationChart();
    createAgeChart();
    createServiceTypeChart();
    createTrendChart();
    createRulesChart();
}

// Calculate and display cost savings
function calculateCostSavings() {
    const approvedCircuits = circuits.filter(c => c.status === 'approved');
    
    if (approvedCircuits.length === 0) {
        document.getElementById('estimatedSavings').textContent = '$0';
        document.getElementById('savingsBreakdown').textContent = 'No approved circuits yet';
        return;
    }
    
    // Calculate annual costs (bandwidth * cost * 12 months)
    const totalAnnualSavings = approvedCircuits.reduce((sum, circuit) => {
        return sum + (circuit.bandwidth * circuit.cost * 12);
    }, 0);
    
    const avgUtilization = (approvedCircuits.reduce((sum, c) => sum + c.utilization, 0) / approvedCircuits.length).toFixed(1);
    const avgAge = Math.round(approvedCircuits.reduce((sum, c) => sum + c.age, 0) / approvedCircuits.length);
    
    document.getElementById('estimatedSavings').textContent = `$${totalAnnualSavings.toLocaleString()}`;
    document.getElementById('savingsBreakdown').textContent = 
        `${approvedCircuits.length} circuits • Avg ${avgUtilization}% utilization • ${avgAge} months old`;
}

// Create status distribution pie chart
function createStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (chartInstances.status) {
        chartInstances.status.destroy();
    }
    
    const statusCounts = {
        active: circuits.filter(c => c.status === 'active' && !c.flagged).length,
        flagged: circuits.filter(c => c.flagged).length,
        approved: circuits.filter(c => c.status === 'approved').length,
        rejected: circuits.filter(c => c.status === 'rejected').length
    };
    
    chartInstances.status = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Active', 'Flagged', 'Approved', 'Rejected'],
            datasets: [{
                data: [statusCounts.active, statusCounts.flagged, statusCounts.approved, statusCounts.rejected],
                backgroundColor: [
                    '#6C757D',
                    '#FFC107',
                    '#28A745',
                    '#DC3545'
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create utilization distribution bar chart
function createUtilizationChart() {
    const canvas = document.getElementById('utilizationChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.utilization) {
        chartInstances.utilization.destroy();
    }
    
    const ranges = {
        '0-20%': circuits.filter(c => c.utilization >= 0 && c.utilization < 20).length,
        '20-40%': circuits.filter(c => c.utilization >= 20 && c.utilization < 40).length,
        '40-60%': circuits.filter(c => c.utilization >= 40 && c.utilization < 60).length,
        '60-80%': circuits.filter(c => c.utilization >= 60 && c.utilization < 80).length,
        '80-100%': circuits.filter(c => c.utilization >= 80 && c.utilization <= 100).length
    };
    
    chartInstances.utilization = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                label: 'Number of Circuits',
                data: Object.values(ranges),
                backgroundColor: '#CD040B',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Create age distribution bar chart
function createAgeChart() {
    const canvas = document.getElementById('ageChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.age) {
        chartInstances.age.destroy();
    }
    
    const ranges = {
        '0-12 mo': circuits.filter(c => c.age < 12).length,
        '1-2 yrs': circuits.filter(c => c.age >= 12 && c.age < 24).length,
        '2-3 yrs': circuits.filter(c => c.age >= 24 && c.age < 36).length,
        '3-4 yrs': circuits.filter(c => c.age >= 36 && c.age < 48).length,
        '4-5 yrs': circuits.filter(c => c.age >= 48 && c.age < 60).length,
        '5+ yrs': circuits.filter(c => c.age >= 60).length
    };
    
    chartInstances.age = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                label: 'Number of Circuits',
                data: Object.values(ranges),
                backgroundColor: '#17A2B8',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Create service type pie chart
function createServiceTypeChart() {
    const canvas = document.getElementById('serviceTypeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.serviceType) {
        chartInstances.serviceType.destroy();
    }
    
    const legacy = circuits.filter(c => c.service_type === 'legacy').length;
    const modern = circuits.filter(c => c.service_type === 'modern').length;
    
    chartInstances.serviceType = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Legacy', 'Modern'],
            datasets: [{
                data: [legacy, modern],
                backgroundColor: ['#FF6384', '#36A2EB'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            }
        }
    });
}

// Create trend line chart (simulated timeline)
function createTrendChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.trend) {
        chartInstances.trend.destroy();
    }
    
    // Simulated monthly data for the last 6 months
    const months = ['6 months ago', '5 months ago', '4 months ago', '3 months ago', '2 months ago', 'Last month'];
    const flaggedData = [8, 15, 22, 28, 35, circuits.filter(c => c.flagged).length];
    const approvedData = [3, 7, 12, 16, 21, circuits.filter(c => c.status === 'approved').length];
    
    chartInstances.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Flagged Circuits',
                    data: flaggedData,
                    borderColor: '#FFC107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Approved Circuits',
                    data: approvedData,
                    borderColor: '#28A745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 10 }
                }
            }
        }
    });
}

// Create rules performance horizontal bar chart
function createRulesChart() {
    const canvas = document.getElementById('rulesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (chartInstances.rules) {
        chartInstances.rules.destroy();
    }
    
    // Count how many circuits each rule matched
    const ruleMatches = {};
    circuits.forEach(circuit => {
        if (circuit.matchedRules) {
            circuit.matchedRules.forEach(ruleName => {
                ruleMatches[ruleName] = (ruleMatches[ruleName] || 0) + 1;
            });
        }
    });
    
    // Get top 5 rules
    const sortedRules = Object.entries(ruleMatches)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (sortedRules.length === 0) {
        // No data yet
        return;
    }
    
    chartInstances.rules = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedRules.map(r => r[0]),
            datasets: [{
                label: 'Circuits Matched',
                data: sortedRules.map(r => r[1]),
                backgroundColor: '#CD040B',
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Refresh analytics
function refreshAnalytics() {
    updateAnalytics();
    updateAnalyticsDashboard();
    showNotification('Analytics refreshed');
}

// Export analytics as PDF (HTML-based report)
function exportAnalyticsPDF() {
    const report = generateAnalyticsReport();
    
    // Create a printable HTML page
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(report);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    showNotification('Analytics report opened for printing/PDF export');
}

// Generate HTML report
function generateAnalyticsReport() {
    const date = new Date().toLocaleDateString();
    const approvedCircuits = circuits.filter(c => c.status === 'approved');
    const flaggedCircuits = circuits.filter(c => c.flagged);
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Circuit Decommission Analytics Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { color: #CD040B; }
                h2 { color: #000000; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #CD040B; color: white; }
                .metric { display: inline-block; padding: 20px; margin: 10px; background: #f6f6f6; border-radius: 8px; }
                .metric h3 { margin: 0; font-size: 2rem; color: #CD040B; }
                .metric p { margin: 5px 0 0 0; color: #666; }
            </style>
        </head>
        <body>
            <h1>📊 Circuit Decommission Analytics Report</h1>
            <p><strong>Generated:</strong> ${date}</p>
            <p><strong>Report Period:</strong> All Time</p>
            
            <h2>Key Metrics</h2>
            <div class="metric">
                <h3>${circuits.length}</h3>
                <p>Total Circuits</p>
            </div>
            <div class="metric">
                <h3>${flaggedCircuits.length}</h3>
                <p>Flagged for Review</p>
            </div>
            <div class="metric">
                <h3>${approvedCircuits.length}</h3>
                <p>Approved for Decommission</p>
            </div>
            
            <h2>Approved Circuits for Decommission</h2>
            <table>
                <thead>
                    <tr>
                        <th>Circuit ID</th>
                        <th>Location</th>
                        <th>Utilization</th>
                        <th>Age (months)</th>
                        <th>Bandwidth (Mbps)</th>
                    </tr>
                </thead>
                <tbody>
                    ${approvedCircuits.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.location}</td>
                            <td>${c.utilization}%</td>
                            <td>${c.age}</td>
                            <td>${c.bandwidth}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>Active Patterns</h2>
            <table>
                <thead>
                    <tr>
                        <th>Pattern Name</th>
                        <th>Type</th>
                        <th>Condition</th>
                    </tr>
                </thead>
                <tbody>
                    ${rules.map(r => `
                        <tr>
                            <td>${r.name}</td>
                            <td>${r.type === 'include' ? 'Include' : 'Exclude'}</td>
                            <td>${r.conditions ? 'Compound Pattern' : getConditionLabel(r.condition) + ' ' + r.operator + ' ' + r.value}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <p style="margin-top: 40px; color: #666; font-size: 0.9rem;">
                <strong>Disclaimer:</strong> This report is generated by an AI-powered system. 
                All recommendations should be reviewed by qualified network engineers before implementation.
            </p>
        </body>
        </html>
    `;
}

// ========== PHASE 3: HISTORY/AUDIT TRAIL + SMART NOTIFICATIONS ==========

// Notification System
let notifications = [];
let notificationIdCounter = 1;

// Initialize notification system
function initializeNotificationSystem() {
    // Load saved notifications
    const savedNotifications = localStorage.getItem('telecom_notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
        notificationIdCounter = Math.max(...notifications.map(n => n.id), 0) + 1;
    }
    
    updateNotificationBadge();
    renderNotifications();
    
    // Generate smart notifications on load
    generateSmartNotifications();
}

// Toggle notification panel
function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    const isActive = panel.classList.toggle('active');
    
    if (isActive) {
        renderNotifications();
    }
    
    // Close panel when clicking outside
    if (isActive) {
        setTimeout(() => {
            document.addEventListener('click', closeNotificationPanelOutside);
        }, 0);
    } else {
        document.removeEventListener('click', closeNotificationPanelOutside);
    }
}

function closeNotificationPanelOutside(event) {
    const panel = document.getElementById('notificationPanel');
    const bell = document.querySelector('.notification-bell');
    
    if (!panel.contains(event.target) && !bell.contains(event.target)) {
        panel.classList.remove('active');
        document.removeEventListener('click', closeNotificationPanelOutside);
    }
}

// Add notification
function addNotification(type, message, circuitId = null) {
    const notification = {
        id: notificationIdCounter++,
        type: type, // 'info', 'warning', 'success', 'alert'
        message: message,
        circuitId: circuitId,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

// Mark notification as read
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

// Mark all as read
function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

// Clear all notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

// Update notification badge
function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// Render notifications
function renderNotifications() {
    const listElement = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        listElement.innerHTML = '<div class="empty-state">No notifications</div>';
        return;
    }
    
    listElement.innerHTML = notifications.map(notification => {
        const timeAgo = getTimeAgo(new Date(notification.timestamp));
        return `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 onclick="handleNotificationClick(${notification.id})">
                <span class="notification-type ${notification.type}">${notification.type.toUpperCase()}</span>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

// Handle notification click
function handleNotificationClick(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    markAsRead(notificationId);
    
    // If notification has a circuit ID, navigate to circuit review
    if (notification.circuitId) {
        document.querySelector('[data-tab="circuitReview"]').click();
        // Scroll to circuit (simplified)
        setTimeout(() => {
            const circuitElement = document.querySelector(`[data-circuit-id="${notification.circuitId}"]`);
            if (circuitElement) {
                circuitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    }
}

// Generate smart notifications
function generateSmartNotifications() {
    const flaggedCircuits = circuits.filter(c => c.flagged && c.status === 'active');
    const pendingReviewCount = flaggedCircuits.length;
    
    // Notification: Circuits awaiting review
    if (pendingReviewCount > 0) {
        const existingNotification = notifications.find(n => 
            n.message.includes('circuits pending review') && !n.read
        );
        if (!existingNotification) {
            addNotification('warning', 
                `${pendingReviewCount} circuits pending review`, 
                null
            );
        }
    }
    
    // Notification: Rules with no matches
    const ruleMatches = {};
    circuits.forEach(circuit => {
        if (circuit.matchedRules) {
            circuit.matchedRules.forEach(ruleName => {
                ruleMatches[ruleName] = true;
            });
        }
    });
    
    const unusedRules = rules.filter(r => !ruleMatches[r.name]);
    if (unusedRules.length > 0) {
        unusedRules.forEach(rule => {
            const existingNotification = notifications.find(n => 
                n.message.includes(`Pattern "${rule.name}" hasn't matched`) && !n.read
            );
            if (!existingNotification) {
                addNotification('info', 
                    `Pattern "${rule.name}" hasn't matched any circuits yet`, 
                    null
                );
            }
        });
    }
    
    // Notification: High utilization circuits flagged
    const highUtilCircuits = circuits.filter(c => c.flagged && c.utilization > 80);
    if (highUtilCircuits.length > 0) {
        highUtilCircuits.forEach(circuit => {
            const existingNotification = notifications.find(n => 
                n.message.includes(circuit.id) && n.message.includes('high utilization') && !n.read
            );
            if (!existingNotification) {
                addNotification('alert', 
                    `Circuit ${circuit.id} flagged despite ${circuit.utilization}% utilization - review urgently`, 
                    circuit.id
                );
            }
        });
    }
}

// Save notifications
function saveNotifications() {
    localStorage.setItem('telecom_notifications', JSON.stringify(notifications));
}

// Get time ago helper
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

// Circuit History System
function initializeCircuitHistory() {
    // Add creation timestamp to existing circuits if not present
    circuits.forEach(circuit => {
        if (!circuit.history) {
            circuit.history = [];
            
            // Add creation event
            circuit.history.push({
                event: 'created',
                timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 90 days
                author: 'System',
                description: 'Circuit added to system'
            });
            
            // If circuit is flagged, add flagged event
            if (circuit.flagged && circuit.matchedRules) {
                circuit.history.push({
                    event: 'flagged',
                    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
                    author: 'Pattern Engine',
                    description: `Flagged by patterns: ${circuit.matchedRules.join(', ')}`
                });
            }
            
            // If circuit has comments, add review events
            if (circuit.comments && circuit.comments.length > 0) {
                circuit.comments.forEach(comment => {
                    circuit.history.push({
                        event: circuit.status === 'approved' ? 'approved' : 'rejected',
                        timestamp: comment.timestamp,
                        author: comment.author,
                        description: comment.text
                    });
                });
            }
        }
    });
    
    saveData();
}

// Add history event
function addHistoryEvent(circuitId, event, description, author = 'Jane Doe') {
    const circuit = circuits.find(c => c.id === circuitId);
    if (!circuit) return;
    
    if (!circuit.history) {
        circuit.history = [];
    }
    
    circuit.history.push({
        event: event, // 'created', 'flagged', 'approved', 'rejected', 'comment', 'status_change'
        timestamp: new Date().toISOString(),
        author: author,
        description: description
    });
    
    saveData();
}

// Open history modal
function viewCircuitHistory(circuitId) {
    const circuit = circuits.find(c => c.id === circuitId);
    if (!circuit) return;
    
    const modal = document.getElementById('historyModal');
    const circuitInfo = document.getElementById('historyCircuitInfo');
    const timeline = document.getElementById('historyTimeline');
    
    // Populate circuit info
    circuitInfo.innerHTML = `
        <h3>Circuit ${circuit.id}</h3>
        <div class="history-info-grid">
            <div class="history-info-item">
                <span class="history-info-label">Location:</span>
                <span class="history-info-value">${circuit.location}</span>
            </div>
            <div class="history-info-item">
                <span class="history-info-label">Status:</span>
                <span class="history-info-value">${circuit.status || 'active'}</span>
            </div>
            <div class="history-info-item">
                <span class="history-info-label">Utilization:</span>
                <span class="history-info-value">${circuit.utilization}%</span>
            </div>
            <div class="history-info-item">
                <span class="history-info-label">Age:</span>
                <span class="history-info-value">${circuit.age} months</span>
            </div>
            <div class="history-info-item">
                <span class="history-info-label">Bandwidth:</span>
                <span class="history-info-value">${circuit.bandwidth} Mbps</span>
            </div>
            <div class="history-info-item">
                <span class="history-info-label">Service Type:</span>
                <span class="history-info-value">${circuit.service_type}</span>
            </div>
        </div>
    `;
    
    // Populate timeline (sort by timestamp, newest first)
    const sortedHistory = (circuit.history || []).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    if (sortedHistory.length === 0) {
        timeline.innerHTML = '<div class="empty-state">No history available</div>';
    } else {
        timeline.innerHTML = sortedHistory.map(event => {
            const eventDate = new Date(event.timestamp);
            const formattedDate = eventDate.toLocaleString();
            
            return `
                <div class="history-event ${event.event}">
                    <div class="history-event-header">
                        <span class="history-event-title">${getEventTitle(event.event)}</span>
                        <span class="history-event-time">${formattedDate}</span>
                    </div>
                    <div class="history-event-description">${event.description}</div>
                    <div class="history-event-author">By: ${event.author}</div>
                </div>
            `;
        }).join('');
    }
    
    modal.classList.add('active');
}

// Close history modal
function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('active');
}

// Get event title helper
function getEventTitle(event) {
    const titles = {
        'created': '<i class="fa-solid fa-plus"></i> Circuit Created',
        'flagged': '<i class="fa-solid fa-flag"></i> Flagged for Review',
        'approved': '<i class="fa-solid fa-circle-check"></i> Approved for Decommission',
        'rejected': '<i class="fa-solid fa-ban"></i> Kept Active',
        'comment': '<i class="fa-solid fa-comment"></i> Comment Added',
        'status_change': '<i class="fa-solid fa-arrow-right-arrow-left"></i> Status Changed'
    };
    return titles[event] || event;
}

