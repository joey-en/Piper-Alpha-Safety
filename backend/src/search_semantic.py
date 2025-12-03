from sentence_transformers import SentenceTransformer
import faiss
import os, pickle
import numpy as np

EMBEDDING_PATH = "./data/semantic_embedding"

# -------------------------------
# Load model (offline, free)
# -------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")  # small, fast, works well

# -------------------------------
# Build embeddings for clauses
# -------------------------------
def build_embeddings(clause_texts):
    """
    clause_texts: list of (clause_id, text)
    Returns: FAISS index + id mapping
    """
    texts = [text for _, text in clause_texts]
    ids = [cid for cid, _ in clause_texts]
    
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner product = cosine similarity
    index.add(embeddings)
    
    return index, ids, embeddings

# -------------------------------
# Query for most similar clauses
# -------------------------------
def query_similar(question, index, ids, top_k=10):
    q_emb = model.encode([question], convert_to_numpy=True, normalize_embeddings=True)
    scores, idxs = index.search(q_emb, top_k)
    
    results = [(ids[i], float(scores[0][k])) for k, i in enumerate(idxs[0])]
    return results

# -------------------------------
# Embedding utils
# -------------------------------
def save_embeddings(index, ids):
    os.makedirs(EMBEDDING_PATH, exist_ok=True)
    faiss.write_index(index, os.path.join(EMBEDDING_PATH, "faiss_index.idx"))
    with open(os.path.join(EMBEDDING_PATH, "id_map.pkl"), "wb") as f:
        pickle.dump(ids, f)

def load_embeddings():
    index_file = os.path.join(EMBEDDING_PATH, "faiss_index.idx")
    id_file = os.path.join(EMBEDDING_PATH, "id_map.pkl")
    if not os.path.exists(index_file) or not os.path.exists(id_file):
        return None
    index = faiss.read_index(index_file)
    with open(id_file, "rb") as f:
        ids = pickle.load(f)
    return index, ids


def build_and_save_embeddings(clause_texts):
    """
    clause_texts: list of (clause_id, text)
    Returns: FAISS index + id mapping
    """
    # Call your existing build_embeddings function
    index, ids, embeddings = build_embeddings(clause_texts)
    save_embeddings(index, ids)
    return index, ids, embeddings


def get_or_build_embeddings(driver):
    """
    Load embeddings from ./data/semantic_embedding.
    If not present, build them from Neo4j clauses and save them.
    Returns: FAISS index + id list
    """

    file_path = os.path.join(EMBEDDING_PATH, "faiss_index.idx")
    os.makedirs(EMBEDDING_PATH, exist_ok=True)

    if os.path.isfile(file_path):
        index, ids = load_embeddings()
        print(f"[INFO] Loaded embeddings for {len(ids)} clauses.")

    else:
        print("[INFO] No saved embeddings found. Building embeddings now...")
        # Fetch all clauses from Neo4j
        with driver.session() as session:
            result = session.run("MATCH (c:Clause) RETURN c.id AS clause_id, c.text AS text")
            clause_texts = [(r["clause_id"], r["text"]) for r in result]
        
        # Build embeddings and save
        index, ids, _ = build_embeddings(clause_texts)
        save_embeddings(index, ids)
        print(f"[INFO] Built and saved embeddings for {len(ids)} clauses.")

    return index, ids


# -------------------------------
# Example usage
# -------------------------------
def test():
    # Example clause data
    clauses = [
        ("1910.1200(b)(1)", "This clause requires chemical hazard communication..."),
        ("1910.1200(b)(2)", "Applies to any chemical present in the workplace..."),
        ("1910.1200(b)(3)", "Laboratory specific requirements...")
    ]

    index, ids, embeddings = build_embeddings(clauses)

    question = "What to do in case of fire?"
    results = query_similar(question, index, ids, top_k=2)
    print("Most relevant clauses:")
    for cid, score in results:
        print(cid, score)
