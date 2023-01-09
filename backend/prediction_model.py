## the below code is written by team mate Sahithi Nallani, to predict the price of a crypto bitcoin using LSTM model


# %%

import yfinance as yf



import plotly.graph_objs as go


# %%
import pandas as pd
from datetime import datetime

# %%
start = datetime(2014,9,17)
end =datetime.now().date().isoformat()
symbol ='BTC-USD'


# %%
df = yf.download(symbol,start=start,end=end)

# %%
df.head()

# %%
df.to_csv('coin.csv')

# %%
data = pd.read_csv('coin.csv')
#X = data.iloc[:, :-1].values
#y = data.iloc[:, 1].values
print(df.dtypes)
#print("\n*** DF ***")
data_copy = df.copy()
data_copy.head()
print(data)

# %%


# %%
data_training = data[data['Date']< '2022-12-01'].copy()
data_training
data_training.head()

# %%
data_test = data[data['Date']< '2022-12-01'].copy()
data_test

# %%
training_data = data_training.drop(['Date', 'Adj Close'], axis = 1)
training_data.head()

# %%
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.preprocessing import MinMaxScaler


# %%
#MinMaxScaler is used to normalize the data
scaler = MinMaxScaler()
training_data = scaler.fit_transform(training_data)
training_data

# %%


# %%
X_train = [] 
Y_train = []
training_data.shape[0]
for i in range(100, training_data.shape[0]):
 X_train.append(training_data[i-100:i])
 Y_train.append(training_data[i,0])
X_train, Y_train = np.array(X_train), np.array(Y_train)
#X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 5))
X_train.shape
print(X_train.shape)

# %%
print( X_train.shape, Y_train.shape )

# %%
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout

# %%
model = Sequential() 
model.add(LSTM(units = 50, activation = 'relu', return_sequences = True, input_shape = (X_train.shape[1], 5)))

# %%
model.add(Dropout(0.2)) 
model.add(LSTM(units = 60, activation = 'relu', return_sequences = True))

# %%
model.add(Dropout(0.3)) 
model.add(LSTM(units = 80, activation = 'relu', return_sequences = True))

# %%
model.add(Dropout(0.4)) 
model.add(LSTM(units = 120, activation = 'relu'))
model.add(Dropout(0.5)) 
model.add(Dense(units =1))
model.summary()

# %%
model.compile(optimizer = 'adam', loss = 'mean_squared_error')


# %%
X_train = np.stack(X_train, axis=0) 

# %%
history= model.fit(X_train, Y_train, epochs = 100, batch_size =50, validation_split=0.1)

# %%
loss = history.history['loss']
val_loss = history.history['val_loss']
epochs = range(len(loss))
plt.figure()
plt.plot(epochs, loss, 'b', label='Training loss')
plt.plot(epochs, val_loss, 'r', label='Validation loss')
plt.title("Training and Validation Loss")
plt.legend()
plt.show()

# %%
part_100_days = data_training.tail(100)
df= part_100_days.append(data_test, ignore_index = True)
df = df.drop(['Date', 'Adj Close'], axis = 1)
df.head()

# %%
inputs = scaler.transform(df) 
inputs


# %%
X_test = []
Y_test = []

for i in range(100, inputs.shape[0]):
 X_test.append(inputs[i-100:i])
 Y_test.append(inputs[i,0])

X_test, Y_test = np.array(X_test), np.array(Y_test)
#X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 5))
#print(X_test.shape)

X_test.shape, Y_test.shape

# %%
#regressor=Sequential()

# %%
Y_pred = model.predict(X_test) 
Y_pred, Y_test
scaler.scale_

# %%
scale = 1/5.18164146e-05
Y_test = Y_test*scale 
Y_pred = Y_pred*scale
Y_pred

# %%
Y_test

# %%
plt.figure(figsize=(14,5))
plt.plot(Y_test, color = 'red', label = 'Real Bitcoin Price')
plt.plot(Y_pred, color = 'green', label = 'Predicted Bitcoin Price')
plt.title('Bitcoin Price Prediction using RNN-LSTM')
plt.xlabel('Time')
plt.ylabel('Price')
plt.legend()
plt.show()

# %%
model.save("sahithi")

# %%
import pickle
import requests
import json

# %%
pickle.dump(model, open('model.pkl','wb'))

# %%
model = pickle.load(open('model.pkl','rb'))
print(model.predict(X_test))

# %%
import numpy as np
from flask import Flask, request, jsonify
import pickle

# %%
import numpy as np
from flask import Flask, request, jsonify, render_template
import pickle

# %%
# Import libraries
import numpy as np
from flask import Flask, request, jsonify
import pickle
app = Flask(__name__)
# Load the model
model = pickle.load(open('model.pkl','rb'))
@app.route('/api',methods=['POST'])
def predict():
    # Get the data from the POST request.
    data = request.get_json(force=True)
    # Make prediction using model loaded from disk as per the data.
    prediction = model.predict([[np.array(data['exp'])]])
    # Take the first value of prediction
    output = prediction[0]
    return jsonify(output)
if __name__ == '__main__':
    app.run(port=5000, debug=True)

# %%
import requests
url = 'http://localhost:5000/api'
r = requests.post(url,json={'exp':X_test,})
print(r.json())

# %%



