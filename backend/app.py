from flask import Flask, request, jsonify, render_template,send_file
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
import requests
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
import tempfile
import contextlib # Import contextlib
import shutil

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["https://college-fair-rust.vercel.app/"])

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

def create_pdf_from_images(image_urls):
    """
    Fetches images from given URLs, creates a PDF, and saves it to a temporary file.

    Args:
        image_urls (list): A list of URLs pointing to the images.

    Returns:
        str: The path to the generated PDF file, or None on error.
    """
    pdf_path = None
    try:
        # Create a temporary file to store the PDF
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf_path = temp_file.name  # Get the path to the temporary file
        c = canvas.Canvas(pdf_path, pagesize=letter)
        width, height = letter

        for img_url in image_urls:
            try:
                # Fetch the image data
                response = requests.get(img_url, stream=True)
                response.raise_for_status()  # Raise an exception for bad status codes

                # Read the image data
                img_data = BytesIO(response.content)
                img = ImageReader(img_data)

                # Get image dimensions.  Important for scaling.
                img_width, img_height = img.getSize()

                # Calculate aspect ratio to maintain image proportions
                ratio = min(width / img_width, height / img_height)
                scaled_width = img_width * ratio
                scaled_height = img_height * ratio
                # Draw the image on the PDF canvas, centered and scaled
                x = (width - scaled_width) / 2
                y = (height - scaled_height) / 2
                c.drawImage(img, x, y, width=scaled_width, height=scaled_height)
                c.showPage()  # Add a new page for each image

            except requests.exceptions.RequestException as e:
                print(f"Error fetching image from {img_url}: {e}")
                #  Don't stop processing, go to the next image.  A warning is better.
                continue
            except Exception as e:
                print(f"Error processing image {img_url}: {e}")
                continue

        c.save()
    
        return pdf_path  # Return the path to the PDF
    except Exception as e:
        print(f"Error creating PDF: {e}")
        return None  # Return None to indicate failure
    finally:
        if 'temp_file' in locals():
            temp_file.close()

@app.route('/download_pdf', methods=['POST']) # Changed route name to /download_pdf to align with front end
def create_pdf_from_image(): # Changed function name to create_pdf_from_image
    pdf_path = None #  Declare pdf_path outside the try block
    try:
        data = request.get_json()
        image_urls = data.get('Images') # Changed from Images to images to match the key from front end
        subject = data.get('Subject')
        if not image_urls:
            return jsonify({'error': 'No image URLs provided.'}), 400

        if not isinstance(image_urls, list):
            return jsonify({'error': 'image_urls must be a list.'}), 400

        if not image_urls:
            return jsonify({'error': 'Empty list of image URLs provided'}), 400
        
        pdf_path = create_pdf_from_images(image_urls) # Use the function

        if pdf_path:
            return send_file(pdf_path, as_attachment=True, download_name=f"{subject}questionPaper.pdf", mimetype='application/pdf')
        else:
            return jsonify({'error': 'Failed to generate PDF'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {e}'}), 500
    # finally: # Removed the finally block
    #     if pdf_path:
    #         try:
    #             os.remove(pdf_path)
    #         except Exception as e:
    #             print(f"Error deleting temporary file: {e}")

  ## user_name = data.get('name')
   ## user_email = data.get('email')
   ## subject = data.get('subject')
   ## body = data.get('body')
  ## """ html_content = render_template('query.html',"""
  ## """ msg = message(subject:"New qeury recived"),recipients = ["anmolgupta1502@gmail.com"],html = html_content)"""

@app.route('/send-order-email', methods=['POST'])
def send_order_email():
    try:
        data = request.get_json()
        print("Received data:", data)

        user_email = data.get('user_email')
        product_owner_email = data.get('product_owner_email')
        product_name = data.get('product_name', 'Unknown Product')
        price = data.get('product_price', 'N/A')
        user_name = data.get('user_Name')
        user_phone = data.get('user_phoneNo')
        product_link = data.get('product_link')
        payloadRent = data.get('payloadRent')
        isSell = data.get('isSell')

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

        msg = Message(
            subject="🛒 New Order Received",
            recipients=[product_owner_email],
            html=html_content
        )
      
        mail.send(msg)
        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"message": "Failed to send email", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
