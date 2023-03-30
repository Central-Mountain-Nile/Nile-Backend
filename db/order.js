const client = require("./client");

async function createOrder({ userId, total }) {
  try {

    const {
      rows: [order],
    } = await client.query(
      `
          INSERT INTO orders(userId, total,createdAt)
          VALUES(${userId},${total},to_timestamp(${Date.now()} / 1000.0) )
          RETURNING *; 
          `
    );
    return order;
  } catch (e) {
    throw e;
  }
}
async function getAllOrders() {
  try {
    const { rows } = await client.query(
      `
              SELECT orders.*, order_items.*, payment_details.*
              FROM orders
              JOIN order_items ON orders.id=order_items.orderId
              JOIN payment_details ON orders.id=payment_details.orderId
              WHERE orders.id=${orderId};
              `
    );
    return rows;
  } catch (e) {
    throw e;
  }
}
async function getOrder(orderId) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
              SELECT orders.*, order_items.*, payment_details.*
              FROM orders
              JOIN order_items ON orders.id=order_items.orderId
              JOIN payment_details ON orders.id=payment_details.orderId
              WHERE orders.id=${orderId};
              `
    );
    return order;
  } catch (e) {
    throw e;
  }
}
async function getOrdersByUser(userId) {
  try {
    const { rows } = await client.query(
      `
              SELECT orders.*, order_items.*, payment_details.*
              FROM orders
              JOIN order_items ON orders.id=order_items.orderId
              JOIN payment_details ON orders.id=payment_details.orderId
              WHERE orders.userId=${userId};
              `
    );
    return rows;
  } catch (e) {
    throw e;
  }
}


module.exports = {
  createOrder,
  getAllOrders,
  getOrder,
  getOrdersByUser
}