const express = require("./client");
const { getCart, addToCart } = require("../db/cart");
const { deleteCartItem, getCartItem } = require("../db/cartItems");
const { requireUser } = require("./utils");
const cartRouter = express.Router();
// get cart /api/cart/
cartRouter.get("/",  requireUser, async (req, res, next) => {
  try {
    //uses the check login to make sure that user exists
    const userId = req.user.id;
    res.send(cart);

    const cart = await getCart(userId);
  } catch (e) {
    next({
      name: "'cartError",
      message: "error",
    });
  }
});
// add to cart /api/cart/
cartRouter.post("/", requireUser, async (req, res, next) => {
  const { productId, quantity } = req.body;
  //get cart frm user token

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

//remove from cart /api/cart/
cartRouter.delete("/", requireUser, async (req, res, next) => {
  const { cartItemId } = req.body;
  try {
    //check if cart item exists
    const check = await getCartItem(cartItemId);
    if (!check) {
      next({
        name: "notFoundError",
        message: `the cartItem with id ${cartItemId} was not found`,
      });
    }

    const cartItem = await deleteCartItem(cartItemId);
    res.send(cartItem);
  } catch (error) {
    next({
      name: "remove from cart Error",
      message: "Could not find this cart item",
    });
  }
});
