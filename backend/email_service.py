import os
import smtplib

from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("EMAIL_ADDRESS")
PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_otp(receiver_email, otp):

    subject = "SignSpeak Email Verification OTP"

    body = f"""
Hello,

Your SignSpeak verification code is:

{otp}

This OTP is valid for 5 minutes.

If you didn't request this, please ignore this email.

Team SignSpeak
"""

    message = MIMEText(body)

    message["Subject"] = subject
    message["From"] = EMAIL
    message["To"] = receiver_email

    try:

        server = smtplib.SMTP("smtp.gmail.com", 587)

        server.starttls()

        server.login(EMAIL, PASSWORD)

        server.send_message(message)

        server.quit()

        print("OTP Sent Successfully")

        return True

    except Exception as e:

        print(e)

        return False