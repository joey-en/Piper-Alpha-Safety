from neo4j import GraphDatabase
import os
import re

# --------------------------------------------
# 1. PARSER — Extract OSHA clause structure
# --------------------------------------------
def parse_osha_text(raw_text: str):
    """
    Takes raw OSHA regulatory text (copy-paste from website)
    and returns a list of nodes with {id, text, parent_id}.
    """

    # OSHA clause patterns like:
    # 1910.1200
    # 1910.1200(b)
    # 1910.1200(b)(3)(ii)
    clause_pattern = r"(1910\.\d+(?:\([a-zA-Z0-9]+\))*)"

    matches = list(re.finditer(clause_pattern, raw_text))

    nodes = []

    for i, match in enumerate(matches):
        clause_id = match.group(1)
        start = match.end()

        # End of this clause = before next clause or end of text
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(raw_text)

        clause_text = raw_text[start:end].strip()

        # Determine parent id
        parent_id = get_parent_clause_id(clause_id)

        nodes.append({
            "id": clause_id,
            "text": clause_text,
            "parent_id": parent_id
        })

    return nodes


def get_parent_clause_id(clause_id: str):
    """
    For example:
    - 1910.1200           → None
    - 1910.1200(b)        → 1910.1200
    - 1910.1200(b)(3)     → 1910.1200(b)
    - 1910.1200(b)(3)(ii) → 1910.1200(b)(3)
    """

    if "(" not in clause_id:
        return None

    # Remove the last (...) group
    return re.sub(r"\([a-zA-Z0-9]+\)$", "", clause_id)

def chunk_text(text, chunk_size=500, overlap=200):
    """
    Splits a string into smaller chunks of up to `chunk_size` characters,
    with `overlap` characters shared between consecutive chunks.
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunks.append(text[start:end])
        start += chunk_size - overlap  # move forward with overlap

    return chunks

# --------------------------------------------
# 2. NEO4J INGESTION
# --------------------------------------------
class OSHA_GraphBuilder:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def create_node(self, node_id, text, label="Clause"):
        """
        Creates a node in Neo4j with the given label.
        """
        query = f"""
        MERGE (n:{label} {{id: $id}})
        SET n.text = $text
        """
        with self.driver.session() as session:
            session.run(query, id=node_id, text=text)

    def create_relationship(self, parent_id, child_id, rel_type="CONTAINS"):
        """
        Creates a relationship between two nodes.
        Default is 'CONTAINS' (for OSHA), can use 'NEXT' for document chunks.
        """
        if parent_id is None:
            return
        query = f"""
        MATCH (p {{id: $pid}})
        MATCH (c {{id: $cid}})
        MERGE (p)-[:{rel_type}]->(c)
        """
        with self.driver.session() as session:
            session.run(query, pid=parent_id, cid=child_id)
    def ingest_nodes(self, nodes):
        for n in nodes:
            # Top-level clauses (no parentheses) get 'Parent'
            if "(" not in n["id"]:
                label = "Parent"
            else:
                label = "Clause"
            db.create_node(n["id"], n["text"], label=label)
        for n in nodes:
            db.create_relationship(n["parent_id"], n["id"], rel_type="CONTAINS")


# --------------------------------------------
# 3. MAIN SCRIPT — Load every file in /data
# --------------------------------------------
def load_texts_from_data_folder(folder="data"):
    docs = {}
    for filename in os.listdir(folder):
        if filename.endswith(".txt"):
            with open(os.path.join(folder, filename), "r", encoding="utf-8") as f:
                docs[filename]= f.read()
    return docs


def is_osha_document(text):
    """
    Very simple detection: OSHA standards always contain `1910.`
    You can expand later if needed.
    """
    return "1910." in text


def create_graph_database(folder="data"):

    # 1. Load all documents
    documents = load_texts_from_data_folder(folder)

    # 2. Connect to Neo4j
    # Adjust with your Neo4j Desktop or Neo4j Aura credentials
    db = OSHA_GraphBuilder(
        uri="bolt://localhost:7687",
        user="neo4j",
        password="BeTheBuilder"
    )

    for file_name, doc in documents.items():
        if is_osha_document(doc):
            # Parse OSHA structure
            nodes = parse_osha_text(doc)
            print(f"{file_name[:20]}... Parsed {len(nodes)} OSHA clauses…")
            db.ingest_nodes(nodes)
        else:
            # Optional: non-OSHA docs can be stored as plain nodes
            doc_id = f"DOC-{hash(doc)}"  # unique document ID
            chunks = chunk_text(doc)

            previous_chunk_id = None
            i=0
            for i, chunk in enumerate(chunks):
                chunk_node_id = f"{doc_id}-chunk-{i}"
                db.create_node(chunk_node_id, chunk, label="Chunk")

                # Link Document -> first chunk
                if i == 0:
                    db.create_relationship(doc_id, chunk_node_id, rel_type="NEXT")

                # Link sequential chunks
                if previous_chunk_id:
                    db.create_relationship(previous_chunk_id, chunk_node_id, rel_type="NEXT")

                previous_chunk_id = chunk_node_id
            print(f"{file_name[:20]}... Non-OSHA doc detected. Parsed {i+1} nodes.")

    db.close()
    print("Done building graph!")
