#!/usr/bin/env python3
"""
Test script for the Premium PDF Bot
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from utils.file_parser import pdf_parser
        print("✅ PDF Parser imported successfully")
    except ImportError as e:
        print(f"❌ PDF Parser import failed: {e}")
        return False
    
    try:
        from utils.vectorstore import vector_store
        print("✅ Vector Store imported successfully")
    except ImportError as e:
        print(f"❌ Vector Store import failed: {e}")
        return False
    
    try:
        from services.langchain_pdf import pdf_service
        print("✅ PDF Service imported successfully")
    except ImportError as e:
        print(f"❌ PDF Service import failed: {e}")
        return False
    
    return True

def test_pdf_parser():
    """Test PDF parser functionality"""
    print("\nTesting PDF Parser...")
    
    try:
        from utils.file_parser import pdf_parser
        
        # Test content analysis
        test_text = "This is a test document with some content. It has multiple sentences and should be analyzed properly."
        analysis = pdf_parser.analyze_content(test_text)
        
        print(f"✅ Content analysis successful")
        print(f"   - Word count: {analysis['word_count']}")
        print(f"   - Character count: {analysis['character_count']}")
        print(f"   - Content type: {analysis['content_type']}")
        
        return True
    except Exception as e:
        print(f"❌ PDF Parser test failed: {e}")
        return False

def test_vector_store():
    """Test vector store functionality"""
    print("\nTesting Vector Store...")
    
    try:
        from utils.vectorstore import vector_store
        
        # Test collection stats
        stats = vector_store.get_collection_stats()
        print(f"✅ Vector store stats retrieved")
        print(f"   - Collection name: {stats.get('collection_name', 'N/A')}")
        print(f"   - Total documents: {stats.get('total_documents', 0)}")
        
        return True
    except Exception as e:
        print(f"❌ Vector Store test failed: {e}")
        return False

def test_pdf_service():
    """Test PDF service functionality"""
    print("\nTesting PDF Service...")
    
    try:
        from services.langchain_pdf import pdf_service
        
        # Test service initialization
        print(f"✅ PDF Service initialized")
        print(f"   - Gemini API available: {bool(pdf_service.api_key)}")
        print(f"   - PaLM API available: {bool(pdf_service.palm_api_key)}")
        
        # Test fallback answer generation
        test_question = "What is this document about?"
        test_context = "This document discusses artificial intelligence and machine learning concepts."
        
        answer = pdf_service._generate_fallback_answer(test_question, test_context)
        print(f"✅ Fallback answer generation successful")
        print(f"   - Answer length: {len(answer)} characters")
        
        return True
    except Exception as e:
        print(f"❌ PDF Service test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Premium PDF Bot - System Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_pdf_parser,
        test_vector_store,
        test_pdf_service
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The PDF Bot is ready to use.")
        print("\nNext steps:")
        print("1. Set up your Google AI API keys in .env file")
        print("2. Start the Flask server: python app.py")
        print("3. Start the React frontend: npm start")
    else:
        print("⚠️  Some tests failed. Please check the error messages above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 