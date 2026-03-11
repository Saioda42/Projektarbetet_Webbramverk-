# backend/app/services/email_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Email-konfiguration från environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")  # Din email
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # App-lösenord
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)


def send_reminder_email(to_email: str, title: str, description: str):
    """
    Skickar ett påminnelse-email
    
    Args:
        to_email: Mottagarens email
        title: Titel på påminnelsen
        description: Beskrivning av påminnelsen
    """
    
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("❌ SMTP credentials saknas! Lägg till i .env")
        return False
    
    try:
        # Skapa email-meddelande
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = f"📌 Påminnelse: {title}"
        
        # Email-body
        body = f"""
        Hej!
        
        Du har en påminnelse från Job Tracker:
        
        📋 {title}
        
        {description if description else 'Ingen ytterligare beskrivning.'}
        
        ---
        Skickat: {datetime.now().strftime('%Y-%m-%d %H:%M')}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Skicka email via SMTP
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Säker koppling
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email skickat till {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Kunde inte skicka email: {str(e)}")
        return False


def send_welcome_email(to_email: str):
    """Skickar ett välkomstmail efter registrering"""

    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("SMTP credentials saknas!")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Välkommen till JobTracker!"

        body = """
        Hej och välkommen till JobTracker!

        Ditt konto har skapats. Nu kan du:

        - Spåra dina jobbansökningar
        - Hantera kontakter
        - Skapa och uppdatera ditt CV
        - Sätta påminnelser med automatiska e-postnotiser
        - Söka jobb via Platsbanken

        Lycka till med jobbsökandet!

        / JobTracker-teamet
        """

        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Välkomstmail skickat till {to_email}")
        return True

    except Exception as e:
        print(f"Kunde inte skicka välkomstmail: {str(e)}")
        return False


def test_email_connection():
    """Testa om email-konfiguration funkar"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        return False, "SMTP credentials saknas"
    
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
        return True, "Email-anslutning funkar!"
    except Exception as e:
        return False, str(e)