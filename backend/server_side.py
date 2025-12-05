# server_side.py

from crypt import methods
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime
from transactions import add_transaction, get_transactions, get_coin_wise_details
from collections import defaultdict
import requests

#from transactions import get_coin_wise_details

price_url = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd"

# Initialize Flask app
app = Flask(__name__)

# Initialize Firestore DB
cred = credentials.Certificate('crypto-db-2bcc5-firebase-adminsdk-4crdo-049faa4ca2.json')
firebase_admin.initialize_app(cred)
symbol_coin_mapping = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "XRP": "ripple",
        "LTC": "litecoin",
        "BCH": "bitcoin-cash",
        "EOS": "eos",
        "XLM": "stellar",
        "ADA": "cardano",
        "SOL": "solana"

    }

db = firestore.client()

@app.route('/add_transaction', methods=['POST'])
def handle_add_transaction():
    data = request.json
    
    # Call the add_transaction function from transactions.py
    result, status_code = add_transaction(db, data)
    
    return result, status_code

@app.route('/get_transactions', methods=['GET'])
def get_transactions_api():
    transactions, status_code = get_transactions(db)
    return jsonify(transactions), status_code

@app.route("/get_details_coinwise", methods=['GET'])
def get_details_coinwise():
    collection = get_coin_wise_details(db)

    get_response = []
    for symbol in collection:
        response = requests.get(f"{price_url}&ids={symbol_coin_mapping.get(symbol, '')}").json()
        live_price = response.get(symbol_coin_mapping.get(symbol, ''), {}).get('usd', 0)

        collection[symbol]['live_price'] = live_price
        collection[symbol]['total_equity'] = collection[symbol]['coins'] * live_price

        get_response.append({
            "symbol": symbol,
            "coins": collection[symbol]["coins"],
            "total_value": collection[symbol]["total_value"],
            "total_equity": collection[symbol]["total_equity"],
            "live_price": live_price
        })

    return jsonify(get_response)

if __name__ == '__main__':
    app.run(debug=True, port=8085)
