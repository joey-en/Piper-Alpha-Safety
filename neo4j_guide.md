# Neo4j Setup and Python Connection Guide

## 1. Install Neo4j Desktop

1. Download Neo4j Desktop from [Neo4j Download](https://neo4j.com/download/).
2. Install the application normally.
3. Open Neo4j Desktop. The first screen will show **Local Instances** under **Data Services**.

---

## 2. Create a New Database Instance

1. Click **Create Instance**.
2. Name your instance: `PiperAlpha`
3. Set the password: `BeTheBuilder`
4. Select the version `2025.10.1`.
5. Click **Create**.
6. After creation, click the **Play button** to start the instance.

   * A terminal window will open automatically. Wait until the database starts successfully.

---

## 3. Create a Database

1. After the instance starts, click **Create Database**.
2. Name your database: `piperalpha` (all lowercase, no spaces or underscores).
3. Click **Create**.
4. Your database is now ready to accept connections.

---

## 4. Test Python Connection

### 4.1 Install Neo4j Python Driver

```bash
pip install neo4j
```

### 4.2 Create Python Test Script

Create a file `test/neo4j_connection.py`:

```python
from neo4j import GraphDatabase

# Replace with your actual credentials
uri = "bolt://localhost:7687"
user = "neo4j"
password = "BeTheBuilder"

# Create driver
driver = GraphDatabase.driver(uri, auth=(user, password))

# Simple test query
with driver.session() as session:
    result = session.run("RETURN 'Connection successful!' AS message")
    for record in result:
        print(record["message"])

driver.close()
```

### 4.3 Run the Test Script

```bash
python test/neo4j_connection.py
```

**Expected Output:**

```
Connection successful!
```

This confirms that your Python environment can communicate with the Neo4j instance.
