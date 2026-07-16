import prisma from '../config/database.js';
import logger from '../config/logger.js';
import {
  sendNewLoginEmail,
  sendChallanIssuedEmail,
  sendChallanApprovedEmail,
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from './email.service.js';

/**
 * A vehicle owner's notification address is their linked User account email
 * if they have one (self-registered citizens always do), falling back to the
 * contact email on the owner profile itself (for owners created by staff
 * without a linked login).
 */
const resolveOwnerEmail = async (ownerId) => {
  const owner = await prisma.vehicleOwner.findUnique({
    where: { id: ownerId },
    include: { user: { select: { email: true } } },
  });
  return owner?.user?.email || owner?.email || null;
};

/**
 * Every notification is best-effort: a broken SMTP config or a missing
 * owner email should never fail the underlying business operation (issuing
 * a challan, approving a payment, etc.) that triggered it.
 */
const safeSend = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    logger.error(`Notification "${label}" failed to send: ${err.message}`);
  }
};

export const notifyNewLogin = (user, req) =>
  safeSend('new-login', () =>
    sendNewLoginEmail(user.email, {
      time: new Date().toISOString(),
      ipAddress: req?.ip,
    })
  );

export const notifyChallanIssued = (challan) =>
  safeSend('challan-issued', async () => {
    const email = await resolveOwnerEmail(challan.vehicle.ownerId);
    if (!email) return;
    const violations = (challan.challanViolations || []).map((cv) => cv.violation.name).join(', ');
    await sendChallanIssuedEmail(email, {
      challanNumber: challan.challanNumber,
      vehicleNumber: challan.vehicle.vehicleNumber,
      fineAmount: challan.fineAmount,
      violations,
    });
  });

export const notifyChallanApproved = (challan) =>
  safeSend('challan-approved', async () => {
    const email = await resolveOwnerEmail(challan.vehicle.ownerId);
    if (!email) return;
    await sendChallanApprovedEmail(email, {
      challanNumber: challan.challanNumber,
      vehicleNumber: challan.vehicle.vehicleNumber,
      fineAmount: challan.fineAmount,
    });
  });

export const notifyPaymentApproved = (payment, challan) =>
  safeSend('payment-approved', async () => {
    const email = await resolveOwnerEmail(challan.vehicle.ownerId);
    if (!email) return;
    await sendPaymentApprovedEmail(email, {
      challanNumber: challan.challanNumber,
      amount: payment.amount,
    });
  });

export const notifyPaymentRejected = (payment, challan, reason) =>
  safeSend('payment-rejected', async () => {
    const email = await resolveOwnerEmail(challan.vehicle.ownerId);
    if (!email) return;
    await sendPaymentRejectedEmail(email, {
      challanNumber: challan.challanNumber,
      amount: payment.amount,
      reason,
    });
  });
