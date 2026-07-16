import { v4 as uuidv4 } from 'uuid';
import ApiError from '../utils/ApiError.js';

/**
 * Each gateway adapter implements initiate(amount, metadata) and
 * returns { transactionId, status, gatewayResponse }.
 * Real gateway SDKs (eSewa, Khalti, Stripe) can be dropped in here later
 * without changing the payment service or controller layer.
 */
const gateways = {
  CASH: {
    async initiate({ amount }) {
      return {
        transactionId: `CASH-${uuidv4()}`,
        status: 'SUCCESS',
        gatewayResponse: { method: 'CASH', amount, note: 'Recorded manually by officer/counter' },
      };
    },
  },
  BANK_TRANSFER: {
    async initiate({ amount }) {
      return {
        transactionId: `BANK-${uuidv4()}`,
        status: 'PENDING',
        gatewayResponse: { method: 'BANK_TRANSFER', amount, note: 'Awaiting bank confirmation' },
      };
    },
  },
  ESEWA: {
    // eslint-disable-next-line no-unused-vars
    async initiate({ amount }) {
      throw ApiError.badRequest(
        'eSewa gateway integration is not yet configured. Add ESEWA_MERCHANT_ID/SECRET to enable it.'
      );
    },
  },
  KHALTI: {
    // eslint-disable-next-line no-unused-vars
    async initiate({ amount }) {
      throw ApiError.badRequest(
        'Khalti gateway integration is not yet configured. Add KHALTI_SECRET_KEY to enable it.'
      );
    },
  },
  STRIPE: {
    // eslint-disable-next-line no-unused-vars
    async initiate({ amount }) {
      throw ApiError.badRequest(
        'Stripe gateway integration is not yet configured. Add STRIPE_SECRET_KEY to enable it.'
      );
    },
  },
};

export const initiatePayment = async (method, amount, metadata = {}) => {
  const gateway = gateways[method];
  if (!gateway) {
    throw ApiError.badRequest(`Unsupported payment method: ${method}`);
  }
  return gateway.initiate({ amount, ...metadata });
};

export default gateways;
