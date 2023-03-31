const client = require("./client");

async function createCart(userId) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
          INSERT INTO carts("userId")
          VALUES(${userId})
          ON CONFLICT ("userId") DO NOTHING
          RETURNING *; 
          `
    );
    return cart;
  } catch (e) {
    throw e;
  }
}


async function getCart(userId){
  try{
    const {
      rows:[cart]
    } = await client.query(`
    SELECT * FROM carts
    WHERE "userId"=${userId};    
    `)
    return cart
  }catch(e){
    throw e
  }
}
async function getCartItems(userId) {
  try {
    const {
      rows,
    } = await client.query(
      `
      SELECT carts.*, cart_items.*, products.quantity, products.price, products.active
      FROM carts
      JOIN cart_items 
      ON carts.id=cart_items."cartId"
      JOIN products 
      ON cart_items."productId" = products.id
      WHERE "userId"=${userId};
          `
    );
    return rows;
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
      INSERT INTO cart_items("cartId", "productId", quantity)
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
          WHERE "cartId"=${cartId}
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
  getCartItems
};
