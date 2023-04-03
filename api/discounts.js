const express = require("express");
const {
  createDiscount,
  getAllDiscounts,
  editDiscounts,
  getDiscountsByProduct,
  deleteDiscounts,
} = require("../db");
const { requireUser } = require("./utils");
const router = express.Router();
const jwt = require("jsonwebtoken");

// GET /api/discounts
router.get("/", async (req, res, next) => {
  try {
    const allDiscounts = await getAllDiscounts();
    const discount = allDiscounts.filter((discount) => {
      console.log(discount, "!!!!!!!!!!");
      return discount;
    });

    res.send(discount);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/discounts
router.post("/", requireUser, async (req, res, next) => {
  console.log("!!!!!!!!!!!");
  const { productId, name, description, discountPercent, active } = req.body;

  const discountData = {
    userId: req.user.id,
    productId,
    name,
    description,
    discountPercent,
    active,
  };

  try {
    const post = await createDiscount(discountData);
    if (post) {
      res.send(post);
    } else {
      next({
        name: "DiscountCreationError",
        message: "Error creating discount.",
      });
    }
  } catch ({ name, message }) {
    next({
      name,
      message: `An discount with ID ${discountData.productId} already exists`,
    });
  }
});

// PATCH /api/discounts/:productId
router.patch("/:productId", requireUser, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const getProductId = await getDiscountsByProduct(productId);
    console.log(getProductId);
    if (!getProductId) {
      next({
        name: "DiscountNotFound",
        message: `Discount ${productId} not found`,
      });
    } else {
      const { productId, name, description, discountPercent, active } =
        req.body;
      try {
        const updatedDiscount = await editDiscounts({
          id: productId,
          name,
          description,
          discountPercent,
          active,
        });
        res.send(updatedDiscount);
      } catch (error) {
        next({
          name: "",
          message: `A discount with ID ${productId} already exists`,
        });
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

// DELETE /api/discounts/:productId

router.delete("/:productId", requireUser, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const discount = await getPaymentById(productId);

    if (discount && discount.userId === req.user.id) {
      await deleteDiscounts(productId);

      res.send(discount);
    } else {
      res.status(403);
      next(
        discount
          ? {
              name: "UnauthorizedUserError",
              message: `User ${req.user.username} is not allowed to delete payment with ID ${productId}`,
            }
          : {
              name: "paymentNotFoundError",
              message: `User ${req.user.username} is not allowed to delete payment with ID ${productId}`,
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = router;

