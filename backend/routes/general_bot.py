from flask import Blueprint, request, jsonify
from services.general_service import general_answer

general_bp = Blueprint('general_bot', __name__)

@general_bp.route('/api/chat/general', methods=['POST'])
def general_chat():
    data = request.get_json()
    message = data.get('message')
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    try:
        response = general_answer(message)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500