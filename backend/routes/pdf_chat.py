from flask import Blueprint, request, jsonify
from services.langchain_pdf import pdf_service
import os
import tempfile
from typing import List
import hashlib

pdf_chat = Blueprint('pdf_chat', __name__)

@pdf_chat.route('/api/chat/pdf', methods=['POST'])
def pdf_chat_route():
    """Enhanced PDF chat endpoint with multiple file support and advanced features"""
    file_info = []
    temp_files = []
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files part in the request'}), 400
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        for file in files:
            if file and (file.filename.lower().endswith('.pdf') or file.content_type == 'application/pdf'):
                # Create temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                file.save(temp_file.name)
                temp_files.append(temp_file.name)
                file_info.append({
                    'original_name': file.filename,
                    'temp_path': temp_file.name,
                    'size': os.path.getsize(temp_file.name)
                })
        if not temp_files:
            return jsonify({'error': 'No valid PDF files found'}), 400
        # Process documents
        file_paths = [info['temp_path'] for info in file_info]
        process_result = pdf_service.process_documents(file_paths)
        if process_result['success']:
            return jsonify({
                'success': True,
                'files_processed': process_result['files_processed'],
                'total_pages': process_result['total_pages'],
                'analysis': process_result['analysis'],
                'tables_found': process_result.get('tables_found', 0),
                'images_found': process_result.get('images_found', 0),
                'forms_found': process_result.get('forms_found', 0),
                'annotations_found': process_result.get('annotations_found', 0),
                'message': f"Successfully processed {process_result['files_processed']} PDF files with advanced extraction"
            })
        else:
            return jsonify({'error': process_result['error']}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary files
        for info in file_info:
            try:
                os.unlink(info['temp_path'])
            except Exception:
                pass

@pdf_chat.route('/api/pdf/upload', methods=['POST'])
def upload_pdfs():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        files = request.files.getlist('files')
        if not files or all(file.filename == '' for file in files):
            return jsonify({'error': 'No valid files selected'}), 400
        temp_files = []
        file_info = []
        for file in files:
            if file.filename and file.filename.lower().endswith('.pdf'):
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                file.save(temp_file.name)
                temp_files.append(temp_file.name)
                file_info.append({
                    'original_name': file.filename,
                    'temp_path': temp_file.name,
                    'size': os.path.getsize(temp_file.name)
                })
        if not temp_files:
            return jsonify({'error': 'No valid PDF files found'}), 400
        file_paths = [info['temp_path'] for info in file_info]
        process_result = pdf_service.process_documents(file_paths)
        if process_result['success']:
            return jsonify({
                'success': True,
                'files_processed': process_result['files_processed'],
                'total_pages': process_result['total_pages'],
                'analysis': process_result['analysis'],
                'tables_found': process_result.get('tables_found', 0),
                'images_found': process_result.get('images_found', 0),
                'forms_found': process_result.get('forms_found', 0),
                'annotations_found': process_result.get('annotations_found', 0),
                'message': f"Successfully processed {process_result['files_processed']} PDF files with advanced extraction"
            })
        else:
            return jsonify({'error': process_result['error']}), 500
        # Clean up temporary files
        for info in file_info:
            try:
                os.unlink(info['temp_path'])
            except Exception:
                pass
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/summary/<file_hash>', methods=['GET'])
def get_document_summary(file_hash):
    """Get comprehensive summary of a specific document"""
    try:
        summary = pdf_service.get_document_summary(file_hash)
        if 'error' in summary:
            return jsonify({'error': summary['error']}), 404
        
        return jsonify(summary)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/compare', methods=['POST'])
def compare_documents():
    """Compare two PDF documents"""
    try:
        data = request.get_json()
        if not data or 'file_hash1' not in data or 'file_hash2' not in data:
            return jsonify({'error': 'Two file hashes are required'}), 400
        
        comparison = pdf_service.compare_documents(data['file_hash1'], data['file_hash2'])
        
        if 'error' in comparison:
            return jsonify({'error': comparison['error']}), 404
        
        return jsonify(comparison)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/translate/<file_hash>', methods=['POST'])
def translate_document(file_hash):
    """Translate document content"""
    try:
        data = request.get_json() or {}
        target_language = data.get('target_language', 'es')
        
        translation = pdf_service.translate_document(file_hash, target_language)
        
        if 'error' in translation:
            return jsonify({'error': translation['error']}), 404
        
        return jsonify(translation)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/extract/<file_hash>', methods=['POST'])
def extract_content(file_hash):
    """Extract specific content from document"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        extracted = pdf_service.extract_specific_content(file_hash, data['query'])
        
        if 'error' in extracted:
            return jsonify({'error': extracted['error']}), 404
        
        return jsonify(extracted)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/tables/<file_hash>', methods=['GET'])
def get_document_tables(file_hash):
    """Get all tables from a specific document"""
    try:
        if file_hash not in pdf_service.document_cache:
            return jsonify({'error': 'Document not found'}), 404
        
        tables = pdf_service.document_cache[file_hash].get('tables', [])
        
        return jsonify({
            'file_hash': file_hash,
            'file_name': pdf_service.document_cache[file_hash]['file_name'],
            'tables': tables,
            'count': len(tables)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/forms/<file_hash>', methods=['GET'])
def get_document_forms(file_hash):
    """Get all form fields from a specific document"""
    try:
        if file_hash not in pdf_service.document_cache:
            return jsonify({'error': 'Document not found'}), 404
        
        forms = pdf_service.document_cache[file_hash].get('forms', [])
        
        return jsonify({
            'file_hash': file_hash,
            'file_name': pdf_service.document_cache[file_hash]['file_name'],
            'forms': forms,
            'count': len(forms)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/entities/<file_hash>', methods=['GET'])
def get_document_entities(file_hash):
    """Get named entities from a specific document"""
    try:
        if file_hash not in pdf_service.document_cache:
            return jsonify({'error': 'Document not found'}), 404
        
        # Get document content
        chunks = pdf_service.vector_store.get_document_by_hash(file_hash)
        if not chunks:
            return jsonify({'error': 'Document content not found'}), 404
        
        # Combine chunks
        full_text = " ".join([chunk['document'] for chunk in chunks])
        
        # Extract entities
        from utils.file_parser import pdf_parser
        entities = pdf_parser.extract_named_entities(full_text)
        
        return jsonify({
            'file_hash': file_hash,
            'file_name': pdf_service.document_cache[file_hash]['file_name'],
            'entities': entities
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/search', methods=['POST'])
def search_documents():
    """Search across all uploaded documents"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Search query is required'}), 400
        
        query = data['query']
        file_hashes = data.get('file_hashes', None)
        
        # Use semantic search
        answer_result = pdf_service._handle_semantic_search(query, file_hashes)
        
        return jsonify({
            'query': query,
            'response': answer_result['answer'],
            'sources': answer_result['sources'],
            'confidence': answer_result['confidence'],
            'results_count': answer_result.get('search_results_count', 0)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/summarize', methods=['POST'])
def summarize_documents():
    """Generate summaries for documents"""
    try:
        data = request.get_json()
        if not data or 'file_hashes' not in data:
            return jsonify({'error': 'File hashes are required'}), 400
        
        summary_type = data.get('summary_type', 'executive')
        summaries = []
        
        for file_hash in data['file_hashes']:
            if file_hash in pdf_service.document_cache:
                summary = pdf_service.get_document_summary(file_hash)
                if 'error' not in summary:
                    summaries.append({
                        'file_hash': file_hash,
                        'file_name': summary['file_name'],
                        'summary': summary['summary'],
                        'summary_type': summary_type
                    })
        
        return jsonify({
            'summaries': summaries,
            'count': len(summaries)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/stats', methods=['GET'])
def get_collection_stats():
    """Get comprehensive statistics about the document collection"""
    try:
        stats = pdf_service.get_collection_stats()
        
        # Add advanced statistics
        total_tables = 0
        total_images = 0
        total_forms = 0
        total_annotations = 0
        
        for doc_info in pdf_service.document_cache.values():
            total_tables += len(doc_info.get('tables', []))
            total_images += len(doc_info.get('images', []))
            total_forms += len(doc_info.get('forms', []))
            total_annotations += len(doc_info.get('annotations', []))
        
        stats.update({
            'total_tables': total_tables,
            'total_images': total_images,
            'total_forms': total_forms,
            'total_annotations': total_annotations,
            'documents_with_tables': len([d for d in pdf_service.document_cache.values() if d.get('tables')]),
            'documents_with_images': len([d for d in pdf_service.document_cache.values() if d.get('images')]),
            'documents_with_forms': len([d for d in pdf_service.document_cache.values() if d.get('forms')])
        })
        
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/clear', methods=['POST'])
def clear_documents():
    """Clear documents from the collection"""
    try:
        data = request.get_json() or {}
        file_hashes = data.get('file_hashes', None)  # Optional: specific files to clear
        
        success = pdf_service.clear_documents(file_hashes)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Documents cleared successfully'
            })
        else:
            return jsonify({'error': 'Failed to clear documents'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/voice/query', methods=['POST'])
def voice_query():
    """Handle voice queries (placeholder for future implementation)"""
    try:
        # This would integrate with Whisper for speech-to-text
        # For now, return a placeholder response
        return jsonify({
            'message': 'Voice query feature is coming soon!',
            'status': 'not_implemented'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pdf_chat.route('/api/pdf/voice/response', methods=['POST'])
def voice_response():
    """Convert text response to speech (placeholder for future implementation)"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        # This would integrate with TTS service
        # For now, return a placeholder response
        return jsonify({
            'message': 'Voice response feature is coming soon!',
            'status': 'not_implemented',
            'text_length': len(data['text'])
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def _generate_file_hash(file_path: str) -> str:
    """Generate SHA-256 hash of file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()
