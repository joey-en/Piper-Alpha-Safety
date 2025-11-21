# main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.response_llm import answer_query 
from fastapi.middleware.cors import CORSMiddleware

# --- Pydantic Models ---
# Define the structure for the request (user input)
class ChatRequest(BaseModel):
    # This must match the key you expect in the JSON body
    question: str 

# Define the structure for the response (chatbot output)
class ChatResponse(BaseModel):
    answer: str
    clause_ids: list[str] = [] # List of relevant clause IDs from your knowledge base

# --- FastAPI Initialization ---
app = FastAPI(
    title="G-RAG Chatbot API",
    description="A Graph Retrieval-Augmented Generation service using Neo4j and Gemini.",
    version="1.0.0"
)

# --- 1. CONFIGURE CORS MIDDLEWARE ---
origins = [
    "http://localhost:3000", # The default port for Create React App/Vite
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allow these domains
    allow_credentials=True,         # Allow cookies/authorization headers
    allow_methods=["*"],            # Allow POST, GET, etc.
    allow_headers=["*"],            # Allow all headers
)
# --- END CORS CONFIG ---

# --- Health Check Endpoint ---
@app.get("/")
async def health_check():
    """Simple endpoint to check if the API is running."""
    print("Health check endpoint called.")
    return {"status": "ok", "message": "RAG Chatbot API is online."}


# --- Main Chat Endpoint ---
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Receives a question and calls the RAG pipeline to generate an answer.
    """
    try:
        # 1. Get the question from the validated Pydantic model
        question = request.question
        # print(f"Received question: {question}")
        
        # 2. Call your existing, core RAG function
        result = answer_query(question)

        # print(f"RAG pipeline result: {result['answer'][:100]}...")  # Log first 100 chars of the answer
        
        # 3. Handle potential errors/missing answers from the RAG service
        if not result["answer"]:
             raise HTTPException(
                status_code=500, 
                detail="LLM failed to generate a response."
            )

        # 4. Return the structured response
        return ChatResponse(
            answer=result["answer"],
            clause_ids=list(result["clause_ids"]) # Ensure it's a list for Pydantic
        )

    except Exception as e:
        # Catch and handle any unexpected errors during the RAG process
        print(f"An error occurred during RAG pipeline execution: {e}")
        # Return a standard HTTP 500 Internal Server Error
        raise HTTPException(
            status_code=500, 
            detail=f"An internal server error occurred: {str(e)}"
        )