import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user
        ? {
            user: env.smtp.user,
            pass: env.smtp.password,
          }
        : undefined,
    });
  }
  return transporter;
};

/**
 * Sends an email. In development, if SMTP is not configured, the email
 * is logged instead of sent, so local auth flows don't break.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.smtp.user || !env.smtp.password) {
    logger.warn(`SMTP not configured - skipping email send. Would have sent to ${to}: ${subject}`);
    logger.debug(`Email body: ${text || html}`);
    return { skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

export const sendPasswordResetEmail = async (to, resetToken, resetUrl) => {
  const link = `${resetUrl}?token=${resetToken}`;
  return sendEmail({
    to,
    subject: 'Password Reset Request - Smart Traffic System',
    html: `<p>You requested a password reset.</p><p>Click <a href="${link}">here</a> to reset your password. This link expires in 1 hour.</p><p>If you did not request this, please ignore this email.</p>`,
    text: `Reset your password: ${link} (expires in 1 hour). If you did not request this, ignore this email.`,
  });
};

export const sendEmailVerificationEmail = async (to, verificationToken, verifyUrl) => {
  const link = `${verifyUrl}?token=${verificationToken}`;
  return sendEmail({
    to,
    subject: 'Welcome to Smart Traffic - Verify Your Email',
    html: `<p>Welcome to the Smart Traffic citizen portal.</p><p>Click <a href="${link}">here</a> to verify your email address.</p>`,
    text: `Welcome to Smart Traffic. Verify your email: ${link}`,
  });
};

export const sendNewLoginEmail = async (to, { time, ipAddress }) => {
  return sendEmail({
    to,
    subject: 'New sign-in to your Smart Traffic account',
    html: `<p>Your Smart Traffic account was just signed in to.</p><p>Time: ${time}<br/>IP address: ${ipAddress || 'unknown'}</p><p>If this wasn't you, change your password immediately.</p>`,
    text: `New sign-in to your Smart Traffic account at ${time} from ${ipAddress || 'unknown'}. If this wasn't you, change your password immediately.`,
  });
};

export const sendChallanIssuedEmail = async (
  to,
  { challanNumber, vehicleNumber, fineAmount, violations }
) => {
  return sendEmail({
    to,
    subject: `New citation issued - ${challanNumber}`,
    html: `<p>A new citation has been issued against your vehicle <strong>${vehicleNumber}</strong>.</p><p>Citation number: ${challanNumber}<br/>Violations: ${violations}<br/>Fine amount: Rs ${fineAmount}</p><p>Sign in to the citizen portal to view details once it's approved.</p>`,
    text: `New citation ${challanNumber} issued against vehicle ${vehicleNumber}. Violations: ${violations}. Fine amount: Rs ${fineAmount}.`,
  });
};

export const sendChallanApprovedEmail = async (
  to,
  { challanNumber, vehicleNumber, fineAmount }
) => {
  return sendEmail({
    to,
    subject: `Citation approved - ${challanNumber}`,
    html: `<p>Your citation <strong>${challanNumber}</strong> against vehicle ${vehicleNumber} has been approved.</p><p>Fine amount due: Rs ${fineAmount}</p><p>You can now submit a payment request from the citizen portal.</p>`,
    text: `Citation ${challanNumber} against vehicle ${vehicleNumber} approved. Fine amount due: Rs ${fineAmount}. You can now submit a payment request.`,
  });
};

export const sendPaymentApprovedEmail = async (to, { challanNumber, amount }) => {
  return sendEmail({
    to,
    subject: `Payment confirmed - ${challanNumber}`,
    html: `<p>Your payment of <strong>Rs ${amount}</strong> for citation ${challanNumber} has been confirmed and the citation is now marked paid.</p>`,
    text: `Payment of Rs ${amount} for citation ${challanNumber} confirmed. Citation marked paid.`,
  });
};

export const sendPaymentRejectedEmail = async (to, { challanNumber, amount, reason }) => {
  return sendEmail({
    to,
    subject: `Payment not accepted - ${challanNumber}`,
    html: `<p>Your payment request of Rs ${amount} for citation ${challanNumber} was not accepted.</p><p>Reason: ${reason || 'Not specified'}</p><p>Please submit a new payment request from the citizen portal.</p>`,
    text: `Payment request of Rs ${amount} for citation ${challanNumber} was not accepted. Reason: ${reason || 'Not specified'}.`,
  });
};

export const sendDisputeResolvedEmail = async (to, { challanNumber, decision, resolutionNote }) => {
  const upheld = decision === 'UPHELD';
  return sendEmail({
    to,
    subject: `Dispute ${upheld ? 'upheld' : 'dismissed'} - ${challanNumber}`,
    html: upheld
      ? `<p>Your dispute for citation <strong>${challanNumber}</strong> was upheld — the citation has been voided.</p><p>Reviewer note: ${resolutionNote || 'None provided'}</p>`
      : `<p>Your dispute for citation <strong>${challanNumber}</strong> was reviewed and dismissed — the citation stands.</p><p>Reviewer note: ${resolutionNote || 'None provided'}</p>`,
    text: `Dispute for citation ${challanNumber} was ${upheld ? 'upheld — citation voided' : 'dismissed — citation stands'}. Reviewer note: ${resolutionNote || 'None provided'}.`,
  });
};

export default sendEmail;
