import { Request, Response, Router } from "express";
import { profileService } from "../services/profile";
import { MulterRequest, upload } from "../utils/config/multer";
import contentAwareImageMiddleware from "../middleware/contentAwareImageMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

export const ProfileRoute = Router();

// get all user profiles
ProfileRoute.get('/all-profiles', authMiddleware, (req: Request, res: Response) => {
  return profileService.getAllProfile(req, res);
});

// get a specific user profile
ProfileRoute.get('/:profileId', authMiddleware, (req: Request, res: Response) => {
  return profileService.getSpecificProfile(req, res);
});

// Register a user profile
ProfileRoute.post('/register', authMiddleware, upload.single('profilePicture'), contentAwareImageMiddleware({
  maxWidth: 500,
  maxHeight: 500,
  quality: 85
}), (req: Request, res: Response) => {
  return profileService.registerProfile(req as MulterRequest, res);
});

// Update a user Profile
ProfileRoute.patch('/update/:profileId', authMiddleware, upload.single('profilePicture'), contentAwareImageMiddleware({
  maxWidth: 500,
  maxHeight: 500,
  quality: 85
}), (req: Request, res: Response) => {
  return profileService.updateProfile(req as MulterRequest, res);
});

// Delete a user Profile
ProfileRoute.delete('/delete/:profileId', authMiddleware, (req: Request, res: Response) => {
  return profileService.deleteProfile(req, res);
});
