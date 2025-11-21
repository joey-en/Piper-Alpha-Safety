from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
AUTH = ("neo4j", "BeTheBuilder")

def main():
    # driver context manager ensures clean shutdown
    with GraphDatabase.driver(URI, auth=AUTH) as driver:
        # explicitly pick your database if you created "piperalpha"
        with driver.session(database="piperalpha") as session:
            record = session.run(
                "RETURN 'Connection successful!' AS message"
            ).single()
            print(record["message"])

if __name__ == "__main__":
    main()
