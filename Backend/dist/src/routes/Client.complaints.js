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
exports.complaintsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Client_complaints_1 = require("../services/Client.complaints");
const Router = express_1.default.Router();
Router.post('/send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Client_complaints_1.ComplaintService.sendComplaints(req, res);
}));
Router.post('/glitch/send', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    Client_complaints_1.ComplaintService.softwareGlitchComplaints(req, res);
}));
exports.complaintsRoutes = Router;
