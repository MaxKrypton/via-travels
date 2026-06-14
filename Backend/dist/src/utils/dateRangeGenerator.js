"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDateRange = void 0;
// Helper functions for date operations
const generateDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
};
exports.generateDateRange = generateDateRange;
