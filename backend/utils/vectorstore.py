import os
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import json
import hashlib
from datetime import datetime
import numpy as np

class VectorStore:
    """Advanced vector store with ChromaDB for semantic search"""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        self.collection_name = "pdf_documents"
        self.collection = self._get_or_create_collection()
    
    def _get_or_create_collection(self):
        """Get existing collection or create new one"""
        try:
            collection = self.client.get_collection(name=self.collection_name)
        except:
            collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"description": "PDF documents for semantic search"}
            )
        return collection
    
    def add_documents(self, documents: List[Dict[str, Any]], chunk_size: int = 1000, overlap: int = 200):
        """
        Add documents to vector store with chunking
        """
        all_chunks = []
        all_metadatas = []
        all_ids = []
        
        for doc in documents:
            chunks = self._chunk_text(doc['text_content'], chunk_size, overlap)
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc['file_hash']}_{i}"
                all_ids.append(chunk_id)
                
                metadata = {
                    'file_name': doc['file_name'],
                    'file_path': doc['file_path'],
                    'file_hash': doc['file_hash'],
                    'chunk_index': i,
                    'total_chunks': len(chunks),
                    'chunk_size': len(chunk),
                    'page_info': doc.get('pages_info', []),
                    'metadata': doc.get('metadata', {}),
                    'analysis': doc.get('analysis', {}),
                    'upload_timestamp': datetime.now().isoformat()
                }
                all_metadatas.append(metadata)
                all_chunks.append(chunk)
        
        # Add to collection in batches
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch_ids = all_ids[i:i + batch_size]
            batch_chunks = all_chunks[i:i + batch_size]
            batch_metadatas = all_metadatas[i:i + batch_size]
            
            self.collection.add(
                ids=batch_ids,
                documents=batch_chunks,
                metadatas=batch_metadatas
            )
        
        return len(all_chunks)
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """
        Split text into overlapping chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundaries
            if end < len(text):
                # Look for sentence endings
                for i in range(end, max(start + chunk_size - 100, start), -1):
                    if text[i] in '.!?':
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
    
    def search(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Search for relevant documents
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_metadata
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    result = {
                        'document': doc,
                        'metadata': results['metadatas'][0][i],
                        'distance': results['distances'][0][i] if results['distances'] else None,
                        'id': results['ids'][0][i]
                    }
                    formatted_results.append(result)
            
            return formatted_results
            
        except Exception as e:
            print(f"Error in vector search: {str(e)}")
            return []
    
    def get_document_by_hash(self, file_hash: str) -> List[Dict[str, Any]]:
        """
        Retrieve all chunks for a specific document
        """
        try:
            results = self.collection.get(
                where={"file_hash": file_hash}
            )
            
            formatted_results = []
            for i, doc in enumerate(results['documents']):
                result = {
                    'document': doc,
                    'metadata': results['metadatas'][i],
                    'id': results['ids'][i]
                }
                formatted_results.append(result)
            
            return formatted_results
            
        except Exception as e:
            print(f"Error retrieving document by hash: {str(e)}")
            return []
    
    def delete_document(self, file_hash: str) -> bool:
        """
        Delete all chunks for a specific document
        """
        try:
            self.collection.delete(
                where={"file_hash": file_hash}
            )
            return True
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the collection
        """
        try:
            count = self.collection.count()
            
            # Get sample documents for analysis
            sample_results = self.collection.get(limit=100)
            
            unique_files = set()
            total_chunks = 0
            
            if sample_results['metadatas']:
                for metadata in sample_results['metadatas']:
                    unique_files.add(metadata.get('file_hash', ''))
                    total_chunks += 1
            
            return {
                'total_documents': count,
                'unique_files': len(unique_files),
                'estimated_total_chunks': total_chunks,
                'collection_name': self.collection_name,
                'persist_directory': self.persist_directory
            }
            
        except Exception as e:
            print(f"Error getting collection stats: {str(e)}")
            return {}
    
    def reset_collection(self) -> bool:
        """
        Reset the entire collection
        """
        try:
            self.client.delete_collection(name=self.collection_name)
            self.collection = self._get_or_create_collection()
            return True
        except Exception as e:
            print(f"Error resetting collection: {str(e)}")
            return False

# Global vector store instance
vector_store = VectorStore()
