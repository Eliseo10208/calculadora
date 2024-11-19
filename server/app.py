from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

# Helper function to parse expression into a tree
def parse_expression(expr):
    operators = ['+', '-', '*', '/']
    last_operator_index = -1

    for op in operators:
        index = expr.rfind(op)
        if index > last_operator_index:
            last_operator_index = index

    if last_operator_index == -1:
        # No operator found, this is a number or parenthesis
        return {"value": expr, "children": []}

    left = expr[:last_operator_index]
    right = expr[last_operator_index + 1:]
    operator = expr[last_operator_index]

    return {
        "value": operator,
        "children": [parse_expression(left), parse_expression(right)],
    }

@app.route('/validate', methods=['POST'])
def validate_expression():
    try:
        data = request.json
        expression = data.get("expression", "")
        # Validate the expression
        if not re.match(r"^[0-9+\-*/(). ]+$", expression):
            return jsonify({"error": "Invalid expression"}), 400

        # Evaluate the expression
        result = eval(expression)
        return jsonify({"expression": expression, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate-tree', methods=['POST'])
def generate_tree():
    try:
        data = request.json
        expression = data.get("expression", "")

        # Validate the expression
        if not re.match(r"^[0-9+\-*/(). ]+$", expression):
            return jsonify({"error": "Invalid expression"}), 400

        tree = parse_expression(expression)
        return jsonify({"expression": expression, "tree": tree})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
