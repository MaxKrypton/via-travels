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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = exports.Complaints = void 0;
const helpers_1 = require("../utils/helpers");
const sendEmails_1 = require("../repository/sendEmails");
const EmailingTemplates_1 = require("../utils/EmailingTemplates");
const sendEmails_2 = require("../repository/sendEmails");
class Complaints {
    sendComplaints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userData = {
                    email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
                    username: (_b = req.user) === null || _b === void 0 ? void 0 : _b.username,
                };
                const { hotelName, subject, message } = req.body;
                yield (0, sendEmails_1.sendComplainsEmail)({
                    firstname: userData.username,
                    complainerEmail: userData.email,
                    hotelName,
                    subject,
                    message
                });
                return res.status(helpers_1.HttpStatusCodes.OK).json({ message: "Complaint sent successfully." });
            }
            catch (error) {
                console.error("Error sending complaint email:", error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to send complaint." });
            }
        });
    }
    softwareGlitchComplaints(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const data = {
                    email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
                    username: (_b = req.user) === null || _b === void 0 ? void 0 : _b.username,
                    role: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role
                };
                const severity = req.body.severity;
                const issueDescription = req.body.issueDescription;
                const glitchEmail = EmailingTemplates_1.emailingOptions.softwareGlitchReport(data.username, data.email, data.role, issueDescription, severity);
                yield (0, sendEmails_2.softwareGlitchEmail)({
                    username: data.username,
                    emailTemplate: glitchEmail
                });
                return res.status(helpers_1.HttpStatusCodes.OK).json({ message: "Software Glitch sent successfully." });
            }
            catch (error) {
                console.error("Error sending glitch report:", error);
                return res.status(helpers_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to send complaint." });
            }
        });
    }
}
exports.Complaints = Complaints;
exports.ComplaintService = new Complaints();
