const express = require("./client");
const { getCart, addToCart } = require("../db/cart");
const { deleteCartItem } = require("../db/cartItems");
const cartRouter = express.Router();
// get cart /api/cart/
cartRouter.get("/", async (req, res, next) => {
  try {
    //check that user token sent belongs to cart
    //else send error for bad cart request or user not existing
    const userId = req.user.id
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
cartRouter.post("/", async (req,res,next)=>{
    const { productId, cartId, quantity } = req.body;
    try {
        const cartItem = await addToCart({productId, cartId, quantity});
        res.send(cartItem);
      } catch (error) {
        next({
            name: "add to cart Error",
          message: "Could not find this product",
        });
      }
})

//remove from cart /api/cart/
cartRouter.delete("/", async (req,res,next)=>{
  const { cartItemId } = req.body;
  try {
      const cartItem = await deleteCartItem(cartItemId)
      res.send(cartItem);
    } catch (error) {
      next({
          name: "remove from cart Error",
        message: "Could not find this cart item",
      });
    }



})