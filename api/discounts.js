const express = require ("express");
const router = require ("router");
const {
    createDiscount,
    getAllDiscounts,
    editDiscounts,
    getDiscountsByProduct,
    deleteDiscounts
  } = require("../db/");


router.post("/", async (req, res, next) => {
    const discountData = {
        productId: req.body.id,
        name: req.body.name,
        description: req.body.description,
        discountPercent: req.body.percent,
        active: req.body.active
    };
    try {
        const createdDiscount = await createDiscount(discountData);
        if (createdDiscount) {
            res.send(createdDiscount);
        }
    } catch (error) {
        next ({
            name: "discount error",
            message: "Error creting discount"
        });
    }
});

  //Get all discounts
  router.get("/", async (req, res, next) => {
    try {
      const discounts = await getAllDiscounts();
      res.send(discounts);
    } catch (error) {
      next({
        name: "discountsError",
        message: "Something went wrong",
      });
    }
  });