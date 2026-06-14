import { otpTable, userTable } from "../utils/config/schema";
import { AuthenticationRepository } from '../repository/User';
import { eq } from "drizzle-orm";
import crypto from 'crypto';
import { database } from "../utils/config/database";

class GenerateAndStoreOTP {
  async generateAndStoreRegistrationOTP(email: string): Promise<string> {
    // Generate 6-digit OTP
    const { OTP, OTP_Expiry } = this.RegistrationOTP();

    // Calculate expiry timestamp
    const expiresAt = OTP_Expiry;

    // Prepare OTP record
    const OTPRecord = {
      email: email,
      code: OTP,
      expiresAt,
      verified: false
    };

    // Store OTP in the database with expiry
    const storeOTP = await database.insert(otpTable).values({
      email: OTPRecord.email,
      code: OTPRecord.code,
      expires_at: OTPRecord.expiresAt as any,
      verified: OTPRecord.verified
    }).returning();

    return storeOTP.length > 0 ? OTPRecord.code : "No OTP Generated";
  }

  async generateAndUpdateRegistrationOTP(email: string): Promise<string> {
    // Generate 6-digit OTP
    const { OTP, OTP_Expiry } = this.RegistrationOTP();

    // Calculate expiry timestamp
    const expiresAt = OTP_Expiry;

    // Prepare OTP record
    const OTPRecord = {
      email: email,
      code: OTP,
      expiresAt,
      verified: false
    };

    // Store OTP in the database with expiry
    const storeOTP = await database.update(otpTable).set({
      code: OTPRecord.code,
      expires_at: OTPRecord.expiresAt as any,
    }).where(eq(otpTable.email, email)).returning();

    return storeOTP.length > 0 ? OTPRecord.code : "No OTP Generated";
  }

  async generateAndStoreForgotPasswordOTP(email: string): Promise<string> {
    // Generate a temporary account password
    const PasswordOTP = this.ForgotPasswordOTP();
    // Store OTP in the database with expiry
    await database.update(userTable).set({
      password: PasswordOTP
    }).where(eq(userTable.email, email));
    return PasswordOTP;
  }

  RegistrationOTP() {
    const generateOTP = crypto.randomInt(100000, 999999).toString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); return {
      OTP: generateOTP,
      OTP_Expiry: tomorrow
    }
  }

  ForgotPasswordOTP(): string {
    const generateOTP: string = crypto.randomInt(10000000, 99999999).toString();
    return generateOTP;
  }
}

export default new GenerateAndStoreOTP()
