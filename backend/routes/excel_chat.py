from flask import Blueprint, request, jsonify
from services.langchain_excel import excel_bot
import os
import tempfile

excel_chat = Blueprint('excel_chat', __name__)

@excel_chat.route('/api/excel/upload', methods=['POST'])
def upload_excel():
    """Upload Excel file and get comprehensive file information"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'.xlsx', '.xls', '.csv'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Unsupported file type. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Save file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        file.save(temp_file.name)
        
        # Load file with advanced Excel bot
        result = excel_bot.load_excel_file(temp_file.name)
        
        # Clean up temp file
        os.unlink(temp_file.name)
        
        if result['status'] == 'error':
            return jsonify({'error': result['message']}), 500
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/query', methods=['POST'])
def natural_language_query():
    """Advanced natural language query processing"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        sheet_name = data.get('sheet_name', None)
        
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.natural_language_query(query, sheet_name)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Query failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/formula', methods=['POST'])
def generate_formula():
    """Generate Excel formula from natural language"""
    try:
        data = request.get_json()
        request_text = data.get('request', '')
        
        if not request_text:
            return jsonify({'error': 'No formula request provided'}), 400
        
        result = excel_bot.generate_formula(request_text)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Formula generation failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/clean', methods=['POST'])
def clean_data():
    """Clean and transform Excel data"""
    try:
        data = request.get_json()
        operations = data.get('operations', [])
        sheet_name = data.get('sheet_name', None)
        
        if not operations:
            return jsonify({'error': 'No cleaning operations provided'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.clean_data(operations, sheet_name)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Data cleaning failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/chart', methods=['POST'])
def create_chart():
    """Create advanced charts from Excel data"""
    try:
        data = request.get_json()
        chart_type = data.get('chart_type', 'bar')
        x_column = data.get('x_column', '')
        y_column = data.get('y_column', '')
        sheet_name = data.get('sheet_name', None)
        title = data.get('title', None)
        options = data.get('options', {})
        
        if not x_column or not y_column:
            return jsonify({'error': 'X and Y columns are required'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.create_chart(chart_type, x_column, y_column, sheet_name, title, options)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Chart creation failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/pivot', methods=['POST'])
def create_pivot_table():
    """Create pivot tables from Excel data"""
    try:
        data = request.get_json()
        sheet_name = data.get('sheet_name', None)
        index_cols = data.get('index_columns', [])
        value_cols = data.get('value_columns', [])
        agg_func = data.get('aggregation', 'sum')
        filters = data.get('filters', None)
        
        if not index_cols or not value_cols:
            return jsonify({'error': 'Index columns and value columns are required'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.create_pivot_table(sheet_name, index_cols, value_cols, agg_func, filters)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Pivot table creation failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/validate', methods=['POST'])
def validate_data():
    """Validate data against custom rules"""
    try:
        data = request.get_json()
        sheet_name = data.get('sheet_name', None)
        validation_rules = data.get('validation_rules', {})
        
        if not validation_rules:
            return jsonify({'error': 'No validation rules provided'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.validate_data(sheet_name, validation_rules)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Data validation failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/automation', methods=['POST'])
def generate_automation_script():
    """Generate Python/Pandas automation scripts"""
    try:
        data = request.get_json()
        task_description = data.get('task_description', '')
        sheet_name = data.get('sheet_name', None)
        
        if not task_description:
            return jsonify({'error': 'No task description provided'}), 400
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.generate_automation_script(task_description, sheet_name)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Automation script generation failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/export', methods=['POST'])
def export_data():
    """Export Excel data in various formats"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'csv')
        sheet_name = data.get('sheet_name', None)
        filters = data.get('filters', None)
        filename = data.get('filename', None)
        
        # Check if file is loaded
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded. Please upload a file first.'}), 400
        
        result = excel_bot.export_data(format_type, sheet_name, filters, filename)
        
        if 'error' in result:
            return jsonify({'error': result['error']}), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

@excel_chat.route('/api/excel/sheets', methods=['GET'])
def get_sheets():
    """Get list of available sheets with detailed information"""
    try:
        if not excel_bot.sheets:
            return jsonify({'sheets': [], 'message': 'No Excel file loaded'})
        
        sheets_info = {}
        for sheet_name, sheet_info in excel_bot.sheets.items():
            sheets_info[sheet_name] = {
                'shape': sheet_info['shape'],
                'columns': sheet_info['columns'],
                'data_types': sheet_info['dtypes'],
                'analysis': sheet_info['analysis']
            }
        
        return jsonify({
            'sheets': list(excel_bot.sheets.keys()),
            'total_sheets': len(excel_bot.sheets),
            'sheets_info': sheets_info
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get sheets: {str(e)}'}), 500

@excel_chat.route('/api/excel/summary', methods=['GET'])
def get_summary():
    """Get comprehensive summary of Excel data"""
    try:
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded'}), 400
        
        summary = excel_bot._generate_comprehensive_summary()
        return jsonify(summary)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get summary: {str(e)}'}), 500

@excel_chat.route('/api/excel/recommendations', methods=['GET'])
def get_recommendations():
    """Get intelligent recommendations for data improvement"""
    try:
        if not excel_bot.sheets:
            return jsonify({'error': 'No Excel file loaded'}), 400
        
        recommendations = excel_bot._generate_recommendations()
        return jsonify({
            'recommendations': recommendations,
            'total_recommendations': len(recommendations)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get recommendations: {str(e)}'}), 500

@excel_chat.route('/api/excel/charts', methods=['GET'])
def get_charts():
    """Get list of created charts"""
    try:
        if not excel_bot.charts:
            return jsonify({'charts': [], 'message': 'No charts created yet'})
        
        charts_list = []
        for chart_id, chart_info in excel_bot.charts.items():
            charts_list.append({
                'id': chart_id,
                'type': chart_info['data']['chart_type'],
                'x_column': chart_info['data']['x_column'],
                'y_column': chart_info['data']['y_column'],
                'created_at': chart_info['created_at']
            })
        
        return jsonify({
            'charts': charts_list,
            'total_charts': len(charts_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get charts: {str(e)}'}), 500

@excel_chat.route('/api/excel/pivots', methods=['GET'])
def get_pivot_tables():
    """Get list of created pivot tables"""
    try:
        if not excel_bot.pivot_tables:
            return jsonify({'pivot_tables': [], 'message': 'No pivot tables created yet'})
        
        pivots_list = []
        for pivot_id, pivot_info in excel_bot.pivot_tables.items():
            pivots_list.append({
                'id': pivot_id,
                'index_columns': pivot_info['index_columns'],
                'value_columns': pivot_info['value_columns'],
                'aggregation': pivot_info['aggregation'],
                'created_at': pivot_info['created_at']
            })
        
        return jsonify({
            'pivot_tables': pivots_list,
            'total_pivot_tables': len(pivots_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get pivot tables: {str(e)}'}), 500

@excel_chat.route('/api/excel/scripts', methods=['GET'])
def get_automation_scripts():
    """Get list of generated automation scripts"""
    try:
        if not excel_bot.automation_scripts:
            return jsonify({'scripts': [], 'message': 'No automation scripts generated yet'})
        
        scripts_list = []
        for script_id, script_info in excel_bot.automation_scripts.items():
            scripts_list.append({
                'id': script_id,
                'task': script_info['task'],
                'sheet_name': script_info['sheet_name'],
                'created_at': script_info['created_at']
            })
        
        return jsonify({
            'scripts': scripts_list,
            'total_scripts': len(scripts_list)
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get automation scripts: {str(e)}'}), 500

@excel_chat.route('/api/excel/chat', methods=['POST'])
def chat_excel():
    """Legacy chat endpoint for backward compatibility"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        question = request.form.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Save file temporarily
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        file.save(temp_file.name)
        
        # Get response from Excel bot
        response = excel_bot.excel_answer(temp_file.name, question)
        
        # Clean up temp file
        os.unlink(temp_file.name)
        
        return jsonify({
            'response': response,
            'bot_type': 'excel'
        })
        
    except Exception as e:
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500
