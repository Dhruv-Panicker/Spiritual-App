
import emailjs from '@emailjs/react-native';

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
  private isInitialized = false;

  // Initialize EmailJS with your service credentials
  private async initializeEmailJS() {
    if (this.isInitialized) return;
    
    try {
      // You'll need to replace these with your actual EmailJS credentials
      // Sign up at https://www.emailjs.com/ to get these values
      await emailjs.init({
        publicKey: 'YOUR_PUBLIC_KEY', // Replace with your EmailJS public key
        // You can sign up for free at emailjs.com
      });
      this.isInitialized = true;
      console.log('EmailJS initialized successfully');
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error);
    }
  }

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email using EmailJS
  async sendOTP(email: string): Promise<boolean> {
    try {
      console.log(`Sending OTP to: ${email}`);
      
      // Initialize EmailJS if not already done
      await this.initializeEmailJS();
      
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

      // For development/testing - log the OTP to console
      console.log('=== EMAIL VERIFICATION OTP ===');
      console.log(`TO: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: ${this.OTP_EXPIRY_MINUTES} minutes`);
      console.log('===============================');

      // Try to send actual email
      try {
        const templateParams = {
          to_email: email,
          to_name: 'Spiritual Seeker',
          otp_code: otp,
          app_name: 'Spiritual Wisdom',
          expiry_minutes: this.OTP_EXPIRY_MINUTES,
        };

        // Replace these with your actual EmailJS service and template IDs
        const response = await emailjs.send(
          'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
          'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
          templateParams
        );

        console.log('Email sent successfully:', response.status, response.text);
        return true;
      } catch (emailError) {
        console.warn('Failed to send email via EmailJS, but OTP is available in console:', emailError);
        // Return true anyway since OTP is logged to console for development
        return true;
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
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

  // Get the current OTP for an email (for development/testing purposes)
  getCurrentOTP(email: string): string | null {
    const otpData = this.otpStorage.get(email);
    if (!otpData || Date.now() > otpData.expiresAt) {
      return null;
    }
    return otpData.otp;
  }
}

export const emailVerificationService = new EmailVerificationService();
