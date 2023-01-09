## The Below Code was developed by Nagarjuna Kocharla (Me) , the code contains API endpoints to get transactions,
## post transactions, delete transactions, get total value of coins, get total coins, get total value of coins and get total value of coins.

## the code is written in python using flask API and endpoints were tested using Insomnia API testing tool. In the process of developing the code,
## i had to use stackoverflow, w3schools, geeksforgeeks, python documentation, flask documentation, postgresql documentation, psycopg2 documentation for error resolution.
## I am i the process of writing another endpoint to forecast the price of a crypto like bitcoin to the future, the model has been developed
## by my team mate Sahithi Nallani using LSTM
## The endpoints from this code will be used by My Other team mate Niharika Chundury to develop the frontend of the application using React JS

## Update: I added another API endpoint called get_predictions, from the model developed by Sahithi Nallani, and the data from the endpoint is fed to the frontend code.
## Path: Kocharla_Nagarjuna_IWS1_Project_Folder\backend\server.py


import json
from collections import defaultdict
from datetime import datetime

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import yfinance as yf
import pickle

import requests
from backend_logic import buy, convert_entry_to_transaction, sell
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from psycopg2 import pool
# from sql_commands import get_transactions, get_detail_coinwise;


price_url = "https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd"

#postgreSQL_pool = pool.SimpleConnectionPool(
 #   1,300,database="cryptodb", user="docker", password="docker", host="127.0.0.1")
postgreSQL_pool = pool.SimpleConnectionPool(
    1,600,database="postgres", user="docker", password="docker1234", host="cryptodb.cb0o6zu61rpk.us-east-1.rds.amazonaws.com")




app = Flask(__name__)
cors = CORS(app)

app.config['postgreSQL_pool'] = postgreSQL_pool

@app.route("/")
def health_check():
    return "DataBase is up and running!!"

@app.route("/transactions")

@cross_origin()

def get_transaction():
    
    cur = postgreSQL_pool.getconn().cursor()

    cur.execute(f"select * from transactions where status!='delete' order by date desc limit 15")
    
    entry = cur.fetchall()
    cur.close()
    

    transactions = defaultdict(list)
    for item in entry:
        transactions[item[1]].append(convert_entry_to_transaction(item))

    return jsonify(transactions)

@app.route("/get_details_coinwise")
def get_details_coinwise():
    collection = defaultdict(
        lambda:{
        "coins": 0, "total_value": 0, "total_equity": 0, "live_price": 0
}
    )
    conn = postgreSQL_pool.getconn()
    cur = conn.cursor()
    cur.execute(f"SELECT  symbol,type, SUM(value_usd)/100 as total_value,SUM(coins) as total_coins FROM transactions where status!='delete' GROUP BY symbol, type")
    entry = cur.fetchall()
    
    for entry in entry:
        coin = entry[0]
        transaction_type = entry[1]
        transaction_value = entry[2]
        transaction_coins = entry[3]

        if transaction_type == "buy":
            collection[coin]["coins"] += transaction_coins
            collection[coin]["total_value"] += transaction_value

        elif transaction_type == "sell":
            if transaction_coins>=collection[coin]["coins"]:
                collection[coin]["coins"] -= transaction_coins
                collection[coin]["total_value"] -= transaction_value
        

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

    get_response = []
    for symbol in collection:
        response = requests.get(f"{price_url}&ids={symbol_coin_mapping[symbol]}").json()

        live_price = response[symbol_coin_mapping[symbol]]['usd']

        collection[symbol]['live_price'] = live_price
        collection[symbol]['total_equity'] = float(
            collection[symbol]['coins']) * live_price

        get_response.append(
            {
                "symbol": symbol,
                "coins": collection[symbol]["coins"],
                "total_value": collection[symbol]["total_value"],
                  "total_equity": collection[symbol]["total_equity"],
                 "live_price": live_price
                
            }
        )
    return jsonify(get_response)


def total_coins_value(symbol):

    coin_dict = {"coins": 0, "total_value": 0}
    
    conn = postgreSQL_pool.getconn()
    cur = conn.cursor()
    cur.execute(f"SELECT  type, SUM(value_usd) as total_value,SUM(coins) as total_coins FROM transactions where status!='delete' and symbol='{symbol}' GROUP BY symbol, type")
   
    entry = cur.fetchall()
    for entry in entry:
        
        transaction_type = entry[0]
        transaction_value = entry[1]
        transaction_coins = entry[2]

        if transaction_type == "buy":
            coin_dict["coins"] += transaction_coins
            coin_dict["total_value"] += transaction_value

        elif transaction_type == "sell":
            if transaction_coins>=coin_dict["coins"]:
                coin_dict["coins"] -= transaction_coins
                coin_dict["total_value"] -= transaction_value
    conn.close()       
    return coin_dict

    
@app.route("/transactions", methods=["POST"])
def add_transaction():
    name = request.json["name"]
    symbol = request.json["symbol"]
    type = request.json["type"]
    value_usd = float(request.json["value_usd"])
    purchased_price = float(request.json["purchased_price"])
    date = datetime.strptime(request.json["date"], "%Y-%m-%d-%H:%M")
    coins = float(request.json["coins"])
    conn = postgreSQL_pool.getconn()
    cur = conn.cursor()
    
    coin_details = total_coins_value(symbol)
    if type == "sell":
        if coin_details["total_value"]>=value_usd:
            cur.execute(f"INSERT INTO transactions (name,symbol,type,value_usd,purchased_price,date,coins) VALUES ('{name}','{symbol}','{type}',{value_usd},{purchased_price},'{date}',{coins})")
            conn.commit()
            return jsonify(request.json)

        else:
            return "You cannot sell more than you have"

    elif type=="buy":
        add_transaction = f"INSERT INTO transactions (name, symbol,type, value_usd, purchased_price, date, coins) VALUES ('{name}', '{symbol}' , '{type}', {value_usd}, {purchased_price}, '{date}', {coins}) RETURNING *"
        cur.execute(add_transaction)
    
        conn.commit()
        conn.close()
        return jsonify(request.json)
        
        
    else:
        conn.close()
        return "Invalid transaction type, please enter buy or sell"

@app.route("/transactions", methods=["DELETE"])
def delete_transaction():
    id = request.json["id"]
    conn = postgreSQL_pool.getconn()
    cur = conn.cursor()
    delete_transaction = f"Update transactions set status='delete' where id={id}"
    cur.execute(delete_transaction)
    update_seq = f"ALTER SEQUENCE transactions_id_seq RESTART;"
    cur.execute(update_seq)
    reset_seq = f"UPDATE transactions SET id = DEFAULT;"
    cur.execute(reset_seq)
    conn.commit()
    conn.close()
    return jsonify(request.json)

@app.route("/prediction", methods=["GET"])
def get_prediction():
    

    model = pickle.load(open('model.pkl','rb'))
    from datetime import datetime

    from datetime import timedelta



    from sklearn.preprocessing import MinMaxScaler




    start = datetime(2022,5,5)
    en = datetime.now().date()
    td = timedelta(days=50)
    end = en + td
    end = en.strftime('%Y-%m-%d')


    



  
    



    symbol ='BTC-USD'
    df = yf.download(symbol,start=start,end=end)



    
    data = df.copy()

    data_test = data.drop(['Adj Close'], axis = 1)
    data_test.index = pd.to_datetime(data_test.index)

    scaler = MinMaxScaler()
    data_test = scaler.fit_transform(data_test)

    X_test = []
    Y_test = []

    for i in range(100, data_test.shape[0]):
        X_test.append(data_test[i-100:i])
        Y_test.append(data_test[i,0])

    X_test, Y_test = np.array(X_test), np.array(Y_test)


    Y_pred = model.predict(X_test) 

    print(Y_pred)
    print(len(Y_pred))
    import matplotlib.dates as mdates

    scale = 1/1.48427770e-05
    X_test = X_test*scale
    Y_pred = Y_pred*scale
    print(Y_pred)

    plt.figure(figsize=(20,5))

   
    
    plt.plot(Y_pred, color = 'green', label = 'Bitcoin Price Forecasting')
    plt.title('Bitcoin Potential Market Outlook using RNN-LSTM')
    plt.xlabel('Time/Days (May 2022 - March 2023)')
    plt.ylabel('Forcasted Price')
    
    plt.legend()
    plt.savefig("../frontend/src/components/Prediction.png")
    plt.show()
    

    
    return jsonify(Y_pred.tolist())


app.run(debug=True, port=5000)