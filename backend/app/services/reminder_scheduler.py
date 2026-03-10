# backend/app/services/reminder_scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.reminder import Reminder
from app.services.email_service import send_reminder_email


def check_and_send_reminders():
    """
    Kollar om det finns påminnelser som ska skickas nu.
    Körs automatiskt varje timme.
    """
    db: Session = SessionLocal()
    
    try:
        # Hitta alla påminnelser som ska skickas (datum passerat, inte skickade än)
        now = datetime.utcnow()
        
        reminders_to_send = db.query(Reminder).filter(
            Reminder.remind_date <= now,
            ~Reminder.is_sent
        ).all()
        
        print(f"🔍 Kollar påminnelser... Hittade {len(reminders_to_send)} att skicka")
        print(f"   Nuvarande tid (UTC): {now}")
        print(f"   Totalt påminnelser i DB: {db.query(Reminder).count()}")
        
        for r in reminders_to_send:
            print(f"   → ID {r.id}: '{r.title}', datum: {r.remind_date}, skickad: {r.is_sent}")
        
        for reminder in reminders_to_send:
            # Hämta användarens email
            user_email = reminder.user.email
            
            # Skicka email
            success = send_reminder_email(
                to_email=user_email,
                title=reminder.title,
                description=reminder.description or ""
            )
            
            if success:
                # Markera som skickad
                reminder.is_sent = True
                db.commit()
                print(f"✅ Påminnelse skickad: {reminder.title} → {user_email}")
            else:
                print(f"❌ Kunde inte skicka påminnelse: {reminder.title}")
    
    except Exception as e:
        print(f"❌ Fel i reminder scheduler: {str(e)}")
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


def start_scheduler():
    """
    Startar background scheduler som kollar påminnelser varje timme.
    """
    scheduler = BackgroundScheduler()
    
    # Kör check_and_send_reminders varje timme
    scheduler.add_job(
        check_and_send_reminders,
        'interval',
        hours=1,
        id='reminder_checker'
    )
    
    scheduler.start()
    print("✅ Reminder scheduler startad! Kollar påminnelser varje timme.")
    
    # Kör direkt vid start
    check_and_send_reminders()
    
    return scheduler