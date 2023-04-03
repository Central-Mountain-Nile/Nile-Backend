const express = require("express");
const { requireUser } = require("./utils");

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

router.post("/", requireUser, async (req, res, next) => {
  const productData = {
    categoryId: req.body.isPublic,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    imgURL: req.body.imgURL,
  };
  productData.creatorId = req.user.id;
  try {
    const createdProduct = await createProduct(productData);
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

router.patch("/:productId", requireUser, async (req, res, next) => {
  const { productId } = req.params;
  const productData = {
    // creatorId: req.user.id,
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
});

router.delete("/:productId", requireUser, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await getProductById(productId);
    if (!product) {
      next({
        name: "Deletion Error",
        message: "Error deleting product",
      });
    } else {
      const deletedProduct = await deleteProducts(productId);
      res.send(deletedProduct);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

router.get("/products/:username/:pageNumber", async (req, res, next) => {
  const { pageNumber, username } = req.params;
  const user = await getUsersByUsername(username);
  const userId = user.id;
  try {
    const product = await getProductsByUser(userId);

    if (!product) {
      next({
        name: "DoesNotExist",
        message: `product not found`,
      });
    } else {
      front = (pageNumber - 1) * 25;
      back = pageNumber * 25;
  
      const productPage = products.slice(front, back);
  
      res.send(productPage);
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

router.get("/category/:categoryId/:pageNumber/", async (req, res, next) => {
  const { pageNumber, categoryId } = req.params;
  const { searchTerm } = req.body;
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

    res.send(productPage);
  } catch (error) {
    throw error;
  }
});

// GET /api/products/pageNumber
router.get("/:pageNumber", async (req, res, next) => {
  try {
    const { pageNumber } = req.params;
    const { searchTerm } = req.body;
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

    res.send(productPage);
  } catch (error) {
    next({
      name: "productsError",
      message: error,
    });
  }
});
module.exports = router;
