import { HttpStatusCodes, SECRETS } from '../utils/helpers';
import { DataResponse, IFlutterPaymentDataResponse } from './../utils/types';
import axios from 'axios';

// Flutterwave will be initialized lazily when needed
console.log('🔧 Flutterwave Configuration:');
console.log(`   Public Key: ${SECRETS.FLW_PUBLIC_KEY?.substring(0, 15)}...`);
console.log(`   API URL: ${SECRETS.FLUTTERWAVE_API_URL}`);

export interface IFlutterwavePaymentUserDetails {
  amount: number | string;
  currency: string;
  redirect_url?: string;
  name: string;
  email: string;
  phone_number: number | string;
  customizationsTitle: string;
  customizationsDescription: string;
}

const generateTxRef = (): string => {
  return `rwpay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

class FlutterWavePaymentRepository {
  async Payment(
    userDetails: IFlutterwavePaymentUserDetails, subAccountId?: string
  ): Promise<DataResponse | undefined> {
    try {
      const {
        amount,
        currency = 'RWF',
        email,
        phone_number,
        name,
        customizationsTitle,
        customizationsDescription,
      } = userDetails;

      // Validation
      if (!amount) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          message: 'Missing required field: amount',
        };
      }

      if (!email || !name) {
        return {
          status: HttpStatusCodes.BAD_REQUEST,
          message: 'Missing required fields: email and name',
        };
      }

      const tx_ref = generateTxRef();

      // Build payload - only include subaccounts if subAccountId is provided
      const payload: any = {
        tx_ref,
        amount: parseFloat(String(amount)),
        currency,
        redirect_url: 'https://nestly.com/payment/callback',
        customer: {
          email,
          phonenumber: phone_number || '250000000000',
          name,
        },
        customizations: {
          title: customizationsTitle || 'Nestly Hotel Booking',
          description: customizationsDescription || 'Hotel room booking payment',
          logo: 'https://nestly.com/logo.png'
        },
        configurations: {
          session_duration: 30,
          max_retry_attempt: 2,
        },
      };

      // Only add subaccounts if provided
      if (subAccountId) {
        payload.subaccounts = [
          {
            id: subAccountId,
            transaction_charge_type: 'percentage',
            transaction_charge: 0.05,
          },
        ];
      }

      console.log('💳 ============ PAYMENT INITIATION START ============');
      console.log(`   Transaction Ref: ${tx_ref}`);
      console.log(`   Amount: ${amount} ${currency}`);
      console.log(`   Customer: ${name} (${email})`);

      try {
        const response: IFlutterPaymentDataResponse = await axios.post(
          `${SECRETS.FLUTTERWAVE_API_URL}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${SECRETS.FLW_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('✅ Payment initiated successfully!');
        console.log(`   Status: ${response.data.status}`);

        const { status, data } = response.data;
        const { link } = data;

        if (status === 'success') {
          console.log(`   Checkout Link: ${link}`);
          console.log('============ PAYMENT INITIATION END ============\n');

          return {
            status: HttpStatusCodes.OK,
            message: `Complete your payment within 30 minutes using the checkout link to secure your booking`,
            data: {
              checkout_link: link,
              tx_ref,
            },
          };
        } else {
          console.error('❌ Payment initiation returned non-success status');
          console.error('============ PAYMENT INITIATION END ============\n');

          return {
            status: HttpStatusCodes.BAD_REQUEST,
            message: 'Payment processing failed',
            data: response.data
          };
        }
      } catch (error: any) {
        console.error('❌ ============ PAYMENT ERROR ============');
        console.error(`   Status: ${error.response?.status}`);
        console.error(`   Message: ${error.message}`);

        if (error.response?.data) {
          console.error(`   Flutterwave Error:`, JSON.stringify(error.response.data, null, 2));
        }

        console.error('============ PAYMENT ERROR END ============\n');

        return {
          status: HttpStatusCodes.BAD_REQUEST,
          message: `Payment processing failed: ${error.response?.data?.message || error.message}`,
          data: error.response?.data
        };
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in payment processing:', error);
      return {
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        message: `Card payment processing failed: ${error?.message || error}`,
      };
    }
  }

  // Method to verify payment status
  async verifyPayment(tx_ref: string): Promise<DataResponse | undefined> {
    if (!tx_ref) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        message: 'Transaction reference is required',
      };
    }

    console.log('🔍 ============ PAYMENT VERIFICATION START ============');
    console.log(`   Transaction Ref: ${tx_ref}`);

    try {
      const response: IFlutterPaymentDataResponse = await axios.get(
        `${SECRETS.FLUTTERWAVE_PAYMENT_VERIFICATION_URL}?tx_ref=${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${SECRETS.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { status, data } = response.data;

      console.log(`   Verification Status: ${status}`);

      if (status === 'success') {
        console.log('✅ Payment verified successfully!');
        console.log(`   Amount: ${data.amount} ${data.currency}`);
        console.log(`   Payment Status: ${data.status}`);
        console.log('============ PAYMENT VERIFICATION END ============\n');

        return {
          status: HttpStatusCodes.OK,
          message: 'Payment was done successfully',
          data: data
        };
      } else {
        console.error('❌ Payment verification failed');
        console.error('============ PAYMENT VERIFICATION END ============\n');

        return {
          status: HttpStatusCodes.BAD_REQUEST,
          message: 'Payment verification failed',
          data: response.data
        };
      }
    } catch (error: any) {
      console.error('❌ ============ VERIFICATION ERROR ============');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.message}`);

      if (error.response?.data) {
        console.error(`   Error Details:`, JSON.stringify(error.response.data, null, 2));
      }

      console.error('============ VERIFICATION ERROR END ============\n');

      return {
        status: HttpStatusCodes.BAD_REQUEST,
        message: `Encountered an error while verifying payment: ${error?.message || error}`,
        data: error.response?.data
      };
    }
  }

}

export const paymentRepository = new FlutterWavePaymentRepository();
