import { Response, Router } from "express";
import { HttpStatusCodes } from "../utils/helpers";

export const welcomeRoute = Router()

welcomeRoute.get('/test', (res: Response) => {
  res.status(HttpStatusCodes.OK).json("Welcome to Nestly App");
})
