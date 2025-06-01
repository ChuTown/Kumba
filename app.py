import os
import requests
import json
import time
import random
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

from solathon.core.instructions import transfer
from solathon import Client, Transaction, PublicKey, Keypair


load_dotenv()
app = Flask(__name__)
CORS(app)  # allow requests from your React app
client = Client("https://api.devnet.solana.com") #client for solathon


rpc_url = os.getenv(
    "QUICKNODE_ENDPOINT",
    os.getenv("RPC_URL_DEV") #"RPC_URL_DEV"
)

WALLET_ADDRESS = os.getenv("WALLET_ADDRESS")

TWITTER_BEARER = os.getenv("TWITTER_BEARER_TOKEN")
TWITTER_USER = os.getenv("TWITTER_USERNAME")

ID_STORE      = 'tweet_ids.txt'
NEXT_ALLOWED  = 'next_allowed.txt'

GOAL_AMOUNT = 1000

EST_FEE = 0.01 #can check if sol balance < goal amount + fee later

organizations = {"Native American Veterans Assistance": "id1", 
                 "The Leukemia & Lymphoma Society": "id2", 
                 "Save the Children®": "id3", 
                 "St. Jude Children’s Research Hospital": "id4"} 

db_config = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME")
}

#below is helper methods
#TODO
def extract_tweet_ids_from_response_data(data):
    tweet_ids = []
    instructions = (
        data
        .get("data", {})
        .get("user", {})
        .get("result", {})
        .get("timeline", {})
        .get("timeline", {})
        .get("instructions", [])
    )
    for instr in instructions:
        if instr.get("type") == "TimelineAddEntries":
            for entry in instr.get("entries", []):
                entry_id = entry.get("entryId", "")
                if entry_id.startswith("tweet-"):
                    tweet_ids.append(entry_id.split("-", 1)[1])
    return tweet_ids

def _read_saved_ids():
    if not os.path.exists(ID_STORE):
        return set()
    with open(ID_STORE, 'r') as f:
        return set(line.strip() for line in f if line.strip())

def _append_new_ids(new_ids):
    with open(ID_STORE, 'a') as f:
        for tid in new_ids:
            f.write(tid + "\n")

def _read_next_allowed_ts():
    if not os.path.exists(NEXT_ALLOWED):
        return 0.0
    try:
        return float(open(NEXT_ALLOWED).read().strip())
    except:
        return 0.0

def _write_next_allowed_ts(ts):
    with open(NEXT_ALLOWED, 'w') as f:
        f.write(str(ts))

#below are API endpoints
@app.route('/api/hello')
def hello():
    return 'hello backend', 200

''' deprecated, old wallet balance endpoint (uses quickNode)
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
'''

@app.route('/api/wallet_balance', methods=['GET'])
def wallet_balance():
    try:
        balance = client.get_balance(WALLET_ADDRESS)
        return jsonify({
            "lamports": balance,
            "sol": balance / 1e9,
            "goalAmount": GOAL_AMOUNT
        }), 200

    except Exception as e:
        return jsonify(error="Failed to fetch wallet balance", details=str(e)), 502


''' deprecated, maybe will use as backup later
@app.route('/api/latest_tweets_twitterAPI', methods=['GET'])
def latest_tweets_twitterAPI():
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
'''

@app.route('/api/latest_tweets_alt', methods=['GET'])
def latest_tweets_alt():
    # Figure out if we're still on cooldown
    now           = time.time()
    next_allowed  = _read_next_allowed_ts()
    if now < next_allowed:
        # Cooldown still active → return the stored IDs
        saved = sorted(_read_saved_ids(), reverse=True)
        print(f"Returning cached IDs")
        return jsonify(tweets=saved), 200

    # Otherwise, hit Twitter
    print(f"Fetching fresh tweets from Twitter")
    raw_url = os.getenv("KUMBA_X_RAW_URL")
    url     = raw_url or os.getenv("KUMBA_X_URL")
    method  = os.getenv("KUMBA_X_METHOD", "get").lower()

    try:
        headers = json.loads(os.getenv("KUMBA_X_HEADERS", "{}"))
        cookies = json.loads(os.getenv("KUMBA_X_COOKIES", "{}"))
        queries = json.loads(os.getenv("KUMBA_X_QUERIES", "{}"))
    except json.JSONDecodeError as e:
        return jsonify(error="Malformed JSON in env", details=str(e)), 500

    params = None if raw_url else queries
    resp   = requests.request(method, url, headers=headers, cookies=cookies, params=params)
    if not resp.ok:
        return jsonify(error="x.com request failed", details=resp.text), resp.status_code

    try:
        data = resp.json()
    except ValueError:
        return jsonify(error="Invalid JSON from x.com"), 502

    tweet_ids = extract_tweet_ids_from_response_data(data)

    # Persist any brand-new IDs
    saved_ids = _read_saved_ids()
    new_ids   = [tid for tid in tweet_ids if tid not in saved_ids]
    if new_ids:
        _append_new_ids(new_ids)

    # Schedule next allowed fetch: now + random 12–22 min (720–1,320 s)
    cooldown = random.randint(12 * 60, 22 * 60)
    _write_next_allowed_ts(now + cooldown)

    return jsonify(tweets=tweet_ids), 200


@app.route('/api/submit_vote', methods=['POST']) #double check code later for security risks
def submit_vote():
    data = request.json
    option_id = data.get('option_id')

    if not option_id:
        return jsonify(error="Missing option_id"), 400

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO votes (option_id) VALUES (%s)", (option_id,))
        conn.commit()
        cursor.close()
        conn.close()
        print(f"Vote submitted for option: {option_id}")
        return jsonify(success=True), 200
    except mysql.connector.Error as err:
        return jsonify(error=str(err)), 500

@app.route('/api/organizations', methods=['GET'])
def get_organizations():
    return jsonify([
        {"id": org_id, "name": name}
        for name, org_id in organizations.items()
    ]), 200

@app.route('/api/vote_counts', methods=['GET'])
def vote_counts():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT option_id, COUNT(*) FROM votes GROUP BY option_id")
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        vote_dicts = [{"id": row[0], "votes": row[1]} for row in results]
        return jsonify(vote_dicts), 200

    except mysql.connector.Error as err:
        return jsonify(error=str(err)), 500

if __name__ == '__main__':
    # Runs on http://localhost:5000
    app.run(port=5000, debug=True)
