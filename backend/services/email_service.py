"""
Email service for sending verification and password reset emails.
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from typing import Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username or "",
    MAIL_PASSWORD=settings.mail_password or "",
    MAIL_FROM=settings.mail_from or settings.mail_username or "noreply@juridence.com",
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_FROM_NAME="Juridence Legal Database",
    MAIL_STARTTLS=settings.mail_tls,
    MAIL_SSL_TLS=settings.mail_ssl,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Initialize FastMail instance
fastmail = FastMail(conf)


async def send_verification_email(email: str, verification_code: str) -> bool:
    """
    Send email verification OTP code to user.
    
    Args:
        email: User's email address
        verification_code: 6-digit OTP verification code
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Always log the verification code for testing purposes
    logger.info(f"=== VERIFICATION CODE FOR {email} ===")
    logger.info(f"OTP Code: {verification_code}")
    logger.info(f"This code expires in 2 minutes.")
    logger.info(f"=====================================")
    
    # Check if email is configured
    if not settings.mail_username or not settings.mail_password:
        logger.warning("Email service not configured. Verification code logged above for testing.")
        return False
    
    try:
        message = MessageSchema(
            subject="Verify Your Email - Juridence",
            recipients=[email],
            body=f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">Welcome to Juridence!</h2>
                    <p>Thank you for registering with Juridence Legal Database System.</p>
                    <p>Your verification code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; display: inline-block;">
                            <h1 style="color: #3B82F6; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">
                                {verification_code}
                            </h1>
                        </div>
                    </div>
                    <p style="text-align: center; font-size: 14px; color: #666;">
                        Enter this code in the verification form to complete your registration.
                    </p>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        If you didn't create an account with Juridence, please ignore this email.
                    </p>
                    <p style="font-size: 12px; color: #666;">
                        This code will expire in 2 minutes.
                    </p>
                </div>
            </body>
            </html>
            """,
            subtype=MessageType.html
        )
        
        await fastmail.send_message(message)
        logger.info(f"Verification email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {email}: {str(e)}")
        return False


async def send_password_reset_email(email: str, reset_token: str) -> bool:
    """
    Send password reset link to user.
    
    Args:
        email: User's email address
        reset_token: Password reset token
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Check if email is configured
    if not settings.mail_username or not settings.mail_password:
        logger.warning("Email service not configured. Skipping password reset email.")
        return False
    
    try:
        # Get frontend URL from settings
        frontend_url = settings.frontend_url
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        message = MessageSchema(
            subject="Reset Your Password - Juridence",
            recipients=[email],
            body=f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3B82F6;">Password Reset Request</h2>
                    <p>We received a request to reset your password for your Juridence account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" 
                           style="background-color: #3B82F6; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #3B82F6;">{reset_link}</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #666;">
                        If you didn't request a password reset, please ignore this email. 
                        Your password will remain unchanged.
                    </p>
                    <p style="font-size: 12px; color: #666;">
                        This link will expire in 1 hour.
                    </p>
                </div>
            </body>
            </html>
            """,
            subtype=MessageType.html
        )
        
        await fastmail.send_message(message)
        logger.info(f"Password reset email sent successfully to {email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
        return False

