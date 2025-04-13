from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

@app.route('/api/notify-owner', methods=['POST'])
def notify_owner():
    api_key = os.getenv("RESEND_API_KEY")
    data = request.json
    user_name = data.get('userName')
    user_email = data.get('userEmail')
    product_id = data.get('productId')

    payload = {
        "from": "onboarding@resend.dev",
        "to": ["anmolgupta9872148833@gmail.com"],
        "subject": f"Interest in product #{product_id}",
        "html": f"""
            <p><strong>{user_name}</strong> ({user_email}) is interested in your product <strong>{product_id}</strong>.</p>
            <p>You can reach out to them directly.</p>
        """
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    response = requests.post("https://api.resend.com/emails", json=payload, headers=headers)

    return jsonify({"status": response.status_code, "response": response.text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
