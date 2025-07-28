import os
import PyPDF2
import fitz  # PyMuPDF
from typing import List, Dict, Any, Optional, Tuple
import re
import json
from datetime import datetime
import hashlib
import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import pandas as pd
import tabula
import easyocr
import spacy
from transformers import pipeline
import fitz  # PyMuPDF for advanced features

class AdvancedPDFParser:
    """Advanced PDF parser with OCR, table extraction, and comprehensive analysis"""
    
    def __init__(self):
        self.supported_extensions = ['.pdf']
        self.ocr_reader = None
        self.nlp = None
        self.ner_pipeline = None
        
        # Initialize OCR
        try:
            self.ocr_reader = easyocr.Reader(['en'])
        except:
            print("EasyOCR not available, using Tesseract")
        
        # Initialize NLP
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("SpaCy model not available")
        
        # Initialize NER pipeline
        try:
            self.ner_pipeline = pipeline("ner", model="dbmdz/bert-large-cased-finetuned-conll03-english")
        except:
            print("NER pipeline not available")
    
    def extract_text_from_pdf(self, file_path: str) -> Dict[str, Any]:
        """
        Extract comprehensive text, tables, images, and metadata from PDF
        """
        try:
            doc = fitz.open(file_path)
            text_content = ""
            pages_info = []
            tables = []
            images = []
            forms = []
            annotations = []
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Extract text
                page_text = page.get_text()
                text_content += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                
                # Extract tables
                page_tables = self._extract_tables_from_page(page, page_num)
                tables.extend(page_tables)
                
                # Extract images
                page_images = self._extract_images_from_page(page, page_num)
                images.extend(page_images)
                
                # Extract forms
                page_forms = self._extract_forms_from_page(page, page_num)
                forms.extend(page_forms)
                
                # Extract annotations
                page_annotations = self._extract_annotations_from_page(page, page_num)
                annotations.extend(page_annotations)
                
                # OCR for scanned content
                if len(page_text.strip()) < 100:  # Likely scanned
                    ocr_text = self._perform_ocr_on_page(page)
                    if ocr_text:
                        text_content += f"\n--- OCR Text (Page {page_num + 1}) ---\n{ocr_text}\n"
                
                # Page metadata
                page_info = {
                    'page_number': page_num + 1,
                    'text_length': len(page_text),
                    'has_images': len(page.get_images()) > 0,
                    'has_drawings': len(page.get_drawings()) > 0,
                    'has_tables': len(page_tables) > 0,
                    'has_forms': len(page_forms) > 0,
                    'has_annotations': len(page_annotations) > 0,
                    'rotation': page.rotation,
                    'rect': page.rect,
                    'ocr_performed': len(page_text.strip()) < 100
                }
                pages_info.append(page_info)
            
            # Extract document metadata
            metadata = doc.metadata
            doc.close()
            
            # Generate file hash for caching
            file_hash = self._generate_file_hash(file_path)
            
            # Perform advanced analysis
            analysis = self.analyze_content(text_content)
            
            return {
                'file_path': file_path,
                'file_name': os.path.basename(file_path),
                'file_size': os.path.getsize(file_path),
                'file_hash': file_hash,
                'text_content': text_content,
                'metadata': metadata,
                'pages_info': pages_info,
                'tables': tables,
                'images': images,
                'forms': forms,
                'annotations': annotations,
                'total_pages': len(pages_info),
                'extraction_timestamp': datetime.now().isoformat(),
                'text_length': len(text_content),
                'analysis': analysis
            }
            
        except Exception as e:
            raise Exception(f"Error extracting text from PDF {file_path}: {str(e)}")
    
    def _extract_tables_from_page(self, page, page_num: int) -> List[Dict[str, Any]]:
        """Extract tables from a page"""
        tables = []
        try:
            # Use tabula for table extraction
            page_tables = tabula.read_pdf(
                page.parent.filename, 
                pages=page_num + 1,
                multiple_tables=True,
                lattice=True,
                stream=True
            )
            
            for i, table in enumerate(page_tables):
                if not table.empty:
                    table_data = {
                        'page_number': page_num + 1,
                        'table_index': i,
                        'data': table.to_dict('records'),
                        'columns': table.columns.tolist(),
                        'shape': table.shape,
                        'html': table.to_html(),
                        'csv': table.to_csv(index=False)
                    }
                    tables.append(table_data)
        except Exception as e:
            print(f"Error extracting tables from page {page_num + 1}: {e}")
        
        return tables
    
    def _extract_images_from_page(self, page, page_num: int) -> List[Dict[str, Any]]:
        """Extract images from a page"""
        images = []
        try:
            image_list = page.get_images()
            for img_index, img in enumerate(image_list):
                xref = img[0]
                pix = fitz.Pixmap(page.parent, xref)
                
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    img_data = {
                        'page_number': page_num + 1,
                        'image_index': img_index,
                        'width': pix.width,
                        'height': pix.height,
                        'colorspace': pix.colorspace.name,
                        'size_bytes': len(pix.tobytes()),
                        'bbox': img[2]  # bounding box
                    }
                    images.append(img_data)
                
                pix = None  # Free memory
        except Exception as e:
            print(f"Error extracting images from page {page_num + 1}: {e}")
        
        return images
    
    def _extract_forms_from_page(self, page, page_num: int) -> List[Dict[str, Any]]:
        """Extract form fields from a page"""
        forms = []
        try:
            widgets = page.widgets()
            for widget in widgets:
                form_data = {
                    'page_number': page_num + 1,
                    'field_name': widget.field_name,
                    'field_type': widget.field_type,
                    'field_value': widget.field_value,
                    'field_flags': widget.field_flags,
                    'rect': widget.rect,
                    'text': widget.text
                }
                forms.append(form_data)
        except Exception as e:
            print(f"Error extracting forms from page {page_num + 1}: {e}")
        
        return forms
    
    def _extract_annotations_from_page(self, page, page_num: int) -> List[Dict[str, Any]]:
        """Extract annotations from a page"""
        annotations = []
        try:
            annots = page.annots()
            for annot in annots:
                annot_data = {
                    'page_number': page_num + 1,
                    'type': annot.type[1],
                    'content': annot.content,
                    'rect': annot.rect,
                    'color': annot.colors,
                    'flags': annot.flags
                }
                annotations.append(annot_data)
        except Exception as e:
            print(f"Error extracting annotations from page {page_num + 1}: {e}")
        
        return annotations
    
    def _perform_ocr_on_page(self, page) -> str:
        """Perform OCR on a page"""
        try:
            # Convert page to image
            pix = page.get_pixmap()
            img_data = pix.tobytes("png")
            
            # Convert to PIL Image
            img = Image.open(io.BytesIO(img_data))
            
            # Perform OCR
            if self.ocr_reader:
                results = self.ocr_reader.readtext(np.array(img))
                text = " ".join([result[1] for result in results])
            else:
                # Fallback to Tesseract
                text = pytesseract.image_to_string(img)
            
            return text
        except Exception as e:
            print(f"Error performing OCR: {e}")
            return ""
    
    def extract_specific_content(self, text_content: str, query: str) -> Dict[str, Any]:
        """Extract specific content based on query"""
        try:
            # Extract paragraphs
            paragraphs = re.split(r'\n\s*\n', text_content)
            
            # Extract bullet points
            bullet_points = re.findall(r'^\s*[•\-\*]\s*(.+)$', text_content, re.MULTILINE)
            
            # Extract headings
            headings = re.findall(r'^[A-Z][A-Z\s]+$', text_content, re.MULTILINE)
            
            # Extract custom spans
            custom_spans = self._extract_custom_spans(text_content, query)
            
            return {
                'paragraphs': paragraphs,
                'bullet_points': bullet_points,
                'headings': headings,
                'custom_spans': custom_spans
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _extract_custom_spans(self, text: str, query: str) -> List[str]:
        """Extract text spans between keywords"""
        spans = []
        try:
            # Simple keyword-based extraction
            keywords = query.lower().split()
            lines = text.split('\n')
            
            for i, line in enumerate(lines):
                if any(keyword in line.lower() for keyword in keywords):
                    # Get context around the line
                    start = max(0, i - 2)
                    end = min(len(lines), i + 3)
                    span = '\n'.join(lines[start:end])
                    spans.append(span)
        except Exception as e:
            print(f"Error extracting custom spans: {e}")
        
        return spans
    
    def extract_named_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities from text"""
        entities = {
            'persons': [],
            'organizations': [],
            'dates': [],
            'locations': [],
            'money': [],
            'percentages': []
        }
        
        try:
            if self.nlp:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ == 'PERSON':
                        entities['persons'].append(ent.text)
                    elif ent.label_ == 'ORG':
                        entities['organizations'].append(ent.text)
                    elif ent.label_ == 'DATE':
                        entities['dates'].append(ent.text)
                    elif ent.label_ == 'GPE':
                        entities['locations'].append(ent.text)
                    elif ent.label_ == 'MONEY':
                        entities['money'].append(ent.text)
                    elif ent.label_ == 'PERCENT':
                        entities['percentages'].append(ent.text)
            
            # Additional regex-based extraction
            # Money patterns
            money_pattern = r'\$[\d,]+(?:\.\d{2})?'
            entities['money'].extend(re.findall(money_pattern, text))
            
            # Percentage patterns
            percent_pattern = r'\d+(?:\.\d+)?%'
            entities['percentages'].extend(re.findall(percent_pattern, text))
            
            # Remove duplicates
            for key in entities:
                entities[key] = list(set(entities[key]))
                
        except Exception as e:
            print(f"Error extracting named entities: {e}")
        
        return entities
    
    def compare_documents(self, doc1_path: str, doc2_path: str) -> Dict[str, Any]:
        """Compare two PDF documents"""
        try:
            doc1 = self.extract_text_from_pdf(doc1_path)
            doc2 = self.extract_text_from_pdf(doc2_path)
            
            # Simple text comparison
            text1 = doc1['text_content']
            text2 = doc2['text_content']
            
            # Calculate similarity
            similarity = self._calculate_text_similarity(text1, text2)
            
            # Find differences
            differences = self._find_text_differences(text1, text2)
            
            return {
                'similarity_score': similarity,
                'differences': differences,
                'doc1_info': {
                    'file_name': doc1['file_name'],
                    'text_length': doc1['text_length'],
                    'total_pages': doc1['total_pages']
                },
                'doc2_info': {
                    'file_name': doc2['file_name'],
                    'text_length': doc2['text_length'],
                    'total_pages': doc2['total_pages']
                }
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        try:
            # Simple Jaccard similarity
            words1 = set(text1.lower().split())
            words2 = set(text2.lower().split())
            
            intersection = len(words1.intersection(words2))
            union = len(words1.union(words2))
            
            return intersection / union if union > 0 else 0.0
        except:
            return 0.0
    
    def _find_text_differences(self, text1: str, text2: str) -> List[Dict[str, Any]]:
        """Find differences between two texts"""
        differences = []
        try:
            lines1 = text1.split('\n')
            lines2 = text2.split('\n')
            
            for i, (line1, line2) in enumerate(zip(lines1, lines2)):
                if line1 != line2:
                    differences.append({
                        'line_number': i + 1,
                        'doc1_line': line1,
                        'doc2_line': line2
                    })
        except Exception as e:
            print(f"Error finding differences: {e}")
        
        return differences
    
    def translate_text(self, text: str, target_language: str = 'es') -> str:
        """Translate text to target language"""
        try:
            # This would integrate with a translation service
            # For now, return placeholder
            return f"[Translated to {target_language}]: {text[:100]}..."
        except Exception as e:
            return f"Translation error: {str(e)}"
    
    def generate_summary(self, text: str, summary_type: str = 'executive') -> str:
        """Generate different types of summaries"""
        try:
            if summary_type == 'executive':
                return self._generate_executive_summary(text)
            elif summary_type == 'bullet':
                return self._generate_bullet_summary(text)
            elif summary_type == 'section':
                return self._generate_section_summary(text)
            else:
                return self._generate_executive_summary(text)
        except Exception as e:
            return f"Summary generation error: {str(e)}"
    
    def _generate_executive_summary(self, text: str) -> str:
        """Generate executive summary"""
        # Extract key sentences (first sentence of each paragraph)
        paragraphs = re.split(r'\n\s*\n', text)
        key_sentences = []
        
        for para in paragraphs:
            sentences = re.split(r'[.!?]+', para.strip())
            if sentences and sentences[0].strip():
                key_sentences.append(sentences[0].strip())
        
        return " ".join(key_sentences[:5])  # Top 5 sentences
    
    def _generate_bullet_summary(self, text: str) -> str:
        """Generate bullet-point summary"""
        # Extract bullet points and key phrases
        bullet_points = re.findall(r'^\s*[•\-\*]\s*(.+)$', text, re.MULTILINE)
        
        if bullet_points:
            return "\n".join([f"• {point}" for point in bullet_points[:10]])
        else:
            # Create bullet points from sentences
            sentences = re.split(r'[.!?]+', text)
            return "\n".join([f"• {s.strip()}" for s in sentences[:10] if s.strip()])
    
    def _generate_section_summary(self, text: str) -> str:
        """Generate section-wise summary"""
        # Extract sections based on headings
        sections = re.split(r'\n([A-Z][A-Z\s]+)\n', text)
        
        summary = []
        for i in range(1, len(sections), 2):
            if i + 1 < len(sections):
                section_title = sections[i]
                section_content = sections[i + 1]
                summary.append(f"## {section_title}\n{section_content[:200]}...")
        
        return "\n\n".join(summary)
    
    def analyze_content(self, text_content: str) -> Dict[str, Any]:
        """
        Analyze PDF content for better understanding
        """
        # Extract sections and headings
        lines = text_content.split('\n')
        sections = []
        current_section = {'title': 'Introduction', 'content': '', 'level': 0}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect headings (simple heuristic)
            if len(line) < 100 and (line.isupper() or line.endswith(':') or 
                                   re.match(r'^[0-9]+\.', line) or 
                                   re.match(r'^[A-Z][a-z]+', line)):
                if current_section['content']:
                    sections.append(current_section)
                current_section = {
                    'title': line,
                    'content': '',
                    'level': self._get_heading_level(line)
                }
            else:
                current_section['content'] += line + ' '
        
        if current_section['content']:
            sections.append(current_section)
        
        # Extract named entities
        entities = self.extract_named_entities(text_content)
        
        # Extract key information
        analysis = {
            'sections': sections,
            'total_sections': len(sections),
            'word_count': len(text_content.split()),
            'character_count': len(text_content),
            'estimated_reading_time': len(text_content.split()) // 200,  # 200 words per minute
            'has_tables': 'table' in text_content.lower() or 'figure' in text_content.lower(),
            'has_references': 'reference' in text_content.lower() or 'bibliography' in text_content.lower(),
            'language': self._detect_language(text_content),
            'content_type': self._classify_content(text_content),
            'named_entities': entities,
            'key_phrases': self._extract_key_phrases(text_content)
        }
        
        return analysis
    
    def _extract_key_phrases(self, text: str) -> List[str]:
        """Extract key phrases from text"""
        try:
            # Simple key phrase extraction
            sentences = re.split(r'[.!?]+', text)
            key_phrases = []
            
            for sentence in sentences:
                if len(sentence.split()) > 3 and len(sentence.split()) < 15:
                    # Remove common words
                    words = sentence.lower().split()
                    filtered_words = [w for w in words if len(w) > 3]
                    if filtered_words:
                        key_phrases.append(' '.join(filtered_words[:5]))
            
            return list(set(key_phrases))[:10]  # Top 10 unique phrases
        except:
            return []
    
    def _get_heading_level(self, line: str) -> int:
        """Determine heading level based on formatting"""
        if line.isupper() and len(line) < 50:
            return 1
        elif re.match(r'^[0-9]+\.', line):
            return 2
        elif re.match(r'^[A-Z][a-z]+', line) and len(line) < 100:
            return 3
        return 0
    
    def _detect_language(self, text: str) -> str:
        """Simple language detection"""
        # This is a basic implementation - could be enhanced with proper language detection
        return 'en'  # Default to English
    
    def _classify_content(self, text: str) -> str:
        """Classify content type"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['research', 'study', 'analysis', 'methodology']):
            return 'research_paper'
        elif any(word in text_lower for word in ['manual', 'guide', 'instruction', 'how to']):
            return 'manual_guide'
        elif any(word in text_lower for word in ['report', 'annual', 'quarterly', 'financial']):
            return 'report'
        elif any(word in text_lower for word in ['contract', 'agreement', 'terms', 'legal']):
            return 'legal_document'
        elif any(word in text_lower for word in ['invoice', 'bill', 'receipt', 'payment']):
            return 'financial_document'
        elif any(word in text_lower for word in ['form', 'application', 'survey', 'questionnaire']):
            return 'form_document'
        else:
            return 'general_document'
    
    def _generate_file_hash(self, file_path: str) -> str:
        """Generate SHA-256 hash of file for caching"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def parse_multiple_files(self, file_paths: List[str]) -> Dict[str, Any]:
        """
        Parse multiple PDF files and create a unified dataset
        """
        parsed_files = []
        combined_text = ""
        total_pages = 0
        all_tables = []
        all_images = []
        all_forms = []
        all_annotations = []
        
        for file_path in file_paths:
            try:
                parsed_file = self.extract_text_from_pdf(file_path)
                
                parsed_files.append(parsed_file)
                combined_text += f"\n\n--- Document: {parsed_file['file_name']} ---\n"
                combined_text += parsed_file['text_content']
                total_pages += parsed_file['total_pages']
                
                # Collect all extracted data
                all_tables.extend(parsed_file.get('tables', []))
                all_images.extend(parsed_file.get('images', []))
                all_forms.extend(parsed_file.get('forms', []))
                all_annotations.extend(parsed_file.get('annotations', []))
                
            except Exception as e:
                print(f"Error parsing {file_path}: {str(e)}")
                continue
        
        # Create unified dataset
        unified_dataset = {
            'files': parsed_files,
            'combined_text': combined_text,
            'total_files': len(parsed_files),
            'total_pages': total_pages,
            'total_text_length': len(combined_text),
            'all_tables': all_tables,
            'all_images': all_images,
            'all_forms': all_forms,
            'all_annotations': all_annotations,
            'combined_analysis': self.analyze_content(combined_text),
            'processing_timestamp': datetime.now().isoformat()
        }
        
        return unified_dataset

# Global parser instance
pdf_parser = AdvancedPDFParser()
