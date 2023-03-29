const client = require("./client");

async function createCart(userId) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
          INSERT INTO cart(user_id)
          VALUES($1)
          ON CONFLICT (user_id) DO NOTHING
          RETURNING *; 
          `,
      [userId]
    );
    return cart;
  } catch (e) {
    throw e;
  }
}
async function getCart(userId) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
          SELECT * FROM cart
          WHERE user_id=${userId};
          `,
      [userId]
    );
    return cart;
  } catch (e) {
    throw e;
  }
}

async function addToCart({ productId, cartId, quantity }) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
      INSERT INTO cart_items(cart_id, product_id, quantity)
      VALUES($1,$2,$3)
      RETURNING *;
      `,
      [cartId, productId, quantity]
    );
    return cart;
  } catch (e) {
    throw e;
  }
}
async function clearCart(cartId) {
  try {
    const { rows } = await client.query(`
          DELETE FROM cart_items
          WHERE cart_id=${cartId}
          RETURNING *;
          `);
    return rows;
  } catch (e) {}
}

module.exports = {
  createCart,
  getCart,
  addToCart,
  clearCart,
};
