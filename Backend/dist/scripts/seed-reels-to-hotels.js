"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../src/utils/config/database");
const schema_1 = require("../src/utils/config/schema");
const drizzle_orm_1 = require("drizzle-orm");
const File_upload_1 = __importDefault(require("../src/repository/File.upload"));
const REELS_DIR = path_1.default.resolve(__dirname, "../../Frontend/assets/reels");
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v"]);
const shuffle = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
};
const getReelFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    const entries = yield promises_1.default.readdir(REELS_DIR, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => path_1.default.join(REELS_DIR, entry.name))
        .filter((filePath) => VIDEO_EXTENSIONS.has(path_1.default.extname(filePath).toLowerCase()));
});
const toMulterFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const buffer = yield promises_1.default.readFile(filePath);
    const stats = yield promises_1.default.stat(filePath);
    const originalname = path_1.default.basename(filePath);
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
        stream: undefined,
    };
});
const titleForReel = (filePath) => {
    const fileName = path_1.default.basename(filePath, path_1.default.extname(filePath));
    return `Reel ${fileName}`;
};
const pickHotelForReel = (activeHotels, index) => {
    return activeHotels[index % activeHotels.length];
};
const seedReelsToHotels = () => __awaiter(void 0, void 0, void 0, function* () {
    const reelFiles = shuffle(yield getReelFiles());
    if (reelFiles.length === 0) {
        console.log(`No reel videos found in ${REELS_DIR}`);
        return;
    }
    const activeHotels = shuffle(yield database_1.database.select().from(schema_1.hotels).where((0, drizzle_orm_1.eq)(schema_1.hotels.status, "active")));
    if (activeHotels.length === 0) {
        throw new Error("No active hotels found. Seed hotels before assigning reels.");
    }
    const reelTitles = reelFiles.map(titleForReel);
    const existingReels = yield database_1.database
        .select({ title: schema_1.videos.title })
        .from(schema_1.videos)
        .where((0, drizzle_orm_1.inArray)(schema_1.videos.title, reelTitles));
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
        const file = yield toMulterFile(reelPath);
        const videoUrl = yield File_upload_1.default.uploadFileToS3(file);
        if (!videoUrl || typeof videoUrl !== "string") {
            throw new Error(`Failed to upload ${path_1.default.basename(reelPath)} to S3`);
        }
        yield database_1.database.insert(schema_1.videos).values({
            hotel_id: hotel.id,
            title,
            video_url: videoUrl,
            view_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
        });
        createdCount += 1;
        console.log(`Assigned ${path_1.default.basename(reelPath)} to ${hotel.name}`);
    }
    console.log(`Done. Created ${createdCount} video rows, skipped ${skippedCount} existing reels.`);
});
seedReelsToHotels()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error("Failed to seed reels:", error);
    process.exit(1);
});
