from celery import shared_task

@shared_task
def send_inquiry_email(user_mail, message):
    print(f"Email sent to {user_mail} with message: {message}")