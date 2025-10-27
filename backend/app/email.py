from flask_mail import Message
from flask import render_template_string, current_app
from . import mail
from .models.user import User

def send_email(subject, sender, recipients, text_body, html_body):
    """Fonction générique pour envoyer un email"""
    msg = Message(
        subject=subject,
        sender=sender,
        recipients=recipients
    )
    msg.body = text_body
    msg.html = html_body
    
    try:
        mail.send(msg)
        current_app.logger.info(f'Email envoyé à {recipients}')
        return True
    except Exception as e:
        current_app.logger.error(f'Erreur lors de l\'envoi de l\'email: {str(e)}')
        return False

def send_password_reset_email(user, reset_link):
    """Envoie un email de réinitialisation de mot de passe"""
    subject = "Réinitialisation de votre mot de passe"
    sender = current_app.config['MAIL_DEFAULT_SENDER']
    recipients = [user.email]
    
    # Corps du message en texte brut
    text_body = f'''
    Bonjour {user.username},
    
    Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien suivant :
    {reset_link}
    
    Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.
    
    Cordialement,
    L'équipe EcoTourism
    '''
    
    # Corps du message en HTML
    html_body = f'''
    <!DOCTYPE html>
    <html>
    <body>
        <p>Bonjour {user.username},</p>
        <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le bouton ci-dessous :</p>
        <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br>
        {reset_link}</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe EcoTourism</p>
    </body>
    </html>
    '''
    
    return send_email(subject, sender, recipients, text_body, html_body)

def send_email_verification(user, verification_link):
    """Envoie un email de vérification d'email"""
    subject = "Veuillez confirmer votre adresse email"
    sender = current_app.config['MAIL_DEFAULT_SENDER']
    recipients = [user.email]
    
    # Corps du message en texte brut
    text_body = f'''
    Bonjour {user.username},
    
    Merci de vous être inscrit sur EcoTourism. Pour finaliser votre inscription, 
    veuillez confirmer votre adresse email en cliquant sur le lien suivant :
    
    {verification_link}
    
    Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet email.
    
    Cordialement,
    L'équipe EcoTourism
    '''
    
    # Corps du message en HTML
    html_body = f'''
    <!DOCTYPE html>
    <html>
    <body>
        <p>Bonjour {user.username},</p>
        <p>Merci de vous être inscrit sur EcoTourism. Pour finaliser votre inscription, 
        veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
        <p><a href="{verification_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmer mon email</a></p>
        <p>Ou copiez ce lien dans votre navigateur :<br>
        {verification_link}</p>
        <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe EcoTourism</p>
    </body>
    </html>
    '''
    
    return send_email(subject, sender, recipients, text_body, html_body)
