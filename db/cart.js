const client = require("./client");

async function createCart(userId) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
          INSERT INTO cart(userId)
          VALUES(${userId})
          ON CONFLICT (userId) DO NOTHING
          RETURNING *; 
          `
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
      SELECT cart.*, cart_items.*
      FROM cart
      JOIN ON cart.id=cart_items.cartId
      WHERE userId=${userId};
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
      INSERT INTO cart_items(cartId, productId, quantity)
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
          WHERE cartId=${cartId}
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
