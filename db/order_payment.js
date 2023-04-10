const client = require("./client");

async function createOrderPayment({ orderId, provider, status }) {
  try {
    const {
      rows: [payment],
    } = await client.query(
      `
        INSERT INTO order_payment( "orderId", provider, status) 
        VALUES($1, $2, $3) 
        RETURNING *;
      `,
      [orderId, provider, status]
    );
    return payment;
  } catch (error) {

    throw error;
  }
}

module.exports = {
  createOrderPayment,
};
//to_timestamp(${Date.now()} / 1000.0)
