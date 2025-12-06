from neo4j import GraphDatabase
import os
import re

# --------------------------------------------
# 1. PARSER — Extract OSHA clause structure
# --------------------------------------------
def extract_references(clause_text: str):
    """
    Finds referenced OSHA clauses inside the clause text.
    Returns a list of clause IDs like '1910.38', '1910.134', etc.
    """

    # Matches 1910.xxx optionally prefixed by '29 CFR'
    ref_pattern = r"(?:29\s*CFR\s*)?(1910\.\d+(?:\([a-zA-Z0-9]+\))*)"

    refs = re.findall(ref_pattern, clause_text)
    return list(set(refs))  # remove duplicates

def parse_standard_header(lines):
    """
    Detects:
        Standard Number: 1910.1200
        Title: Hazard Communication.
    Returns (id, title_text, end_index)
    """
    std_num = None
    title = None
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        if line.startswith("Standard Number:"):
            std_num = line.split("Standard Number:")[1].strip()

        elif line.startswith("Title:"):
            title = line.split("Title:")[1].strip()

        # Stop when we hit the first clause ID
        if re.match(r"^1910\.\d+(?:\([a-zA-Z0-9]+\))*$", line):
            break

        i += 1

    if std_num:
        full_text = f"{std_num}: {title}" if title else std_num
        return std_num, full_text, i

    return None, None, 0  # no standard header found

def parse_osha_text(raw_text: str):
    lines = raw_text.splitlines()
    clause_pattern = r"^(1910\.\d+(?:\([a-zA-Z0-9]+\))*)$"

    nodes = []

    # --------------------------------------------------------
    # 1. Check if document begins with "Standard Number" header
    # --------------------------------------------------------
    std_id, std_text, start_index = parse_standard_header(lines)

    if std_id:
        nodes.append({
            "id": std_id,
            "text": std_text,
            "parent_id": None,
            "refs": extract_references(std_text)
        })
    else:
        start_index = 0

    # --------------------------------------------------------
    # 2. Parse all clauses below the document header
    # --------------------------------------------------------
    i = start_index
    n = len(lines)

    while i < n:
        line = lines[i].strip()

        match = re.match(clause_pattern, line)
        if match:
            clause_id = match.group(1)
            parent_id = get_parent_clause_id(clause_id)

            # If no explicit parent but we detected a Standard Number, attach to it
            if parent_id is None and std_id and clause_id != std_id:
                parent_id = std_id

            # Gather text block
            j = i + 1
            content_lines = []

            while j < n:
                next_line = lines[j].strip()

                if re.match(clause_pattern, next_line):
                    break

                if next_line != "":
                    content_lines.append(next_line)

                j += 1

            full_text = " ".join(content_lines).strip()
            refs = extract_references(full_text)

            nodes.append({
                "id": clause_id,
                "text": f"{clause_id}: {full_text}",
                "parent_id": parent_id,
                "refs": refs
            })

            i = j
        else:
            i += 1

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

def chunk_text(text, chunk_size=200, overlap=20):
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
        query = f"""
        MERGE (n {{id: $id}})
        SET n.text = $text
        SET n :{label}
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
        MERGE (c {{id: $cid}})
        MERGE (p {{id: $pid}})
        MERGE (p)-[:{rel_type}]->(c)
        """
        with self.driver.session() as session:
            session.run(query, pid=parent_id, cid=child_id)

    def resolve_references(self, nodes):
        """
        For each node, create REFERS_TO edges to ALL nodes with matching clause_id.
        """
        # Build lookup: clause_id → list of graph ids
        lookup = {}
        for n in nodes:
            lookup.setdefault(n["clause_id"], []).append(n["id"])

        # Build edges
        for n in nodes:
            for ref in n["refs"]:
                if ref in lookup:
                    for target_graph_id in lookup[ref]:
                        self.create_relationship(n["id"], target_graph_id, rel_type="REFERS_TO")


    def ingest_nodes(self, nodes):
        # Create nodes
        for n in nodes:
            # Top-level clauses (no parentheses) get 'Parent'
            if "(" not in n["id"]:
                label = "Parent"
            else:
                label = "Clause"
            self.create_node(n["id"], n["text"], label=label)
        # Create CONTAINS relationships
        for n in nodes:
            self.create_relationship(n["parent_id"], n["id"], rel_type="CONTAINS")
        # Create REFERS_TO relationships
        for n in nodes:
            for ref in n.get("refs", []):
                self.create_relationship(n["id"], ref, rel_type="REFERS_TO")

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
base_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(base_dir, "data")
create_graph_database(folder=data_dir)