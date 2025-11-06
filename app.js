// Application State
let rules = [];
let circuits = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeTabs();
    initializeRuleForm();
    renderRules();
    generateSampleCircuits();
    updateStats();
});

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
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const rule = {
            id: Date.now(),
            name: document.getElementById('ruleName').value,
            condition: document.getElementById('ruleCondition').value,
            operator: document.getElementById('ruleOperator').value,
            value: parseFloat(document.getElementById('ruleValue').value),
            description: document.getElementById('ruleDescription').value
        };
        
        rules.push(rule);
        saveData();
        renderRules();
        form.reset();
        
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
    
    rulesList.innerHTML = rules.map(rule => `
        <div class="rule-item">
            <div class="rule-header">
                <div class="rule-name">${rule.name}</div>
                <button class="btn btn-danger" onclick="deleteRule(${rule.id})">Delete</button>
            </div>
            <div class="rule-condition">
                <strong>Condition:</strong> ${getConditionLabel(rule.condition)} ${rule.operator} ${rule.value}
            </div>
            ${rule.description ? `<div class="rule-description">${rule.description}</div>` : ''}
        </div>
    `).join('');
}

// Delete Rule
function deleteRule(ruleId) {
    if (confirm('Are you sure you want to delete this rule?')) {
        rules = rules.filter(rule => rule.id !== ruleId);
        saveData();
        renderRules();
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
        'cost': 'Cost per Mbps ($)'
    };
    return labels[condition] || condition;
}

// Generate Sample Circuits
function generateSampleCircuits() {
    if (circuits.length > 0) return; // Don't regenerate if data exists
    
    circuits = [
        {
            id: 'CKT-2024-001',
            location: 'New York - Manhattan',
            bandwidth: 100,
            utilization: 15,
            age: 36,
            traffic: 45,
            cost: 12.50,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-002',
            location: 'Los Angeles - Downtown',
            bandwidth: 1000,
            utilization: 75,
            age: 12,
            traffic: 850,
            cost: 8.20,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-003',
            location: 'Chicago - Loop',
            bandwidth: 500,
            utilization: 22,
            age: 48,
            traffic: 120,
            cost: 15.00,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-004',
            location: 'Houston - Energy Corridor',
            bandwidth: 250,
            utilization: 88,
            age: 6,
            traffic: 225,
            cost: 9.50,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-005',
            location: 'Phoenix - Downtown',
            bandwidth: 100,
            utilization: 18,
            age: 60,
            traffic: 25,
            cost: 18.75,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-006',
            location: 'Philadelphia - Center City',
            bandwidth: 500,
            utilization: 45,
            age: 24,
            traffic: 240,
            cost: 11.00,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-007',
            location: 'San Antonio - Medical Center',
            bandwidth: 100,
            utilization: 12,
            age: 72,
            traffic: 15,
            cost: 22.00,
            status: 'active',
            comments: []
        },
        {
            id: 'CKT-2024-008',
            location: 'San Diego - Mission Valley',
            bandwidth: 250,
            utilization: 65,
            age: 18,
            traffic: 180,
            cost: 10.50,
            status: 'active',
            comments: []
        }
    ];
    
    saveData();
}

// Run Analysis
function runAnalysis() {
    if (rules.length === 0) {
        alert('Please add at least one rule before running analysis.');
        return;
    }
    
    // Reset all circuits
    circuits.forEach(circuit => {
        circuit.flagged = false;
        circuit.matchedRules = [];
    });
    
    // Apply rules
    circuits.forEach(circuit => {
        rules.forEach(rule => {
            if (evaluateRule(circuit, rule)) {
                circuit.flagged = true;
                circuit.matchedRules.push(rule.name);
            }
        });
    });
    
    saveData();
    renderCircuits();
    updateStats();
    showNotification('Analysis completed!');
}

// Evaluate Rule
function evaluateRule(circuit, rule) {
    const circuitValue = circuit[rule.condition];
    const ruleValue = rule.value;
    
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
    showNotification(`Circuit ${circuitId} will remain active.`);
}

// Update Stats
function updateStats() {
    const totalCircuits = circuits.length;
    const flaggedCircuits = circuits.filter(c => c.flagged).length;
    
    document.getElementById('totalCircuits').textContent = `${totalCircuits} Circuits`;
    document.getElementById('flaggedCircuits').textContent = `${flaggedCircuits} Flagged`;
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
        background: #48bb78;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-weight: 600;
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

