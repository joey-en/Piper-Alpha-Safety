# **Piper Alpha Safety Assistant**

### *FutureLab Challenge 2025 – Qatar Chemical Company LTD & UDST (RIHLA Program)*

The Piper Alpha Safety Assistant is an intelligent, retrieval-augmented chatbot designed to support industrial safety workflows. It provides regulation-aware, clause-referenced guidance using OSHA standards and IChemE lessons learned. The system uses a custom **Graph-RAG**, **FAISS semantic search**, and **Gemini 2.5 Pro** to deliver accurate and contextualized safety recommendations.

This project was built by a team of UDST students for the FutureLab 2025 challenge under the “Be the Builder” track.

---

# **📁 Project Structure**

```
Piper-Alpha-Safety/
│
├── backend/
│   ├── src/
│   │   ├── api.py               # FastAPI route /api/ask
│   │   ├── response_llm.py      # LLM integration, JSON extraction
│   │   ├── graph_loader.py      # Neo4j graph + embeddings load
│   │   ├── retrieval.py         # FAISS similarity search
│   │   ├── prompt_template.txt  # Main system prompt
│   │   └── utils.py
│   ├── data/                    # OSHA + IChemE context documents
│   ├── venv/
│   ├── requirements.txt
│   └── run_backend.bat
│
├── frontend/
│   ├── apps/
│   │   └── web/                 # Vite + React frontend
│   ├── package.json
│   └── run_frontend.bat
│
├── start_piper_alpha.bat                  # Starts backend + frontend together
└── README.md
```

---

# **Features**

### **✓ Graph-RAG (Graph Retrieval-Augmented Generation)**

* Regulatory text is stored as interconnected nodes (Neo4j).
* Each OSHA clause is linked to its parent, children, and references.
* Retrieval always returns **full context**, not isolated text fragments.

### **✓ Semantic Retrieval using FAISS**

* Every clause and IChemE chunk is embedded using SentenceTransformer.
* FAISS returns the closest matches to a user's question.
* The ID-mapping rehydrates full graph context from Neo4j.

### **✓ LLM Answer Generation (Gemini 2.5 Pro)**

* Large context window (1M tokens).
* Prompt enforces:

  * Arabic greeting & closing
  * Clause-referenced outputs
  * JSON-formatted answer
  * No hallucinations
  * Safety escalation when needed

### **✓ Modern Frontend**

* Vite + React Router interface
* Fully decoupled client-server architecture
* Displays:

  * Answer
  * Clause references
  * Suggested steps
  * PPE
  * Critical alerts

---

# **System Architecture (How It Works)**

### **1. User submits a question via the web app.**

An HTTP POST request is sent to:

```
POST http://localhost:8000/api/ask
```

### **2. Backend creates a semantic embedding**

Sentence-Transformers embeds the question and searches FAISS for the closest nodes.

### **3. Graph context expansion**

Using IDs returned from FAISS:

* parent clauses
* subsections
* referenced clauses
  are pulled from Neo4j.

### **4. Prompt assembly**

Backend inserts:

* context text
* user question
  into a strict controlled prompt.

### **5. Gemini 2.5 Pro generates the answer**

Backend extracts the **JSON block** from the LLM response.

### **6. Frontend renders structured safety output**

UI shows:

* main answer
* bullet steps
* PPE
* clause tags
* critical alerts

### **7. Conversation continues in real time**

Every new message repeats the retrieval + generation process.

---

# **Installation & Setup**

## **1. Clone the repository**

```
git clone https://github.com/joey-en/Piper-Alpha-Safety
cd Piper-Alpha-Safety
```

---

# **Backend Setup**

## **2. Create virtual environment**

```
cd backend
python -m venv venv
venv\Scripts\activate
```

## **3. Install dependencies**

```
pip install -r requirements.txt
```

## **4. Add API Key**

Create `.env` inside `backend/`:

```
GEMINI_API_KEY=your_key_here
```

## **5. Start backend**

```
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000
```

The backend loads:

* Neo4j graph
* FAISS index
* Embeddings

---

# **Frontend Setup**

## **1. Install dependencies**

```
cd frontend/apps/web
npm install
```

## **2. Run the web app**

```
npm run dev
```

Frontend will be on:

**[http://localhost:3000](http://localhost:3000)**

---

# **Run Both (One Command)**

Use the provided startup script:

```
start_piper_alpha.bat
```

This launches:

* Backend in a new terminal
* Frontend in another terminal

---

# **requirements.txt (Backend)**

```
fastapi
uvicorn[standard]
pydantic
python-dotenv
numpy
requests
neo4j
google-generativeai
sentence-transformers
faiss-cpu
python-multipart
```

---

# **Security & Data Privacy**

* All regulatory documents stored locally
* Neo4j graph database never leaves the environment
* Future-ready for on-premise LLM deployment
* Decoupled architecture facilitates role-based access control

---

# **Future Development**

* Integrate internal SOPs, incident logs, maintenance reports
* Deploy an offline private LLM for enterprise confidentiality
* Add safety-officer dashboards & hazard trend analysis
* Add voice interface for frontline workers
* IoT sensor integration (proactive alerting)

---

# **Team Members**

* **Joy Anne Dela Cruz**
* **Lynn Younes**
* **Djihane Mahraz**
* **Manahil Sheikh**
* **Hafsa Farhan**

---

# **License**

This project was developed for the **FutureLab 2025 Hackathon** and is intended for research and educational purposes.

---