import requests
from datetime import datetime
import os

import sqlite3

import multiprocessing
import time
# /root/arduinoRestfulApi
db_filename = '/root/arduinoRestfulApi/readings.db'

def getData():
    PARAMS = {
        'lat':'40.365390',
        'lon':'-3.883740',
        'units':'metric',
        'appid':'aeef6ff9298280e916db08b8308d26f9',
    } 
    URL = 'http://api.openweathermap.org/data/2.5/weather'
    r = requests.get(url = URL, params = PARAMS) 
    
    # extracting data in json format 
    data = r.json()
    temp = data['main']['temp']
    clouds = data['clouds']['all']
    humidity = data['main']['humidity']
    with sqlite3.connect(db_filename) as conn:
        conn.execute("INSERT INTO weather (day, temp, clouds, humidity) VALUES(datetime('now'),?,?,?)", [temp, clouds, humidity])
        print('Successfull store ' + datetime.now().strftime("%d-%m-%Y, %H:%M:%S"))

if __name__ == '__main__':
    # Start getData as a process
    p = multiprocessing.Process(target=getData, name="getData")
    p.start()

    # Wait 10 seconds
    time.sleep(25)

    # Terminate
    p.terminate()

    # Cleanup
    p.join()