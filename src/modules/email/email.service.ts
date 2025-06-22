import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send email verification OTP
   */
  async sendEmailVerification(email: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"StayKaru" <${this.configService.get<string>('EMAIL_FROM', 'noreply@staykaru.com')}>`,
        to: email,
        subject: 'StayKaru - Verify Your Email Address',
        html: this.getEmailVerificationTemplate(otp),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email verification sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email verification to ${email}:`,
        error,
      );
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"StayKaru" <${this.configService.get<string>('EMAIL_FROM', 'noreply@staykaru.com')}>`,
        to: email,
        subject: 'StayKaru - Password Reset Request',
        html: this.getPasswordResetTemplate(resetUrl),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    try {
      const mailOptions = {
        from: `"StayKaru" <${this.configService.get<string>('EMAIL_FROM', 'noreply@staykaru.com')}>`,
        to: email,
        subject: 'Welcome to StayKaru!',
        html: this.getWelcomeTemplate(name, role),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error for welcome email failure
    }
  }

  /**
   * Email verification template
   */
  private getEmailVerificationTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - StayKaru</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .otp-code { background: #f8f9fa; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 10px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StayKaru</div>
            <h1 style="color: #333; margin: 0;">Verify Your Email Address</h1>
          </div>
          
          <p>Thank you for registering with StayKaru! To complete your account setup and start exploring accommodation and food options, please verify your email address.</p>
          
          <div class="otp-code">
            <p style="margin: 0; font-size: 16px; color: #666;">Your verification code is:</p>
            <div class="otp-number">${otp}</div>
            <p style="margin: 0; font-size: 14px; color: #666;">Enter this code in the app to verify your email</p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This code will expire in 15 minutes. If you didn't request this verification, please ignore this email.
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>Browse and book accommodations</li>
            <li>Order food from local providers</li>
            <li>Access your personalized dashboard</li>
            <li>Receive important notifications</li>
          </ul>
          
          <div class="footer">
            <p>This email was sent by StayKaru. If you have any questions, please contact our support team.</p>
            <p>&copy; 2025 StayKaru. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password reset template
   */
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - StayKaru</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .reset-button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StayKaru</div>
            <h1 style="color: #333; margin: 0;">Password Reset Request</h1>
          </div>
          
          <p>We received a request to reset your password for your StayKaru account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <div class="footer">
            <p>This email was sent by StayKaru. If you have any questions, please contact our support team.</p>
            <p>&copy; 2025 StayKaru. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Welcome email template
   */
  private getWelcomeTemplate(name: string, role: string): string {
    const roleSpecificContent = this.getRoleSpecificWelcomeContent(role);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to StayKaru!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #2563eb; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .welcome-message { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .feature-list { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StayKaru</div>
            <h1 style="color: #333; margin: 0;">Welcome to StayKaru!</h1>
          </div>
          
          <div class="welcome-message">
            <h2 style="margin: 0 0 10px 0;">Hello ${name}! 🎉</h2>
            <p style="margin: 0;">Your email has been verified and your ${role} account is now active!</p>
          </div>
          
          <p>We're excited to have you join the StayKaru community. Your account is now ready, and you can start exploring all the features we have to offer.</p>
          
          <div class="feature-list">
            <h3 style="color: #2563eb; margin-top: 0;">What you can do now:</h3>
            ${roleSpecificContent}
          </div>
          
          <p>If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!</p>
          
          <div class="footer">
            <p>Thank you for choosing StayKaru. We look forward to serving you!</p>
            <p>&copy; 2025 StayKaru. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get role-specific welcome content
   */
  private getRoleSpecificWelcomeContent(role: string): string {
    switch (role) {
      case 'student':
        return `
          <ul>
            <li>Browse and book student accommodations</li>
            <li>Order food from local providers</li>
            <li>Connect with other students</li>
            <li>Access exclusive student discounts</li>
            <li>Rate and review your experiences</li>
          </ul>
        `;
      case 'landlord':
        return `
          <ul>
            <li>List and manage your properties</li>
            <li>Receive and manage booking requests</li>
            <li>Track your earnings and analytics</li>
            <li>Communicate with tenants</li>
            <li>Update property availability</li>
          </ul>
        `;
      case 'food_provider':
        return `
          <ul>
            <li>Create and manage your menu</li>
            <li>Receive and process orders</li>
            <li>Track sales and performance</li>
            <li>Manage delivery options</li>
            <li>Build your customer base</li>
          </ul>
        `;
      case 'admin':
        return `
          <ul>
            <li>Manage all users and accounts</li>
            <li>Monitor platform activity</li>
            <li>Handle disputes and support</li>
            <li>Access analytics and reports</li>
            <li>Configure platform settings</li>
          </ul>
        `;
      default:
        return `
          <ul>
            <li>Explore all platform features</li>
            <li>Connect with the community</li>
            <li>Access personalized recommendations</li>
            <li>Manage your profile and preferences</li>
          </ul>
        `;
    }
  }
}
