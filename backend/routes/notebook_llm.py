from flask import Blueprint, request, jsonify
from services.langchain_notebook import get_notebook_response

notebook_llm_bp = Blueprint("notebook_llm", __name__)

@notebook_llm_bp.route("/notebook", methods=["POST"])
def notebook_chat():
    data = request.get_json()
    cell_input = data.get("cell", "")
    response = get_notebook_response(cell_input)
    return jsonify({"response": response})
