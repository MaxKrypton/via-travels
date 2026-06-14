import { database } from '../utils/config/database';
import { userProfiles, userRolesTable, userTable } from '../utils/config/schema';
import {
  CreatedUserType,
  NoDataResponse, RegisterUserTypes, RoleOptions

} from '../utils/types';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';
import { HttpStatusCodes } from '../utils/helpers';
import { SECRETS } from '../utils/helpers';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as EmailValidator from 'email-validator';

type PublicUserData = {
  id: string;
  email: string;
  username: string;
};


export class AuthenticationRepository {
  private static readonly SALT_ROUNDS = SECRETS.SALT_ROUNDS;

  async checkExistingUser(
    email: string,
  ): Promise<{ emailValidationStatus: number, emailValidationMessage: string }> {
    const existingUser = await database
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        emailValidationStatus: HttpStatusCodes.UNAUTHORIZED,
        emailValidationMessage: 'User already exists',
      }
    }
    return {
      emailValidationStatus: HttpStatusCodes.OK,
      emailValidationMessage: 'Register user',
    };
  }

  async checkExistingUserWithData(
    email: string,
  ): Promise<{ emailValidationStatus: number, emailValidationMessage: string, data: PublicUserData | null }> {

    const existingUser = await database
      .select({
        id: userTable.id,
        email: userTable.email,
        username: userTable.username
      })
      .from(userTable)
      .where(eq(userTable.email, email));

    if (existingUser.length > 0) {
      return {
        emailValidationStatus: HttpStatusCodes.UNAUTHORIZED,
        emailValidationMessage: 'User already exists',
        data: existingUser[0] as PublicUserData
      }
    }
    return {
      emailValidationStatus: HttpStatusCodes.OK,
      emailValidationMessage: 'Register user',
      data: null
    };
  }

  async createUser(userData: RegisterUserTypes): Promise<CreatedUserType> {
    const createdUser = await database
      .insert(userTable)
      .values(userData)
      .returning()
      .then((rows) => rows[0]);
    return createdUser;
  }

  async createUserRole(role: RoleOptions, userId: string): Promise<object> {
    const createdUserRole = await database
      .insert(userRolesTable)
      .values({
        user_id: userId,
        roles: role
      })
      .returning()
      .then((rows) => rows[0]);
    return createdUserRole;
  }

  async validateUserData(
    userData: RegisterUserTypes,
  ): Promise<NoDataResponse> {
    if (!EmailValidator.validate(userData.email)) {
      return {
        message: 'Invalid email format',
        status: HttpStatusCodes.UNAUTHORIZED,
      };
    }
    if (userData.password.length < 8) {
      return {
        message: 'Password must be at least 8 characters long',
        status: HttpStatusCodes.BAD_REQUEST,
      };
    }
    return {
      message: "valid email",
      status: HttpStatusCodes.OK
    }
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, AuthenticationRepository.SALT_ROUNDS);
  }

  async findUserByEmail(email: string): Promise<any> {
    const userWithProfile = await database
      .select({
        // User fields
        id: userTable.id,
        username: userTable.username,
        email: userTable.email,
        password: userTable.password,
        auth_provider: userTable.auth_provider,
        email_verified: userTable.email_verified,
        user_created_at: userTable.created_at,
        user_updated_at: userTable.updated_at,

        // Profile fields (will be null if no profile exists)
        profileId: userProfiles.id,
        firstName: userProfiles.first_name,
        lastName: userProfiles.last_name,
        phoneNumber: userProfiles.phone_number,
        dateOfBirth: userProfiles.date_of_birth,
        avatarUrl: userProfiles.avatar_url,
        preferred_language: userProfiles.preferred_language,
        preferred_currency: userProfiles.preferred_currency,
        profile_created_at: userProfiles.created_at,
        profile_updated_at: userProfiles.updated_at
      })
      .from(userTable)
      .leftJoin(userProfiles, eq(userTable.id, userProfiles.user_id))
      .where(eq(userTable.email, email))
      .limit(1);

    return userWithProfile[0];
  }

  async findUserByEmailForAuth(email: string): Promise<any> {
    const user = await database
      .select({
        id: userTable.id,
        username: userTable.username,
        email: userTable.email,
        password: userTable.password,
        email_verified: userTable.email_verified,
        preferred_language: userProfiles.preferred_language,
        preferred_currency: userProfiles.preferred_currency,
        phone_number: userProfiles.phone_number,
        role: userRolesTable.roles
      })
      .from(userTable)
      .leftJoin(userProfiles, eq(userTable.id, userProfiles.user_id))
      .leftJoin(userRolesTable, eq(userTable.id, userRolesTable.user_id))
      .where(eq(userTable.email, email))
      .limit(1);

    return user[0];
  }

  async findUserById(userId: string): Promise<object[]> {
    const user = await database
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);
    return user;
  }

  async comparePasswords(
    loginDataPassword: string,
    userPassword: string,
  ): Promise<Boolean> {
    const comparePasswordCredentials = await bcrypt.compare(
      loginDataPassword,
      userPassword,
    );
    return comparePasswordCredentials;
  }

  async generateToken(email: string): Promise<string> {
    const token = jwt.sign({ email }, SECRETS.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
    return token;
  }

  async generateResetToken(email: string): Promise<string> {
    return jwt.sign({ email }, SECRETS.ACCESS_TOKEN_SECRET, { expiresIn: '15min' });
  }

  async verifyResetToken(token: string): Promise<{ email: string } | null> {
    try {
      const payload = jwt.verify(token, SECRETS.ACCESS_TOKEN_SECRET) as {
        email: string;
      };
      return payload;
    } catch (error) {
      return null;
    }
  }

  async updateUserPassword(
    email: string,
    hashedPassword: string,
  ): Promise<void> {
    await database
      .update(userTable)
      .set({ password: hashedPassword })
      .where(eq(userTable.email, email));
  }

  async verifyEmailToken(token: string): Promise<{ email: string } | null> {
    try {
      const payload = jwt.verify(token, SECRETS.ACCESS_TOKEN_SECRET) as {
        email: string;
      };
      return payload;
    } catch (error) {
      return null;
    }
  }

  async markEmailAsVerified(email: string): Promise<void> {
    await database
      .update(userTable)
      .set({ email_verified: true })
      .where(eq(userTable.email, email));
  }

  generateSecurePassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    const allChars = lowercase + digits + symbols;

    // Random length between 10 and 12
    const length = Math.floor(Math.random() * 3) + 10;

    // Ensure at least one uppercase and one digit
    const guaranteedUpper = uppercase[Math.floor(Math.random() * uppercase.length)];
    const guaranteedDigit = digits[Math.floor(Math.random() * digits.length)];

    let remainingChars = '';
    for (let i = 0; i < length - 2; i++) {
      const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
      remainingChars += randomChar;
    }

    // Mix guaranteed characters with the rest randomly
    const fullPassword = [guaranteedUpper, guaranteedDigit, ...remainingChars].sort(() => Math.random() - 0.5).join('');

    return fullPassword;
  }
}
