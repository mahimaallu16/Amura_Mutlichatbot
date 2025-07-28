
import os
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from services.langchain_notebook import notebook_answer

load_dotenv()

def get_qa_response(question):
    llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"), temperature=0)
    response = llm([HumanMessage(content=question)])
    return response.content

notebook_chat = Blueprint('notebook_chat', __name__)

@notebook_chat.route('/api/chat/notebook', methods=['POST'])
def notebook_chat_route():
    data = request.get_json()
    cell = data.get('cell')
    if not cell:
        return jsonify({'error': 'Cell is required'}), 400
    try:
        response = notebook_answer(cell)
        return jsonify({'response': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
