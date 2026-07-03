import { and, eq } from "drizzle-orm";
import { database } from "../src/utils/config/database";
import { hotels, room, roomPricing } from "../src/utils/config/schema";

type Hotel = typeof hotels.$inferSelect;
type RoomInsert = typeof room.$inferInsert;
type RoomPricingInsert = typeof roomPricing.$inferInsert;

type RoomTemplate = {
  type: string;
  description: string;
  maxOccupancy: number;
  numBeds: number;
  roomSize: number;
  inventoryShare: number;
  priceMultiplier: number;
};

const KNOWN_BASE_PRICES_USD: Record<string, number> = {
  "Akagera Game Lodge": 150,
  "Gorillas Hotel Kigali": 30,
  "Heaven Restaurant & Boutique Hotel": 60,
  "Kigali Serena Hotel": 120,
  "Kinigi Guesthouse": 20,
  "Sabyinyo Silverback Lodge": 600,
};

const DEFAULT_ROOM_TEMPLATES: RoomTemplate[] = [
  {
    type: "Standard Room",
    description: "Comfortable room for short stays with essential amenities, private bathroom, desk, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 24,
    inventoryShare: 0.45,
    priceMultiplier: 1,
  },
  {
    type: "Deluxe Room",
    description: "Larger room with upgraded furnishings, city or garden views, private bathroom, workspace, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 32,
    inventoryShare: 0.3,
    priceMultiplier: 1.35,
  },
  {
    type: "Twin Room",
    description: "Flexible room with two beds, private bathroom, workspace, and Wi-Fi for friends or colleagues.",
    maxOccupancy: 2,
    numBeds: 2,
    roomSize: 30,
    inventoryShare: 0.15,
    priceMultiplier: 1.15,
  },
  {
    type: "Suite",
    description: "Spacious suite with separate sitting area, premium amenities, private bathroom, workspace, and Wi-Fi.",
    maxOccupancy: 3,
    numBeds: 1,
    roomSize: 48,
    inventoryShare: 0.1,
    priceMultiplier: 1.85,
  },
];

const LODGE_ROOM_TEMPLATES: RoomTemplate[] = [
  {
    type: "Garden Room",
    description: "Quiet lodge room with private bathroom, warm local finishes, garden access, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 28,
    inventoryShare: 0.45,
    priceMultiplier: 1,
  },
  {
    type: "View Room",
    description: "Scenic room with private bathroom, sitting area, nature or lake views, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 34,
    inventoryShare: 0.3,
    priceMultiplier: 1.35,
  },
  {
    type: "Family Cottage",
    description: "Family-friendly cottage with additional sleeping space, private bathroom, sitting area, and Wi-Fi.",
    maxOccupancy: 4,
    numBeds: 2,
    roomSize: 52,
    inventoryShare: 0.15,
    priceMultiplier: 1.65,
  },
  {
    type: "Premium Suite",
    description: "Premium lodge suite with generous living space, upgraded amenities, private bathroom, and scenic views.",
    maxOccupancy: 3,
    numBeds: 1,
    roomSize: 58,
    inventoryShare: 0.1,
    priceMultiplier: 2.15,
  },
];

const APARTMENT_ROOM_TEMPLATES: RoomTemplate[] = [
  {
    type: "Studio Apartment",
    description: "Self-contained studio with sleeping area, kitchenette, private bathroom, workspace, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 36,
    inventoryShare: 0.45,
    priceMultiplier: 1,
  },
  {
    type: "One Bedroom Apartment",
    description: "Apartment with separate bedroom, living area, kitchenette, private bathroom, and Wi-Fi.",
    maxOccupancy: 2,
    numBeds: 1,
    roomSize: 52,
    inventoryShare: 0.3,
    priceMultiplier: 1.35,
  },
  {
    type: "Two Bedroom Apartment",
    description: "Spacious apartment with two bedrooms, living area, kitchenette, private bathroom, and Wi-Fi.",
    maxOccupancy: 4,
    numBeds: 2,
    roomSize: 78,
    inventoryShare: 0.2,
    priceMultiplier: 1.8,
  },
  {
    type: "Executive Apartment",
    description: "Premium serviced apartment with expanded living space, kitchenette, workspace, and Wi-Fi.",
    maxOccupancy: 4,
    numBeds: 2,
    roomSize: 92,
    inventoryShare: 0.05,
    priceMultiplier: 2.25,
  },
];

const getTemplatesForHotel = (hotel: Hotel): RoomTemplate[] => {
  const descriptor = `${hotel.name} ${hotel.property_type} ${hotel.category ?? ""}`.toLowerCase();

  if (descriptor.includes("apartment") || descriptor.includes("residence") || descriptor.includes("suites")) {
    return APARTMENT_ROOM_TEMPLATES;
  }

  if (descriptor.includes("lodge") || descriptor.includes("guesthouse") || descriptor.includes("retreat")) {
    return LODGE_ROOM_TEMPLATES;
  }

  return DEFAULT_ROOM_TEMPLATES;
};

const roundedPrice = (value: number): string => {
  const rounded = Math.max(18, Math.round(value / 5) * 5);
  return rounded.toFixed(2);
};

const getBasePrice = (hotel: Hotel): number => {
  const knownPrice = KNOWN_BASE_PRICES_USD[hotel.name];
  if (knownPrice) return knownPrice;

  const starRating = Number(hotel.star_rating || 3);
  const sponsoredPremium = hotel.sponsored ? 1.1 : 1;
  const roomCountFactor = hotel.total_rooms >= 120 ? 1.1 : hotel.total_rooms <= 25 ? 0.9 : 1;
  const kigaliPremium = hotel.city?.toLowerCase().includes("kigali") ? 1.08 : 1;
  const propertyDescriptor = `${hotel.property_type} ${hotel.category ?? ""}`.toLowerCase();
  const lodgePremium = propertyDescriptor.includes("lodge") ? 1.25 : 1;
  const apartmentDiscount = propertyDescriptor.includes("apartment") ? 0.85 : 1;

  return 28 * starRating * sponsoredPremium * roomCountFactor * kigaliPremium * lodgePremium * apartmentDiscount;
};

const allocateInventory = (totalRooms: number, templates: RoomTemplate[]): number[] => {
  const inventory = templates.map((template) => Math.max(1, Math.round(totalRooms * template.inventoryShare)));
  let allocated = inventory.reduce((sum, count) => sum + count, 0);

  while (allocated > totalRooms && inventory.some((count) => count > 1)) {
    const largestIndex = inventory.indexOf(Math.max(...inventory));
    inventory[largestIndex] -= 1;
    allocated -= 1;
  }

  while (allocated < totalRooms) {
    const largestShareIndex = templates.indexOf(
      templates.reduce((largest, template) =>
        template.inventoryShare > largest.inventoryShare ? template : largest
      )
    );
    inventory[largestShareIndex] += 1;
    allocated += 1;
  }

  return inventory;
};

const roomExists = async (hotelId: string, roomType: string): Promise<boolean> => {
  const existing = await database
    .select({ id: room.id })
    .from(room)
    .where(and(eq(room.hotel_id, hotelId), eq(room.type, roomType)))
    .limit(1);

  return existing.length > 0;
};

const pricingExists = async (roomTypeId: string): Promise<boolean> => {
  const existing = await database
    .select({ id: roomPricing.id })
    .from(roomPricing)
    .where(eq(roomPricing.roomTypeId, roomTypeId))
    .limit(1);

  return existing.length > 0;
};

const createPricingForRoom = async (
  roomTypeId: string,
  roomFee: string,
  serviceFee: string
): Promise<void> => {
  const pricingData: RoomPricingInsert = {
    roomTypeId,
    roomFee,
    serviceFee,
    currency: "USD",
    tax_percentage: "18.00",
    child_policy:
      "Children under 6 stay free when using existing bedding. Children 6-12 may share with adults; extra beds are subject to availability and hotel confirmation.",
    created_at: new Date(),
    updated_at: new Date(),
  };

  await database.insert(roomPricing).values(pricingData);
};

const backfillMissingPrices = async () => {
  const existingRooms = await database.select().from(room);
  let createdPrices = 0;

  for (const existingRoom of existingRooms) {
    if (await pricingExists(existingRoom.id)) continue;

    const [hotel] = await database.select().from(hotels).where(eq(hotels.id, existingRoom.hotel_id)).limit(1);
    if (!hotel) continue;

    const basePrice = getBasePrice(hotel);
    const templates = getTemplatesForHotel(hotel);
    const matchingTemplate = templates.find((template) => template.type === existingRoom.type) ?? templates[0];
    const roomFee = roundedPrice(basePrice * matchingTemplate.priceMultiplier);
    const serviceFee = roundedPrice(Number(roomFee) * 0.08);

    await createPricingForRoom(existingRoom.id, roomFee, serviceFee);
    createdPrices += 1;
  }

  return createdPrices;
};

const seedHotelRooms = async () => {
  const activeHotels = await database.select().from(hotels).where(eq(hotels.status, "active"));

  if (activeHotels.length === 0) {
    throw new Error("No active hotels found. Seed hotels before seeding rooms.");
  }

  let createdRooms = 0;
  let createdPrices = 0;
  let hotelsWithoutNewRooms = 0;

  for (const hotel of activeHotels) {
    const templates = getTemplatesForHotel(hotel);
    const inventory = allocateInventory(Math.max(hotel.total_rooms || templates.length, templates.length), templates);
    const basePrice = getBasePrice(hotel);
    let hotelCreatedRooms = 0;

    for (const [index, template] of templates.entries()) {
      if (await roomExists(hotel.id, template.type)) continue;

      const roomData: RoomInsert = {
        hotel_id: hotel.id,
        type: template.type,
        description: template.description,
        max_occupancy: template.maxOccupancy,
        num_beds: template.numBeds,
        room_size: template.roomSize.toFixed(2),
        total_inventory: inventory[index],
        available_inventory: inventory[index],
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [createdRoom] = await database.insert(room).values(roomData).returning();
      createdRooms += 1;

      const roomFee = roundedPrice(basePrice * template.priceMultiplier);
      const serviceFee = roundedPrice(Number(roomFee) * 0.08);
      await createPricingForRoom(createdRoom.id, roomFee, serviceFee);
      createdPrices += 1;
      hotelCreatedRooms += 1;
    }

    if (hotelCreatedRooms === 0) {
      hotelsWithoutNewRooms += 1;
      console.log(`Skipped ${hotel.name}; all default room types already exist`);
    } else {
      console.log(`Created ${hotelCreatedRooms} room types for ${hotel.name}`);
    }
  }

  const backfilledPrices = await backfillMissingPrices();

  console.log(
    `Done. Created ${createdRooms} rooms, created ${createdPrices + backfilledPrices} prices, skipped ${hotelsWithoutNewRooms} hotels with complete default room sets.`
  );
};

seedHotelRooms()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed hotel rooms:", error);
    process.exit(1);
  });
