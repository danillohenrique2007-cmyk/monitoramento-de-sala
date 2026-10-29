from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Estado dos dispositivos armazenados no servidor Python
devices_state = {
    "light": True,
    "ac": True,
    "pump": False,
    "alarm": True
}

@app.route('/')
def index():
    return render_template('index.html')

# API em Python para ler os sensores em tempo real
@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    data = {
        "temperature": round(22.0 + random.uniform(0.5, 3.5), 1),
        "humidity": random.randint(50, 65),
        "power": round(1.2 + random.uniform(0.1, 0.4), 2),
        "battery": 92,
        "latency": f"{random.randint(18, 35)}ms"
    }
    return jsonify(data)

# API em Python para alternar estado dos dispositivos
@app.route('/api/device/toggle', methods=['POST'])
def toggle_device():
    data = request.get_json()
    device = data.get('device')
    state = data.get('state')
    
    if device in devices_state:
        devices_state[device] = state
        return jsonify({"status": "success", "device": device, "state": state})
    return jsonify({"status": "error", "message": "Dispositivo não encontrado"}), 400

if __name__ == '__main__':
    print("🚀 Servidor Python rodando em: http://127.0.0.1:5000")
    app.run(debug=True)