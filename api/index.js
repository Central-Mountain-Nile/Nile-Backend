const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getUsersById } = require("../db");
const { JWT_SECRET } = process.env;
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
// const bodyParser = require("body-parser");
// const cors = require("cors");

// GET /api/health
router.get("/health", async (req, res, next) => {
  try {
    res.send({ message: "Okay!" });
  } catch (error) {
    next(error);
  }
});
router.post("/payment", async (req, res) => {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Nile Marketplace",
      payment_method: id,
      confirm: true,
    });
    console.log("Payment", payment);
    res.json({
      message: "Payment successful",
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment failed",
      success: false,
    });
  }
});

router.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");
  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      if (id) {
        req.user = await getUsersById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

// ROUTER: /api/users
const usersRouter = require("./users");
router.use("/users", usersRouter);

// ROUTER: /api/cart
const cartRouter = require("./carts");
router.use("/carts", cartRouter);

// ROUTER: /api/order
const orderRouter = require("./order");
router.use("/order", orderRouter);

// ROUTER: /api/products
const productsRouter = require("./products");
router.use("/products", productsRouter);

// ROUTER: /api/users_payments
const users_paymentsRouter = require("./users_payments");
router.use("/users_payments", users_paymentsRouter);

// ROUTER: /api/users_payments
const discountsRouter = require("./discounts");
router.use("/discounts", discountsRouter);

const AdminRouter = require("./admin");
router.use("/admin", AdminRouter);
module.exports = router;
