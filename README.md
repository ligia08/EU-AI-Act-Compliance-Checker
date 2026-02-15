# 🛡️ EU AI Act Compliance Checker

AI-powered compliance assessment tool using **NVIDIA Nemotron Super 49B** to help companies navigate the EU AI Act.

[![NVIDIA](https://img.shields.io/badge/Powered%20by-NVIDIA%20Nemotron-76B900?style=flat&logo=nvidia&logoColor=white)](https://www.nvidia.com/)
[![GTC 2026](https://img.shields.io/badge/Built%20for-GTC%202026-green)](https://www.nvidia.com/gtc/)

---

## 📹 Demo Videos

**👋 Introduction & Overview**  
Watch me introduce the project:
https://www.loom.com/share/bda56fbb950e4269b990755a9da96b29

**🖥️ Full Tool Walkthrough**  
See the Compliance Checker in action: https://www.loom.com/share/a5b31110de86402280d1ecf0eb831302

---

## 🎯 What It Does

The **EU AI Act Compliance Checker** analyzes AI systems against the new EU AI Act regulations and provides:

✅ **Risk Classification** - Categorizes systems into 4 risk levels (UNACCEPTABLE, HIGH, LIMITED, MINIMAL)  
✅ **Compliance Scoring** - 0-100 score based on requirement adherence  
✅ **Detailed Assessment** - Requirement-by-requirement analysis with recommendations  
✅ **Financial Impact** - Shows potential penalties (up to €35 million for violations)  
✅ **Actionable Insights** - Clear next steps for achieving compliance  
✅ **Export Options** - Copy API code or download professional HTML reports  

---

## 🤖 Powered by NVIDIA Nemotron Super 49B

This tool leverages **NVIDIA's open-source Llama 3.3 Nemotron Super 49B model** (49 billion parameters) for:

- Deep understanding of EU AI Act requirements
- Intelligent risk categorization
- Context-aware compliance analysis
- Actionable recommendations

**Model:** `nvidia/llama-3.3-nemotron-super-49b-v1`

---

## 🏗️ Architecture

### **Backend**
- **Framework:** FastAPI (Python 3.13)
- **AI Model:** NVIDIA Nemotron Super 49B via OpenAI-compatible API
- **API:** RESTful endpoints for compliance assessment

### **Frontend**
- **Framework:** React 18 + Vite
- **UI Library:** Lucide React (icons)
- **Styling:** Custom CSS with gradient themes
- **Features:** Interactive forms, dynamic results, hover tooltips, export buttons

---

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- NVIDIA API Key ([Get one here](https://build.nvidia.com/))

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/EU-AI-Act-Compliance-Checker.git
cd EU-AI-Act-Compliance-Checker
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "NVIDIA_API_KEY=your_api_key_here" > .env

# Run backend
python main.py
```

Backend runs at: `http://localhost:8000`

### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 📊 Example Systems

The tool includes 6 pre-configured examples covering all risk categories:

| System | Risk Level | Description |
|--------|-----------|-------------|
| **Workplace Emotion Surveillance** | 🔴 UNACCEPTABLE | Real-time emotion monitoring (prohibited) |
| **SmartRecruit Pro** | 🟠 HIGH | AI recruitment system |
| **CreditScore AI** | 🟠 HIGH | Credit risk assessment |
| **ContentModerator** | 🟠 HIGH | Social media content filtering |
| **ChatBot Helper** | 🟡 LIMITED | Customer service chatbot |
| **Email Spam Filter** | 🟢 MINIMAL | Basic spam detection |

---

## 🎨 Key Features

### Risk Category Explanations
Hover over the risk badge to see all 4 EU AI Act risk categories with descriptions.

### Financial Penalty Warnings
HIGH and UNACCEPTABLE risk systems display potential fines:
- **UNACCEPTABLE:** Up to €35M or 7% of global turnover
- **HIGH RISK:** Up to €15M or 3% of global turnover

### Developer-Friendly
- **Copy API Code:** Get Python code to integrate assessments into your workflow
- **Export HTML Reports:** Download professional reports to share with stakeholders

---

## 📁 Project Structure

```
EU-AI-Act-Compliance-Checker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── App.css         # Styling
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static assets
│   ├── index.html          # HTML template
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
└── README.md
```

---

## 🔑 API Endpoints

### `GET /health`
Health check and API key status

### `GET /examples`
Retrieve pre-configured example systems

### `GET /risk-categories`
Get EU AI Act risk category information

### `POST /assess`
Assess an AI system for compliance

**Request Body:**
```json
{
  "system_name": "My AI System",
  "description": "System description",
  "application_domain": "Healthcare",
  "data_sources": ["Patient records", "Medical images"],
  "user_impact": "Diagnostic assistance",
  "deployment_context": "Hospital setting"
}
```

---

## 🛠️ Technologies Used

**Backend:**
- FastAPI
- NVIDIA API (OpenAI SDK)
- Python-dotenv
- Uvicorn

**Frontend:**
- React
- Vite
- Axios
- Lucide React

---

## 🎓 Built for GTC 2026 Golden Ticket Contest

This project was created for the **NVIDIA GTC 2026 Golden Ticket Developer Contest**, demonstrating:

- ✅ Open-source AI innovation with NVIDIA Nemotron
- ✅ Real-world business application
- ✅ Professional software engineering
- ✅ Educational value and accessibility

---

## 🤝 Contributing

This is a contest submission, but feedback and suggestions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests for improvements
- Share your thoughts on LinkedIn

---

## 📧 Contact

**Built by:** Ligia Forgaciu 
**LinkedIn:** https://www.linkedin.com/in/ligia-forgaciu-mba-m-sc-aa603b84/  
**For:** NVIDIA GTC 2026 Golden Ticket Contest  
**Judge:** Sabrina Koumoin (@sabrinakoumoin)

---

## 📜 Disclaimer

This tool provides AI-generated compliance assessments for informational purposes only. It should not be considered legal advice. Always consult qualified legal and compliance professionals for official EU AI Act compliance guidance.

---

## 🙏 Acknowledgments

- **NVIDIA** for the Nemotron Super 49B model and GTC Golden Ticket opportunity
- **Sabrina Koumoin** for inspiring accessible tech education through Brina's Code
- The **EU AI Act** framework for establishing responsible AI governance

---

## ⭐ Show Your Support

If you find this project helpful, please give it a star! ⭐

**Built with 💚 for the NVIDIA community**
