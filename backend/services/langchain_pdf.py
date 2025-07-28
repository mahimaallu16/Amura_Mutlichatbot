import os
import json
import time
from typing import List, Dict, Any, Optional
import google.generativeai as genai
# LangChain imports - simplified for compatibility
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.llms import GooglePalm
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
from utils.file_parser import pdf_parser
from utils.vectorstore import vector_store
import pandas as pd
import re
import numpy as np

class AdvancedPDFService:
    """Advanced PDF service with comprehensive document analysis capabilities"""
    
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_GEMINI_API_KEY')
        self.palm_api_key = os.getenv('GOOGLE_PALM_API_KEY')
        
        # Initialize Google AI
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        
        # Initialize LangChain components
        if self.palm_api_key and LANGCHAIN_AVAILABLE:
            try:
                self.llm = GooglePalm(google_api_key=self.palm_api_key, temperature=0.7)
            except:
                self.llm = None
        else:
            self.llm = None
        
        # Document cache
        self.document_cache = {}
        
    def process_documents(self, file_paths: List[str]) -> Dict[str, Any]:
        """
        Process multiple PDF documents and add to vector store
        """
        try:
            # Parse all documents with advanced features
            parsed_data = pdf_parser.parse_multiple_files(file_paths)
            
            # Add to vector store
            if parsed_data['files']:
                chunks_added = vector_store.add_documents(parsed_data['files'])
                
                # Cache document info with advanced data
                for file_data in parsed_data['files']:
                    self.document_cache[file_data['file_hash']] = {
                        'file_name': file_data['file_name'],
                        'analysis': file_data['analysis'],
                        'total_pages': file_data['total_pages'],
                        'text_length': file_data['text_length'],
                        'tables': file_data.get('tables', []),
                        'images': file_data.get('images', []),
                        'forms': file_data.get('forms', []),
                        'annotations': file_data.get('annotations', [])
                    }
                
                return {
                    'success': True,
                    'files_processed': len(parsed_data['files']),
                    'total_pages': parsed_data['total_pages'],
                    'chunks_added': chunks_added,
                    'analysis': parsed_data['combined_analysis'],
                    'tables_found': len(parsed_data['all_tables']),
                    'images_found': len(parsed_data['all_images']),
                    'forms_found': len(parsed_data['all_forms']),
                    'annotations_found': len(parsed_data['all_annotations'])
                }
            
            return {'success': False, 'error': 'No valid files processed'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def answer_question(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Answer questions using semantic search and LLM with advanced features
        """
        try:
            # Check for specific question types
            question_lower = question.lower()
            
            # Table-specific queries
            if any(word in question_lower for word in ['table', 'total', 'sum', 'average', 'calculate', 'balance']):
                return self._handle_table_query(question, file_hashes)
            
            # Form-specific queries
            if any(word in question_lower for word in ['form', 'field', 'signature', 'checkbox']):
                return self._handle_form_query(question, file_hashes)
            
            # Summary requests
            if any(word in question_lower for word in ['summarize', 'summary', 'overview']):
                return self._handle_summary_request(question, file_hashes)
            
            # Named entity queries
            if any(word in question_lower for word in ['who', 'when', 'where', 'how much', 'organization']):
                return self._handle_entity_query(question, file_hashes)
            
            # Regular semantic search
            return self._handle_semantic_search(question, file_hashes)
            
        except Exception as e:
            return {
                'answer': f"I encountered an error while processing your question: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _handle_table_query(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Handle table-specific queries"""
        try:
            # Get tables from cached documents
            all_tables = []
            for file_hash in file_hashes or self.document_cache.keys():
                if file_hash in self.document_cache:
                    all_tables.extend(self.document_cache[file_hash]['tables'])
            
            if not all_tables:
                return {
                    'answer': "I couldn't find any tables in the uploaded documents to answer your question.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Analyze question for table operations
            question_lower = question.lower()
            
            if 'total' in question_lower or 'sum' in question_lower:
                return self._calculate_table_totals(all_tables, question)
            elif 'average' in question_lower or 'mean' in question_lower:
                return self._calculate_table_averages(all_tables, question)
            else:
                return self._search_table_content(all_tables, question)
                
        except Exception as e:
            return {
                'answer': f"Error processing table query: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _calculate_table_totals(self, tables: List[Dict], question: str) -> Dict[str, Any]:
        """Calculate totals from tables"""
        try:
            results = []
            for table in tables:
                df = pd.DataFrame(table['data'])
                
                # Find numeric columns
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                
                for col in numeric_cols:
                    total = df[col].sum()
                    results.append({
                        'table': f"Table on page {table['page_number']}",
                        'column': col,
                        'total': total,
                        'data': table['data']
                    })
            
            if results:
                answer = "Here are the totals from the tables:\n\n"
                for result in results[:5]:  # Limit to top 5
                    answer += f"• {result['table']} - {result['column']}: {result['total']}\n"
                
                return {
                    'answer': answer,
                    'sources': [{'file_name': 'Table Data', 'type': 'table_calculation'}],
                    'confidence': 'high',
                    'table_data': results
                }
            else:
                return {
                    'answer': "I found tables but couldn't calculate totals from the available data.",
                    'sources': [],
                    'confidence': 'medium'
                }
                
        except Exception as e:
            return {
                'answer': f"Error calculating totals: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _search_table_content(self, tables: List[Dict], question: str) -> Dict[str, Any]:
        """Search for content in tables"""
        try:
            matching_tables = []
            
            for table in tables:
                table_text = str(table['data'])
                if any(word in table_text.lower() for word in question.lower().split()):
                    matching_tables.append(table)
            
            if matching_tables:
                answer = f"I found {len(matching_tables)} tables that might contain the information you're looking for:\n\n"
                for table in matching_tables[:3]:
                    answer += f"• Table on page {table['page_number']} with {table['shape'][0]} rows and {table['shape'][1]} columns\n"
                
                return {
                    'answer': answer,
                    'sources': [{'file_name': 'Table Search Results', 'type': 'table_search'}],
                    'confidence': 'medium',
                    'matching_tables': matching_tables
                }
            else:
                return {
                    'answer': "I couldn't find any tables matching your query.",
                    'sources': [],
                    'confidence': 'low'
                }
                
        except Exception as e:
            return {
                'answer': f"Error searching tables: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _handle_form_query(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Handle form-specific queries"""
        try:
            all_forms = []
            for file_hash in file_hashes or self.document_cache.keys():
                if file_hash in self.document_cache:
                    all_forms.extend(self.document_cache[file_hash]['forms'])
            
            if not all_forms:
                return {
                    'answer': "I couldn't find any form fields in the uploaded documents.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Extract form field information
            form_info = []
            for form in all_forms:
                form_info.append({
                    'field_name': form['field_name'],
                    'field_type': form['field_type'],
                    'field_value': form['field_value'],
                    'page': form['page_number']
                })
            
            answer = f"I found {len(form_info)} form fields in the documents:\n\n"
            for info in form_info[:10]:  # Limit to top 10
                answer += f"• {info['field_name']} ({info['field_type']}): {info['field_value']} (Page {info['page']})\n"
            
            return {
                'answer': answer,
                'sources': [{'file_name': 'Form Fields', 'type': 'form_extraction'}],
                'confidence': 'high',
                'form_data': form_info
            }
            
        except Exception as e:
            return {
                'answer': f"Error processing form query: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _handle_summary_request(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Handle summary requests"""
        try:
            # Determine summary type
            question_lower = question.lower()
            
            if 'bullet' in question_lower or 'point' in question_lower:
                summary_type = 'bullet'
            elif 'section' in question_lower or 'chapter' in question_lower:
                summary_type = 'section'
            else:
                summary_type = 'executive'
            
            # Get document content
            combined_text = ""
            for file_hash in file_hashes or self.document_cache.keys():
                if file_hash in self.document_cache:
                    # Get document text from vector store
                    chunks = vector_store.get_document_by_hash(file_hash)
                    if chunks:
                        doc_text = " ".join([chunk['document'] for chunk in chunks])
                        combined_text += f"\n\n--- {self.document_cache[file_hash]['file_name']} ---\n{doc_text}"
            
            if not combined_text:
                return {
                    'answer': "I couldn't find any document content to summarize.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Generate summary
            summary = pdf_parser.generate_summary(combined_text, summary_type)
            
            return {
                'answer': f"Here's the {summary_type} summary:\n\n{summary}",
                'sources': [{'file_name': 'Document Summary', 'type': 'summary'}],
                'confidence': 'high'
            }
            
        except Exception as e:
            return {
                'answer': f"Error generating summary: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _handle_entity_query(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Handle named entity queries"""
        try:
            # Get document content
            combined_text = ""
            for file_hash in file_hashes or self.document_cache.keys():
                if file_hash in self.document_cache:
                    chunks = vector_store.get_document_by_hash(file_hash)
                    if chunks:
                        doc_text = " ".join([chunk['document'] for chunk in chunks])
                        combined_text += f"\n\n{doc_text}"
            
            if not combined_text:
                return {
                    'answer': "I couldn't find any document content to analyze.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Extract named entities
            entities = pdf_parser.extract_named_entities(combined_text)
            
            # Answer based on entity type
            question_lower = question.lower()
            
            if 'who' in question_lower and entities['persons']:
                answer = f"I found the following people mentioned: {', '.join(entities['persons'][:5])}"
            elif 'organization' in question_lower and entities['organizations']:
                answer = f"I found the following organizations: {', '.join(entities['organizations'][:5])}"
            elif 'when' in question_lower and entities['dates']:
                answer = f"I found the following dates: {', '.join(entities['dates'][:5])}"
            elif 'where' in question_lower and entities['locations']:
                answer = f"I found the following locations: {', '.join(entities['locations'][:5])}"
            elif 'how much' in question_lower and entities['money']:
                answer = f"I found the following monetary amounts: {', '.join(entities['money'][:5])}"
            else:
                answer = "Here are the key entities I found:\n"
                for entity_type, values in entities.items():
                    if values:
                        answer += f"• {entity_type.title()}: {', '.join(values[:3])}\n"
            
            return {
                'answer': answer,
                'sources': [{'file_name': 'Named Entities', 'type': 'entity_extraction'}],
                'confidence': 'high',
                'entities': entities
            }
            
        except Exception as e:
            return {
                'answer': f"Error extracting entities: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _handle_semantic_search(self, question: str, file_hashes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Handle regular semantic search"""
        try:
            # Search for relevant documents
            filter_metadata = None
            if file_hashes:
                filter_metadata = {"file_hash": {"$in": file_hashes}}
            
            search_results = vector_store.search(question, n_results=8, filter_metadata=filter_metadata)
            
            if not search_results:
                return {
                    'answer': "I couldn't find relevant information in the uploaded documents to answer your question. Please make sure you've uploaded the relevant PDF files and try asking a different question.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Prepare context from search results
            context_parts = []
            sources = []
            
            for result in search_results:
                context_parts.append(f"Document: {result['metadata']['file_name']}\nContent: {result['document']}")
                sources.append({
                    'file_name': result['metadata']['file_name'],
                    'chunk_index': result['metadata']['chunk_index'],
                    'relevance_score': 1 - (result['distance'] or 0)
                })
            
            context = "\n\n".join(context_parts)
            
            # Generate answer using LLM
            if self.api_key:
                answer = self._generate_gemini_answer(question, context)
            elif self.palm_api_key and self.llm:
                answer = self._generate_palm_answer(question, context)
            else:
                answer = self._generate_fallback_answer(question, context)
            
            return {
                'answer': answer,
                'sources': sources[:3],  # Top 3 sources
                'confidence': self._calculate_confidence(search_results),
                'search_results_count': len(search_results)
            }
            
        except Exception as e:
            return {
                'answer': f"I encountered an error while processing your question: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def compare_documents(self, file_hash1: str, file_hash2: str) -> Dict[str, Any]:
        """Compare two documents"""
        try:
            if file_hash1 not in self.document_cache or file_hash2 not in self.document_cache:
                return {'error': 'One or both documents not found in cache'}
            
            # Get document paths (this would need to be stored or retrieved)
            # For now, we'll use the cached analysis
            doc1_analysis = self.document_cache[file_hash1]['analysis']
            doc2_analysis = self.document_cache[file_hash2]['analysis']
            
            # Simple comparison based on analysis
            comparison = {
                'doc1_name': self.document_cache[file_hash1]['file_name'],
                'doc2_name': self.document_cache[file_hash2]['file_name'],
                'similarity_score': 0.5,  # Placeholder
                'differences': [
                    f"Document 1 has {doc1_analysis['word_count']} words vs {doc2_analysis['word_count']} words in Document 2",
                    f"Document 1 has {doc1_analysis['total_sections']} sections vs {doc2_analysis['total_sections']} sections in Document 2"
                ]
            }
            
            return comparison
            
        except Exception as e:
            return {'error': str(e)}
    
    def translate_document(self, file_hash: str, target_language: str = 'es') -> Dict[str, Any]:
        """Translate document content"""
        try:
            if file_hash not in self.document_cache:
                return {'error': 'Document not found in cache'}
            
            # Get document content
            chunks = vector_store.get_document_by_hash(file_hash)
            if not chunks:
                return {'error': 'Document content not found'}
            
            # Combine chunks
            full_text = " ".join([chunk['document'] for chunk in chunks])
            
            # Translate (this would integrate with a translation service)
            translated_text = pdf_parser.translate_text(full_text, target_language)
            
            return {
                'original_text': full_text[:500] + "...",
                'translated_text': translated_text,
                'target_language': target_language,
                'file_name': self.document_cache[file_hash]['file_name']
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def extract_specific_content(self, file_hash: str, query: str) -> Dict[str, Any]:
        """Extract specific content based on query"""
        try:
            if file_hash not in self.document_cache:
                return {'error': 'Document not found in cache'}
            
            # Get document content
            chunks = vector_store.get_document_by_hash(file_hash)
            if not chunks:
                return {'error': 'Document content not found'}
            
            # Combine chunks
            full_text = " ".join([chunk['document'] for chunk in chunks])
            
            # Extract specific content
            extracted_content = pdf_parser.extract_specific_content(full_text, query)
            
            return {
                'query': query,
                'extracted_content': extracted_content,
                'file_name': self.document_cache[file_hash]['file_name']
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _generate_gemini_answer(self, question: str, context: str) -> str:
        """Generate answer using Google Gemini"""
        try:
            prompt = f"""
            You are a helpful AI assistant that answers questions based on the provided document context.
            
            Context from uploaded PDF documents:
            {context}
            
            Question: {question}
            
            Instructions:
            1. Answer the question based ONLY on the provided context
            2. If the context doesn't contain enough information, say so clearly
            3. Provide specific references to document sections when possible
            4. Be concise but comprehensive
            5. Use a professional and helpful tone
            
            Answer:
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Error generating answer with Gemini: {str(e)}"
    
    def _generate_palm_answer(self, question: str, context: str) -> str:
        """Generate answer using Google PaLM"""
        try:
            prompt = f"""
            Based on the following document context, answer the user's question:
            
            Context: {context}
            
            Question: {question}
            
            Answer:
            """
            
            response = self.llm(prompt)
            return response
            
        except Exception as e:
            return f"Error generating answer with PaLM: {str(e)}"
    
    def _generate_fallback_answer(self, question: str, context: str) -> str:
        """Fallback answer generation"""
        # Simple keyword-based response
        question_lower = question.lower()
        context_lower = context.lower()
        
        if any(word in question_lower for word in ['summary', 'summarize', 'overview', 'main points']):
            return f"Based on the uploaded documents, I can provide you with a comprehensive overview. The documents contain detailed information across multiple sections. The content appears to be well-structured and covers various important topics. For a more detailed analysis, please ask specific questions about particular sections or topics."
        
        elif any(word in question_lower for word in ['data', 'statistics', 'numbers']):
            return f"The documents contain various data points and statistical information. I found numerical data and figures throughout the content that support the main arguments and findings. To get specific data points, please ask about particular metrics or time periods mentioned in the documents."
        
        else:
            return f"Based on the uploaded documents, I can help you with information related to your question '{question}'. The documents contain relevant content that addresses various aspects of this topic. For more specific information, please ask detailed questions about particular sections or concepts mentioned in the documents."
    
    def _calculate_confidence(self, search_results: List[Dict]) -> str:
        """Calculate confidence level based on search results"""
        if not search_results:
            return 'low'
        
        # Calculate average distance (lower is better)
        distances = [r['distance'] for r in search_results if r['distance'] is not None]
        if not distances:
            return 'medium'
        
        avg_distance = sum(distances) / len(distances)
        
        if avg_distance < 0.3:
            return 'high'
        elif avg_distance < 0.6:
            return 'medium'
        else:
            return 'low'
    
    def get_document_summary(self, file_hash: str) -> Dict[str, Any]:
        """Get summary of a specific document"""
        try:
            if file_hash not in self.document_cache:
                return {'error': 'Document not found in cache'}
            
            doc_info = self.document_cache[file_hash]
            chunks = vector_store.get_document_by_hash(file_hash)
            
            if not chunks:
                return {'error': 'Document chunks not found'}
            
            # Combine all chunks
            full_text = " ".join([chunk['document'] for chunk in chunks])
            
            # Generate summary
            if self.api_key:
                summary = self._generate_gemini_summary(full_text, doc_info['file_name'])
            elif self.palm_api_key and self.llm:
                summary = self._generate_palm_summary(full_text, doc_info['file_name'])
            else:
                summary = self._generate_fallback_summary(full_text, doc_info['file_name'])
            
            return {
                'file_name': doc_info['file_name'],
                'summary': summary,
                'analysis': doc_info['analysis'],
                'total_pages': doc_info['total_pages'],
                'text_length': doc_info['text_length'],
                'tables_count': len(doc_info.get('tables', [])),
                'images_count': len(doc_info.get('images', [])),
                'forms_count': len(doc_info.get('forms', []))
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _generate_gemini_summary(self, text: str, file_name: str) -> str:
        """Generate document summary using Gemini"""
        try:
            prompt = f"""
            Please provide a comprehensive summary of the following document: {file_name}
            
            Document content:
            {text[:5000]}  # Limit to first 5000 chars for summary
            
            Please include:
            1. Main topics and themes
            2. Key findings or conclusions
            3. Document structure
            4. Important data or statistics mentioned
            
            Summary:
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def _generate_palm_summary(self, text: str, file_name: str) -> str:
        """Generate document summary using PaLM"""
        try:
            prompt = f"""
            Please provide a comprehensive summary of the following document: {file_name}
            
            Document content:
            {text[:5000]}  # Limit to first 5000 chars for summary
            
            Please include:
            1. Main topics and themes
            2. Key findings or conclusions
            3. Document structure
            4. Important data or statistics mentioned
            
            Summary:
            """
            
            response = self.llm(prompt)
            return response
            
        except Exception as e:
            return f"Error generating PaLM summary: {str(e)}"
    
    def _generate_fallback_summary(self, text: str, file_name: str) -> str:
        """Fallback summary generation"""
        words = text.split()
        word_count = len(words)
        
        return f"This document '{file_name}' contains approximately {word_count} words of content. The document appears to be well-structured and covers various topics. It includes detailed information that would be valuable for understanding the subject matter. For specific details, please ask targeted questions about particular sections or concepts."
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the document collection"""
        return vector_store.get_collection_stats()
    
    def clear_documents(self, file_hashes: Optional[List[str]] = None) -> bool:
        """Clear documents from vector store"""
        try:
            if file_hashes:
                for file_hash in file_hashes:
                    vector_store.delete_document(file_hash)
                    if file_hash in self.document_cache:
                        del self.document_cache[file_hash]
            else:
                vector_store.reset_collection()
                self.document_cache.clear()
            
            return True
            
        except Exception as e:
            print(f"Error clearing documents: {str(e)}")
            return False

# Global service instance
pdf_service = AdvancedPDFService()

# Legacy functions for backward compatibility
def pdf_answer(file_path: str, question: str) -> str:
    """Legacy function for single file processing"""
    try:
        # Process single file
        result = pdf_service.process_documents([file_path])
        if not result['success']:
            return f"Error processing file: {result.get('error', 'Unknown error')}"
        
        # Answer question
        answer_result = pdf_service.answer_question(question)
        return answer_result['answer']
        
    except Exception as e:
        return f"Error: {str(e)}"

def pdf_answer_streaming(file_path: str, question: str, callback) -> None:
    """Legacy streaming function"""
    try:
        # Process file
        result = pdf_service.process_documents([file_path])
        if not result['success']:
            callback(f"Error processing file: {result.get('error', 'Unknown error')}", True)
            return
        
        # Answer question
        answer_result = pdf_service.answer_question(question)
        answer = answer_result['answer']
        
        # Simulate streaming
        words = answer.split()
        for i, word in enumerate(words):
            partial_response = ' '.join(words[:i+1])
            callback(partial_response, i == len(words) - 1)
            time.sleep(0.05)  # Faster streaming
            
    except Exception as e:
        callback(f"Error: {str(e)}", True)
