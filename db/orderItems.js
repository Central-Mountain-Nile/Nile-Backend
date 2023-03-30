const client = require("./client");

async function createOrderItems({ orderId, productId, quantity }) {
  try {
    const {
      rows: [payment],
    } = await client.query(
      `
        INSERT INTO order_items( "orderId", "productId", quantity) 
        VALUES($1, $2, $3) 
        RETURNING *;
      `,
      [orderId, productId, quantity]
    );
    return payment;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createOrderItems,
};
//to_timestamp(${Date.now()} / 1000.0)
//ahahahahsihioxwiojcbeiowdsc
