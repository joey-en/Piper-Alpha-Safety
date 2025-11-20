# Piper Alpha Safety

This project addresses one of the core lessons from the Piper Alpha offshore platform explosion: workers must have immediate access to accurate, context-aware safety information. Traditional search tools and standard RAG systems often provide fragmented results or produce hallucinated answers, which are unacceptable in safety-critical environments.

To solve this, we implemented a Neo4j-based Graph-RAG architecture that restructures OSHA and related safety guidelines into a connected knowledge graph. This allows the chatbot to retrieve complete regulatory context and minimize hallucination risk, providing workers with fast, reliable, and structured safety insights. Safety standards are ingested into a Neo4j database in a graph structure rather than arbitrary text chunks. Each clause, subsection, definition, and cross-reference becomes a node with explicit relationships such as CONTAINS, REFERS_TO, DEFINES, and EXCEPTION_FOR. This preserves the regulatory hierarchy and ensures that all relevant context is connected.

The system is designed for offshore and industrial environments where quick decision support can prevent escalation during normal operations, maintenance tasks, or foreseeable emergencies.

---

# ChatBot Pipeline Flow

### Step 1: User Query

A worker asks a safety-related question through the chatbot interface.

### Step 2: Graph Search

The system performs an advanced traversal of the Neo4j knowledge graph.

Instead of retrieving isolated text fragments, the graph search collects:

* the directly relevant safety clause
* its parent sections
* embedded definitions
* referenced or exception clauses
* adjacent context required for accurate interpretation

This minimizes hallucination because retrieval is deterministic, structure-aware, and anchored in the full regulatory context.

### Step 3: Context Bundling

All related nodes are assembled into a context bundle containing the full clause text and any directly connected information.

### Step 4: LLM Response

The bundled context is sent to an LLM.

The model responds to the user’s query based strictly on the retrieved clauses and their associated context.

---

# Goals

* Improve frontline access to safety-critical information.
* Reduce ambiguity in hazard communication and operational decision-making.
* Apply lessons from historical disasters to create a modern, reliable digital safety assistant.
* Demonstrate a safer alternative to traditional RAG through structure-aware graph retrieval.
