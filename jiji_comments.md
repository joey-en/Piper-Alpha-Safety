## Changes made
* Created a `test\test_neo4j.py` because the other one was giving me errors, its a slightly modified version
* Edited `src\response_llm.py` resolved some path issues that were happening when i was calling running the fastAPI app
* Created `main.py` which is the fastAPI app, running instructions below, I tested it and it works so now it just needs to be integrated into the front end. The post rorequest to the chat route will receive the question from the user then call the `answer_query` function and return the answer and clause ids.

## How to run 
```bash
uvicorn main:app --reload
```