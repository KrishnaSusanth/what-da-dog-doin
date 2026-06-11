import os
import re
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()

def extract_and_chunk_pdf(pdf_path, chunk_size=1200, overlap=200):
    print(f"Opening {pdf_path}...")
    reader = PdfReader(pdf_path)
    full_text = ""
    
    # Extract text page by page
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            full_text += f"\n[Page {i+1}]\n" + text

    # Clean up excessive whitespaces/newlines
    full_text = re.sub(r'\s+', ' ', full_text)
    
    print(f"Extraction complete. Total characters: {len(full_text)}")
    print("Chunking text...")
    
    # Simple sliding window chunking mechanism
    chunks = []
    start = 0
    while start < len(full_text):
        end = start + chunk_size
        chunk = full_text[start:end]
        chunks.append(chunk.strip())
        start += chunk_size - overlap
        
    print(f"Generated {len(chunks)} text chunks.")
    return chunks

if __name__ == "__main__":
    # Test the parser
    pdf_file = "vet_manual.pdf"
    if os.path.exists(pdf_file):
        sample_chunks = extract_and_chunk_pdf(pdf_file)
        # Display a sample chunk to verify it works
        print("\n--- Sample Chunk 50 ---")
        print(sample_chunks[50][:400] + "...")
    else:
        print(f"Error: Please place your '{pdf_file}' file in this directory.")