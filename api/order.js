const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrder,
  getOrdersByUser,
  updateOrder,
  deleteOrder,
} = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//GET /api/order
router.get("/", async (req, res, next) => {
  try {
    const allOrders = await getAllOrders();
    const order = allOrders.filter((order) => {
      return order;
    });
    res.send(order);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//POST /api/order
router.post("/", requireUser, async (req, res, next) => {
  const { orderId, total } = req.body;
  const orderData = {
    orderId: req.user.id,
    userId,
    total,
  };
  try {
    const order = await createOrder(orderData);
    if (order) {
      res.send(order);
    } else {
      next({
        name: "OrderCreationError",
        message: "Invalid Order",
      });
    }
  } catch ({ name, message }) {
    next({ name, message: `Order ID: ${orders.id} already exists!` });
  }
});

// PATCH /api/order/:orderId

router.patch("/:orderId", requireUser, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const orderObject = await getOrder(orderId); //may want to pass in getOrderByUser?
    if (!orderObject) {
      next({
        name: "not found",
        message: `Order ID ${orderId} not found`,
      });
    } else {
      const { userId, total } = req.body;
      if (req.user.id !== orderObject.userId) {
        res.status(403);
        next({
          name: "Unauthorized",
          message: `User ${req.user.username} is not allowed to update ${orderObject.name}`,
        });
      } else {
        const updatedOrder = await updateOrder({
          orderId: req.user.id,
          userId,
          total,
        });
        res.send(updatedOrder);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// do we need a patch? if so, here is the function. if not needed DELETE

// DELETE /api/order/:orderId

router.delete("/:orderId", requireUser, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const _order = await getOrder(orderId); //may want to pass in getOrderByUser?

    if (_order && _order.userId === req.user.id) {
      await deleteOrder(orderId);

      res.send(_order);
    } else {
      res.status(403);
      next(
        _order
          ? {
              name: "UnauthorizedUserError",
              message: `User ${req.user.username} is not allowed to delete ${_order.name}`,
            }
          : {
              name: "OrderNotFoundError",
              message: `User ${req.user.username} is not allowed to delete ${_order.name}`,
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;
