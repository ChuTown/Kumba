
import os
import requests
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow requests from your React app

RPC_URL = os.getenv(
    "QUICKNODE_ENDPOINT",
    "https://blissful-compatible-mound.solana-mainnet.quiknode.pro/6ae20ef0b830bd6c8e439340e2537ae264e6ddb0/"
)

WALLET_ADDRESS = "CbuwfqfVsb3srTGfWseVDqepBHDmDcGXxxCmKZZcsmco"

#below are API endpoints
@app.route('/api/hello')
def hello():
    return 'hello backend', 200

@app.route('/api/wallet_balance', methods=['GET'])
def wallet_balance():
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [WALLET_ADDRESS]
    }
    try:
        resp = requests.post(RPC_URL, json=payload)
        resp.raise_for_status()
        lamports = resp.json()["result"]["value"]
        return jsonify({
            "lamports": lamports,
            "sol": lamports / 1e9
        }), 200

    except requests.RequestException as e:
        return jsonify(error="RPC request failed", details=str(e)), 502
    except KeyError:
        return jsonify(error="Unexpected RPC response"), 500

if __name__ == '__main__':
    # Runs on http://localhost:5000
    app.run(port=5000, debug=True)
