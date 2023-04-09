const express = require("express");
const { requireUser, requireStore } = require("./utils");

const router = express.Router();
const {
  createProduct,
  getProductById,
  editProduct,
  getProductsByUser,
  getProductsByCategory,
  deleteProducts,
  getAllProducts,
  getUsersByUsername,
} = require("../db/");

router.post("/", requireUser, requireStore, async (req, res, next) => {
  const productData = {
    categoryId: req.body.categoryId,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    imgURL: req.body.imgURL,
  };
  productData.creatorId = req.user.id;
  try {
    const createdProduct = await createProduct(productData);
    console.log("hit123");
    console.log(createdProduct);
    if (createdProduct) {
      res.send(createdProduct);
    } else {
      next({
        name: "ProductError",
        message: "Product is already created",
      });
    }
  } catch (error) {
    next({
      name: "productsError",
      message: "Could not create product",
    });
  }
});

router.patch(
  "/:productId",
  requireUser,
  requireStore,
  async (req, res, next) => {
    const { productId } = req.params;
    const productData = {
      categoryId: req.body.categoryId,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      imgURL: req.body.imgURL,
    };
    try {
      const product = await getProductById(productId);
      if (product.creatorId === req.user.id) {
        const result = await editProduct({ id: productId, ...productData });
        res.send(result);
      } else {
        next({
          name: "updateError",
          message: "user not authorized update product",
        });
      }
    } catch (error) {
      next({
        name: "updateError",
        message: "Could not update product",
      });
    }
  }
);

router.delete(
  "/:productId",
  requireUser,
  requireStore,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const product = await getProductById(productId);
      if (!product) {
        next({
          name: "productError",
          message: `product ${productId} des not exist`,
        });
      }
      if (product.creatorId !== req.user.id) {
        next({
          name: "Deletion Error",
          message: `product ${productId} does not belong to ${req.user.username} `,
        });
      } else {
        const deletedProduct = await deleteProducts(productId);
        res.send(deletedProduct);
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

router.get("/products/user/:username/:pageNumber", async (req, res, next) => {
  const { pageNumber, username } = req.params;
  const user = await getUsersByUsername(username);
  const userId = user.id;
  try {
    const products = await getProductsByUser(userId);
    if (!products) {
      next({
        name: "DoesNotExist",
        message: `product not found`,
      });
    } else {
      front = (pageNumber - 1) * 25;
      back = pageNumber * 25;

      const productPage = products.slice(front, back);
      const count = products.length;
      const result = { products: productPage, count };
      res.send(result);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

router.get("/product/:productId", async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await getProductById(productId);
    if (!product) {
      next({
        name: "productError",
        message: "product do not exist",
      });
    }
    res.send(product);
  } catch (error) {
    next({
      message: "Could not find this product",
    });
  }
});

router.get("/category/:category/:pageNumber", async (req, res, next) => {
  const { pageNumber, category } = req.params;
  try {
    let products = await getProductsByCategory(category);
    if (!products) {
      next({
        name: "DoesNotExist",
        message: `category ${category} does not exist or has no products available`,
      });
      return;
    }
    front = (pageNumber - 1) * 25;
    back = pageNumber * 25;

    const productPage = products.slice(front, back);
    const count = products.length;
    const result = { products: productPage, count };
    res.send(result);
  } catch (error) {
    throw error;
  }
});

router.get(
  "/category/:categoryId/:pageNumber/:searchTerm",
  async (req, res, next) => {
    const { pageNumber, categoryId, searchTerm } = req.params;
    try {
      let products = await getProductsByCategory(categoryId);
      if (!products) {
        next({
          name: "DoesNotExist",
          message: `product not found`,
        });
        return;
      }
      if (searchTerm) {
        const newProducts = [];
        for (let i = 0; i < products.length; i++) {
          if (
            products[i].name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            //if the name includes the search term
            newProducts.push(products[i]);
          }
        }
        products = newProducts;
      }
      front = (pageNumber - 1) * 25;
      back = pageNumber * 25;

      const productPage = products.slice(front, back);
      const count = products.length;
      const result = { products: productPage, count };
      res.send(result);
    } catch (error) {
      throw error;
    }
  }
);
// GET /api/products/pageNumber
router.get("/:pageNumber", async (req, res, next) => {
  try {
    const { pageNumber } = req.params;
    let products = await getAllProducts();
    front = (pageNumber - 1) * 25;
    back = pageNumber * 25;

    const productPage = products.slice(front, back);
    const count = products.length;
    const result = { products: productPage, count };
    res.send(result);
  } catch (error) {
    next({
      name: "productsError",
      message: error,
    });
  }
});
router.get("/:pageNumber/:searchTerm", async (req, res, next) => {
  try {
    const { pageNumber, searchTerm } = req.params;
    let products = await getAllProducts();
    if (searchTerm) {
      const newProducts = [];
      for (let i = 0; i < products.length; i++) {
        if (products[i].name.toLowerCase().includes(searchTerm.toLowerCase())) {
          //if the name includes the search term
          newProducts.push(products[i]);
        }
      }
      products = newProducts;
    }
    front = (pageNumber - 1) * 25;
    back = pageNumber * 25;

    const productPage = products.slice(front, back);
    const count = products.length;
    const result = { products: productPage, count };
    res.send(result);
  } catch (error) {
    next({
      name: "productsError",
      message: error,
    });
  }
});
module.exports = router;
