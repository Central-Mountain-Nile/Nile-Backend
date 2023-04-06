require("dotenv").config();
const express = require("express");
const app = express();
const apiRouter = require("./api/index");
const morgan = require("morgan");
const cors = require("cors");
const { resolve } = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const env = require("dotenv").config({ path: "./.env" });

app.use(cors());
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function(req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    }
  })
);

app.use(morgan("dev"));

app.use("/api", apiRouter);

app.use(express.static(process.env.STATIC_DIR));

app.get("/", (req, res) => {
  const path = resolve(process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "USD",
      amount: 1999,
      automatic_payment_methods: { enabled: true },
    });

    // Send publishable key and PaymentIntent details to client
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.post("/create-checkout-session", async (req, res) => {
  console.log('hit')
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        Price: "price_1234",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:8080?success=true`,
    cancel_url: `http://localhost:8080?canceled=true`,
  });
  console.log('hit2')
  res.redirect(303, session.url);
});


app.get("*", (req, res) => {
  res.status(404).send({
    name: "404 - Not Found",
    message: "No route found for the requested URL",
  });
});

app.use((error, req, res, next) => {
  console.error("SERVER ERROR: ", error);
  if (res.statusCode < 400) res.status(401);
  res.send({ name: error.name, message: error.message, error: error.message });
});

module.exports = app;
