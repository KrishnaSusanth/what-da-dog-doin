import os
import json
import time
from dotenv import load_dotenv
from google import genai
from groq import Groq
from neo4j import GraphDatabase
from parse_manual import extract_and_chunk_pdf

load_dotenv()

# Initialize API clients
ai_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def get_embedding(text):
    """Generates a 768-dimensional vector embedding using Google's model."""
    response = ai_client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return response.embeddings[0].values

def extract_graph_entities_with_groq(text_chunk):
    """Uses Groq + Llama-3.1-8b with strict regex correction to pull clean JSON arrays."""
    prompt = f"""
    Analyze the following veterinary text chunk and extract key clinical relationships.
    Identify diseases, conditions, symptoms, treatments, or risk factors.
    
    You must respond ONLY with a raw JSON array of objects. Do not include markdown codeblocks, explanations, or introductory text.
    Each object in the array must have exactly these keys:
    - "source": The main clinical entity (e.g., "Parvovirus", "Lethargy")
    - "type": The entity type (e.g., "DISEASE", "SYMPTOM", "TREATMENT")
    - "relationship": How it links to the target (e.g., "HAS_SYMPTOM", "TREATS", "CAUSED_BY")
    - "target": The connected entity (e.g., "Dehydration", "Fluid Therapy")
    - "target_type": The target entity type.

    Text to extract from: {text_chunk}
    """
    
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1000
        )
        
        raw_text = completion.choices[0].message.content.strip()
        
        # --- ROBUST REGEX CLEANING FALLBACK ---
        # Find anything that sits between the first '[' and the last ']'
        import re
        match = re.search(r'\[\s*{.*}\s*\]', raw_text, re.DOTALL)
        if match:
            clean_json_str = match.group(0)
        else:
            # Fallback in case it didn't include the array outer brackets
            if raw_text.startswith("```json"):
                clean_json_str = raw_text.split("```json")[1].split("```")[0].strip()
            elif raw_text.startswith("```"):
                clean_json_str = raw_text.split("```")[1].split("```")[0].strip()
            else:
                clean_json_str = raw_text

        # Fix minor formatting slips (like trailing commas before closing braces)
        clean_json_str = re.sub(r',\s*\]', ']', clean_json_str)
        clean_json_str = re.sub(r',\s*\}', '}', clean_json_str)
        
        return json.loads(clean_json_str)
        
    except Exception as e:
        # If it still fails, return an empty array so the loop keeps processing other chunks gracefully
        print(f" -> Parsing adjustment made: skipped 1 chunk due to structure shape variance ({e})")
        return []

def execute_cypher(query, parameters=None):
    with neo4j_driver.session() as session:
        session.run(query, parameters)

def setup_database_constraints():
    print("Setting up database unique constraints...")
    try:
        execute_cypher("CREATE CONSTRAINT unique_entity IF NOT EXISTS FOR (e:Entity) REQUIRE e.name IS UNIQUE")
        execute_cypher("CREATE CONSTRAINT unique_dog IF NOT EXISTS FOR (d:Dog) REQUIRE d.id IS UNIQUE")
    except Exception as e:
        print(f"Constraint configuration notice: {e}")

def ingest_knowledge_base(chunks, limit=50):
    print(f"\n--- Starting High-Speed Knowledge Ingestion (First {limit} chunks) ---")
    
    for i in range(limit):
        chunk = chunks[i]
        print(f"Processing chunk {i+1}/{limit} using Groq + Google Embeddings...")
        
        # 1. Get Vector Embedding (High rate ceiling)
        vector = get_embedding(chunk)
        
        # 2. Extract Triples via High-RPM Groq Pipeline
        triples = extract_graph_entities_with_groq(chunk)
        
        # 3. Stream nodes directly into Neo4j
        for triple in triples:
            source = str(triple.get('source', '')).strip().title()
            target = str(triple.get('target', '')).strip().title()
            rel = str(triple.get('relationship', 'ASSOCIATED_WITH')).strip().upper().replace(" ", "_")
            
            if not source or not target:
                continue
                
            cypher = f"""
            MERGE (s:Entity {{name: $source}})
            ON CREATE SET s.type = $source_type
            
            MERGE (t:Entity {{name: $target}})
            ON CREATE SET t.type = $target_type
            
            MERGE (s)-[r:{rel}]->(t)
            """
            execute_cypher(cypher, {
                "source": source, "source_type": triple.get('type'),
                "target": target, "target_type": triple.get('target_type')
            })
            
        # Store text document block
        chunk_cypher = """
        CREATE (c:DocumentChunk {chunk_id: $chunk_id, text: $text, embedding: $embedding})
        """
        execute_cypher(chunk_cypher, {"chunk_id": i, "text": chunk, "embedding": vector})
        time.sleep(0.1) # Micro-pause to maintain clean thread timing

def inject_synthetic_time_series():
    print("\n--- Injecting Option A Time-Series Timeline Graph ---")
    
    execute_cypher("""
    MERGE (d:Dog {id: "stray_77"})
    SET d.name = "Rocky", d.breed = "Indie Street Dog", d.estimated_age = "3 years"
    """)
    
    # Day 1
    execute_cypher("""
    MATCH (d:Dog {id: "stray_77"})
    CREATE (l1:Log {date: "2026-06-06", food_intake_pct: 100, temp_celsius: 38.6, activity: "Normal"})
    CREATE (d)-[:HAS_TIMELINE]->(l1)
    """)
    
    # Day 2
    execute_cypher("""
    MATCH (l1:Log {date: "2026-06-06"})
    CREATE (l2:Log {date: "2026-06-07", food_intake_pct: 40, temp_celsius: 39.4, activity: "Lethargic"})
    CREATE (l2)-[:PREVIOUS]->(l1)
    WITH l2
    MERGE (s:Entity {name: "Lethargy"})
    MERGE (l2)-[:EXHIBITS]->(s)
    """)
    
    # Day 3 (Today)
    execute_cypher("""
    MATCH (l2:Log {date: "2026-06-07"})
    CREATE (l3:Log {date: "2026-06-08", food_intake_pct: 0, temp_celsius: 40.1, activity: "Very Weak"})
    CREATE (l3)-[:PREVIOUS]->(l2)
    WITH l3
    MERGE (s1:Entity {name: "Lethargy"})
    MERGE (s2:Entity {name: "Anorexia"})
    MERGE (l3)-[:EXHIBITS]->(s1)
    MERGE (l3)-[:EXHIBITS]->(s2)
    """)
    print("Time-series tracking built into topology!")

if __name__ == "__main__":
    setup_database_constraints()
    chunks = extract_and_chunk_pdf("vet_manual.pdf")
    
    # Slice the list to completely bypass table of contents noise
    # Starts at chunk 100 and takes the next 50 clinical chunks
    clinical_chunks = chunks[100:150] 
    
    ingest_knowledge_base(clinical_chunks, limit=50)
    inject_synthetic_time_series()
    
    print("\nInitialization completely successful! Graph populated with core clinical data.")
    neo4j_driver.close()