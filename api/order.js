const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  createOrderItems,
  createOrderPayment,
  getCart,
  getCartItems,
  getPaymentById,
  clearCart,
  lowerQuantity,
  getProductById,
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
// total, orderItemData,
//POST /api/order
router.post("/", requireUser, async (req, res, next) => {
  const {userPaymentId } = req.body;
  const cart = await getCart(req.user.id)
  const cartItems = await getCartItems(req.user.id);
  if (cartItems.length === 0) {//check if the cart is empty
    next({ name: "orderError", message: "the cart has no items in it" });
    return
  }
  let total = 0;
  for(let i = 0; i < cartItems.length; i ++){
    total = total + Number(cartItems[i].price)
  }
  const orderData = {
    userId: req.user.id,
    total,
  };
  //check that the products have enough quantity else go next
  for(let i = 0; i < cartItems.length; i++){
    const product = await getProductById(cartItems[i].productId)
    console.log(cartItems[i].quantity, product.quantity)
    if(cartItems[i].quantity > product.quantity){
      next({name:"orderError",message:`not enough of ${product.name} left in stock`})
      return;
    }


  }
  try {
    const order = await createOrder(orderData);
    if (!order) {
      next({
        name: "OrderCreationError",
        message: "Invalid Order",
      });
      return;
    }
    const userPayment = await getPaymentById(userPaymentId)
    const orderPayment = await createOrderPayment({
      orderId: order.id,
      provider: userPayment.provider,
      status:"good"
    });
    order.payment = orderPayment;
     let orders = [];
     for (let i = 0; i < cartItems.length; i++) {
       const orderItem = await createOrderItems({
         orderId: order.id,
         productId: cartItems[i].productId,
         quantity: cartItems[i].quantity
       });
       orders.push(orderItem);
       await lowerQuantity(cartItems[i].productId,cartItems[i].quantity)
     }
     order.item = orders;
     const clear = await clearCart(cart.id)

    res.send(order);
  } catch ({ name, message }) {
    next({ name:"orderError", message: `problem with orders` });
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
