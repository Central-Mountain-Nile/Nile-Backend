const express = require("./client");
const { getCart, addToCart } = require("../db/cart");
const cartRouter = express.Router();

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