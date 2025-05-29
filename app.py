
import os
import requests
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow requests from your React app

@app.route('/api/hello')
def hello():
    return 'hello backend', 200

if __name__ == '__main__':
    # Runs on http://localhost:5000
    app.run(port=5000, debug=True)
