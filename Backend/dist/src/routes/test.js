"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeRoute = void 0;
const express_1 = require("express");
const helpers_1 = require("../utils/helpers");
exports.welcomeRoute = (0, express_1.Router)();
exports.welcomeRoute.get('/test', (res) => {
    res.status(helpers_1.HttpStatusCodes.OK).json("Welcome to Nestly App");
});
