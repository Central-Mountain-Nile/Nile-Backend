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

module.export = router;
