import { useState } from 'react';
import { OPERATORS, BUTTON_LAYOUT, API_URL } from './configuration';
import './App.css';

export default function App() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);

  const handleNumber = (number) => {
    const newExpression = expression + number;
    setExpression(newExpression);
    setDisplay(newExpression);
    setError(null);
  };

  const handleOperator = (op) => {
    if (!expression) return;
    
    const lastChar = expression.slice(-1);
    if (OPERATORS.includes(lastChar)) {
      const newExpression = expression.slice(0, -1) + op;
      setExpression(newExpression);
      setDisplay(newExpression);
    } else {
      const newExpression = expression + op;
      setExpression(newExpression);
      setDisplay(newExpression);
    }
    setError(null);
  };

  const handleParenthesis = (paren) => {
    setExpression(prev => prev + paren);
    setDisplay(prev => prev + paren);
    setError(null);
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setTree(null);
    setError(null);
  };

  const handleApiCall = async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error en la operación');
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const validateExpression = async () => {
    const data = await handleApiCall('/validate');
    if (data) {
      setDisplay(`${expression} = ${data.result}`);
    }
  };

  const fetchTree = async () => {
    const data = await handleApiCall('/generate-tree');
    if (data) {
      setTree(data.tree);
    }
  };

  const handleButtonClick = (value) => {
    switch (value) {
      case 'C': return clear();
      case '=': return validateExpression();
      case 'Tree': return fetchTree();
      case '(': 
      case ')': return handleParenthesis(value);
      case '+':
      case '-':
      case '*':
      case '/': return handleOperator(value);
      default: return handleNumber(value);
    }
  };

  const renderTree = (node) => {
    if (!node) return null;

    return (
      <div className="node">
        <div className="node-content">{node.value}</div>
        <div className="node-children">
          {node.children.map((child, index) => (
            <div key={index}>{renderTree(child)}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <main>
        <div className="calculator">
          <div className="display">{display}</div>
          <div className="keypad">
            {BUTTON_LAYOUT.flat().map((btn, index) => (
              <button 
                key={index}
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </main>
      <section className="tree-container">
        {error && <p className="error">{error}</p>}
        {!error && (tree ? renderTree(tree) : <p>No tree generated</p>)}
      </section>
    </div>
  );
}
