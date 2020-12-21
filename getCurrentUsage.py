from oligo import Iber # pip3 install oligo
from datetime import datetime
import os

import sqlite3

import multiprocessing
import time
# /root/arduinoRestfulApi
db_filename = '/root/arduinoRestfulApi/readings.db'

def getData():
    connection = Iber()
    connection.login(os.getenv('IB_USER'), os.getenv('IB_PWD'))

    watt = connection.watthourmeter()
    with sqlite3.connect(db_filename) as conn:
        conn.execute("INSERT INTO wattage (day, data) VALUES(datetime('now'),?)", [watt])
        print('Successfull store ' + datetime.now().strftime("%d-%m-%Y, %H:%M:%S"))

if __name__ == '__main__':
    # Start getData as a process
    p = multiprocessing.Process(target=getData, name="getData")
    p.start()

    # Wait 10 seconds
    time.sleep(50)

    # Terminate
    p.terminate()

    # Cleanup
    p.join()