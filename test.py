import smtplib
from email.message import EmailMessage

# =========================
# SMTP CONFIGURATION
# =========================

SMTP_HOST = "smtpout.secureserver.net"
SMTP_PORT = 465
SMTP_USERNAME = "info@dandicraft.com"
SMTP_PASSWORD = "craft8471!"
SMTP_ENCRYPTION = "ssl"  # "ssl" or "tls"

# Receiver
RECEIVER_EMAIL = "muneebamir067@gmail.com"

# =========================
# EMAIL CONTENT
# =========================

SUBJECT = "Demo SMTP Email"

BODY = """
Hello,

This is a demo email sent using SMTP.

If you received this email, the SMTP configuration is working correctly.

Regards,
SMTP Test
"""

# =========================
# SEND EMAIL
# =========================

try:
    msg = EmailMessage()
    msg["From"] = SMTP_USERNAME
    msg["To"] = RECEIVER_EMAIL
    msg["Subject"] = SUBJECT
    msg.set_content(BODY)

    if SMTP_ENCRYPTION.lower() == "ssl":
        # Port 465
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

    elif SMTP_ENCRYPTION.lower() == "tls":
        # Port 587
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

    else:
        raise ValueError("SMTP_ENCRYPTION must be 'ssl' or 'tls'")

    print("✅ Email sent successfully!")

except Exception as e:
    print(f"❌ Failed to send email: {e}")