const client = require("./client");

async function createCategories({ name }) {
  try {
    const {
      rows: [product_category],
    } = await client.query(
      `
            INSERT INTO product_category (name)
            VALUES($1)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;
            `,
      [name]
    );
    return product_category;
  } catch (error) {
    throw error;
  }
}

async function getAllCategories() {
  try {
    const { rows } = await client.query(
      `
        SELECT *
        FROM product_category;
        `
    );
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
module.exports = {
  createCategories,
  getAllCategories,
};
