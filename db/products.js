const client = require("./client");

async function createProduct({
  creatorId,
  categoryId,
  name,
  description,
  price,
  quantity,
  imgURL
}) {
  try {
    const {
      rows: [products],
    } = await client.query(
      `
            INSERT INTO products(
                "creatorId",
                "categoryId",
                name,
                description,
                price,
                quantity,
               "imgURL"

            )
            VALUES($1, $2, $3, $4, $5, $6,$7)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
        `,
      [creatorId, categoryId, name, description, price, quantity,imgURL]
    );
    return products;
  } catch (error) {
    throw error;
  }
}
async function getProductById(id) {
  try {
    const {
      rows: [products],
    } = await client.query(
      `
        SELECT *
        FROM products
        WHERE id = ${id}
        `
    );
    return products;
  } catch (error) {
    throw error;
  }
}
async function getProductsByCategory(categoryId) {
  try {
    const {
      rows: [products],
    } = await client.query(
      `
        SELECT *
        FROM products
        WHERE "categoryId" = $1;
        `,
      [categoryId]
    );
    console.log(products);
    return rows;
  } catch (error) {
    throw error;
  }
}
async function deleteProducts(productId) {
  try {
    const { rows } = await client.query(
      `
        UPDATE products
        SET boolean active = false
        WHERE id = $1
        RETURNING *;
        `,
      [productId]
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function editProduct({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  try {
    if (setString.length > 0) {
      await client.query(
        `
              UPDATE products
              SET ${setString}
              WHERE id=${id}
              RETURNING *;
            `,
        Object.values(fields)
      );
    }
    return await getProductById(id);
  } catch (error) {
    console.log(error);
    throw error;
  }
}
async function getProductsByUser(user_id) {
  try {
    const {
      row,
    } = await client.query(
      `
          SELECT *
          FROM products
          WHERE "userId" = $1;
          `,
      [user_id]
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw {
      name: "ProductNotFoundError",
      message: "Could not find products with this userId",
    };
  }
}
module.exports = {
  createProduct,
  getProductById,
  editProduct,
  getProductsByUser,
  getProductsByCategory,
  deleteProducts,
};
