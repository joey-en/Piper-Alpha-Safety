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
