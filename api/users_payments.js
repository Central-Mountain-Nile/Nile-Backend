const express = require("express");
const {
  getPaymentById,
  patchPayment,
  createPayment,
  deletePayment,
  getPaymentByUser,
} = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

// GET /api/user_payments
router.get("/", requireUser, async (req, res, next) => {
  const { userId } = req.user.id;

  try {
    const getPayments = await getPaymentByUser(userId);
    const payment = getPayments.filter((payment) => {
      return payment;
    });

    res.send(payment);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users_payments
router.post("/", requireUser, async (req, res, next) => {
  const { paymentType, provider, accountNo, expire } = req.body;

  const paymentData = {
    userId: req.user.id,
    paymentType,
    provider,
    accountNo,
    expire,
  };

  try {
    const post = await createPayment(paymentData);
    if (post) {
      res.send(post);
    } else {
      next({
        name: "PaymentCreationError",
        message: "Error creating payment.",
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message: `An payment with ID ${paymentData.paymentId} already exists`,
    });
  }
});

// PATCH /api/users_payments/:paymentId
router.patch("/:paymentId", requireUser, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const getPaymentId = await getPaymentById(paymentId);

    if (!getPaymentId) {
      next({
        name: "PaymentNotFound",
        message: `Payment ${paymentId} not found`,
      });
    } else {
      const { paymentType, provider, accountNo } = req.body;

        const updatedPayment = await patchPayment({
          id: paymentId,
          paymentType,
          provider,
          accountNo,
        });
        res.send(updatedPayment);
    }
  } catch (error) {
    throw error
  }
});

// DELETE /api/users_payments/:paymentId

router.delete("/:paymentId", requireUser, async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await getPaymentById(paymentId);

    if (payment && payment.userId === req.user.id) {
      await deletePayment(paymentId);

      res.send(payment);
    } else {
      res.status(403);
      next(
        payment
          ? {
              name: "UnauthorizedUserError",
              message: `User ${req.user.username} is not allowed to delete payment with ID ${paymentId}`,
            }
          : {
              name: "paymentNotFoundError",
              message: `User ${req.user.username} is not allowed to delete payment with ID ${paymentId}`,
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;
