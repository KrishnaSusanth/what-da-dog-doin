import pdfplumber
import re

def is_header(line):
    line = line.strip()
    if not line or len(line) < 3:
        return False
    
    # 1. Existing rules
    keywords = ['DISEASE:', 'SYMPTOMS:', 'TREATMENT:', 'DIAGNOSIS:', 'INCUBATION:', 
                'PROGRESSION:', 'PREVENTION:', 'VACCINATION:', 'GUIDELINES:']
    if any(line.upper().startswith(k) for k in keywords):
        return True
    
    # 2. Numbered sections
    if re.match(r'^\d+(\.\d+)*\s', line) and len(line) < 80:
        return True
    
    # 3. Short ALL CAPS
    if line.isupper() and len(line.split()) <= 8 and len(line) < 70:
        return True
    
    # 4. New rules — very useful for veterinary PDFs
    if re.match(r'^[A-Z][a-zA-Z\s&-]+[:.]?$', line) and 5 < len(line) < 60:  # Title-like
        return True
    
    # 5. Common disease names as headers
    disease_indicators = ['Parvovirus', 'Rabies', 'Distemper', 'Leptospirosis', ' mange', 
                         'Ehrlichia', 'Babesia', 'Heartworm', 'Giardia']
    if any(d in line for d in disease_indicators) and len(line.split()) < 12:
        return True
    
    return False


def extract_and_chunk_pdf(pdf_path="vet_manual.pdf"):
    print(f"Opening {pdf_path} for section-aware extraction...")
    chunks = []
    current_section_title = "General Veterinary Context"
    current_chunk_lines = []
    min_words = 20   # Lower threshold during debugging
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text(x_tolerance=3, y_tolerance=3)
                if not text:
                    continue
                    
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                
                for line in lines:
                    if is_header(line):
                        # Save previous chunk
                        if current_chunk_lines:
                            chunk_text = f"Section: {current_section_title}\n\n" + "\n".join(current_chunk_lines)
                            if len(chunk_text.split()) >= min_words:
                                chunks.append(chunk_text)
                        
                        current_section_title = line.strip()
                        current_chunk_lines = []
                    else:
                        current_chunk_lines.append(line)
        
        # Don't forget the last chunk
        if current_chunk_lines:
            chunk_text = f"Section: {current_section_title}\n\n" + "\n".join(current_chunk_lines)
            if len(chunk_text.split()) >= min_words:
                chunks.append(chunk_text)
        
        print(f"Successfully extracted {len(chunks)} logical, section-aware chunks from the PDF.")
        if len(chunks) > 0:
            print(f"First chunk preview (first 200 chars): {chunks[0][:200]}...")
        
        return chunks
        
    except FileNotFoundError:
        print(f"Error: Could not find {pdf_path}.")
        return []
    except Exception as e:
        print(f"Error during PDF processing: {e}")
        return []