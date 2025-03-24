import paho.mqtt.client as mqtt
import matplotlib.pyplot as plt
import numpy as np
import scipy as sp
import time
import json

f_sig = 60e-6 #frequency in revolutions per microsecond
ts = 1000 # approx 100us between samples

t_vals = np.arange(0, 40*ts, ts)
phase1_vals = (1500*np.sin(2*np.pi*f_sig*(t_vals-ts)-0*(np.pi/180))).astype(int) + 2048
phase2_vals = (1250*np.sin(2*np.pi*f_sig*(t_vals-ts)-120*(np.pi/180))).astype(int) + 2048
phase3_vals = (1000*np.sin(2*np.pi*f_sig*(t_vals-ts)-240*(np.pi/180))).astype(int) + 2048
neutral_vals = (150*np.sin(2*np.pi*f_sig*(t_vals-ts)-0*(np.pi/180))).astype(int) + 2048


sig = np.array([t_vals, phase1_vals, phase2_vals, phase3_vals, neutral_vals]).T
sig = np.vectorize(hex)(sig)
sig = np.array([[datapoint.replace('0x', '') for datapoint in row] for row in sig])
csv_data = '\n'.join([','.join(row) for row in sig])

json_data = {
    "origin_id": 11,
    "time": 0,
    "data": {
        "phase1": 4000000,
        "phase2": 2500000,
        "phase3": 1200000,
        "neutral": 250000
    }
}

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "simSensor11to18")
mqtt_client.username_pw_set("admin", "1234")
mqtt_client.connect("localhost", 1883)
mqtt_client.loop_start()
while True:
    for i in range (1, 9):
        json_data["time"] = int(time.time()*1000.0)
        json_data["origin_id"] = 10 + i
        json_data["data"]["phase1"] = 4000000 + np.random.normal(0, 10000, 1)[0]
        json_data["data"]["phase2"] = 2500000 + np.random.normal(0, 10000, 1)[0]
        json_data["data"]["phase3"] = 1200000 + np.random.normal(0, 10000, 1)[0]
        json_data["data"]["neutral"] = 250000 + np.random.normal(0, 10000, 1)[0]
        mqtt_client.publish("sensor_data/processed", json.dumps(json_data))
        mqtt_client.publish("sensor_data/raw", hex(10+i).replace('0x', '') + "\n" + csv_data)
    time.sleep(3)