import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np
import paho.mqtt.client as mqtt

#mqtt stuff

# connection function
def on_connect(client, userdata, flags, rc, properties):
    print("Connected with result code "+str(rc))
    client.subscribe("sensor_data/raw")

# message handler
def on_message(client, userdata, msg):

    #python moment lol
    data = np.array([[int(datapoint, 16) for datapoint in line.split(",")] for line in msg.payload.decode("utf-8").strip().split("\n")])
    phase = data[0][1]
    data = data[1:].T

    # center data
    data[1] = data[1] - 2048

    # convert to float
    data = data.astype(float)

    # scale to voltage
    data[1] = data[1] * 3.3 / 4096.0

    # calculate rms
    rms = np.sqrt(np.mean(data[1]**2))

    #find trigger index
    trigger = 0.05 # trigger on rising edge @ 0.05V
    trigger_index = 0
    for i, reading in enumerate(data[1][1:]):
        if reading > trigger and data[1][i-1] < trigger: #check for low to high transition at trigger
            trigger_index = i - 1
            break
    
    #plot data
    time_vals = data[0][trigger_index:] - data[0][trigger_index]
    match phase:
        case 0:
            phase1_line.set_data(time_vals, data[1][trigger_index:])
            phase1_rms_text.set_text(f'Phase 1 RMS: {rms}')
        case 1:
            phase2_line.set_data(time_vals, data[1][trigger_index:])
            phase2_rms_text.set_text(f'Phase 2 RMS: {rms}')
        case 2:
            phase3_line.set_data(time_vals, data[1][trigger_index:])
            phase3_rms_text.set_text(f'Phase 3 RMS: {rms}')
        case 3:
            neutral_line.set_data(time_vals, data[1][trigger_index:])
            neutral_rms_text.set_text(f'Neutral RMS: {rms}')

    #update graph
    fig.canvas.draw()
    fig.canvas.flush_events()

# setup function
def init_mqtt() :
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "testgrapher-12345")
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set("admin", "1234")
    client.connect("localhost", 1883)
    client.loop_forever()

#matplotlib stuff

# setup figure and axes
fig, axs = plt.subplots(2, 2)
fig.tight_layout(pad = 3.0)
fig.suptitle('Sensor Readings')
axs.flat[0].set_title('Phase 1')
axs.flat[1].set_title('Phase 2')
axs.flat[2].set_title('Phase 3')
axs.flat[3].set_title('Neutral')
for ax in axs.flat:
    ax.set_xlabel('Time (us)')
    ax.set_ylabel('Voltage (V)')
    ax.grid(True)
    ax.set_ylim(-2, 2)
    ax.set_xlim(0, 40000)

# setup lines and text
phase1_line = axs.flat[0].plot([], [], 'r.-')[0]
phase2_line = axs.flat[1].plot([], [], 'g.-')[0]
phase3_line = axs.flat[2].plot([], [], 'b.-')[0]
neutral_line = axs.flat[3].plot([], [], 'k.-')[0]
phase1_rms_text = axs.flat[0].text(0.02, 0.9, '', fontsize = 10, bbox = dict(facecolor = 'white', alpha = 0.5), transform = axs.flat[0].transAxes)
phase2_rms_text = axs.flat[1].text(0.02, 0.9, '', fontsize = 10, bbox = dict(facecolor = 'white', alpha = 0.5), transform = axs.flat[1].transAxes)
phase3_rms_text = axs.flat[2].text(0.02, 0.9, '', fontsize = 10, bbox = dict(facecolor = 'white', alpha = 0.5), transform = axs.flat[2].transAxes)
neutral_rms_text = axs.flat[3].text(0.02, 0.9, '', fontsize = 10, bbox = dict(facecolor = 'white', alpha = 0.5), transform = axs.flat[3].transAxes)

# have matplotlib call mqtt setup after rendering graph
fig.canvas.manager.window.after(1000, init_mqtt)

# show graph
plt.show()