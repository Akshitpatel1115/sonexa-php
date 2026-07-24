<?php
namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;
    public $otp;
    public function __construct($otp)
    {
        $this->otp = $otp;
    }
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(env('EMAIL_FROM'), 'SONEXA'),
            subject: 'Password Reset Request - SONEXA',
        );
    }
    public function content(): Content
    {
        $html = <<<HTML
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; line-height: 1.6;">
    <h2 style="color: #1a1a1a; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Password Reset Request</h2>
    
    <p>Hello,</p>
    
    <p>We received a request to reset the password associated with your SONEXA account. You can reset your password using the verification code below:</p>
    
    <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e74c3c;">{$this->otp}</span>
    </div>
    
    <p><strong>Security Notice:</strong> This code will expire in 10 minutes. Please do not share this code with anyone.</p>
    
    <p>If you did not request a password reset, please ignore this email. Your account remains secure and your current password has not been changed.</p>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>The SONEXA Security Team</strong></p>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999999; text-align: center;">
        <p>This is an automated security alert, please do not reply directly to this email.</p>
    </div>
</div>
HTML;
        return new Content(htmlString: $html);
    }
}

