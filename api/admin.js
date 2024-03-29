const express = require("express");

const { requireUser, requireAdmin } = require("./utils");
const {
  getUsersById,
  getPaymentByUser,
  getOrdersByUser,
  makeAdmin,
  getAllUsers,
  getProductById,
  editProduct,
  deleteProducts,
} = require("../db");

const adminRouter = express.Router();
adminRouter.patch("/users", requireUser, async (req, res, next) => {
  const secretCode = req.body.secretCode;
  try {
    if (secretCode === process.env.SECRET_CODE) {
      const user = await makeAdmin(req.user.id, secretCode);
      res.send(user);
    } else {
      next({ name: "adminError", message: "invalid admin password" });
    }
  } catch (error) {
    throw error;
  }
});

adminRouter.get("/users", requireUser, requireAdmin, async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.send(users);
  } catch (error) {
    next(error);
  }
});
adminRouter.get(
  "/users/:userId",
  requireUser,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await getUsersById(userId);
      const userPayments = await getPaymentByUser(userId);
      const orderHistory = await getOrdersByUser(userId);
      user.payments = userPayments;
      user.orderHistory = orderHistory;
      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);

// edit delete products
//api/admin/product/:productId
adminRouter.patch(
  "/product/:productId",
  requireUser,
  requireAdmin,
  async (req, res, next) => {
    const { productId } = req.params;
    const productData = { ...req.body };
    try {
      const product = await getProductById(productId);
      if (!product) {
        next({
          name: "adminError",
          message: `product ${productId} des not exist`,
        });
      }
      const result = await editProduct({ id: productId, ...productData });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
);
adminRouter.delete(
  "/product/:productId",
  requireUser,
  requireAdmin,
  async (req, res, next) => {
    const { productId } = req.params;
    try {
      const product = await getProductById(productId);
      if (!product) {
        next({
          name: "adminError",
          message: `product ${productId} des not exist`,
        });
      }
      const deletedProduct = await deleteProducts(productId);
      res.send(deletedProduct);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = adminRouter;
