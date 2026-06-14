const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Flutterwave
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

// Helper function to generate transaction reference
const generateTxRef = () => {
  return `rwpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to verify webhook signature
const verifyWebhookSignature = (signature, payload) => {
  const hash = crypto
    .createHmac('sha256', process.env.FLW_SECRET_HASH)
    .update(payload, 'utf8')
    .digest('hex');
  return hash === signature;
};

// 1. CARD PAYMENT ENDPOINT (Rwanda)
app.post('/api/payment/card', async (req, res) => {
  try {
    const {
      amount,
      currency = 'RWF',
      email,
      phone_number,
      name,
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      redirect_url,
      meta = {}
    } = req.body;

    // Validate required fields
    if (!amount || !email || !card_number || !cvv || !expiry_month || !expiry_year) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: amount, email, card_number, cvv, expiry_month, expiry_year'
      });
    }

    const tx_ref = generateTxRef();

    // Prepare payment payload for Rwanda
    const payload = {
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      currency,
      amount: parseFloat(amount),
      redirect_url: redirect_url || 'https://your-app.com/payment/callback',
      email,
      phone_number,
      fullname: name || 'Rwanda Customer',
      tx_ref,
      enckey: process.env.FLW_ENCRYPTION_KEY,
      meta: {
        consumer_id: meta.consumer_id || tx_ref,
        consumer_mac: meta.consumer_mac || 'N/A',
        ...meta
      }
    };

    console.log('Processing card payment for Rwanda:', { tx_ref, amount, currency, email });

    // Process card payment
    const response = await flw.Charge.card(payload);

    if (response.status === 'success') {
      const { data } = response;

      if (data.status === 'successful') {
        // Payment successful
        return res.json({
          status: 'success',
          message: 'Payment completed successfully',
          data: {
            tx_ref: data.tx_ref,
            flw_ref: data.flw_ref,
            transaction_id: data.id,
            amount: data.amount,
            currency: data.currency,
            charged_amount: data.charged_amount,
            processor_response: data.processor_response,
            payment_type: data.payment_type
          }
        });
      } else if (data.status === 'pending') {
        // Requires additional authentication (3D Secure, PIN, etc.)
        return res.json({
          status: 'pending',
          message: 'Payment requires additional authentication',
          data: {
            tx_ref: data.tx_ref,
            flw_ref: data.flw_ref,
            transaction_id: data.id,
            auth_model: data.auth_model,
            auth_url: data.auth_url,
            mode: data.mode
          }
        });
      } else {
        // Payment failed
        return res.status(400).json({
          status: 'failed',
          message: data.processor_response || 'Payment failed',
          data: {
            tx_ref: data.tx_ref,
            processor_response: data.processor_response
          }
        });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: response.message || 'Payment processing failed',
        data: response
      });
    }

  } catch (error) {
    console.error('Card payment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// 2. MOBILE MONEY PAYMENT ENDPOINT (Rwanda - MTN & Airtel)
app.post('/api/payment/mobile-money', async (req, res) => {
  try {
    const {
      amount,
      currency = 'RWF',
      email,
      phone_number,
      name,
      network, // MTN or AIRTEL
      redirect_url,
      meta = {}
    } = req.body;

    // Validate required fields
    if (!amount || !email || !phone_number || !network) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: amount, email, phone_number, network'
      });
    }

    // Validate Rwanda phone number format
    const rwandaPhoneRegex = /^(\+250|250|0)?[7][0-9]{8}$/;
    const cleanPhone = phone_number.replace(/[\s\-\(\)]/g, '');

    if (!rwandaPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Rwanda phone number format. Use format: +250xxxxxxxxx or 07xxxxxxxx'
      });
    }

    // Format phone number for Rwanda
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '250' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+250')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('250')) {
      formattedPhone = '250' + formattedPhone;
    }

    const tx_ref = generateTxRef();

    // Prepare mobile money payload for Rwanda
    const payload = {
      tx_ref,
      amount: parseFloat(amount),
      currency,
      email,
      phone_number: formattedPhone,
      fullname: name || 'Rwanda Customer',
      network: network.toUpperCase(),
      type: 'mobile_money_rwanda',
      country: 'RW',
      redirect_url: redirect_url || 'https://your-app.com/payment/callback',
      meta: {
        consumer_id: meta.consumer_id || tx_ref,
        ...meta
      }
    };

    console.log('Processing mobile money payment for Rwanda:', {
      tx_ref,
      amount,
      currency,
      network: network.toUpperCase(),
      phone: formattedPhone
    });

    // Process mobile money payment
    const response = await flw.MobileMoney.rwanda(payload);

    if (response.status === 'success') {
      const { data } = response;

      if (data.status === 'pending') {
        return res.json({
          status: 'pending',
          message: 'Please check your phone and enter your PIN to complete the payment',
          data: {
            tx_ref: data.tx_ref,
            flw_ref: data.flw_ref,
            transaction_id: data.id,
            amount: data.amount,
            currency: data.currency,
            network: network.toUpperCase(),
            phone_number: formattedPhone,
            processor_response: data.processor_response
          }
        });
      } else if (data.status === 'successful') {
        return res.json({
          status: 'success',
          message: 'Mobile money payment completed successfully',
          data: {
            tx_ref: data.tx_ref,
            flw_ref: data.flw_ref,
            transaction_id: data.id,
            amount: data.amount,
            currency: data.currency,
            charged_amount: data.charged_amount
          }
        });
      } else {
        return res.status(400).json({
          status: 'failed',
          message: data.processor_response || 'Mobile money payment failed',
          data: {
            tx_ref: data.tx_ref,
            processor_response: data.processor_response
          }
        });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: response.message || 'Mobile money payment processing failed',
        data: response
      });
    }

  } catch (error) {
    console.error('Mobile money payment error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Mobile money payment processing failed',
      error: error.message
    });
  }
});

// 3. VERIFY PAYMENT ENDPOINT
app.get('/api/payment/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;

    console.log('Verifying payment:', tx_ref);

    const response = await flw.Transaction.verify({ id: tx_ref });

    if (response.status === 'success') {
      const { data } = response;

      if (data.status === 'successful' && data.currency === 'RWF') {
        return res.json({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            tx_ref: data.tx_ref,
            flw_ref: data.flw_ref,
            transaction_id: data.id,
            amount: data.amount,
            currency: data.currency,
            charged_amount: data.charged_amount,
            customer: {
              name: data.customer.name,
              email: data.customer.email,
              phone: data.customer.phone_number
            },
            payment_type: data.payment_type,
            processor_response: data.processor_response,
            created_at: data.created_at
          }
        });
      } else {
        return res.json({
          status: 'failed',
          message: 'Payment verification failed or payment not successful',
          data: {
            tx_ref: data.tx_ref,
            status: data.status,
            processor_response: data.processor_response
          }
        });
      }
    } else {
      return res.status(400).json({
        status: 'error',
        message: response.message || 'Payment verification failed',
        data: response
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// 4. VALIDATE PAYMENT ENDPOINT (Additional security layer)
app.post('/api/payment/validate/:flw_ref', async (req, res) => {
  try {
    const { flw_ref } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP is required for payment validation'
      });
    }

    const payload = {
      flw_ref,
      otp
    };

    const response = await flw.Charge.validate(payload);

    if (response.status === 'success') {
      return res.json({
        status: 'success',
        message: 'Payment validated successfully',
        data: response.data
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: response.message || 'Payment validation failed',
        data: response
      });
    }

  } catch (error) {
    console.error('Payment validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Payment validation failed',
      error: error.message
    });
  }
});

// 5. WEBHOOK ENDPOINT
app.post('/api/payment/webhook', (req, res) => {
  try {
    const signature = req.headers['verif-hash'];
    const payload = JSON.stringify(req.body);

    console.log('Webhook received:', { signature, event: req.body.event });

    // Verify webhook signature
    if (!verifyWebhookSignature(signature, payload)) {
      console.log('Invalid webhook signature');
      return res.status(400).json({
        status: 'error',
        message: 'Invalid webhook signature'
      });
    }

    const { event, data } = req.body;

    // Handle different webhook events
    switch (event) {
      case 'charge.completed':
        console.log('Payment completed webhook:', {
          tx_ref: data.tx_ref,
          flw_ref: data.flw_ref,
          amount: data.amount,
          currency: data.currency,
          status: data.status
        });

        // Verify the payment amount and currency for Rwanda
        if (data.currency === 'RWF' && data.status === 'successful') {
          // Update your database
          // Send confirmation email/SMS
          // Update order status
          // Log successful payment
          console.log('Rwanda payment successful:', data.tx_ref);
        }
        break;

      case 'charge.failed':
        console.log('Payment failed webhook:', {
          tx_ref: data.tx_ref,
          processor_response: data.processor_response
        });
        // Handle failed payment
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed'
    });
  }
});

// 6. GET PAYMENT FEES ENDPOINT
app.get('/api/payment/fees', async (req, res) => {
  try {
    const { amount, currency = 'RWF', payment_type = 'card' } = req.query;

    if (!amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount is required'
      });
    }

    // Calculate fees for Rwanda payments
    let fee = 0;
    let total = parseFloat(amount);

    if (payment_type === 'card') {
      // Typical card fees in Rwanda (adjust based on your agreement)
      fee = Math.max(total * 0.035, 100); // 3.5% or minimum 100 RWF
    } else if (payment_type === 'mobile_money') {
      // Mobile money fees in Rwanda
      fee = Math.max(total * 0.02, 50); // 2% or minimum 50 RWF
    }

    return res.json({
      status: 'success',
      data: {
        amount: total,
        currency,
        payment_type,
        fee: Math.round(fee),
        total_amount: Math.round(total + fee)
      }
    });

  } catch (error) {
    console.error('Fee calculation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Fee calculation failed',
      error: error.message
    });
  }
});

// 7. REFUND PAYMENT ENDPOINT
app.post('/api/payment/refund/:flw_ref', async (req, res) => {
  try {
    const { flw_ref } = req.params;
    const { amount, comments = 'Customer refund request' } = req.body;

    const payload = {
      ref: flw_ref
    };

    if (amount) {
      payload.amount = parseFloat(amount);
    }

    console.log('Processing refund:', { flw_ref, amount });

    const response = await flw.Transaction.refund(payload);

    if (response.status === 'success') {
      return res.json({
        status: 'success',
        message: 'Refund processed successfully',
        data: {
          refund_id: response.data.id,
          flw_ref: response.data.flw_ref,
          amount: response.data.amount,
          currency: response.data.currency,
          status: response.data.status,
          created_at: response.data.created_at
        }
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: response.message || 'Refund processing failed',
        data: response
      });
    }

  } catch (error) {
    console.error('Refund error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Refund processing failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Flutterwave Rwanda Payment API is running',
    country: 'Rwanda',
    supported_currencies: ['RWF'],
    supported_networks: ['MTN', 'AIRTEL'],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Flutterwave Rwanda Payment API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Supported payment methods: Card, MTN Mobile Money, Airtel Mobile Money');
  console.log('Currency: RWF (Rwandan Franc)');
});

module.exports = app;
