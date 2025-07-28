from flask import Blueprint, request, jsonify
from services.langchain_qa import qa_answer

qa_chat = Blueprint('qa_chat', __name__)

@qa_chat.route('/api/chat/qa', methods=['POST'])
def qa_chat_route():
    data = request.get_json()
    question = data.get('question')
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    try:
        response = qa_answer(question)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500