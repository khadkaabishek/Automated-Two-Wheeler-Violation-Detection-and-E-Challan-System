import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as paymentService from '../services/payment.service.js';

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(
    req.body,
    { id: req.user.id, roleName: req.user.roleName },
    req
  );
  new ApiResponse(res, 201, 'Payment processed successfully', payment);
});

export const listPayments = asyncHandler(async (req, res) => {
  const { payments, meta } = await paymentService.listPayments(req.query, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Payments retrieved successfully', { payments, meta });
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Payment retrieved successfully', payment);
});

export const confirmPayment = asyncHandler(async (req, res) => {
  const { transactionId, status } = req.body;
  const payment = await paymentService.confirmPayment(transactionId, status, req.user?.id, req);
  new ApiResponse(res, 200, 'Payment status updated', payment);
});

export const approvePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.approvePayment(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Payment approved — citation marked paid', payment);
});

export const rejectPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.rejectPayment(
    req.params.id,
    req.body.reason,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Payment rejected', payment);
});
