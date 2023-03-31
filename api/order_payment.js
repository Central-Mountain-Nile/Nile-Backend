const express = require("express");
const { createOrderPayment } = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//POST /api/orderItems
router.post("/", requireUser, async (req, res, next) => {
  const { orderId, provider, status } = req.body;
  const orderPaymentData = {
    orderId: req.user.id,
    provider,
    status,
  };
  try {
    const orderPayment = await createOrderPayment(orderPaymentData);
    if (orderPayment) {
      res.send(orderPayment);
    } else {
      next({
        name: "OrderPaymentCreationError",
        message: "Invalid Order Payment",
      });
    }
  } catch ({ name, message }) {
    next({ name, message: `Order Payment ID: ${orderId} already exists!` });
  }
});
