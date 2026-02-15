import React, { useState } from 'react';
import axios from 'axios';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  FileText, Send, Loader, Info, ChevronDown, ChevronUp 
} from 'lucide-react';
import './App.css';

const API_BASE_URL = '/api';

function App() {
  const [formData, setFormData] = useState({
    system_name: '',
    description: '',
    application_domain: '',
    data_sources: '',
    user_impact: '',
    deployment_context: '',
    additional_info: ''
  });

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [expandedReqs, setExpandedReqs] = useState({});
  const [examples, setExamples] = useState([]);
  const [selectedExample, setSelectedExample] = useState(0);

  React.useEffect(() => {
    checkApiHealth();
    loadExamples();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setApiStatus(response.data);
    } catch (err) {
      setApiStatus({ status: 'error', api_key_configured: false });
    }
  };

  const loadExamples = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/examples`);
      setExamples(response.data.examples);
    } catch (err) {
      console.error('Failed to load examples:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadExample = () => {
    if (examples.length === 0) return;
    const example = examples[selectedExample];
    setFormData({
      system_name: example.system_name,
      description: example.description,
      application_domain: example.application_domain,
      data_sources: example.data_sources.join(', '),
      user_impact: example.user_impact,
      deployment_context: example.deployment_context,
      additional_info: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const payload = {
        ...formData,
        data_sources: formData.data_sources.split(',').map(s => s.trim()).filter(Boolean)
      };

      const response = await axios.post(`${API_BASE_URL}/assess`, payload);
      setAssessment(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRequirement = (index) => {
    setExpandedReqs({
      ...expandedReqs,
      [index]: !expandedReqs[index]
    });
  };

  const getRiskColor = (risk) => {
    const colors = {
      'UNACCEPTABLE': 'red',
      'HIGH': 'orange',
      'LIMITED': 'yellow',
      'MINIMAL': 'green'
    };
    return colors[risk] || 'gray';
  };
  
  const getRiskExplanation = (risk) => {
    const explanations = {
    'UNACCEPTABLE': '🚫 Prohibited AI systems. These cannot be deployed in the EU under any circumstances. Immediate action required.',
    'HIGH': '⚠️ High-risk AI requiring strict compliance: risk management systems, human oversight, data governance, comprehensive technical documentation, and conformity assessment.',
    'LIMITED': '⚡ Limited-risk AI with transparency obligations. Users must be clearly informed they are interacting with an AI system.',
    'MINIMAL': '✅ Minimal-risk AI. Few regulatory obligations. Standard business practices and voluntary codes of conduct apply.'
  };
  return explanations[risk] || '';
}; 
  const getStatusIcon = (status) => {
    switch(status) {
      case 'compliant':
        return <CheckCircle className="status-icon compliant" />;
      case 'non-compliant':
        return <XCircle className="status-icon non-compliant" />;
      case 'partial':
        return <AlertTriangle className="status-icon partial" />;
      default:
        return <Info className="status-icon unknown" />;
    }
  };

  const copyAPICode = () => {
    const code = `import requests

# EU AI Act Compliance Assessment
response = requests.post('http://localhost:8000/assess', 
    json={
        "system_name": "${formData.system_name}",
        "description": "${formData.description}",
        "application_domain": "${formData.application_domain}",
        "data_sources": ${JSON.stringify(formData.data_sources.split(',').map(s => s.trim()))},
        "user_impact": "${formData.user_impact}",
        "deployment_context": "${formData.deployment_context}"
    }
)

result = response.json()
print(f"Risk: {result['risk_category']}")
print(f"Score: {result['overall_compliance_score']}/100")
`;

    navigator.clipboard.writeText(code).then(() => {
      alert('✅ API code copied to clipboard!');
    });
  };

  const exportReport = () => {
    const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EU AI Act Compliance Report - ${assessment.system_name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            line-height: 1.6;
            color: #2d3748;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 60px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 400px;
            height: 400px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .logo {
            font-size: 48px;
            margin-bottom: 10px;
        }
        
        .header h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
        }
        
        .header-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.2);
        }
        
        .meta-item {
            display: flex;
            flex-direction: column;
        }
        
        .meta-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.8;
            margin-bottom: 5px;
        }
        
        .meta-value {
            font-size: 16px;
            font-weight: 600;
        }
        
        .content {
            padding: 60px;
        }
        
        .risk-section {
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 16px;
            margin-bottom: 40px;
        }
        
        .risk-badge {
            display: inline-block;
            padding: 12px 32px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .risk-HIGH {
            background: linear-gradient(135deg, #fbd38d 0%, #f6ad55 100%);
            color: #7c2d12;
        }
        
        .risk-LIMITED {
            background: linear-gradient(135deg, #faf089 0%, #f6e05e 100%);
            color: #744210;
        }
        
        .risk-MINIMAL {
            background: linear-gradient(135deg, #9ae6b4 0%, #68d391 100%);
            color: #22543d;
        }
        
        .risk-UNACCEPTABLE {
            background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
            color: #742a2a;
        }
        
        .score {
            font-size: 72px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .score-label {
            font-size: 16px;
            color: #718096;
            font-weight: 500;
        }
        
        .section {
            margin: 40px 0;
        }
        
        .section-title {
            font-size: 24px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-icon {
            font-size: 28px;
        }
        
        .card {
            background: #f7fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            border-left: 4px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .requirement {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 15px;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
        }
        
        .requirement.compliant {
            border-left: 5px solid #48bb78;
            background: linear-gradient(to right, #f0fff4 0%, white 100%);
        }
        
        .requirement.partial {
            border-left: 5px solid #ed8936;
            background: linear-gradient(to right, #fffaf0 0%, white 100%);
        }
        
        .requirement.non-compliant {
            border-left: 5px solid #f56565;
            background: linear-gradient(to right, #fff5f5 0%, white 100%);
        }
        
        .requirement-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .requirement-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
        }
        
        .status-badge {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-badge.compliant {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .status-badge.partial {
            background: #feebc8;
            color: #7c2d12;
        }
        
        .status-badge.non-compliant {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .status-badge.unknown {
            background: #e2e8f0;
            color: #4a5568;
        }
        
        .requirement-details {
            color: #4a5568;
            line-height: 1.7;
        }
        
        .recommendations {
            margin-top: 15px;
            padding: 15px;
            background: rgba(102, 126, 234, 0.05);
            border-radius: 8px;
        }
        
        .recommendations strong {
            color: #667eea;
            display: block;
            margin-bottom: 10px;
        }
        
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .recommendations li {
            margin-bottom: 8px;
            color: #4a5568;
        }
        
        .alert-box {
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
        }
        
        .alert-box.danger {
            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
            border: 2px solid #fc8181;
        }
        
        .alert-box.success {
            background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
            border: 2px solid #9ae6b4;
        }
        
        .alert-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .alert-box.danger .alert-title {
            color: #742a2a;
        }
        
        .alert-box.success .alert-title {
            color: #22543d;
        }
        
        .alert-box ul,
        .alert-box ol {
            margin: 0;
            padding-left: 25px;
        }
        
        .alert-box li {
            margin-bottom: 12px;
            line-height: 1.7;
        }
        
        .alert-box.danger li {
            color: #742a2a;
        }
        
        .alert-box.success li {
            color: #22543d;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 40px 60px;
            text-align: center;
        }
        
        .footer-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .footer p {
            margin: 10px 0;
            opacity: 0.9;
        }
        
        .footer-logo {
            font-size: 32px;
            margin-bottom: 15px;
        }
        
        .disclaimer {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 13px;
            opacity: 0.7;
            font-style: italic;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="logo">🛡️</div>
                <h1>EU AI Act Compliance Report</h1>
                <div class="header-meta">
                    <div class="meta-item">
                        <span class="meta-label">System</span>
                        <span class="meta-value">${assessment.system_name}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Generated</span>
                        <span class="meta-value">${new Date(assessment.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Powered By</span>
                        <span class="meta-value">NVIDIA Nemotron Super 49B</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="risk-section">
                <div class="risk-badge risk-${assessment.risk_category}">
                    ${assessment.risk_category} RISK
                </div>
                <div class="score">${Math.round(assessment.overall_compliance_score)}<span style="font-size: 0.5em; opacity: 0.5;">/100</span></div>
                <div class="score-label">Overall Compliance Score</div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <span class="section-icon">📋</span>
                    Risk Assessment
                </h2>
                <div class="card">
                    <p>${assessment.risk_level_justification}</p>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <span class="section-icon">✓</span>
                    Compliance Requirements (${assessment.compliance_requirements.length})
                </h2>
                ${assessment.compliance_requirements.map(req => `
                    <div class="requirement ${req.status}">
                        <div class="requirement-header">
                            <div class="requirement-title">${req.requirement}</div>
                            <span class="status-badge ${req.status}">${req.status}</span>
                        </div>
                        <div class="requirement-details">
                            <p><strong>Assessment:</strong> ${req.details}</p>
                            ${req.recommendations.length > 0 ? `
                                <div class="recommendations">
                                    <strong>💡 Recommendations</strong>
                                    <ul>
                                        ${req.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${assessment.critical_gaps.length > 0 ? `
            <div class="alert-box danger">
                <div class="alert-title">
                    <span>⚠️</span>
                    Critical Compliance Gaps
                </div>
                <ul>
                    ${assessment.critical_gaps.map(gap => `<li>${gap}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${assessment.next_steps.length > 0 ? `
            <div class="alert-box success">
                <div class="alert-title">
                    <span>✅</span>
                    Recommended Next Steps
                </div>
                <ol>
                    ${assessment.next_steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <div class="footer-content">
                <div class="footer-logo">🛡️</div>
                <p><strong>EU AI Act Compliance Checker</strong></p>
                <p>Powered by NVIDIA Nemotron Super 49B</p>
                <p>Built for GTC 2026 Golden Ticket Contest</p>
                <div class="disclaimer">
                    This is an AI-generated assessment and should be reviewed by qualified legal and compliance professionals. 
                    Not intended as legal advice.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EU-AI-Act-Compliance-Report-${assessment.system_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Shield className="logo" size={40} />
          <div>
            <h1>EU AI Act Compliance Checker</h1>
            <p className="subtitle">Powered by NVIDIA Nemotron Super 49B</p>
          </div>
        </div>
        {apiStatus && (
          <div className={`api-status ${apiStatus.status}`}>
            <div className="status-indicator" />
            <span>API {apiStatus.status}</span>
            {!apiStatus.api_key_configured && (
              <span className="warning"> (API key not configured)</span>
            )}
          </div>
        )}
      </header>

      <main className="main-content">
        <div className="container">
          <div className="form-section">
            <div className="section-header">
              <FileText size={24} />
              <h2>AI System Information</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="system_name">System Name *</label>
                <input
                  type="text"
                  id="system_name"
                  name="system_name"
                  value={formData.system_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., SmartRecruit Pro"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe what the AI system does..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="application_domain">Application Domain *</label>
                <input
                  type="text"
                  id="application_domain"
                  name="application_domain"
                  value={formData.application_domain}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Employment and HR, Healthcare, Finance"
                />
              </div>

              <div className="form-group">
                <label htmlFor="data_sources">Data Sources (comma-separated) *</label>
                <input
                  type="text"
                  id="data_sources"
                  name="data_sources"
                  value={formData.data_sources}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Resume databases, LinkedIn profiles, Assessment scores"
                />
              </div>

              <div className="form-group">
                <label htmlFor="user_impact">User Impact *</label>
                <textarea
                  id="user_impact"
                  name="user_impact"
                  value={formData.user_impact}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  placeholder="How does this system impact users?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deployment_context">Deployment Context *</label>
                <textarea
                  id="deployment_context"
                  name="deployment_context"
                  value={formData.deployment_context}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  placeholder="Where and how is this system deployed?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="additional_info">Additional Information (optional)</label>
                <textarea
                  id="additional_info"
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Any other relevant details..."
                />
              </div>

              <div className="button-group">
                <div style={{display: 'flex', gap: '0.5rem', flex: 1}}>
                  <select 
                    value={selectedExample}
                    onChange={(e) => setSelectedExample(Number(e.target.value))}
                    style={{
                      padding: '0.875rem',
                      border: '2px solid #667eea',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      flex: 1,
                      fontFamily: 'inherit'
                    }}
                  >
                    {examples.map((ex, idx) => (
                      <option key={ex.id} value={idx}>
                        {ex.system_name}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={loadExample}
                    className="btn btn-secondary"
                    style={{whiteSpace: 'nowrap'}}
                  >
                    Load
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader className="spinner" size={20} />
                      Assessing...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Assess Compliance
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                <AlertTriangle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {assessment && (
            <div className="results-section">
              <div className="section-header">
                <Shield size={24} />
                <h2>Compliance Assessment Results</h2>
              </div>

              <div className="assessment-card">
                <div className="assessment-header">
  <h3>{assessment.system_name}</h3>
  <div>
    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
  <div className={`risk-badge risk-${getRiskColor(assessment.risk_category)}`}>
    {assessment.risk_category} RISK
  </div>
  <div className="risk-info-icon">
    <span style={{fontSize: '18px', color: '#667eea', fontWeight: 'bold'}}>ℹ️</span>
    <div className="tooltip">
      <strong style={{display: 'block', marginBottom: '10px', color: '#2d3748'}}>EU AI Act Risk Categories:</strong>
      <div style={{marginBottom: '8px'}}>
        <span style={{color: '#f56565', fontWeight: 'bold'}}>🔴 UNACCEPTABLE</span> - Prohibited
      </div>
      <div style={{marginBottom: '8px'}}>
        <span style={{color: '#f97316', fontWeight: 'bold'}}>🟠 HIGH</span> - Strict requirements
      </div>
      <div style={{marginBottom: '8px'}}>
        <span style={{color: '#eab308', fontWeight: 'bold'}}>🟡 LIMITED</span> - Transparency obligations
      </div>
      <div>
        <span style={{color: '#22c55e', fontWeight: 'bold'}}>🟢 MINIMAL</span> - Few obligations
      </div>
    </div>
  </div>
</div>
    <p style={{
      marginTop: '10px',
      padding: '12px',
      background: '#f7fafc',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#2d3748'
    }}>
      {getRiskExplanation(assessment.risk_category)}
    </p>
  </div>
</div>

                <div className="score-section">
                  <div className="score-circle">
                    <svg viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e0e0e0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={assessment.overall_compliance_score >= 70 ? '#4caf50' : assessment.overall_compliance_score >= 40 ? '#ff9800' : '#f44336'}
                        strokeWidth="10"
                        strokeDasharray={`${assessment.overall_compliance_score * 2.827} 282.7`}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="score-text">
                      <span className="score-number">{Math.round(assessment.overall_compliance_score)}</span>
                      <span className="score-label">/ 100</span>
                    </div>
                  </div>
                  <div className="score-details">
                    <h4>Overall Compliance Score</h4>
                    <p>{assessment.risk_level_justification}</p>
                  </div>
                </div>

                <div className="requirements-section">
                  <h4>Compliance Requirements ({assessment.compliance_requirements.length})</h4>
                  {assessment.compliance_requirements.map((req, index) => (
                    <div key={index} className="requirement-card">
                      <div 
                        className="requirement-header"
                        onClick={() => toggleRequirement(index)}
                      >
                        {getStatusIcon(req.status)}
                        <span className="requirement-title">{req.requirement}</span>
                        <span className={`status-badge status-${req.status}`}>
                          {req.status}
                        </span>
                        {expandedReqs[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      
                      {expandedReqs[index] && (
                        <div className="requirement-details">
                          <p><strong>Details:</strong> {req.details}</p>
                          {req.recommendations.length > 0 && (
                            <div className="recommendations">
                              <strong>Recommendations:</strong>
                              <ul>
                                {req.recommendations.map((rec, i) => (
                                  <li key={i}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

		{(assessment.risk_category === 'HIGH' || assessment.risk_category === 'UNACCEPTABLE') && (
  <div style={{
    background: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)',
    border: '3px solid #f56565',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
    marginBottom: '20px'
  }}>
    <h4 style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#742a2a',
      marginBottom: '12px',
      fontSize: '18px',
      fontWeight: '700'
    }}>
      💰 Non-Compliance Financial Penalties
    </h4>
    <p style={{ color: '#742a2a', lineHeight: '1.7', margin: 0 }}>
      {assessment.risk_category === 'UNACCEPTABLE' 
        ? '⚠️ Deploying prohibited AI systems can result in fines up to €35 million or 7% of worldwide annual turnover (whichever is higher).'
        : '⚠️ Non-compliance with high-risk AI requirements can result in fines up to €15 million or 3% of worldwide annual turnover (whichever is higher). Additional penalties apply for data governance violations.'}
    </p>
    <p style={{ 
      color: '#742a2a', 
      fontSize: '13px', 
      marginTop: '10px',
      fontStyle: 'italic',
      opacity: 0.9
    }}>
      Based on EU AI Act Articles 99 and 71. Penalties tiered by severity of violation.
    </p>
  </div>
)}

                {assessment.critical_gaps.length > 0 && (
                  <div className="critical-gaps">
                    <h4>
                      <AlertTriangle size={20} />
                      Critical Compliance Gaps
                    </h4>
                    <ul>
                      {assessment.critical_gaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {assessment.next_steps.length > 0 && (
                  <div className="next-steps">
                    <h4>
                      <CheckCircle size={20} />
                      Recommended Next Steps
                    </h4>
                    <ol>
                      {assessment.next_steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="timestamp">
                  Assessment generated: {new Date(assessment.timestamp).toLocaleString()}
                </div>

                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => copyAPICode()}
                    className="btn btn-secondary"
                    style={{flex: 1, minWidth: '200px'}}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginRight: '0.5rem'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy API Code
                  </button>
                  
                  <button
                    onClick={() => exportReport()}
                    className="btn btn-primary"
                    style={{flex: 1, minWidth: '200px'}}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{marginRight: '0.5rem'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          EU AI Act Compliance Checker | San Jose 2026 Conference | 
          Powered by NVIDIA Nemotron Super 49B
        </p>
      </footer>
    </div>
  );
}

export default App;
