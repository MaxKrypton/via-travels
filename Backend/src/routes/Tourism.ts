import { Router, Request, Response } from 'express';
import { tourismRepository } from '../repository/Tourism.entries';
import { authMiddleware } from '../middleware/authMiddleware';
import { rolesAndPermissions } from '../middleware/RolesAndPermissions';

export const TourismRoutes = Router();

// Public — browse attractions
TourismRoutes.get('/entries', (req: Request, res: Response) => {
  tourismRepository.getAllEntries(req).then(r => res.status(r.status).json(r));
});

// Protected — generate itinerary
TourismRoutes.post('/itinerary/generate', authMiddleware, (req: Request, res: Response) => {
  tourismRepository.generateItinerary(req).then(r => res.status(r.status).json(r));
});

// Protected — get my saved itineraries
TourismRoutes.get('/itinerary/saved', authMiddleware, (req: Request, res: Response) => {
  tourismRepository.getSavedItineraries(req).then(r => res.status(r.status).json(r));
});

// Admin only — manage entries
TourismRoutes.post('/entries', authMiddleware, rolesAndPermissions.viaAdminOnly, (req: Request, res: Response) => {
  tourismRepository.createEntry(req).then(r => res.status(r.status).json(r));
});

TourismRoutes.patch('/entries/:id', authMiddleware, rolesAndPermissions.viaAdminOnly, (req: Request, res: Response) => {
  tourismRepository.updateEntry(req).then(r => res.status(r.status).json(r));
});

TourismRoutes.delete('/entries/:id', authMiddleware, rolesAndPermissions.viaAdminOnly, (req: Request, res: Response) => {
  tourismRepository.deleteEntry(req).then(r => res.status(r.status).json(r));
});