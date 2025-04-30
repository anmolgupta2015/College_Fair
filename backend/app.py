from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Flask-Mail Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

@app.route('/send-query-email',methods=['POST'])
def send_query_email():
    data = request.get_json()
    name  = data.get('name')
    user_email = data.get('email')
    subject = data.get('subject')
    body = data.get('body')
    if not name or not user_email or not subject or not body:
        return jsonify({"message":"Please fill full information"}),500
    html_content = f"""
    <h2>New Query Received</h2>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {user_email}</p>
    <p><strong>Subject:</strong> {subject}</p>
    <p><strong>Message:</strong><br>{body}</p>
    """

    msg = Message(subject="New query Recieved",recipients=['anmolgupta1502@gmail.com'],html = html_content)
    try :
      mail.send(msg)
      return jsonify({"message": "Query Recieved! Tech team is out to get you :-) "}), 200
    except :
        print("Error",(e))
        return jsonify({"message":"Failed to send query"}),500

  ## user_name = data.get('name')
   ## user_email = data.get('email')
   ## subject = data.get('subject')
   ## body = data.get('body')
  ## """ html_content = render_template('query.html',"""
  ## """ msg = message(subject:"New qeury recived"),recipients = ["anmolgupta1502@gmail.com"],html = html_content)"""

@app.route('/send-order-email', methods=['POST'])
def send_order_email():
    data = request.get_json()

    user_email = data.get('user_email')
    product_owner_email = data.get('product_owner_email')
    product_name = data.get('product_name', 'Unknown Product')
    price = data.get('product_price', 'N/A')
    user_name = data.get('user_Name')
    user_phone = data.get('user_phoneNo')
    product_link = data.get('product_link')
    payloadRent = data.get('payloadRent')
    isSell = data.get('isSell')
   

    # Select appropriate template
    if isSell:
        html_content = render_template(
            'mailBuy.html',
            user_email=user_email,
            product_name=product_name,
            price=price,
            user_phone=user_phone,
            user_name=user_name,
            product_link=product_link
        )
    else:
        html_content = render_template(
            'rent.html',
            user_email=user_email,
            product_name=product_name,
            price=price,
            user_phone=user_phone,
            user_name=user_name,
            product_link=product_link,
            payloadRent=payloadRent
        )

    msg = Message(subject="🛒 New Order Received",
                  recipients=[product_owner_email],
                  html=html_content)

    try:
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Failed to send email"}), 500

if __name__ == '__main__':
    app.run(debug=True)
