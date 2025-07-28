from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
import os
from dotenv import load_dotenv
import tempfile
import asyncio
import threading
import time
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

from routes.general_bot import general_bp
from routes.qa_chat import qa_chat
from routes.pdf_chat import pdf_chat
from routes.excel_chat import excel_chat
from routes.langchain_notebook import notebook_chat
from routes.llama_chat import llama_bp

# Import bot services
from services.langchain_qa import qa_answer
from services.langchain_pdf import pdf_answer
from services.langchain_excel import excel_answer
from services.langchain_notebook import notebook_answer
from services.general_service import general_answer

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app)
# Change async_mode from 'threading' to 'eventlet'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Register blueprints
app.register_blueprint(general_bp)
app.register_blueprint(qa_chat)
app.register_blueprint(pdf_chat)
app.register_blueprint(excel_chat)
app.register_blueprint(notebook_chat)
app.register_blueprint(llama_bp)

def stream_response(socketio, bot_type, response_text, session_id):
    """Stream response text word by word with realistic timing"""
    try:
        words = response_text.split()
        accumulated_text = ""
        
        for i, word in enumerate(words):
            accumulated_text += word + " "
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': accumulated_text.strip(),
                'bot_type': bot_type,
                'is_complete': i == len(words) - 1
            }, room=session_id)
            
            # Variable timing based on word length and punctuation
            if word.endswith(('.', '!', '?')):
                time.sleep(0.3)  # Pause after sentences
            elif word.endswith(','):
                time.sleep(0.15)  # Pause after commas
            else:
                time.sleep(0.08)  # Normal word timing
                
    except Exception as e:
        socketio.emit('stream_response', {
            'role': 'bot',
            'content': f'Error during streaming: {str(e)}',
            'bot_type': bot_type,
            'is_complete': True
        }, room=session_id)

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('send_message')
def handle_message(data):
    bot_type = data.get('bot_type', 'general')
    message = data.get('message', '')
    file_data = data.get('file', None)
    session_id = request.sid
    
    # Emit user message immediately
    emit('message_received', {
        'role': 'user',
        'content': message,
        'bot_type': bot_type
    }, room=session_id)
    
    def process_message():
        try:
            # Route to appropriate bot service based on bot_type
            if bot_type == 'qa':
                response = qa_answer(message)
                stream_response(socketio, bot_type, response, session_id)
                
            elif bot_type == 'pdf':
                if not file_data:
                    socketio.emit('stream_response', {
                        'role': 'bot',
                        'content': 'Please upload a PDF file first.',
                        'bot_type': bot_type,
                        'is_complete': True
                    }, room=session_id)
                    return
                
                # Handle file upload for PDF
                file_path = os.path.join(tempfile.gettempdir(), file_data['name'])
                try:
                    with open(file_path, 'wb') as f:
                        f.write(file_data['data'])
                    response = pdf_answer(file_path, message)
                    stream_response(socketio, bot_type, response, session_id)
                finally:
                    # Clean up temp file
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            elif bot_type == 'excel':
                if not file_data:
                    socketio.emit('stream_response', {
                        'role': 'bot',
                        'content': 'Please upload an Excel file first.',
                        'bot_type': bot_type,
                        'is_complete': True
                    }, room=session_id)
                    return
                
                # Handle file upload for Excel
                file_path = os.path.join(tempfile.gettempdir(), file_data['name'])
                try:
                    with open(file_path, 'wb') as f:
                        f.write(file_data['data'])
                    response = excel_answer(file_path, message)
                    stream_response(socketio, bot_type, response, session_id)
                finally:
                    # Clean up temp file
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            elif bot_type == 'notebook':
                if not file_data:
                    socketio.emit('stream_response', {
                        'role': 'bot',
                        'content': 'Please upload a Notebook file first.',
                        'bot_type': bot_type,
                        'is_complete': True
                    }, room=session_id)
                    return
                
                # Handle file upload for Notebook
                file_path = os.path.join(tempfile.gettempdir(), file_data['name'])
                try:
                    with open(file_path, 'wb') as f:
                        f.write(file_data['data'])
                    response = notebook_answer(file_path, message)
                    stream_response(socketio, bot_type, response, session_id)
                finally:
                    # Clean up temp file
                    if os.path.exists(file_path):
                        os.remove(file_path)
                        
            else:  # general bot
                response = general_answer(message)
                stream_response(socketio, bot_type, response, session_id)
                
        except Exception as e:
            # Emit error response
            error_message = f"I apologize, but I encountered an error while processing your request: {str(e)}. Please try again or rephrase your question."
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': error_message,
                'bot_type': bot_type,
                'is_complete': True
            }, room=session_id)
    
    # Run the message processing in a separate thread to avoid blocking
    thread = threading.Thread(target=process_message)
    thread.daemon = True
    thread.start()

@socketio.on('excel_analytics')
def handle_excel_analytics(data):
    session_id = request.sid
    sheet_name = data.get('sheet_name')
    analysis_type = data.get('analysis_type', 'comprehensive')

    def process_analytics():
        try:
            from services.langchain_excel import excel_bot
            # Stream start
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': 'Starting analytics...',
                'bot_type': 'excel',
                'is_complete': False
            }, room=session_id)
            result = excel_bot.generate_advanced_analytics(sheet_name, analysis_type)
            if 'error' in result:
                socketio.emit('stream_response', {
                    'role': 'bot',
                    'content': f"Error: {result['error']}",
                    'bot_type': 'excel',
                    'is_complete': True
                }, room=session_id)
                return
            # Stream each analytics section
            analytics = result.get('analytics', {})
            for key, value in analytics.items():
                socketio.emit('stream_response', {
                    'role': 'bot',
                    'content': f"{key.replace('_', ' ').title()}: {str(value)[:1000]}",
                    'bot_type': 'excel',
                    'is_complete': False
                }, room=session_id)
                time.sleep(0.2)
            # Stream completion
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': 'Analytics complete.',
                'bot_type': 'excel',
                'is_complete': True
            }, room=session_id)
        except Exception as e:
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': f'Error during analytics streaming: {str(e)}',
                'bot_type': 'excel',
                'is_complete': True
            }, room=session_id)
    thread = threading.Thread(target=process_analytics)
    thread.daemon = True
    thread.start()

@socketio.on('excel_cleaning')
def handle_excel_cleaning(data):
    session_id = request.sid
    operations = data.get('operations', [])
    sheet_name = data.get('sheet_name')

    def process_cleaning():
        try:
            from services.langchain_excel import excel_bot
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': 'Starting data cleaning...',
                'bot_type': 'excel',
                'is_complete': False
            }, room=session_id)
            result = excel_bot.clean_data(operations, sheet_name)
            if 'error' in result:
                socketio.emit('stream_response', {
                    'role': 'bot',
                    'content': f"Error: {result['error']}",
                    'bot_type': 'excel',
                    'is_complete': True
                }, room=session_id)
                return
            # Stream each operation performed
            report = result.get('cleaning_report', {})
            for op in report.get('operations_performed', []):
                socketio.emit('stream_response', {
                    'role': 'bot',
                    'content': f"Performed: {op}",
                    'bot_type': 'excel',
                    'is_complete': False
                }, room=session_id)
                time.sleep(0.2)
            # Stream summary
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': result.get('summary', 'Cleaning complete.'),
                'bot_type': 'excel',
                'is_complete': True
            }, room=session_id)
        except Exception as e:
            socketio.emit('stream_response', {
                'role': 'bot',
                'content': f'Error during cleaning streaming: {str(e)}',
                'bot_type': 'excel',
                'is_complete': True
            }, room=session_id)
    thread = threading.Thread(target=process_cleaning)
    thread.daemon = True
    thread.start()

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
