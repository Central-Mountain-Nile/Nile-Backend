const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrder,
  getOrdersByUser,
} = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

//GET /api/order
router.get("/order", async (req, res, next) => {
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
router.post("/order", requireUser, async (req, res, next) => {
  const { userId, total } = req.body;
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
    next({ name, message: `Order ID: ${orderId} already exists!` });
  }
});

// router.patch("/:orderId", requireUser, async (req, res, next) => {
//   try {
//     const { orderId } = req.params;
//     const orderObject = await getOrder(orderId); //may want to pass in getOrderByUser?
//     if (!orderObject) {
//       next({
//         name: "not found",
//         message: `Order ID ${orderId} not found`,
//       });
//     } else {
//       const { userId, total } = req.body;
//       if (req.user.id !== orderObject.userId) {
//         res.status(403);
//         next({
//           name: "Unauthorized",
//           message: `User ${req.user.username} is not allowed to update ${routineObject.name}`,
//         });
//       } else {
//         const updatedOrder = await updateOrder({
//           orderId: req.user.id,
//           userId,
//           total,
//         });
//         res.send(updatedOrder);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

// do we need a patch? if so, here is the function. if not needed DELETE

module.exports = router;
