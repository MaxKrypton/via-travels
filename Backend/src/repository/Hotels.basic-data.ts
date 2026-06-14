import { Request } from 'express';
import { HttpStatusCodes, SECRETS } from '../utils/helpers';
import { database } from '../utils/config/database';
import { eq } from 'drizzle-orm';
import { CreatedUserType, DataResponse, IsubAccountInfo } from '../utils/types';
import { hotelManagement, hotelMedia, hotels, room, roomPricing, userRolesTable } from '../utils/config/schema';
import { AuthenticationRepository } from './User';
import { sendHotelManagementCredentials } from './sendEmails';
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(SECRETS.FLW_PUBLIC_KEY, SECRETS.FLW_SECRET_KEY);

const AuthData = new AuthenticationRepository();

// Define types based on your schema
type PaymentOption = 'Visa' | 'MasterCard' | 'Momo';
type HotelStatus = 'active' | 'inactive';

// Use Drizzle's InferModel to get the correct types
type NewHotel = typeof hotels.$inferInsert;
type Hotel = typeof hotels.$inferSelect;

class Hotels {
  // Create - Register New Hotel
  async createHotel(req: Request): Promise<DataResponse> {
    try {
      const hotelData: Omit<NewHotel, 'id' | 'created_at' | 'updated_at'> = {
        name: req.body.name,
        short_description: req.body.short_description,
        long_description: req.body.long_description,
        star_rating: req.body.star_rating,
        property_type: req.body.property_type,
        built_year: req.body.built_year,
        last_renovation_year: req.body.last_renovation_year,
        category: req.body.category,
        street_address: req.body.street_address,
        city: req.body.city,
        state: req.body.state,
        province: req.body.province,
        country: req.body.country,
        postal_code: req.body.postal_code,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        map_url: req.body.map_url,
        total_rooms: req.body.total_rooms,
        cancellation_policy: req.body.cancellation_policy,
        payment_options: req.body.payment_options as PaymentOption[],
        menu_download_url: req.body.menu_download_url,
        sponsored: req.body.sponsored,
        status: req.body.status as HotelStatus,
        management_email: req.body.management_email,
        management_name: req.body.management_name
      };

      const hotelDataSubAccountPayload = {
        account_bank: req.body.account_bank,
        account_number: req.body.account_number,
        business_name: hotelData.name,
        country: "RW",
        business_mobile: req.body.business_mobile,
        business_email: req.body.business_email,
        business_contact: req.body.business_contact,
        business_contact_mobile: req.body.business_contact_mobile,
        split_type: 'percentage',
        split_value: 0.05,
      }

      // First Create a payment subAccount
      const response = await flw.Subaccount.create(hotelDataSubAccountPayload);
      console.log(response);

      const { status, message } = response;
      if (status === "success") {
        const subAccountInfo: IsubAccountInfo = response.data;
        const hotelPayload = {
          ...hotelData,
          account_bank: subAccountInfo.account_bank,
          account_number: subAccountInfo.account_number,
          bank_name: subAccountInfo.bank_name,
          business_name: hotelData.name,
          subaccount_id: subAccountInfo.subaccount_id,
          country: "RW",
          business_mobile: req.body.business_mobile,
          business_email: req.body.business_email,
          business_contact: req.body.business_contact,
          business_contact_mobile: req.body.business_contact_mobile,
          split_type: 'percentage',
          split_value: 0.05,
        }

        const [createdHotel] = await database
          .insert(hotels)
          .values(hotelPayload)
          .returning();

        const userExists = await AuthData.checkExistingUserWithData(hotelData.management_email as string);

        const { emailValidationMessage, emailValidationStatus, data } = userExists;

        if (emailValidationStatus !== HttpStatusCodes.OK) {
          // a user exists, we need to update records in the hotel management Table
          await database.insert(hotelManagement).values({
            user_id: data?.id as string,
            hotel_id: createdHotel.id
          })

          // a user exists, we need to update the roles to hotel manager
          await database.update(userRolesTable).set({
            user_id: data?.id as string,
            roles: "hotel-manager"
          })
        }

        // Register user's email and update records in the hotel management

        // Generate password
        const password = AuthData.generateSecurePassword();
        const hashedPassword = await AuthData.hashPassword(password)
        const newUser: CreatedUserType = await AuthData.createUser({
          username: hotelData.management_name as string,
          email: hotelData.management_email as string,
          password: hashedPassword,
          email_verified: false
        });

        // Insert Credentials into Hotel Management
        await database.insert(hotelManagement).values({
          user_id: newUser.id as string,
          hotel_id: createdHotel.id
        });

        await database.insert(userRolesTable).values({
          user_id: newUser.id as string,
          roles: "hotel-manager"
        });

        await sendHotelManagementCredentials({
          username: newUser.username,
          password,
          managerEmail: newUser.email,
          subject: "Your Hotel Management Access Credentials"
        });

        console.log("This is the Hotel Manager password ", password);

        return {
          data: createdHotel,
          message: 'Hotel profile successfully created. Security credentials for hotel management have been sent via email.',
          status: HttpStatusCodes.CREATED,
        };
      }

      return {
        message: `Something went wrong while registering Banking data`,
        status: HttpStatusCodes.CREATED,
      };

    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Read - Get All Hotels
  async getAllHotels(): Promise<DataResponse> {
    try {
      const rawResults = await database
        .select({
          // Hotel details
          id: hotels.id,
          name: hotels.name,
          shortDescription: hotels.short_description,
          longDescription: hotels.long_description,
          starRating: hotels.star_rating,
          propertyType: hotels.property_type,
          builtYear: hotels.built_year,
          lastRenovationYear: hotels.last_renovation_year,
          category: hotels.category,
          // Location details
          streetAddress: hotels.street_address,
          city: hotels.city,
          state: hotels.state,
          province: hotels.province,
          country: hotels.country,
          postalCode: hotels.postal_code,
          latitude: hotels.latitude,
          longitude: hotels.longitude,
          mapUrl: hotels.map_url,
          // Services
          totalRooms: hotels.total_rooms,
          cancellationPolicy: hotels.cancellation_policy,
          paymentOptions: hotels.payment_options,
          menuDownloadUrl: hotels.menu_download_url,
          sponsored: hotels.sponsored,
          status: hotels.status,
          // Media details
          media: hotelMedia
        })
        .from(hotels)
        .leftJoin(hotelMedia, eq(hotels.id, hotelMedia.hotel_id))
        .where(eq(hotels.status, 'active'));

      // Process results to group by hotel
      const hotelsMap = new Map();
      rawResults.forEach(row => {
        if (!hotelsMap.has(row.id)) {
          hotelsMap.set(row.id, {
            ...row,
            media: row.media ? [row.media] : []
          });
        } else {
          if (row.media) {
            hotelsMap.get(row.id).media.push(row.media);
          }
        }
      });
      const hotelsWithMedia = Array.from(hotelsMap.values());
      return {
        data: hotelsWithMedia,
        message: 'Hotels fetched successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Read - Get Specific Hotel
  async getSpecificHotel(req: Request): Promise<DataResponse> {
    const hotelId = req.params.hotelId;
    try {
      // Fetch Hotel Base Information
      const hotelBase = await database
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotelId))
        .execute();

      if (hotelBase.length === 0) {
        return {
          data: null,
          message: 'Hotel not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      // Fetch Media in a separate query
      const mediaList = await database
        .select({
          id: hotelMedia.id,
          mediaType: hotelMedia.media_type,
          url: hotelMedia.url,
        })
        .from(hotelMedia)
        .where(eq(hotelMedia.hotel_id, hotelId))
        .execute();

      // Fetch Rooms with Pricing
      const roomsWithPricing = await database
        .select({
          roomId: room.id,
          roomType: room.type,
          maxOccupancy: room.max_occupancy,
          roomFee: roomPricing.roomFee,
          serviceFee: roomPricing.serviceFee,
          currency: roomPricing.currency,
        })
        .from(room)
        .leftJoin(roomPricing, eq(room.id, roomPricing.roomTypeId))
        .where(eq(room.hotel_id, hotelId))
        .execute();

      // Construct complete hotel profile
      const hotelProfile = {
        ...hotelBase[0],
        media: mediaList,
        rooms: roomsWithPricing,
      };

      return {
        data: hotelProfile,
        message: 'Hotel Profile fetched successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      console.error('Hotel Profile Fetch Error:', error);
      return {
        data: null,
        message: `Error retrieving hotel profile, ${error}`,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getHotelById(hotelId: string): Promise<DataResponse> {
    try {
      // Fetch Hotel Base Information
      const [hotelBase] = await database
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotelId))
        .execute();

      if (!hotelBase) {
        return {
          data: null,
          message: 'Hotel not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      return {
        status: HttpStatusCodes.OK,
        message: "Hotel Profile Data fetched successfully",
        data: hotelBase
      }

    } catch (error) {
      console.error('Hotel Profile Fetch Error:', error);
      return {
        data: null,
        message: `Error retrieving hotel profile, ${error}`,
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Update - Update Hotel
  async updateHotel(req: Request): Promise<DataResponse> {
    const hotelId = req.params.hotelId;
    const updateData = req.body;

    try {
      const [existingHotel] = await database
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotelId));

      if (!existingHotel) {
        return {
          data: null,
          message: 'Hotel not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      const updatedData: Partial<NewHotel> = {
        ...updateData,
        ...(updateData.check_in_time && {
          check_in_time: new Date(updateData.check_in_time),
        }),
        ...(updateData.check_out_time && {
          check_out_time: new Date(updateData.check_out_time),
        }),
        updated_at: new Date(),
      };

      const [updatedHotel] = await database
        .update(hotels)
        .set(updatedData)
        .where(eq(hotels.id, hotelId))
        .returning();

      return {
        data: updatedHotel,
        message: 'Hotel updated successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  // Delete - Delete Specific Hotel (Soft Delete)
  async deleteHotel(req: Request): Promise<DataResponse> {
    const hotelId = req.params.hotelId;
    try {
      const [deletedHotel] = await database
        .update(hotels)
        .set({
          status: 'inactive' as HotelStatus,
          updated_at: new Date(),
        })
        .where(eq(hotels.id, hotelId))
        .returning();

      if (!deletedHotel) {
        return {
          data: null,
          message: 'Hotel not found',
          status: HttpStatusCodes.NOT_FOUND,
        };
      }

      return {
        data: deletedHotel,
        message: 'Hotel deleted successfully',
        status: HttpStatusCodes.OK,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}

export const hotelRepository = new Hotels();

