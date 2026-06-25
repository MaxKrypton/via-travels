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
const postgres_1 = __importDefault(require("postgres"));
const seed_tourism_entries_1 = require("./seed-tourism-entries");
const seed_tourism_entries_batch3_1 = require("./seed-tourism-entries-batch3");
const validTargets = new Set(['all', 'batch2', 'batch3', 'accommodation', 'planning-prices']);
function getTarget() {
    var _a;
    const target = ((_a = process.argv[2]) !== null && _a !== void 0 ? _a : 'all').toLowerCase();
    if (!validTargets.has(target)) {
        console.error(`Unknown seed target "${target}". Use one of: all, batch2, batch3, accommodation, planning-prices.`);
        process.exit(1);
    }
    return target;
}
function runSqlSeed(seedFile) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const connectionString = process.env.NEON_DATABASE_URL;
        if (!connectionString) {
            throw new Error('NEON_DATABASE_URL is missing. Check Backend/.env.');
        }
        const seedPath = path_1.default.join(__dirname, seedFile);
        const seedSql = yield promises_1.default.readFile(seedPath, 'utf8');
        const sql = (0, postgres_1.default)(connectionString, { ssl: 'require' });
        try {
            const result = yield sql.unsafe(seedSql);
            console.log(`Applied ${seedFile}; affected ${(_a = result.count) !== null && _a !== void 0 ? _a : 0} rows.`);
        }
        finally {
            yield sql.end();
        }
    });
}
function seedAccommodation() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSqlSeed('accommodation-tourism-entries.sql');
    });
}
function seedPlanningPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        yield runSqlSeed('planning-prices.sql');
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const target = getTarget();
        if (target === 'all' || target === 'batch2') {
            yield (0, seed_tourism_entries_1.seedBatch2)();
        }
        if (target === 'all' || target === 'batch3') {
            yield (0, seed_tourism_entries_batch3_1.seedBatch3)();
        }
        if (target === 'all' || target === 'accommodation') {
            yield seedAccommodation();
        }
        if (target === 'planning-prices') {
            yield seedPlanningPrices();
        }
        console.log('Tourism seed completed.');
    });
}
run().catch((error) => {
    console.error('Tourism seed failed:', error);
    process.exit(1);
});
