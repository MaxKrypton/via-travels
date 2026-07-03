import fs from "fs/promises";
import path from "path";
import { database } from "../src/utils/config/database";
import { hotels, videos } from "../src/utils/config/schema";
import { eq, inArray } from "drizzle-orm";
import fileUpload from "../src/repository/File.upload";

const REELS_DIR = path.resolve(__dirname, "../../Frontend/assets/reels");
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v"]);

type Hotel = typeof hotels.$inferSelect;

const shuffle = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

const getReelFiles = async (): Promise<string[]> => {
  const entries = await fs.readdir(REELS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(REELS_DIR, entry.name))
    .filter((filePath) => VIDEO_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
};

const toMulterFile = async (filePath: string): Promise<Express.Multer.File> => {
  const buffer = await fs.readFile(filePath);
  const stats = await fs.stat(filePath);
  const originalname = path.basename(filePath);

  return {
    fieldname: "video",
    originalname,
    encoding: "7bit",
    mimetype: "video/mp4",
    size: stats.size,
    destination: "",
    filename: originalname,
    path: filePath,
    buffer,
    stream: undefined as never,
  };
};

const titleForReel = (filePath: string): string => {
  const fileName = path.basename(filePath, path.extname(filePath));
  return `Reel ${fileName}`;
};

const pickHotelForReel = (activeHotels: Hotel[], index: number): Hotel => {
  return activeHotels[index % activeHotels.length];
};

const seedReelsToHotels = async () => {
  const reelFiles = shuffle(await getReelFiles());

  if (reelFiles.length === 0) {
    console.log(`No reel videos found in ${REELS_DIR}`);
    return;
  }

  const activeHotels = shuffle(
    await database.select().from(hotels).where(eq(hotels.status, "active"))
  );

  if (activeHotels.length === 0) {
    throw new Error("No active hotels found. Seed hotels before assigning reels.");
  }

  const reelTitles = reelFiles.map(titleForReel);
  const existingReels = await database
    .select({ title: videos.title })
    .from(videos)
    .where(inArray(videos.title, reelTitles));
  const existingTitles = new Set(existingReels.map((video) => video.title));

  let createdCount = 0;
  let skippedCount = 0;

  for (const [index, reelPath] of reelFiles.entries()) {
    const title = titleForReel(reelPath);

    if (existingTitles.has(title)) {
      skippedCount += 1;
      console.log(`Skipped existing reel: ${title}`);
      continue;
    }

    const hotel = pickHotelForReel(activeHotels, index);
    const file = await toMulterFile(reelPath);
    const videoUrl = await fileUpload.uploadFileToS3(file);

    if (!videoUrl || typeof videoUrl !== "string") {
      throw new Error(`Failed to upload ${path.basename(reelPath)} to S3`);
    }

    await database.insert(videos).values({
      hotel_id: hotel.id,
      title,
      video_url: videoUrl,
      view_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    createdCount += 1;
    console.log(`Assigned ${path.basename(reelPath)} to ${hotel.name}`);
  }

  console.log(
    `Done. Created ${createdCount} video rows, skipped ${skippedCount} existing reels.`
  );
};

seedReelsToHotels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed reels:", error);
    process.exit(1);
  });
