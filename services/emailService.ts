
interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

class EmailVerificationService {
  private otpStorage: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly OTP_LENGTH = 6;

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email using a simple email API service
  async sendOTP(email: string): Promise<boolean> {
    try {
      console.log(`Sending OTP to: ${email}`);
      
      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = Date.now() + (this.OTP_EXPIRY_MINUTES * 60 * 1000);
      
      // Store OTP
      this.otpStorage.set(email, {
        email,
        otp,
        expiresAt,
        verified: false
      });

      // Send email using EmailJS (free service for client-side email sending)
      const emailData = {
        to_email: email,
        subject: 'Spiritual Wisdom - Email Verification',
        message: `Your verification code is: ${otp}. This code will expire in ${this.OTP_EXPIRY_MINUTES} minutes.`,
        otp_code: otp,
        app_name: 'Spiritual Wisdom'
      };

      // Using a mock email service for demo - replace with actual email service
      const response = await this.sendEmailViaService(emailData);
      
      console.log(`OTP sent successfully to ${email}: ${otp}`);
      return response;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }

  // Mock email service - replace with actual email service like EmailJS, SendGrid, etc.
  private async sendEmailViaService(emailData: any): Promise<boolean> {
    try {
      // For development, we'll just log the OTP
      console.log('=== EMAIL VERIFICATION OTP ===');
      console.log(`TO: ${emailData.to_email}`);
      console.log(`OTP: ${emailData.otp_code}`);
      console.log(`Expires in: ${this.OTP_EXPIRY_MINUTES} minutes`);
      console.log('===============================');

      // In production, replace this with actual email service
      // Example with EmailJS:
      /*
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'your_service_id',
          template_id: 'your_template_id',
          user_id: 'your_user_id',
          template_params: emailData
        })
      });
      return response.ok;
      */
      
      // For demo purposes, always return true
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Verify OTP
  verifyOTP(email: string, enteredOTP: string): boolean {
    const otpData = this.otpStorage.get(email);
    
    if (!otpData) {
      console.log('No OTP found for email:', email);
      return false;
    }

    if (Date.now() > otpData.expiresAt) {
      console.log('OTP expired for email:', email);
      this.otpStorage.delete(email);
      return false;
    }

    if (otpData.otp !== enteredOTP) {
      console.log('Invalid OTP for email:', email);
      return false;
    }

    // Mark as verified
    otpData.verified = true;
    this.otpStorage.set(email, otpData);
    
    console.log('OTP verified successfully for email:', email);
    return true;
  }

  // Check if email is verified
  isEmailVerified(email: string): boolean {
    const otpData = this.otpStorage.get(email);
    return otpData?.verified || false;
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [email, otpData] of this.otpStorage.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStorage.delete(email);
      }
    }
  }

  // Get remaining time for OTP
  getRemainingTime(email: string): number {
    const otpData = this.otpStorage.get(email);
    if (!otpData) return 0;
    
    const remaining = Math.max(0, otpData.expiresAt - Date.now());
    return Math.ceil(remaining / 1000); // Return seconds
  }
}

export const emailVerificationService = new EmailVerificationService();
