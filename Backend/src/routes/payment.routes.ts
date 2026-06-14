// Backend/src/routes/payment.routes.ts
import { Router, Request, Response } from 'express';
import { paymentRepository } from '../repository/FlutterwavePayment';
import { authMiddleware } from '../middleware/authMiddleware';
import { HttpStatusCodes } from '../utils/helpers';
import crypto from 'crypto';

export const PaymentRoutes = Router();

// Initiate payment (create payment link)
PaymentRoutes.post('/initiate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      amount,
      currency,
      name,
      email,
      phone_number,
      customizationsTitle,
      customizationsDescription,
      subAccountId
    } = req.body;

    if (!amount || !email || !phone_number || !name) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Missing required fields: amount, email, phone_number, name'
      });
    }

    const userDetails = {
      amount,
      currency: currency || 'RWF',
      name,
      email,
      phone_number,
      customizationsTitle: customizationsTitle || 'Hotel Booking Payment',
      customizationsDescription: customizationsDescription || 'Complete your hotel booking'
    };

    const result = await paymentRepository.Payment(userDetails, subAccountId);

    return res.status(result?.status || HttpStatusCodes.OK).json(result);
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Payment initiation failed',
      error: error.message
    });
  }
});

// Verify payment status
PaymentRoutes.get('/verify/:tx_ref', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Transaction reference is required'
      });
    }

    const result = await paymentRepository.verifyPayment(tx_ref);

    return res.status(result?.status || HttpStatusCodes.OK).json(result);
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Webhook endpoint for Flutterwave callbacks
PaymentRoutes.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha256', process.env.FLW_SECRET_HASH || '')
      .update(payload, 'utf8')
      .digest('hex');

    if (hash !== signature) {
      console.log('Invalid webhook signature');
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Invalid webhook signature'
      });
    }

    const { event, data } = req.body;

    console.log('Webhook received:', { event, tx_ref: data?.tx_ref, status: data?.status });

    // Handle different webhook events
    switch (event) {
      case 'charge.completed':
        if (data.status === 'successful' && data.currency === 'RWF') {
          console.log('Payment successful:', {
            tx_ref: data.tx_ref,
            amount: data.amount,
            customer: data.customer.email
          });
          // Booking status will be updated when user verifies payment
        }
        break;

      case 'charge.failed':
        console.log('Payment failed:', {
          tx_ref: data.tx_ref,
          reason: data.processor_response
        });
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return res.status(HttpStatusCodes.OK).json({
      status: 'success',
      message: 'Webhook processed'
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Webhook processing failed'
    });
  }
});

// Calculate payment fees
PaymentRoutes.get('/fees', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, payment_type } = req.query;

    if (!amount) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Amount is required'
      });
    }

    const amountNum = parseFloat(amount as string);
    let fee = 0;

    if (payment_type === 'card') {
      fee = Math.max(amountNum * 0.035, 100); // 3.5% or min 100 RWF
    } else {
      fee = Math.max(amountNum * 0.02, 50); // 2% or min 50 RWF
    }

    return res.status(HttpStatusCodes.OK).json({
      status: 'success',
      data: {
        amount: amountNum,
        currency: 'RWF',
        fee: Math.round(fee),
        total: Math.round(amountNum + fee)
      }
    });
  } catch (error: any) {
    console.error('Fee calculation error:', error);
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Fee calculation failed'
    });
  }
});