import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from '../schema/otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in database
   */
  async storeOtp(
    email: string,
    otp: string,
    purpose: 'email_verification' | 'password_reset' = 'email_verification',
  ): Promise<void> {
    // Delete any existing OTPs for this email and purpose
    await this.otpModel.deleteMany({ email, purpose });

    // Create new OTP entry
    const otpEntry = new this.otpModel({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      attempts: 0,
    });

    await otpEntry.save();
  }

  /**
   * Verify OTP
   */
  async verifyOtp(
    email: string,
    otp: string,
    purpose: 'email_verification' | 'password_reset' = 'email_verification',
  ): Promise<boolean> {
    const otpEntry = await this.otpModel.findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!otpEntry) {
      throw new BadRequestException('OTP not found or expired');
    }

    // Check if maximum attempts reached
    if (otpEntry.attempts >= 3) {
      await this.otpModel.deleteOne({ _id: otpEntry._id });
      throw new BadRequestException(
        'Maximum OTP verification attempts reached. Please request a new code.',
      );
    }

    // Increment attempts
    otpEntry.attempts += 1;
    await otpEntry.save();

    // Verify OTP
    if (otpEntry.otp !== otp) {
      throw new BadRequestException(
        `Invalid OTP. ${3 - otpEntry.attempts} attempts remaining.`,
      );
    }

    // OTP is valid, delete it
    await this.otpModel.deleteOne({ _id: otpEntry._id });
    return true;
  }

  /**
   * Clean expired OTPs (called periodically)
   */
  async cleanExpiredOtps(): Promise<void> {
    await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  /**
   * Check if OTP exists for email
   */
  async hasValidOtp(
    email: string,
    purpose: 'email_verification' | 'password_reset' = 'email_verification',
  ): Promise<boolean> {
    const otpEntry = await this.otpModel.findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    return !!otpEntry;
  }

  /**
   * Get remaining time for OTP
   */
  async getRemainingTime(
    email: string,
    purpose: 'email_verification' | 'password_reset' = 'email_verification',
  ): Promise<number> {
    const otpEntry = await this.otpModel.findOne({
      email,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!otpEntry) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor((otpEntry.expiresAt.getTime() - Date.now()) / 1000),
    );
  }
}
