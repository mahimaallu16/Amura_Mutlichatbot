# Advanced PDF Chatbot with Premium Features

A comprehensive PDF chatbot system that supports advanced document analysis, multiple file processing, and premium features for enterprise use.

## 🚀 Core Features

### 1. Document Ingestion and Parsing

- **Multi-PDF Support**: Upload and process multiple PDF files simultaneously
- **Advanced Text Extraction**: Extract structured and unstructured text from any PDF
- **OCR Support**: Automatic OCR for scanned documents using EasyOCR and Tesseract
- **Metadata Extraction**: Extract title, author, creation date, and other document properties
- **Image Extraction**: Identify and extract images from PDF pages
- **Table Detection**: Automatically detect and extract tables with structured data
- **Form Field Extraction**: Extract form fields, checkboxes, and signatures
- **Annotation Processing**: Extract comments, highlights, and annotations

### 2. Advanced Question Answering

- **Natural Language Q&A**: Ask questions in plain English
- **Table Queries**: "What's the total in the balance sheet?" or "Calculate the average sales"
- **Form Analysis**: "Who signed the contract?" or "What are the form field values?"
- **Entity Recognition**: "Who are the people mentioned?" or "What organizations are referenced?"
- **Multi-Document Search**: Search across all uploaded documents simultaneously
- **Source Attribution**: Get specific page and document references for answers
- **Confidence Scoring**: See how confident the AI is in its responses

### 3. Document Analysis and Processing

- **Content Classification**: Automatically classify document types (research, legal, financial, etc.)
- **Section Detection**: Identify headings, sections, and document structure
- **Key Phrase Extraction**: Extract important terms and concepts
- **Named Entity Recognition**: Identify people, organizations, dates, locations, and monetary amounts
- **Document Summarization**: Generate executive, bullet-point, or section-wise summaries

### 4. Advanced Search and Extraction

- **Semantic Search**: Find relevant content using meaning, not just keywords
- **Custom Content Extraction**: Extract specific paragraphs, bullet points, or text spans
- **Page-Specific Queries**: Get content from specific pages or sections
- **Cross-Document Search**: Search across multiple documents simultaneously

### 5. Document Comparison and Analysis

- **Document Comparison**: Compare two PDF files for similarities and differences
- **Change Detection**: Highlight additions, deletions, and modifications
- **Similarity Scoring**: Get quantitative similarity scores between documents
- **Diff Summaries**: Generate summaries of differences between documents

### 6. Translation and Localization

- **Multi-Language Support**: Translate documents to Spanish, French, German, Italian, and more
- **Section Translation**: Translate specific sections or pages
- **Preserve Formatting**: Maintain document structure during translation

### 7. Form and Data Processing

- **Form Field Extraction**: Extract all form fields with their values and types
- **Table Data Analysis**: Perform calculations on table data (sums, averages, etc.)
- **Data Export**: Export tables to CSV, JSON, or Excel formats
- **Structured Data Queries**: Ask questions about specific data in tables

### 8. Voice and Accessibility Features

- **Voice Queries**: Ask questions using voice input (coming soon)
- **Text-to-Speech**: Have responses read aloud (coming soon)
- **Accessibility Support**: Screen reader friendly interface

## 🛠️ Technical Architecture

### Backend Technologies

- **Flask**: Web framework for API endpoints
- **PyMuPDF (fitz)**: Advanced PDF processing and text extraction
- **EasyOCR & Tesseract**: OCR for scanned documents
- **ChromaDB**: Vector database for semantic search
- **Google Gemini & PaLM**: AI models for question answering
- **SpaCy**: Natural language processing and entity recognition
- **Transformers**: Advanced NLP models for text analysis
- **Tabula-py**: Table extraction from PDFs
- **OpenCV & PIL**: Image processing and analysis

### Frontend Technologies

- **React**: Modern UI framework
- **Material-UI**: Professional component library
- **Real-time Chat**: WebSocket-based streaming responses
- **Advanced UI Components**: Tables, accordions, charts, and data visualization

## 📋 Installation and Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- Tesseract OCR (for OCR features)
- Google AI API keys

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export GOOGLE_GEMINI_API_KEY="your_gemini_api_key"
export GOOGLE_PALM_API_KEY="your_palm_api_key"

# Run the backend
python app.py
```

### Frontend Setup

```bash
cd multi-chatbot-frontend
npm install
npm start
```

## 🔧 API Endpoints

### Core Chat Endpoints

- `POST /api/chat/pdf` - Main chat endpoint with file upload and question
- `POST /api/pdf/upload` - Upload and process PDF files
- `GET /api/pdf/stats` - Get collection statistics

### Advanced Feature Endpoints

- `GET /api/pdf/summary/<file_hash>` - Get document summary
- `POST /api/pdf/compare` - Compare two documents
- `POST /api/pdf/translate/<file_hash>` - Translate document
- `POST /api/pdf/extract/<file_hash>` - Extract specific content
- `GET /api/pdf/tables/<file_hash>` - Get all tables from document
- `GET /api/pdf/forms/<file_hash>` - Get all form fields from document
- `GET /api/pdf/entities/<file_hash>` - Get named entities from document
- `POST /api/pdf/search` - Search across documents
- `POST /api/pdf/summarize` - Generate summaries for multiple documents
- `POST /api/pdf/clear` - Clear documents from collection

### Voice Endpoints (Coming Soon)

- `POST /api/pdf/voice/query` - Handle voice queries
- `POST /api/pdf/voice/response` - Convert text to speech

## 💡 Usage Examples

### Basic Usage

1. Upload PDF files using the file upload interface
2. Ask questions about the documents
3. Get AI-powered answers with source references

### Advanced Usage

#### Table Queries

```
"What's the total revenue in the financial report?"
"Calculate the average sales for Q3"
"Show me the balance sheet totals"
```

#### Form Analysis

```
"Who signed the contract?"
"What are the form field values?"
"Extract all signatures from the document"
```

#### Entity Recognition

```
"Who are the people mentioned in the document?"
"What organizations are referenced?"
"What dates are important in this document?"
```

#### Document Comparison

```
"Compare the old and new versions of the contract"
"What changed between these two documents?"
"Show me the differences in the financial reports"
```

#### Content Extraction

```
"Extract all bullet points from the executive summary"
"Get the key findings from the research paper"
"Show me the main conclusions"
```

#### Translation

```
"Translate this document to Spanish"
"Translate only the executive summary to French"
"Convert the technical specifications to German"
```

## 🎯 Advanced Features

### Document Processing Pipeline

1. **File Upload**: Multiple PDF files uploaded simultaneously
2. **Text Extraction**: Advanced parsing with OCR fallback
3. **Content Analysis**: Structure detection and entity recognition
4. **Vector Embedding**: Semantic indexing for search
5. **AI Processing**: LLM-powered question answering
6. **Response Generation**: Contextual answers with sources

### Smart Question Routing

The system automatically routes questions to specialized handlers:

- **Table Queries** → Table analysis and calculations
- **Form Queries** → Form field extraction and analysis
- **Entity Queries** → Named entity recognition and extraction
- **Summary Requests** → Document summarization
- **General Queries** → Semantic search and LLM response

### Real-time Processing

- **Streaming Responses**: Real-time answer generation
- **Progress Indicators**: Upload and processing status
- **Error Handling**: Graceful error recovery and user feedback
- **Caching**: Intelligent caching for improved performance

## 🔒 Security and Privacy

- **Local Processing**: All document processing happens locally
- **Temporary Storage**: Files are processed and then deleted
- **No Data Retention**: Documents are not permanently stored
- **Secure API**: Protected endpoints with proper validation
- **Privacy Compliance**: GDPR and privacy regulation compliant

## 🚀 Performance Features

- **Multi-threading**: Parallel document processing
- **Memory Management**: Efficient memory usage for large documents
- **Caching**: Intelligent caching of processed results
- **Optimization**: Optimized for large document collections
- **Scalability**: Designed to handle enterprise-scale document processing

## 🛠️ Troubleshooting

### Common Issues

#### OCR Not Working

- Install Tesseract OCR: `sudo apt-get install tesseract-ocr`
- Install EasyOCR: `pip install easyocr`
- Check language packs: `tesseract --list-langs`

#### Table Extraction Issues

- Install Java (required for Tabula): `sudo apt-get install default-jre`
- Check tabula-py installation: `pip install tabula-py`
- Verify PDF contains actual tables (not images of tables)

#### Memory Issues

- Process documents in smaller batches
- Increase system memory allocation
- Use document chunking for large files

#### API Key Issues

- Verify Google AI API keys are set correctly
- Check API quotas and billing
- Ensure proper API permissions

### Performance Optimization

- Use SSD storage for better I/O performance
- Allocate sufficient RAM (8GB+ recommended)
- Enable GPU acceleration for AI models
- Use document preprocessing for large collections

## 📈 Future Enhancements

### Planned Features

- **Real-time Collaboration**: Multi-user document analysis
- **Advanced Analytics**: Document insights and trends
- **Custom Models**: Train domain-specific AI models
- **Integration APIs**: Connect with external systems
- **Mobile Support**: Native mobile applications
- **Offline Mode**: Local processing without internet

### Enterprise Features

- **User Management**: Role-based access control
- **Audit Logging**: Complete activity tracking
- **Custom Branding**: White-label solutions
- **API Rate Limiting**: Enterprise-grade API management
- **Backup and Recovery**: Document backup systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Note**: This is a premium PDF chatbot system with enterprise-grade features. For basic PDF chat functionality, see the simplified version in the main branch.
