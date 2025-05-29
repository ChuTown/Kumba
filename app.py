
import os
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)  # allow requests from your React app

rpc_url = os.getenv(
    "QUICKNODE_ENDPOINT",
    os.getenv("RPC_URL")
)

WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")

TWITTER_BEARER = os.getenv("TWITTER_BEARER_TOKEN")
TWITTER_USER = os.getenv("TWITTER_USERNAME")

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
        resp = requests.post(rpc_url, json=payload)
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

@app.route('/api/latest_tweets', methods=['GET'])
def latest_tweets():
    #get twitter user ID
    """    
    user_resp = requests.get(
        f"https://api.twitter.com/2/users/by/username/{TWITTER_USER}",
        headers={"Authorization": f"Bearer {TWITTER_BEARER}"}
    )
    if not user_resp.ok:
        return jsonify(error="Could not fetch user"), user_resp.status_code"""

    user_id = "1856393766606692352"

    #get 3 of the latest tweets
    tweets_resp = requests.get(
        f"https://api.twitter.com/2/users/{user_id}/tweets", #once per 15 min
        headers={"Authorization": f"Bearer {TWITTER_BEARER}"},
        params={"max_results": 5, "tweet.fields": "id"}
    )
    if not tweets_resp.ok:
        return jsonify(error="Could not fetch tweets"), tweets_resp.status_code

    tweet_data = tweets_resp.json().get("data", [])

    print(tweet_data)

    #return only tweet IDs
    tweet_ids = [t["id"] for t in tweet_data]
    return jsonify(tweets=tweet_ids), 200

if __name__ == '__main__':
    # Runs on http://localhost:5000
    app.run(port=5000, debug=True)
