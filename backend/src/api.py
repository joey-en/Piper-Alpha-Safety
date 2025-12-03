from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .response_llm import answer_query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # DEV: allow everything
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/api/ask")
def ask(question: Question):
    result = answer_query(question.question)
    return {
        "answer": result["answer"],
        "clause_ids": list(result["clause_ids"]),
    }
