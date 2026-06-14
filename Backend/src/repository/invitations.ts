import { Request } from 'express';
import { database } from "../utils/config/database";
import { hotelManagement, hotels, userRolesTable } from "../utils/config/schema";
import { HttpStatusCodes } from "../utils/helpers";
import { RoleOptions } from "../utils/types";
import { AuthenticationRepository } from "./User";
import { eq } from "drizzle-orm";
import { InvitationData, InviteEmailData } from "../utils/types"; // Use both types from utils
import { emailingOptions } from "../utils/EmailingTemplates";
import { inviteViaAdmin, inviteHotelManager, inviteCustomer } from './sendEmails';

interface UserExistenceResult {
  exists: boolean;
  userData?: any;
  currentRoles?: string[];
}

interface HotelData {
  id: string;
  name: string;
}

const authData = new AuthenticationRepository();

class ViaInvitation {

  async generateInvitationEmail(req: Request, data: InvitationData): Promise<{ success: boolean; message?: string; emailTemplate?: string }> {
    try {
      const inviterRole = req.user?.role as string;
      const securePasscode = authData.generateSecurePassword();
      const { inviteeRole } = data;

      // Validate required fields
      if (!data.inviteeUsername || !data.inviteeEmail || !inviteeRole) {
        return {
          success: false,
          message: "Missing required fields: inviteeUsername, inviteeEmail, and inviteeRole are required"
        };
      }

      // Validate inviter authentication
      if (!req.user?.username || !req.user?.role) {
        return {
          success: false,
          message: "Inviter information missing from request. User must be authenticated."
        };
      }

      if (inviterRole === "via-admin") {
        const inviteData: InviteEmailData = {
          inviteeUsername: data.inviteeUsername,
          inviteeEmail: data.inviteeEmail,
          inviterName: req.user?.username as string,
          inviterRole: req.user?.role as string,
          inviteeRole: data.inviteeRole,
          password: securePasscode,
          hotelId: data.hotelId
        }

        // we check the inviteeRole to know which template to send.
        if (inviteeRole === "via-admin") {
          // Check if the user exists & which role they currently have. If they have a customer account, update the role otherwise register the via-admin
          await this.processViaAdminRegistration(data, securePasscode);
          const emailTemplate = emailingOptions.viaAdminInvitationTemplate(inviteData);
          await inviteViaAdmin({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true };
        } else if (inviteeRole === "hotel-manager") {
          if (!data.hotelId) {
            return { success: false, message: "Hotel ID is required for hotel manager invitations" };
          }
          // Check if the user exists & which role they currently have. We do database queries to get the hotel name to be used in the invitation template & insert the user in the appropriate tables
          const hotelData = await this.getHotelData(data.hotelId);
          if (!hotelData) {
            return { success: false, message: "Invalid hotel ID provided" };
          }
          await this.processHotelManagerRegistration(data, hotelData, securePasscode);
          const inviteDataWithHotel = { ...inviteData, hotelName: hotelData.name };
          const emailTemplate = emailingOptions.hotelManagerInvitationTemplate(inviteDataWithHotel, hotelData.name);
          await inviteHotelManager({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true };
        } else if (inviteeRole === "customer") {
          // Check if the user exists & which role they currently have. We insert the user in the db
          await this.processCustomerRegistration(data, securePasscode);
          const emailTemplate = emailingOptions.customerInvitationTemplate(inviteData);
          await inviteCustomer({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true };
        }
        return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };

      } else if (inviterRole === "hotel-manager") {
        const inviteData: InviteEmailData = {
          inviteeUsername: data.inviteeUsername,
          inviteeEmail: data.inviteeEmail,
          inviterName: req.user?.username as string,
          inviterRole: req.user?.role as string,
          inviteeRole: data.inviteeRole,
          password: securePasscode,
          hotelId: data.hotelId
        }

        if (inviteeRole === "hotel-manager") {
          if (!data.hotelId) {
            return { success: false, message: "Hotel ID is required for hotel manager invitations" };
          }
          // Check if the user exists & which role they currently have. We do database queries to get the hotel name to be used in the invitation template & insert the user in the appropriate tables
          const hotelData = await this.getHotelData(data.hotelId);
          if (!hotelData) {
            return { success: false, message: "Invalid hotel ID provided" };
          }
          await this.processHotelManagerRegistration(data, hotelData, securePasscode);
          const inviteDataWithHotel = { ...inviteData, hotelName: hotelData.name };
          const emailTemplate = emailingOptions.hotelManagerInvitationTemplate(inviteDataWithHotel, hotelData.name);
          await inviteHotelManager({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true };
        } else if (inviteeRole === "customer") {
          // Check if the user exists & which role they currently have. We insert the user in the db
          await this.processCustomerRegistration(data, securePasscode);
          const emailTemplate = emailingOptions.customerInvitationTemplate(inviteData);
          await inviteCustomer({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true, emailTemplate };
        }
        return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };
      } else if (inviterRole === "customer") {
        const inviteData: InviteEmailData = {
          inviteeUsername: data.inviteeUsername,
          inviteeEmail: data.inviteeEmail,
          inviterName: req.user?.username as string,
          inviterRole: req.user?.role as string,
          inviteeRole: data.inviteeRole,
          password: securePasscode,
          hotelId: data.hotelId
        }

        if (inviteeRole === "customer") {
          // Check if the user exists & which role they currently have. We insert the user in the db
          await this.processCustomerRegistration(data, securePasscode);
          const emailTemplate = emailingOptions.customerInvitationTemplate(inviteData);
          await inviteCustomer({
            inviteeEmail: data.inviteeEmail,
            inviteeUsername: data.inviteeUsername,
            emailTemplate: emailTemplate
          });
          return { success: true, emailTemplate };
        }
        return { success: false, message: "User role is out of scope or you don't have appropriate privileges" };
      }

      return { success: false, message: "Invalid inviter role" };
    } catch (error) {
      console.error('Error generating invitation:', error);
      return { success: false, message: "An error occurred while processing the invitation" };
    }
  }

  async processViaAdminRegistration(data: InvitationData, securePasscode: string): Promise<void> {
    const userCheck = await this.checkUserExistence(data.inviteeEmail);

    if (userCheck.exists) {
      // User exists, update role to via-admin
      await this.updateUserRole(userCheck.userData.id, 'via-admin');
    } else {
      // Create new user and assign via-admin role
      const hashedPassword = await authData.hashPassword(securePasscode);
      const newUser = await authData.createUser({
        username: data.inviteeUsername,
        email: data.inviteeEmail,
        password: hashedPassword,
        email_verified: false
      });
      await authData.createUserRole('via-admin', newUser.id);
    }
  }

  async processHotelManagerRegistration(data: InvitationData, hotelData: HotelData, securePasscode: string): Promise<void> {
    const userCheck = await this.checkUserExistence(data.inviteeEmail);

    if (userCheck.exists) {
      // User exists, add hotel-manager role and hotel association
      await this.updateUserRole(userCheck.userData.id, 'hotel-manager');
      await this.createHotelManagement(userCheck.userData.id, data.hotelId!);
    } else {
      // Create new user, assign hotel-manager role, and create hotel association
      const hashedPassword = await authData.hashPassword(securePasscode);
      const newUser = await authData.createUser({
        username: data.inviteeUsername,
        email: data.inviteeEmail,
        password: hashedPassword,
        email_verified: false
      });
      await authData.createUserRole('hotel-manager', newUser.id);
      await this.createHotelManagement(newUser.id, data.hotelId!);
    }
  }

  async processCustomerRegistration(data: InvitationData, securePasscode: string): Promise<void> {
    const userCheck = await this.checkUserExistence(data.inviteeEmail);

    if (userCheck.exists) {
      // User exists, ensure they have customer role
      if (!userCheck.currentRoles?.includes('customer')) {
        await this.updateUserRole(userCheck.userData.id, 'customer');
      }
    } else {
      // Create new user and assign customer role
      const hashedPassword = await authData.hashPassword(securePasscode);
      const newUser = await authData.createUser({
        username: data.inviteeUsername,
        email: data.inviteeEmail,
        password: hashedPassword,
        email_verified: false
      });
      await authData.createUserRole('customer', newUser.id);
    }
  }

  async checkUserExistence(email: string): Promise<UserExistenceResult> {
    const result = await authData.checkExistingUserWithData(email);

    if (result.emailValidationStatus === HttpStatusCodes.UNAUTHORIZED) {
      // User exists, get their roles
      const roles = await this.getUserRoles(result.data!.id);
      return {
        exists: true,
        userData: result.data,
        currentRoles: roles
      };
    }

    return { exists: false };
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await database
      .select({ role: userRolesTable.roles })
      .from(userRolesTable)
      .where(eq(userRolesTable.user_id, userId));

    return roles.map(r => r.role);
  }

  async updateUserRole(userId: string, newRole: RoleOptions): Promise<void> {
    // Check if user already has this role
    const existingRoles = await this.getUserRoles(userId);

    if (!existingRoles.includes(newRole)) {
      await authData.createUserRole(newRole, userId);
    }
  }

  async createHotelManagement(userId: string, hotelId: string): Promise<void> {
    await database
      .insert(hotelManagement)
      .values({
        user_id: userId,
        hotel_id: hotelId
      });
  }

  async getHotelData(hotelId: string): Promise<HotelData | null> {
    const hotel = await database
      .select({
        id: hotels.id,
        name: hotels.name
      })
      .from(hotels)
      .where(eq(hotels.id, hotelId))
      .limit(1);

    return hotel.length > 0 ? hotel[0] : null;
  }
}

export const viaInvitation = new ViaInvitation();
