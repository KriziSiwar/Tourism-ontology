from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/test')
def test():
    return jsonify({"message": "Le serveur fonctionne !"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
