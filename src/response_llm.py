import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
import google.generativeai as genai
from search_semantic import * 

# -------------------------------
# Load Gemini API Key
# -------------------------------
load_dotenv(".env")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables.")
genai.configure(api_key=GEMINI_API_KEY)
# -------------------------------
# Neo4j Retriever
# -------------------------------
class Neo4jRetriever:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="BeTheBuilder"):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def get_chunks_by_clause(self, clause_id):
        """
        Returns list of tuples: (chunk_id, text)
        If no chunks, returns the clause itself.
        """
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (c {id: $cid})
                OPTIONAL MATCH (c)-[:NEXT*0..]->(chunk:Chunk)
                RETURN coalesce(chunk.id, c.id) AS chunk_id,
                       coalesce(chunk.text, c.text) AS text
                ORDER BY chunk_id
                """,
                cid=clause_id
            )
            return [(r["chunk_id"], r["text"]) for r in result]

    def search_relevant_clauses(self, question):
        # Step 1: load embeddings
        index, ids = get_or_build_embeddings(self.driver)
        if index is None or ids is None:
            # Build embeddings from Neo4j
            with self.driver.session() as session:
                result = session.run("MATCH (c:Clause) RETURN c.id AS clause_id, c.text AS text")
                clause_texts = [(r["clause_id"], r["text"]) for r in result]
            index, ids, embeddings = build_and_save_embeddings(clause_texts)

        # Step 2: perform semantic search
        top_clause_ids = query_similar(question, index, ids, top_k=5)
        print(top_clause_ids)
        return top_clause_ids
        

# -------------------------------
# Gemini LLM call
# -------------------------------
def ask_gemini_llm(question, context_chunks):
    """
    Calls Gemini Pro 2.5 with context + question.
    Returns the LLM's answer.
    """
    context_text = "\n".join([text for _, text in context_chunks])
    prompt = f"Answer the question using the context below.\n\nContext:\n{context_text}\n\nQuestion:\n{question}"
    
    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ LLM ERROR Womp womp")
        print(e)
        return None


# -------------------------------
# Combine retrieval + LLM
# -------------------------------
def answer_query(question):
    """
    Returns answer + list of relevant clause IDs.
    """
    retriever = Neo4jRetriever()
    # Step 1: find relevant clause IDs
    clause_ids = retriever.search_relevant_clauses(question)
    if not clause_ids:
        return {"answer": "No relevant clauses found.", "clause_ids": []}

    # Step 2: fetch chunks for each clause
    chunks = []
    for cid in clause_ids:
        chunks.extend(retriever.get_chunks_by_clause(cid))

    # Step 3: ask LLM
    answer = ask_gemini_llm(question, chunks)

    return {"answer": answer, "clause_ids": clause_ids}

# -------------------------------
# Terminal interactive test
# -------------------------------
def terminal_test():
    print("=== Piper Alpha Neo4j + Gemini LLM Test ===")
    print("Type 'exit' to quit.\n")
    while True:
        question = input("Enter your question: ").strip()
        if question.lower() == "exit":
            break
        result = answer_query(question)
        print("\n--- RESULT ---")
        print("Answer:", result["answer"])
        print("Relevant Clause IDs:", result["clause_ids"])
        print("-----------------\n")

# -------------------------------
# Run terminal test if executed directly
# -------------------------------
if __name__ == "__main__":
    terminal_test()
