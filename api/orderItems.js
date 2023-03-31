const express = require("express");
const { createOrderItems } = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//POST /api/orderItems
router.post("/", requireUser, async (req, res, next) => {
  const { orderId, productId, quantity } = req.body;
  const orderItemData = {
    orderId: req.user.id,
    productId,
    quantity,
  };
  try {
    const orderItem = await createOrderItems(orderItemData);
    if (orderItem) {
      res.send(orderItem);
    } else {
      next({
        name: "orderItemCreationError",
        message: "Invalid orderItem",
      });
    }
  } catch ({ name, message }) {
    next({ name, message: `orderItem ID: ${orderId} already exists!` });
  }
});
