const express = require("express");
const {
  deleteCartItem,
  getCartItems,
  getCart,
  addToCart,
  getCartItem,
  updateCartItem,
} = require("../db/");
const { requireUser } = require("./utils");
const cartRouter = express.Router();
// get cart /api/carts/
cartRouter.get("/", requireUser, async (req, res, next) => {
  try {
    //uses the check login to make sure that user exists
    const userId = req.user.id;
    console.log;
    const cart = await getCart(userId);
    const cartItems = await getCartItems(userId);
    console.log(cartItems);
    cart.cartItems = cartItems;
    res.send(cart);
  } catch (e) {
    next({
      name: "'cartError",
      message: "error",
    });
  }
});
// add to cart /api/carts/
cartRouter.post("/", requireUser, async (req, res, next) => {
  const { productId, quantity } = req.body;
  //get cart frm user token

  //check if product is already in cart

  try {
    const cart = await getCart(req.user.id);

    const cartItem = await addToCart({ productId, cartId: cart.id, quantity });
    res.send(cartItem);
  } catch (error) {
    next({
      name: "add to cart Error",
      message: "Could not find this product",
    });
  }
});

//remove from cart /api/carts/
cartRouter.delete("/", requireUser, async (req, res, next) => {
  const { cartItemId } = req.body;
  try {
    //check if cart item exists
    const cart = await getCartItems(req.user.id);
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id === cartItemId) {
        const cartItem = await deleteCartItem(cartItemId);
        res.send(cartItem);
        return;
      }
    }
    next({
      name: "remove from cart Error",
      message: "selected Item is not in cart",
    });
  } catch (error) {
    next({
      name: "remove from cart Error",
      message: "Could not find this cart item",
    });
  }
});

cartRouter.patch("/", requireUser, async (req, res, next) => {
  const { quantity, cartItemId } = req.body;
  const cart = await getCartItems(req.user.id);
  try {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id === cartItemId) {
        if (quantity === 0) {
          //delete if new quantity is 0
          const cartItem = await deleteCartItem(cartItemId);
          res.send(cartItem);
          return;
        } else {
          const cartItem = await updateCartItem({
            id: cartItemId,
            quantity
          });
          res.send(cartItem);
          return;
        }
      }
    }
    next({
      name: "remove from cart Error",
      message: "selected Item is not in cart",
    });
  } catch (e) {
    next({
      name: "DBError",
      message: "problem connecting with db",
    });
  }
});
module.exports = cartRouter;
