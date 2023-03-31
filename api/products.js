const express = require("./client");

const router = express.Router();
const {
  createProduct,
  getProductById,
  editProduct,
  getProductsByUser,
  getProductsByCategory,
  deleteProducts,
  getAllProducts,
} = require("..db/");

// GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.send(products);
  } catch (error) {
    next({
      name: "productsError",
      message: "Something went wrong",
    });
  }
});

router.post("/", async (req, res, next) => {
  const productData = {
    creatorId: req.user.id,
    categoryId: req.body.isPublic,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    imgURL: req.body.imgURL,
  };
  try {
    const createdProduct = await createProduct(productData);
    if (createdProduct) {
      res.send(createdProduct);
    }
  } catch (error) {
    next({
      name: "productsError",
      message: "Could not create product",
    });
  }
});

router.get("/:productId", async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await getProductById(productId);
    res.send(product);
  } catch (error) {
    next({
      name: "productsError",
      message: "Could not find this product",
    });
  }
});

router.patch("/:productId", async (req, res, next) => {
  const productData = {
    creatorId: req.user.id,
    categoryId: req.body.categoryId,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity,
    imgURL: req.body.imgURL,
  };
  try {
    if (product.creatorId === req.user.id) {
      const result = await editProduct(productData);
      res.send(result);
    }
  } catch (error) {
    next({
      name: "updateError",
      message: "Could not update product",
    });
  }
});

router.delete("/:productId", async (req, res, next) => {
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

router.get("/products", async (req, res, next) => {
  const userId = req.user.id;
  try {
    const product = await getProductsByUser(userId);

    if (!product) {
      next({
        name: "DoesNotExist",
        message: `product not found`,
      });
    } else {
      res.send(product);
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

router.get("/categoryId", async (req, res, next) => {
  const categoryId = req.user.id;
  try {
    const category = await getProductsByCategory(categoryId);

    if (!category) {
      next({
        name: "DoesNotExist",
        message: `product not found`,
      });
    } else {
      res.send(category);
    }
  } catch (error) {}
});

module.export = router;