import paymentRepository from '../repositories/payment.repository.js';
import challanRepository from '../repositories/challan.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { initiatePayment } from './paymentGateway.service.js';
import { recordAudit } from './audit.service.js';
import { notifyPaymentApproved, notifyPaymentRejected } from './notification.service.js';
import { ROLES } from '../constants/roles.js';

/**
 * Citizens submit a payment REQUEST here — it always lands as PENDING and
 * does not mark the challan paid by itself. A Traffic Police officer or
 * Super Admin must explicitly approve or reject it (see approvePayment /
 * rejectPayment below). This matches the real-world workflow: an officer
 * confirms cash was actually received, or a bank/gateway reference is valid,
 * before a violation is considered settled.
 */
export const createPayment = async (payload, actor, req) => {
  const challan = await challanRepository.findById(payload.challanId);
  if (!challan) {
    throw ApiError.badRequest('Invalid violation ID');
  }

  if (actor.roleName === ROLES.VEHICLE_OWNER && challan.vehicle?.owner?.userId !== actor.id) {
    throw ApiError.notFound('Invalid violation ID');
  }

  if (challan.status !== 'APPROVED') {
    throw ApiError.badRequest('Only APPROVED violations can be paid');
  }
  if (Number(payload.amount) !== Number(challan.fineAmount)) {
    throw ApiError.badRequest(`Payment amount must equal the challan fine amount (${challan.fineAmount})`);
  }

  await recordAudit({ userId: actor.id, action: 'PAYMENT_INITIATED', details: { challanId: challan.id }, req });

  // Still runs through the gateway abstraction so a transaction reference is
  // recorded and unconfigured gateways (eSewa/Khalti/Stripe) still fail
  // clearly here — but the resulting status is never trusted directly; the
  // payment always starts PENDING until a staff member reviews it.
  const gatewayResult = await initiatePayment(payload.paymentMethod, payload.amount, {
    challanId: challan.id,
  });

  const payment = await paymentRepository.create({
    challanId: challan.id,
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    transactionId: gatewayResult.transactionId,
    gatewayResponse: gatewayResult.gatewayResponse,
    status: 'PENDING',
    paymentDate: null,
  });

  return payment;
};

export const listPayments = async (query, actor) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['amount', 'paymentDate', 'createdAt'], 'createdAt');

  const where = {};
  if (query.status) where.status = query.status;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;
  if (query.challanId) where.challanId = query.challanId;

  if (actor?.roleName === ROLES.VEHICLE_OWNER) {
    where.challan = { vehicle: { owner: { userId: actor.id } } };
  }

  const [payments, total] = await Promise.all([
    paymentRepository.findMany({ where, skip, take, orderBy }),
    paymentRepository.count(where),
  ]);

  return { payments, meta: buildPaginationMeta(total, page, limit) };
};

export const getPaymentById = async (id, actor) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');

  if (actor?.roleName === ROLES.VEHICLE_OWNER && payment.challan?.vehicle?.owner?.userId !== actor.id) {
    throw ApiError.notFound('Payment not found');
  }

  return payment;
};

/**
 * Traffic Police / Super Admin approves a pending payment request: marks it
 * SUCCESS, marks the challan PAID, and notifies the owner.
 */
export const approvePayment = async (id, actorId, req) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'PENDING') {
    throw ApiError.badRequest('Only pending payment requests can be approved');
  }

  const updated = await paymentRepository.update(id, { status: 'SUCCESS', paymentDate: new Date() });
  const challan = await challanRepository.update(payment.challanId, {
    status: 'PAID',
    paymentStatus: 'SUCCESS',
  });

  await recordAudit({ userId: actorId, action: 'PAYMENT_SUCCESS', details: { paymentId: id }, req });
  await notifyPaymentApproved(updated, challan);

  return updated;
};

/**
 * Traffic Police / Super Admin rejects a pending payment request (e.g. cash
 * never actually received, invalid reference number). The challan stays
 * APPROVED so the citizen can submit a new payment request.
 */
export const rejectPayment = async (id, reason, actorId, req) => {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== 'PENDING') {
    throw ApiError.badRequest('Only pending payment requests can be rejected');
  }

  const updated = await paymentRepository.update(id, { status: 'FAILED' });
  const challan = await challanRepository.update(payment.challanId, { paymentStatus: 'FAILED' });

  await recordAudit({ userId: actorId, action: 'PAYMENT_FAILED', details: { paymentId: id, reason }, req });
  await notifyPaymentRejected(updated, challan, reason);

  return updated;
};

/**
 * Webhook-style callback for async gateways (eSewa/Khalti/Stripe) to confirm
 * or fail a previously PENDING payment. Kept for when a real gateway is wired
 * up; the manual approvePayment/rejectPayment above is the primary path today.
 */
export const confirmPayment = async (transactionId, status, actorId, req) => {
  const payment = await paymentRepository.findByTransactionId(transactionId);
  if (!payment) throw ApiError.notFound('Payment not found for this transaction ID');

  const updated = await paymentRepository.update(payment.id, {
    status,
    paymentDate: status === 'SUCCESS' ? new Date() : payment.paymentDate,
  });

  if (status === 'SUCCESS') {
    const challan = await challanRepository.update(payment.challanId, {
      status: 'PAID',
      paymentStatus: 'SUCCESS',
    });
    await recordAudit({ userId: actorId, action: 'PAYMENT_SUCCESS', details: { paymentId: payment.id }, req });
    await notifyPaymentApproved(updated, challan);
  } else if (status === 'FAILED') {
    const challan = await challanRepository.update(payment.challanId, { paymentStatus: 'FAILED' });
    await recordAudit({ userId: actorId, action: 'PAYMENT_FAILED', details: { paymentId: payment.id }, req });
    await notifyPaymentRejected(updated, challan, 'Gateway reported failure');
  }

  return updated;
};
