
// Define the newUserTypes type
export type RegisterUserTypes = {
  username: string;
  email: string;
  password: string;
  email_verified: boolean;
};

export type UserDataProfile = {
  id: string;
  username: string;
  email: string;
  password: string;
  auth_provider: string;
  email_verified: boolean;
}

export interface UserTypes {
  id: string;
  username: string;
  email: string;
  password: string;
  auth_provider: string
  email_verified: boolean;
}

export type loginDataType = {
  email: string;
  password: string;
}

export type resetPasswordDataType = {
  email: string;
  password: string;
  confirmPassword: string;
};

export interface NoDataResponse {
  message: string,
  status: number
}

export interface DataResponse {
  message: string,
  status: number,
  data?: any
}

export interface IFlutterPaymentDataResponse {
  message: string,
  status: string,
  data?: any
}

export interface profileDataTypes {
  userId: number,
  first_name: string,
  last_name: string,
  phone_number: string,
  date_of_birth: string,
  profilePicture: string,
  preferred_language: string,
  preferred_currency: string
}

export interface updateProfileDataTypes {
  profile_id: string
  first_name: string,
  last_name: string,
  phone_number: string,
  date_of_birth: string,
  avatar_url: string,
  preferred_language: string,
  preferred_currency: string
}

export interface existingUserTypes {
  userId: string | null,
  profileId: string | null,
  email: string | null
}

export type paymentOptions = "Visa" | "MasterCard" | "Momo" | "Irembo";
export type RoleOptions = "customer" | "hotel-manager" | "via-admin";

export interface HotelMediaTypes {
  hotel_id: string;
  media_type: 'photo' | 'video';
  media_category: 'landscape' | 'portrait' | 'profile' | 'room' | 'gallery' | 'sponsored' | 'virtualTours';
  url: string;
}

// Types for Hotel Operations
export type CreateHotelType = {
  name: string;
  short_description?: string;
  long_description?: string;
  star_rating: number;
  property_type: string;
  built_year?: number;
  last_renovation_year?: number;
  category?: string;
  street_address: string;
  city: string;
  state: string;
  province?: string;
  country: string;
  postal_code?: string;
  latitude?: any;
  longitude?: any;
  map_url?: string;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy?: string;
  payment_options?: PaymentOptions[];
  menu_download_url?: string;
  sponsored?: boolean;
  status?: "active" | "inactive";
};

export interface RoomTypes {
  hotel_id: string;
  type: 'single' | 'double' | 'king';
  description?: string;
  max_occupancy: number;
  num_beds: number;
  room_size?: any;
  total_rooms: number;
}

export interface RoomPricingTypes {
  room_type_id: string;
  base_price: any;
  currency: string;
  tax_percentage: any;
  child_policy?: string;
}

export interface RoomAvailabilityInfo {
  room_id: string;
  room_type: string;
  total_inventory: number;
  available_rooms: number;
  booked_rooms: number;
  max_occupancy: number;
  num_beds: number;
  room_size: string | null;
  description: string | null;
}

export interface HotelRoomSummary {
  hotel_id: string;
  hotel_name: any;
  total_room_types: number;
  total_rooms: number;
  available_rooms: number;
  occupancy_rate: number;
  room_types: RoomAvailabilityInfo[];
}


export interface PriceModifierTypes {
  room_type_id: string;
  modifier_type: string;
  percentage: any;
  start_date: string;
  end_date: string;
}

export interface HotelReviewTypes {
  hotel_id: string;
  user_name: string;
  profile_picture?: string;
  content: string;
  rating?: any;
}

export interface complaintsDataType {
  username?: string,
  email?: string,
  hotelName: string,
  subject: string,
  message: string
}

export interface IsubAccountInfo {
  account_number: string,
  account_bank: string,
  full_name: string,
  created_at?: string,
  split_type?: string,
  split_value?: number,
  subaccount_id: string,
  bank_name?: string
}

export type CreatedUserType = {
  id: string;
  created_at: Date;
  updated_at: Date;
  username: string;
  email: string;
  password: string | null;
  auth_provider: string | null;
  email_verified: boolean | null;
}

export interface InvitationData {
  inviteeUsername: string;
  inviteeEmail: string;
  inviteeRole: 'customer' | 'hotel-manager' | 'via-admin';
  hotelId?: string;
}

export interface InviteEmailData {
  inviteeUsername: string;
  inviteeEmail: string;
  inviterName: string;
  inviterRole: string;
  inviteeRole: string;
  password: string;
  hotelId?: string;
  hotelName?: string;
}
