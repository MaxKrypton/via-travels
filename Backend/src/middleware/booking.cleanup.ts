import { Request, Response, NextFunction } from "express";
import { HttpStatusCodes } from "../utils/helpers";
import { bookingRepository } from "../repository/Hotel.booking";

interface BookingCleanupOptions {
  skipRoutes?: string[];
  logActivity?: boolean;
}

export const BookingCleanup = (options: BookingCleanupOptions = {}) => {
  const {
    skipRoutes = ['/health', '/status', '/metrics', '/favicon.ico', '/robots.txt'],
    logActivity = process.env.NODE_ENV === 'development'
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if we should skip this route
      if (skipRoutes.includes(req.path)) {
        return next();
      }

      // Free up the booking space
      const expiredPendingPayments = await bookingRepository.processExpiredPendingPayments();
      const expiredCheckouts = await bookingRepository.processExpiredCheckouts();

      // Validate that both methods returned numbers
      if (typeof expiredPendingPayments !== "number" || typeof expiredCheckouts !== "number") {
        console.error('[BookingCleanup] Invalid return types from cleanup methods:', {
          expiredPendingPayments: typeof expiredPendingPayments,
          expiredCheckouts: typeof expiredCheckouts,
          path: req.path,
          timestamp: new Date().toISOString()
        });

        // Don't fail the request, just log the error and continue
        // This prevents cleanup issues from breaking user requests
        return next();
      }

      // Log activity if enabled and there were cleanups
      if (logActivity && (expiredPendingPayments > 0 || expiredCheckouts > 0)) {
        console.log(`[BookingCleanup] Processed ${expiredPendingPayments} expired payments and ${expiredCheckouts} expired checkouts on ${req.method} ${req.path}`);
      }

      // Continue to next middleware
      next();
    } catch (error) {
      console.error('[BookingCleanup] Error during cleanup process:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      // Don't fail the request due to cleanup errors
      // The user's request should still be processed even if cleanup fails
      next();
    }
  };
};
