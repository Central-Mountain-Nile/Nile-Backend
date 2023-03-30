const client = require("./client");

async function createPaymentDetails({ orderId, provider, status }) {
  try {
    const {
      rows: [payment],
    } = await client.query(
      `
        INSERT INTO order_payment( orderId, provider, status, createdAt) 
        VALUES($1, $2, $3, to_timestamp(${Date.now()} / 1000.0)) 
        RETURNING *;
      `,
      [orderId, provider, status]
    );
    return payment;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  createPaymentDetails,
};
//to_timestamp(${Date.now()} / 1000.0)
