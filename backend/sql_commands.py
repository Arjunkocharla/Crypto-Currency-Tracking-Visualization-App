# the below code is written by Nagarjuna Kocharla (Me), sql commands 2 of them used in server.py

get_transactions = f"SELECT * FROM transactions where status!='delete'"
get_detail_coinwise = f"SELECT  symbol,type, SUM(value_usd)/100 as total_value,SUM(coins) as total_coins FROM transactions where status!='delete' GROUP BY symbol, type"



