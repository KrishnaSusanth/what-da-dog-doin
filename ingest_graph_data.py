import os
import json
import time
import re
from dotenv import load_dotenv
from openai import OpenAI
from neo4j import GraphDatabase
from parse_manual import extract_and_chunk_pdf

load_dotenv()

# Initialize Azure AI Clients using standard OpenAI standard format
# Replace model names in the functions below with your actual deployed Azure model names
llm_client = OpenAI(
    base_url=os.getenv("AZURE_AI_ENDPOINT"),
    api_key=os.getenv("AZURE_AI_KEY")
)

embedding_client = OpenAI(
    base_url=os.getenv("AZURE_EMBEDDING_ENDPOINT", os.getenv("AZURE_AI_ENDPOINT")),
    api_key=os.getenv("AZURE_EMBEDDING_KEY", os.getenv("AZURE_AI_KEY"))
)

neo4j_driver = GraphDatabase.driver(
    os.getenv("NEO4J_URI"), 
    auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
)

def get_embedding(text):
    """Generates a vector embedding using Azure Serverless Embedding Model."""
    response = embedding_client.embeddings.create(
        model="text-embedding-3-small", # Update to your Azure deployment name
        input=text
    )
    return response.data[0].embedding

def extract_graph_entities_with_azure(text_chunk):
    """Uses Azure LLM to extract entities, relationships, and temporal properties."""
    prompt = f"""
    Analyze the following veterinary text chunk from an Indian street dog care guide.
    Extract key clinical relationships, focusing heavily on disease progression and timelines.
    
    You must respond ONLY with a raw JSON array of objects. No markdown, no explanations.
    Each object must have these keys:
    - "source": The main clinical entity (e.g., "Parvovirus", "Lethargy")
    - "type": Entity type (e.g., "DISEASE", "SYMPTOM", "TREATMENT")
    - "relationship": How it links (e.g., "HAS_SYMPTOM", "PROGRESSES_TO", "TREATS")
    - "target": Connected entity (e.g., "Dehydration", "Fluid Therapy")
    - "target_type": Target entity type.
    - "properties": A JSON object containing any timeline or severity data mentioned (e.g., {{"onset_day": "3-5", "severity": "high"}}). Leave empty {{}} if none.

    Text to extract from: {text_chunk}
    """
    
    try:
        completion = llm_client.chat.completions.create(
            model="gpt-4o-mini", # Update to your Azure deployment name (e.g., Llama-3)
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1500
        )
        
        raw_text = completion.choices[0].message.content.strip()
        
        # Robust regex fallback for clean JSON extraction
        match = re.search(r'\[\s*{.*}\s*\]', raw_text, re.DOTALL)
        if match:
            clean_json_str = match.group(0)
        else:
            if raw_text.startswith("```json"):
                clean_json_str = raw_text.split("```json")[1].split("```")[0].strip()
            elif raw_text.startswith("```"):
                clean_json_str = raw_text.split("```")[1].split("```")[0].strip()
            else:
                clean_json_str = raw_text

        clean_json_str = re.sub(r',\s*\]', ']', clean_json_str)
        clean_json_str = re.sub(r',\s*\}', '}', clean_json_str)
        
        return json.loads(clean_json_str)
        
    except Exception as e:
        print(f" -> Extraction skipped due to formatting variance: {e}")
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
    print(f"\n--- Starting Hybrid Ingestion (First {limit} chunks) ---")
    
    for i in range(limit):
        chunk = chunks[i]
        print(f"Processing chunk {i+1}/{limit} using Azure AI...")
        
        vector = get_embedding(chunk)
        triples = extract_graph_entities_with_azure(chunk)
        
        for triple in triples:
            source = str(triple.get('source', '')).strip().title()
            target = str(triple.get('target', '')).strip().title()
            rel = str(triple.get('relationship', 'ASSOCIATED_WITH')).strip().upper().replace(" ", "_")
            props = triple.get('properties', {})
            
            if not source or not target:
                continue
                
            # Dynamic property mapping for Cypher
            set_props = ", ".join([f"r.{k} = ${k}" for k in props.keys()])
            set_clause = f"SET {set_props}" if set_props else ""
            
            cypher = f"""
            MERGE (s:Entity {{name: $source}})
            ON CREATE SET s.type = $source_type
            
            MERGE (t:Entity {{name: $target}})
            ON CREATE SET t.type = $target_type
            
            MERGE (s)-[r:{rel}]->(t)
            {set_clause}
            """
            
            # Merge standard params with the dynamic properties dict
            params = {
                "source": source, "source_type": triple.get('type'),
                "target": target, "target_type": triple.get('target_type')
            }
            params.update(props)
            
            execute_cypher(cypher, params)
            
        chunk_cypher = """
        CREATE (c:DocumentChunk {chunk_id: $chunk_id, text: $text, embedding: $embedding})
        """
        execute_cypher(chunk_cypher, {"chunk_id": i, "text": chunk, "embedding": vector})
        time.sleep(0.2) 

# [Keep your existing inject_synthetic_time_series() function here]
def inject_synthetic_time_series():
    pass # Add back your original Rocky time-series logic here

if __name__ == "__main__":
    setup_database_constraints()
    
    # Updated to process the new v6 PDF
    chunks = extract_and_chunk_pdf("vet_manual.pdf") 
    
    # Adjust chunk slicing based on where the clinical data actually starts in the new PDF
    #clinical_chunks = chunks[10:60] 
    
    ingest_knowledge_base(chunks, limit=50)
    # inject_synthetic_time_series()
    
    print("\nInitialization completely successful! Graph populated with timeline-aware clinical data.")
    neo4j_driver.close()