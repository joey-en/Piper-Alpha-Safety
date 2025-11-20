import os
from dotenv import load_dotenv
from neo4j import GraphDatabase
import google.generativeai as genai
from search_semantic import * 

PROMPT_PATH = "./data/prompts/chat_prompt.txt"
TOPK = 3

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

    def get_chunks_by_clause(self, clause_id, query_path= "data/prompts/question_query.txt"):
        # Read the query from the external file
        with open(query_path, "r", encoding="utf-8") as f:
            query = f.read()
        
        with self.driver.session() as session:
            result = session.run(query, id=clause_id)
            nodes_list = [(r["nodeID"], r["nodeText"]) for r in result]
            return nodes_list


    def search_relevant_clauses(self, question):
        # Step 1: load embeddings
        index, ids = get_or_build_embeddings(self.driver)
        # Step 2: perform semantic search
        top_clause_ids = query_similar(question, index, ids, top_k=TOPK)
        # print("top_clause_ids", top_clause_ids)
        all_chunks = {}
        for clause_id, _ in top_clause_ids:
            chunks = self.get_chunks_by_clause(clause_id)
            for chunk_id, text in chunks:
                all_chunks[chunk_id] = text
        # print("all_chunks", all_chunks)
        return all_chunks
                

# -------------------------------
# Gemini LLM call
# -------------------------------

def ask_gemini_llm(question, context_chunks):
    """
    Calls Gemini Pro 2.5 with context + question.
    Returns the LLM's answer.
    """
    context_text = "\n".join(context_chunks)

    # Load main prompt template
    if not os.path.exists(PROMPT_PATH):
        raise RuntimeError(f"Prompt file not found at {PROMPT_PATH}")
    with open(PROMPT_PATH, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    # Fill in the placeholders
    prompt = prompt_template.format(context=context_text, question=question)
    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ LLM ERROR whomp whomppp")
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
    # Step 1: find relevant clause IDs and their text
    all_chunks = retriever.search_relevant_clauses(question)
    if not all_chunks:
        return {"answer": "No relevant clauses found.", "clause_ids": []}

    # Step 3: ask LLM
    answer = ask_gemini_llm(question, all_chunks.values())
    
    return {"answer": answer, "clause_ids": all_chunks.keys()}

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
        print(result["answer"])
        # print("Relevant Clause IDs:", result["clause_ids"])
        print("-----------------\n")

'''
These will help you test your pipeline in the terminal:

What should employees do in case of a fire on the platform?
Who is responsible for reporting a chemical spill?
How often must emergency drills be conducted according to OSHA?
What are the steps to shut down a module safely in an emergency?
Which clauses describe hazard communication for chemicals?
How should contractors be trained before working on the platform?
What personal protective equipment is required during maintenance?
What does clause 1910.1200(b)(1) require employers to do?
'''
# -------------------------------
# Run terminal test if executed directly
# -------------------------------
if __name__ == "__main__":
    terminal_test()
